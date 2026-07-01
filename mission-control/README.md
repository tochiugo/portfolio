# Mission Control — live status bridge

The portfolio homepage renders a live operational dashboard for **Arbiter**,
the cross-venue divergence bot (Polymarket ↔ Kalshi). It is driven by one
small contract:

```
arbiter (arbiter.log + arbiter.db)
   │  read-only, every ~60s
   ▼
arbiter_status_bridge.py  ──▶  live_status.json  ──▶  GitHub gist  ──▶  /api/status  ──▶  dashboard
        (pm2: pm-arbiter-bridge)                                       (Vercel fn)        (polls 15s)
```

No websockets to the browser, no backend to babysit — a sanitized JSON snapshot
the bridge keeps fresh and the site polls.

## Files

| File | Purpose |
| --- | --- |
| `arbiter_status_bridge.py` | The real bridge. Runs under pm2 (`pm-arbiter-bridge`), reads `~/arbiter/arbiter.log` + `~/arbiter/arbiter.db` **read-only**, pushes a sanitized `live_status.json` to the gist every ~60s. |
| `live_status_bridge.py` | Retired — the prior bridge for the V15.4 Polymarket engine (`~/polymarket-bot/`, no longer running). Kept for reference; its `V15_FIRST_RUN`/sleeve/governor/Brier fields don't apply to Arbiter. |
| `update_status.py` | Legacy reference writer (dry-run demo telemetry). Superseded by the bridge; kept for documentation. |

## Run it

```bash
# kept alive by pm2, reused gist/token already set in Vercel prod (GIST_ID, GH_GIST_TOKEN)
python3 arbiter_status_bridge.py --gist <GIST_ID>

# single snapshot (debugging)
python3 arbiter_status_bridge.py --gist <GIST_ID> --once
```

Both bridges write to the **same gist file** (`live_status.json`) so `/api/status`
needed no changes when the site switched from V15.4 to Arbiter — only one bridge
should run against that filename at a time.

## What it publishes

- **Resolved trade metrics**: total/resolved trade counts, wins/losses, win rate,
  net PnL (real, including losses).
- **Open book**: open position count and deployed capital (sum of `cost_usd`
  where `outcome='pending'`).
- **Category breakdown**: PnL and trade count per divergence category (weather,
  sports — crypto is logged for research only, never traded).
- Recent trades (category, label, edge, cost, PnL, open/closed) and a cleaned
  `arbiter.log` tail.

## How ONLINE / OFFLINE is decided

`last_heartbeat` is the `arbiter.log` mtime. Fresh (< 10 min — Arbiter scans
every ~3.5 min) → **ONLINE**; stale → **OFFLINE** automatically; next fresh
heartbeat flips it back. Because "offline" is just "the file stopped changing,"
down/recovery needs no extra wiring.

## Public-safe guarantee

The bridge emits **only** whitelisted fields and never reads `.env`. A DENY
regex drops any log line containing `0x…` addresses, signer/key/secret/wallet
material, or balance-allowance payloads. Wallet keys, addresses, and API
secrets never leave the machine. The PnL shown is real — including losses —
by design.
