#!/usr/bin/env python3
"""
Live status bridge for the Polymarket bot → portfolio Mission Control.

Reads the bot's REAL outputs (bot.log + data/trades.db, read-only) and emits a
sanitized status.json, then pushes it to a GitHub Gist every INTERVAL seconds.
The deployed portfolio reads it via a Vercel /api/status proxy.

SAFETY: emits ONLY whitelisted public fields. Never reads .env. Never emits
private keys, wallet addresses, API secrets, or raw log lines containing 0x
addresses / signer / key / balance-allowance.

Run (kept alive by pm2):
    python3 live_status_bridge.py --gist <GIST_ID>
"""
import argparse, json, os, re, sqlite3, subprocess, tempfile, time, collections, datetime as dt

BOT_DIR = os.path.dirname(os.path.abspath(__file__))
LOG = os.path.join(BOT_DIR, "bot.log")
DB = os.path.join(BOT_DIR, "data", "trades.db")
INTERVAL = 20
VERSION = "12.53.0"
CODENAME = "V12-53"

# log lines we will NOT surface (anything that could leak secrets/addresses)
DENY = re.compile(r"(0x[a-fA-F0-9]{6,}|private|signer|secret|api[_-]?key|passphrase|balance-allowance|allowance|authorization|signature_type)", re.I)
# loggers worth showing in the live feed
ALLOW_LOGGER = re.compile(r"\b(main|data\.gamma_client|calibration\.\w+|risk\.risk_manager|alpha\.\w+|data\.coinbase_feed|execution\.clob_executor)\b")


def tail(path, n=400):
    try:
        with open(path, "rb") as f:
            f.seek(0, 2); size = f.tell(); block = 65536; data = b""
            while size > 0 and data.count(b"\n") <= n:
                step = min(block, size); size -= step; f.seek(size); data = f.read(step) + data
        return data.decode("utf-8", "replace").splitlines()[-n:]
    except Exception:
        return []


def grep_last(pattern):
    # last line in the (large) log matching pattern — for once-per-run lines
    try:
        out = subprocess.run(["grep", "-aE", pattern, LOG], capture_output=True, text=True, timeout=15).stdout
        lines = [l for l in out.splitlines() if l]
        return lines[-1] if lines else None
    except Exception:
        return None


def clean_log_line(line):
    # strip leading date, keep "HH:MM:SS [LEVEL] logger: msg"
    m = re.match(r"\d{4}-\d{2}-\d{2} (\d{2}:\d{2}:\d{2}),\d+ \[(\w+)\] ([\w.]+): (.*)", line)
    if not m:
        return None
    t, lvl, logger, msg = m.groups()
    if DENY.search(line) or not ALLOW_LOGGER.search(logger):
        return None
    msg = msg.strip()
    if len(msg) > 150:
        msg = msg[:147] + "…"
    return f"[{t}] {lvl} {logger.split('.')[-1]}: {msg}"


def parse_log(lines):
    out = {"feed": [], "assets": [], "balance_usd": None, "exposure_usd": None,
           "open_orders": None, "mode_live": False, "signals_active": None, "last_scan": None,
           "drivers": [], "shadow": [], "killed": None}
    for line in lines:
        if "LIVE TRADING" in line or "Live CLOB executor active" in line:
            out["mode_live"] = True
        # real signal policy: which signals can trade vs shadow-only
        pm = re.search(r"DRIVERS \(can trade\)=\[([^\]]*)\].*SHADOW[^=]*=\[([^\]]*)\]", line)
        if pm:
            out["drivers"] = re.findall(r"'([^']+)'", pm.group(1))
            out["shadow"] = re.findall(r"'([^']+)'", pm.group(2))
        km = re.search(r"'killed': (True|False)", line)
        if km:
            out["killed"] = km.group(1) == "True"
        m = re.search(r"(\d+) active", line)
        if "signals" in line.lower() and m:
            out["signals_active"] = int(m.group(1))
        # asset breakdown from gamma crypto line
        am = re.search(r"\[assets: ([^\]]+)\]", line)
        if am:
            pairs = []
            for kv in am.group(1).split(","):
                if ":" in kv:
                    k, v = kv.split(":"); pairs.append({"asset": k.strip(), "markets": int(v)})
            if pairs:
                out["assets"] = pairs
        sm = re.search(r"Scan (\d+) \((\w+)\): processing (\d+) markets", line)
        if sm:
            out["last_scan"] = {"id": int(sm.group(1)), "kind": sm.group(2), "markets": int(sm.group(3))}
        bm = re.search(r"'balance': '(\d+)'", line)
        if bm:
            out["balance_usd"] = round(int(bm.group(1)) / 1e6, 2)
        om = re.search(r"'open_order_count': (\d+)", line)
        if om:
            out["open_orders"] = int(om.group(1))
        rm = re.search(r"open_exposure_usd': ([\d.]+)", line)
        if rm:
            out["exposure_usd"] = round(float(rm.group(1)), 2)
        cl = clean_log_line(line)
        if cl:
            out["feed"].append(cl)
    out["feed"] = out["feed"][-12:][::-1]
    return out


