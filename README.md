# Tochi Ugochukwu — Engineering Platform

A proof-driven portfolio, live at **[tochiugo.com](https://tochiugo.com)**. Not a résumé
site — a living engineering platform where every claim is backed by real runtime evidence.

**Live centerpiece:** Mission Control — a public-safe dashboard wired to the **real,
running Polymarket/Kalshi trading system (V15.4)**. It streams the system's actual
trade ledger, PnL (including losses), calibration, governor state, and sleeve capital
allocations. Below it: a native iOS product (**WitnessPro**), a home **SOC lab**, a
10-project ecosystem with swipeable evidence galleries, and an embedded assistant
(**ATLAS**).

## Stack

- **React 18 + Vite** single-page app
- **Tailwind CSS** (dark, operational aesthetic)
- Client-only UI — no tracking, no data leaves the browser
- One serverless function (`api/status.js`) proxies the live bot feed

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build -> dist/
```

Deploys via `vercel --prod` (no git auto-deploy).

## Structure

```
src/
  App.jsx                  section composition + scroll spy
  data/
    portfolio.js           single source of truth (projects, copy, timeline)
    evidenceManifest.js    auto-generated curated screenshot paths
  components/
    MissionControl.jsx     live V15 dashboard (the homepage centerpiece)
    SwipeGallery.jsx       reusable swipeable gallery (touch / arrows / lightbox)
    WitnessProSection.jsx  iOS product section
    ProjectEcosystem.jsx   filterable project grid with galleries
    SocLab.jsx             home SOC lab (Splunk / Chronicle / MITRE)
    AboutEngineer.jsx · Experience.jsx · Certifications.jsx
    EvidenceRepo.jsx · ContactSection.jsx · Nav.jsx
    NexusAI.jsx            ATLAS — client-side engineering assistant
public/
  resume.html / resume.pdf the résumé (web + one-click PDF)
  evidence/<project>/      curated, public-safe screenshots
api/
  status.js                Vercel function: reads the live feed (GitHub gist)
mission-control/
  live_status_bridge.py    bot-side bridge (sanitized, every ~20s, via pm2)
```

## Mission Control feed

`live_status_bridge.py` runs next to the bot (pm2), reads its `bot.log` + SQLite trade
ledger **read-only**, and pushes a sanitized `status.json` to a GitHub gist every ~20s;
the site polls it through `/api/status`. Primary metrics are scoped to the current V15
system (`run_id >= V15_FIRST_RUN`); an all-time block carries the cumulative scale. If
the heartbeat goes stale the dashboard flips to OFFLINE automatically and recovers on
the next heartbeat. See [`mission-control/README.md`](mission-control/README.md).

## Evidence & privacy

Screenshots are the curated public slice of a larger per-project evidence repository.
All captures are public-safe: no wallets, keys, tokens, credentials, or precise PII.
The bridge whitelists fields and strips anything matching addresses or secrets before
publishing. The trading system's source is not published here.
