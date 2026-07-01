#!/usr/bin/env python3
"""
Live status bridge for Arbiter (cross-venue divergence bot) -> portfolio Mission Control.

Reads Arbiter's REAL outputs (~/arbiter/arbiter.log + arbiter.db, read-only) and
emits a sanitized status.json, then pushes it to the same GitHub Gist the
portfolio's /api/status already reads (reused from the retired polymarket-bot
bridge — no new credentials).

SAFETY: emits ONLY whitelisted public fields. Never reads .env. Never emits
private keys, wallet addresses, API secrets, or raw log lines containing 0x
addresses / signer / key / balance-allowance.

Run (kept alive by pm2):
    python3 arbiter_status_bridge.py --gist <GIST_ID>
"""
import argparse, json, os, re, sqlite3, subprocess, time, datetime as dt

HOME = os.path.expanduser("~")
ARBITER_DIR = os.path.join(HOME, "arbiter")
LOG = os.path.join(ARBITER_DIR, "arbiter.log")
DB = os.path.join(ARBITER_DIR, "arbiter.db")
INTERVAL = 60  # arbiter scans every ~3.5min; no need for the old bot's 20s cadence
VERSION = "1.0"
CODENAME = "Arbiter"

DENY = re.compile(r"(0x[a-fA-F0-9]{6,}|private|signer|secret|api[_-]?key|passphrase|balance-allowance|allowance|authorization|signature_type|wallet)", re.I)


def tail(path, n=200):
    try:
        with open(path, "rb") as f:
            f.seek(0, 2); size = f.tell(); block = 65536; data = b""
            while size > 0 and data.count(b"\n") <= n:
                step = min(block, size); size -= step; f.seek(size); data = f.read(step) + data
        return data.decode("utf-8", "replace").splitlines()[-n:]
    except Exception:
        return []


def clean_log_line(line):
    # "2026-07-01 03:59:29,878 [INFO] arbiter: placed 0 live order(s) this cycle."
    m = re.match(r"\d{4}-\d{2}-\d{2} (\d{2}:\d{2}:\d{2}),\d+ \[(\w+)\] ([\w.]+): (.*)", line)
    if not m:
        return None
    t, lvl, logger, msg = m.groups()
    if DENY.search(line):
        return None
    msg = msg.strip()
    if len(msg) > 150:
        msg = msg[:147] + "…"
    return f"[{t}] {lvl} {logger}: {msg}"


def read_db():
    d = {}
    try:
        con = sqlite3.connect(f"file:{DB}?mode=ro", uri=True, timeout=4)
        con.execute("PRAGMA query_only=1")
        cur = con.cursor()

        resolved = cur.execute(
            "select count(*), coalesce(sum(case when outcome='win' then 1 else 0 end),0), coalesce(sum(pnl_usd),0) "
            "from arbiter_trades where outcome!='pending'").fetchone()
        d["resolved_total"], d["wins"], d["total_pnl"] = resolved[0], resolved[1], round(resolved[2], 2)
        d["losses"] = d["resolved_total"] - d["wins"]
        d["win_rate"] = round(100 * d["wins"] / max(1, d["resolved_total"]), 1)

        open_row = cur.execute(
            "select count(*), coalesce(sum(cost_usd),0) from arbiter_trades where outcome='pending'").fetchone()
        d["open_positions"], d["deployed_usd"] = open_row[0], round(open_row[1], 2)

        d["categories"] = [
            {"category": c, "trades": n, "pnl": round(p or 0, 2)}
            for c, n, p in cur.execute(
                "select category, count(*), coalesce(sum(pnl_usd),0) from arbiter_trades group by category").fetchall()
        ]

        rows = cur.execute(
            "select category, label, edge, cost_usd, pnl_usd, outcome, ts "
            "from arbiter_trades order by id desc limit 8").fetchall()
        d["recent_trades"] = [{
            "category": c, "label": (l or "")[:60], "edge": round(e, 3) if e is not None else None,
            "cost": round(cost, 2) if cost is not None else None,
            "pnl": round(p, 2) if p is not None else None,
            "open": oc == "pending", "ts": dt.datetime.utcfromtimestamp(ts).isoformat() + "Z" if ts else None,
        } for c, l, e, cost, p, oc, ts in rows]

        d["total_trades"] = cur.execute("select count(*) from arbiter_trades").fetchone()[0]
        con.close()
    except Exception as e:
        d["db_error"] = str(e)[:120]
    return d


def build_status():
    now = time.time()
    lines = tail(LOG, 200)
    feed = [cl for cl in (clean_log_line(l) for l in lines) if cl][-12:][::-1]
    db = read_db()
    try:
        log_mtime = os.path.getmtime(LOG)
    except Exception:
        log_mtime = 0
    fresh = (now - log_mtime) < 600  # arbiter scans ~every 3.5min; 10min stale = down
    iso = lambda t: dt.datetime.utcfromtimestamp(t).isoformat() + "Z"
    return {
        "system": "Arbiter — Cross-Venue Divergence Engine",
        "codename": CODENAME, "version": VERSION,
        "mode": "LIVE",
        "status": "online" if fresh else "offline",
        "source": "real",
        "generated_at": iso(now),
        "last_heartbeat": iso(log_mtime) if log_mtime else None,
        "health": {"state": "healthy" if fresh else "stale", "log_age_sec": int(now - log_mtime) if log_mtime else None},
        "metrics": {
            "total_trades": db.get("total_trades"),
            "resolved_total": db.get("resolved_total"),
            "wins": db.get("wins"), "losses": db.get("losses"), "win_rate": db.get("win_rate"),
            "total_pnl": db.get("total_pnl"),
            "open_positions": db.get("open_positions"), "deployed_usd": db.get("deployed_usd"),
        },
        "categories": db.get("categories", []),
        "recent_trades": db.get("recent_trades", []),
        "feed": feed,
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
    ap.add_argument("--out", default=os.path.join(os.path.dirname(os.path.abspath(__file__)), "live_status.json"))
    ap.add_argument("--once", action="store_true")
    args = ap.parse_args()
    print(f"Arbiter live bridge -> gist {args.gist}, every {INTERVAL}s")
    while True:
        st = build_status()
        with open(args.out, "w") as f:
            json.dump(st, f, indent=2)
        push_gist(args.gist, args.out)
        m = st["metrics"]
        print(f"{st['status']} trades={m['total_trades']} resolved={m['resolved_total']} "
              f"pnl=${m['total_pnl']} win={m['win_rate']}% open={m['open_positions']} deployed=${m['deployed_usd']}")
        if args.once:
            break
        time.sleep(INTERVAL)


if __name__ == "__main__":
    main()