def read_db():
    d = {}
    try:
        con = sqlite3.connect(f"file:{DB}?mode=ro", uri=True, timeout=4)
        con.execute("PRAGMA query_only=1")
        cur = con.cursor()
        # latest run (uptime, mode, bankroll)
        r = cur.execute("select run_id, started_at, mode, bankroll_at_start from runs order by run_id desc limit 1").fetchone()
        if r:
            d["run_id"], d["run_started_at"], d["run_mode"], d["bankroll_start"] = r[0], r[1], r[2], r[3]
        d["runs_total"] = cur.execute("select count(*) from runs").fetchone()[0]
        # cumulative scan totals
        s = cur.execute("select count(*), coalesce(sum(n_markets_seen),0), coalesce(sum(n_evaluated),0), coalesce(sum(n_proposed),0), coalesce(sum(n_traded),0) from scans").fetchone()
        d["scans_total"], d["markets_seen"], d["evaluations"], d["proposed"], d["traded"] = s
        d["latest_scan_id"] = cur.execute("select max(scan_id) from scans").fetchone()[0]
        # trade stats overall + by mode
        d["trades_total"] = cur.execute("select count(*) from trades").fetchone()[0]
        d["wins"] = cur.execute("select count(*) from trades where pnl_usd>0").fetchone()[0]
        d["losses"] = cur.execute("select count(*) from trades where pnl_usd<0").fetchone()[0]
        d["total_pnl"] = round(cur.execute("select coalesce(sum(pnl_usd),0) from trades").fetchone()[0], 2)
        d["open_positions"] = cur.execute("select count(*) from trades where outcome is null").fetchone()[0]
        by = {m: (n, round(p or 0, 2)) for m, n, p in cur.execute("select mode, count(*), sum(pnl_usd) from trades group by mode").fetchall()}
        d["live_trades"] = by.get("live", (0, 0))[0]; d["live_pnl"] = by.get("live", (0, 0))[1]
        d["paper_trades"] = by.get("paper", (0, 0))[0]; d["paper_pnl"] = by.get("paper", (0, 0))[1]
        # daily pnl (today, local)
        today = dt.datetime.now().strftime("%Y-%m-%d")
        start = dt.datetime.strptime(today, "%Y-%m-%d").timestamp()
        d["daily_pnl"] = round(cur.execute("select coalesce(sum(pnl_usd),0) from trades where timestamp>=?", (start,)).fetchone()[0], 2)
        d["daily_trades"] = cur.execute("select count(*) from trades where timestamp>=?", (start,)).fetchone()[0]
        # brier
        b = cur.execute("select score, n_trades from brier_log order by id desc limit 1").fetchone()
        if b:
            d["brier"], d["brier_n"] = round(b[0], 4), b[1]
        # recent trades
        rows = cur.execute("select side, size_usd, entry_price, pnl_usd, outcome, mode, timestamp from trades order by id desc limit 8").fetchall()
        d["recent_trades"] = [{
            "side": s, "size": round(sz, 2), "price": round(ep, 3),
            "pnl": round(p, 2) if p is not None else None,
            "open": oc is None, "mode": md, "ts": ts,
        } for s, sz, ep, p, oc, md, ts in rows]
        con.close()
    except Exception as e:
        d["db_error"] = str(e)[:120]
    return d


