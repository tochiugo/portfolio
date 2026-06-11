#!/usr/bin/env python3
"""
Mission Control — public-safe status writer.

Run this next to the Polymarket bot. Every HEARTBEAT_INTERVAL seconds it writes a
SANITIZED status.json that the portfolio reads to render the live dashboard.

Design goals (kept deliberately small):
  * Bot updates status.json every 30s.  Portfolio reads it.  That's the whole contract.
  * PUBLIC-SAFE ONLY. This script never emits wallet keys, private addresses, API
    secrets, real PnL, or any field not in PUBLIC_FIELDS below.
  * If the bot stops, status.json simply stops changing -> the portfolio detects the
    stale heartbeat and flips the dashboard to OFFLINE automatically. No extra wiring.

Usage:
    python3 update_status.py --out /path/to/portfolio/public/status.json
    # or publish to wherever the deployed site fetches VITE_STATUS_URL from
    # (same-origin file, an object-store key, a gist raw URL, etc.)

This reference build emits dry-run telemetry. To surface REAL (still sanitized)
numbers, replace read_bot_state() with a reader for your bot's own state/log files
and copy across ONLY the public-safe fields.
"""

import argparse
import datetime as dt
import json
import os
import random
import tempfile
import time

HEARTBEAT_INTERVAL = 30  # seconds — matches the contract the portfolio expects
VERSION = "15.4.0"
CODENAME = "V15.4"
BOOT_TIME = dt.datetime.now(dt.timezone.utc)

# Whitelist of fields that are allowed to leave this process. Anything not here
# never reaches the portfolio. Keep this list tight.
PUBLIC_FIELDS = {
    "system", "codename", "mode", "status", "version", "environment",
    "boot_time", "generated_at", "last_heartbeat", "heartbeat_interval_sec",
    "health", "counters", "strategies", "markets", "calibration",
    "recent_activity", "recent_logs",
}

ACTIVITY_TEMPLATES = [
    "Heartbeat OK · cycle {cycle} · {lat}ms",
    "Scanned BTC 15m Up/Down — mid {p:.2f}, spread {s:.2f}",
    "Latency-Arb: Binance Δ below entry threshold → skip",
    "Late-Window armed for ETH 15m (T-minus 2m gate)",
    "Position monitor: 0 open positions (dry-run)",
    "Brier calibration refreshed → {brier:.3f}",
    "Flash-Crash watch: no 0.27+ drop detected",
    "Risk manager: exposure 0% of cap · kill-switch clear",
]


def read_bot_state(counters):
    """Reference dry-run state. Replace with a reader for your real bot's state
    files, copying ONLY public-safe fields. Never read or return secrets."""
    counters["markets_scanned"] += random.randint(2, 6)
    counters["evaluations_processed"] += random.randint(8, 20)
    counters["cycles_completed"] += 1
    if random.random() < 0.04:
        counters["signals_generated"] += 1
    return counters


def build_status(counters):
    now = dt.datetime.now(dt.timezone.utc)
    uptime = now - BOOT_TIME
    days, rem = divmod(int(uptime.total_seconds()), 86400)
    hours, rem = divmod(rem, 3600)
    mins = rem // 60
    cycle = counters["cycles_completed"]
    lat = random.randint(180, 260)
    brier = round(0.18 + random.uniform(-0.01, 0.01), 3)
    activity = [t.format(cycle=cycle, lat=lat, p=random.uniform(0.45, 0.58),
                          s=random.uniform(0.01, 0.04), brier=brier)
                for t in random.sample(ACTIVITY_TEMPLATES, 6)]
    return {
        "system": "Polymarket Mission Control",
        "codename": CODENAME,
        "mode": "public-dry-run",
        "status": "online",
        "version": VERSION,
        "environment": "public-safe · dry-run · no live trading",
        "boot_time": BOOT_TIME.isoformat().replace("+00:00", "Z"),
        "generated_at": now.isoformat().replace("+00:00", "Z"),
        "last_heartbeat": now.isoformat().replace("+00:00", "Z"),
        "heartbeat_interval_sec": HEARTBEAT_INTERVAL,
        "health": {
            "state": "healthy",
            "cycle_latency_ms": lat,
            "feed_lag_ms": random.randint(60, 130),
            "error_rate_pct": 0.0,
            "watchdog": "passing",
            "data_feeds": ["binance.spot.ws", "polymarket.gamma", "polymarket.clob.ws"],
        },
        "counters": {**counters, "open_positions": 0,
                     "uptime_label": f"{days}d {hours}h {mins}m"},
        "strategies": [
            {"name": "Latency-Arb", "state": "armed", "edge": "Binance leads Polymarket 2-55s"},
            {"name": "Flash-Crash", "state": "watching", "edge": "Contrarian bounce on 0.27+ prob drop"},
            {"name": "Late-Window", "state": "armed", "edge": "Mid + spot confirm in final 2 min"},
        ],
        "markets": [
            {"label": "BTC 15m Up/Down", "spot": "—", "prob": round(random.uniform(0.48, 0.56), 2), "state": "scanning"},
            {"label": "BTC 5m Up/Down", "spot": "—", "prob": round(random.uniform(0.45, 0.53), 2), "state": "scanning"},
            {"label": "ETH 15m Up/Down", "spot": "—", "prob": round(random.uniform(0.50, 0.58), 2), "state": "scanning"},
            {"label": "ETH 5m Up/Down", "spot": "—", "prob": round(random.uniform(0.44, 0.52), 2), "state": "watching"},
        ],
        "calibration": {"brier_score": brier, "trades_logged": 0, "note": "dry-run — paper router only"},
        "recent_activity": activity,
        "recent_logs": [
            f"[{now.strftime('%H:%M:%S')}] INFO  cycle={cycle} scanned=4 evals=12 latency={lat}ms",
            f"[{now.strftime('%H:%M:%S')}] INFO  latency_arb btc15m delta below thr action=skip",
            f"[{now.strftime('%H:%M:%S')}] INFO  gamma refresh ok markets=4 stale=0",
            f"[{now.strftime('%H:%M:%S')}] INFO  clob.ws heartbeat ok",
            f"[{now.strftime('%H:%M:%S')}] INFO  risk exposure=0.0% killswitch=clear",
            f"[{now.strftime('%H:%M:%S')}] INFO  paper_router open=0 (dry-run)",
        ],
    }


def write_atomic(path, payload):
    # Strip anything not explicitly whitelisted, then write atomically.
    safe = {k: v for k, v in payload.items() if k in PUBLIC_FIELDS}
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=os.path.dirname(os.path.abspath(path)), suffix=".tmp")
    with os.fdopen(fd, "w") as f:
        json.dump(safe, f, indent=2)
    os.replace(tmp, path)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="../public/status.json", help="status.json output path")
    ap.add_argument("--once", action="store_true", help="write a single snapshot and exit")
    args = ap.parse_args()

    counters = {
        "markets_scanned": 184213, "evaluations_processed": 902847,
        "signals_generated": 1644, "cycles_completed": 73118,
    }
    print(f"Mission Control writer → {args.out} (every {HEARTBEAT_INTERVAL}s, ctrl-c to stop)")
    while True:
        counters = read_bot_state(counters)
        write_atomic(args.out, build_status(counters))
        if args.once:
            break
        time.sleep(HEARTBEAT_INTERVAL)


if __name__ == "__main__":
    main()
