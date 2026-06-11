# Mission Control — live status bridge

The portfolio homepage renders a live operational dashboard for the Polymarket
**V15.4** system. It is driven by one small contract:

```
bot (bot.log + trades.db)
   │  read-only, every ~20s
   ▼
live_status_bridge.py  ──▶  status.json  ──▶  GitHub gist  ──▶  /api/status  ──▶  dashboard
        (pm2)                                                  (Vercel fn)        (polls 15s)
```

No websockets to the browser, no backend to babysit — a sanitized JSON snapshot
the bridge keeps fresh and the site polls.

## Files

| File | Purpose |
| --- | --- |
| `live_status_bridge.py` | The real bridge. Runs next to the bot under pm2 (`pm-live-bridge`), reads `bot.log` + `data/trades.db` **read-only**, pushes a sanitized `status.json` to a gist every ~20s. |
| `update_status.py` | Legacy reference writer (dry-run demo telemetry). Superseded by the bridge; kept for documentation. |

## Run it

```bash
# next to the bot, kept alive by pm2
python3 live_status_bridge.py --gist <GIST_ID>

# single snapshot (debugging)
python3 live_status_bridge.py --gist <GIST_ID> --once
```

## What it publishes

- **V15-scoped primary metrics** (`run_id >= V15_FIRST_RUN`, default 85): PnL,
  daily PnL, win rate, open positions, exposure, live/shadow split, recent trades.
  Retired pre-V15 runs cannot pollute these numbers.
- **Calibration as skill**: rolling Brier for the model *and* the market baseline,
  plus the skill differential — the same standard as the bot's readiness gate.
- **Governor + allocator state**: `mode_override` (e.g. `paper_forced` when the
  system self-demotes), opening-suspended flag, live sleeve capital multipliers.
- **All-time scale** (`lifetime`): cumulative markets scanned, evaluations, scans,
  trades, runs — across every version since v1.
- The live signal policy (drivers vs. shadow) and a cleaned `bot.log` tail.

## How ONLINE / OFFLINE is decided

`last_heartbeat` is the bot.log mtime. Fresh (< 5 min) → **ONLINE**; stale →
**OFFLINE** automatically; next fresh heartbeat flips it back. Because "offline"
is just "the file stopped changing," down/recovery needs no extra wiring.

## Public-safe guarantee

The bridge emits **only** whitelisted fields and never reads `.env`. A DENY
regex drops any log line containing `0x…` addresses, signer/key/secret material,
or balance-allowance payloads. Wallet keys, addresses, and API secrets never
leave the machine. The PnL shown is real — including losses — by design.

## Mode truth

The governor's `mode_override` wins: `paper_forced` ⇒ the dashboard says PAPER
no matter what historical log lines claim. Only the current run's recorded mode
(or a live marker in the recent log tail) may report LIVE.
