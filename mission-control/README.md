# Mission Control — live status bridge

The portfolio homepage renders a live operational dashboard for the Polymarket
**V15.4** system. It is driven by one small contract:

```
bot  ──writes every 30s──▶  status.json  ──read by──▶  portfolio dashboard
```

That's the whole design. No websockets to the browser, no backend to babysit —
just a JSON file the bot keeps fresh and the site polls.

## Files

| File | Purpose |
| --- | --- |
| `update_status.py` | Writes a **sanitized, public-safe** `status.json` every 30s. |
| `../public/status.json` | The status file the portfolio reads (seed committed for the dry-run demo). |

## Run it

```bash
# continuous (writes every 30s)
python3 update_status.py --out ../public/status.json

# single snapshot
python3 update_status.py --out ../public/status.json --once
```

## How ONLINE / OFFLINE is decided

The portfolio reads `last_heartbeat` from `status.json`:

- **fresh** (heartbeat within ~90s) → dashboard shows **ONLINE** with live uptime.
- **stale** (bot stopped writing) → dashboard flips to **OFFLINE**, showing
  *Last Seen* and a running *Downtime* counter.
- bot comes back → next fresh heartbeat flips it back to **ONLINE** automatically.

Because "offline" is just "the file stopped changing," nothing extra has to be
wired up for the down/recovery behavior to work.

## Public-safe guarantee

`update_status.py` emits **only** the fields in its `PUBLIC_FIELDS` whitelist.
It never reads or writes:

- wallet private keys, funder addresses, key passphrases
- CLOB / Builder API keys or secrets
- real position sizes, real PnL, or account balances

The reference build emits **dry-run** telemetry. To surface real (still sanitized)
numbers, replace `read_bot_state()` with a reader for your bot's own state/log
files and copy across only whitelisted public fields.

## Deploying the feed

The site fetches `VITE_STATUS_URL` (defaults to `/status.json`, same origin).
Point it wherever the bot can publish:

- **Same origin** — bot writes into the deployed `public/status.json` (simplest if
  the bot and site share a host).
- **Object store / gist** — bot uploads `status.json`; set
  `VITE_STATUS_URL=https://…/status.json` at build time.

If the feed is unreachable or stale, the dashboard runs a clearly-labeled
**public dry-run** telemetry stream so the centerpiece is never blank.