def build_status():
    now = time.time()
    log_lines = tail(LOG, 400)
    log = parse_log(log_lines)
    # once-per-run lines live far back in the log — grep for the latest occurrence
    policy = grep_last("Alpha signal policy")
    if policy:
        pm = re.search(r"DRIVERS \(can trade\)=\[([^\]]*)\].*SHADOW[^=]*=\[([^\]]*)\]", policy)
        if pm:
            log["drivers"] = re.findall(r"'([^']+)'", pm.group(1))
            log["shadow"] = re.findall(r"'([^']+)'", pm.group(2))
    if log.get("mode_live") is False and grep_last("Live CLOB executor active|LIVE TRADING"):
        log["mode_live"] = True
    db = read_db()
    try:
        log_mtime = os.path.getmtime(LOG)
    except Exception:
        log_mtime = now
    fresh = (now - log_mtime) < 300  # bot writes constantly; >5min stale ⇒ likely down
    win_rate = round(100 * db.get("wins", 0) / max(1, db.get("wins", 0) + db.get("losses", 0)), 1)
    bankroll = log.get("balance_usd") or db.get("bankroll_start")
    iso = lambda t: dt.datetime.utcfromtimestamp(t).isoformat() + "Z"
    return {
        "system": "Polymarket Mission Control",
        "codename": CODENAME, "version": VERSION,
        "mode": "LIVE" if log.get("mode_live") or db.get("run_mode") == "live" else "PAPER",
        "status": "online" if fresh else "offline",
        "source": "real",
        "generated_at": iso(now),
        "last_heartbeat": iso(log_mtime),
        "run_id": db.get("run_id"), "runs_total": db.get("runs_total"),
        "run_started_at": iso(db["run_started_at"]) if db.get("run_started_at") else None,
        "health": {
            "state": "healthy" if fresh else "stale",
            "signals_active": log.get("signals_active") or 14,
            "log_age_sec": int(now - log_mtime),
        },
        "metrics": {
            "markets_scanned": db.get("markets_seen"),
            "evaluations": db.get("evaluations"),
            "scans_completed": db.get("scans_total"),
            "latest_scan_id": db.get("latest_scan_id"),
            "trades_total": db.get("trades_total"),
            "wins": db.get("wins"), "losses": db.get("losses"), "win_rate": win_rate,
            "open_positions": log.get("open_orders") if log.get("open_orders") is not None else db.get("open_positions"),
            "total_pnl": db.get("total_pnl"),
            "daily_pnl": db.get("daily_pnl"), "daily_trades": db.get("daily_trades"),
            "live_trades": db.get("live_trades"), "live_pnl": db.get("live_pnl"),
            "paper_trades": db.get("paper_trades"), "paper_pnl": db.get("paper_pnl"),
            "bankroll_usd": bankroll, "exposure_usd": log.get("exposure_usd"),
            "brier": db.get("brier"), "brier_n": db.get("brier_n"),
        },
        "markets": log.get("assets", []),
        "signals": {"drivers": log.get("drivers", []), "shadow": log.get("shadow", []), "killed": log.get("killed")},
        "last_scan": log.get("last_scan"),
        "recent_trades": db.get("recent_trades", []),
        "feed": log.get("feed", []),
    }


def push_gist(gist_id, path):
    try:
        subprocess.run(["gh", "gist", "edit", gist_id, "-a", path],
                       check=True, capture_output=True, timeout=30)
        return True
    except Exception as e:
        print("gist push failed:", getattr(e, "stderr", e))
        return False


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--gist", required=True)
    ap.add_argument("--out", default=os.path.join(BOT_DIR, "live_status.json"))
    ap.add_argument("--once", action="store_true")
    args = ap.parse_args()
    print(f"Live bridge → gist {args.gist}, every {INTERVAL}s")
    while True:
        st = build_status()
        with open(args.out, "w") as f:
            json.dump(st, f, indent=2)
        push_gist(args.gist, args.out)
        m = st["metrics"]
        print(f"{st['status']} mode={st['mode']} trades={m['trades_total']} pnl=${m['total_pnl']} "
              f"win={m['win_rate']}% scans={m['scans_completed']} scan#{m.get('latest_scan_id')}")
        if args.once:
            break
        time.sleep(INTERVAL)


if __name__ == "__main__":
    main()
