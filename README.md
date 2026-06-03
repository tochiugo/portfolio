# Tochi Ugochukwu — Engineering Platform

A proof-driven portfolio. Not a résumé site — a living engineering ecosystem where
every claim is backed by real runtime evidence.

**Live centerpiece:** a public-safe, dry-run **Mission Control** dashboard for a
Polymarket trading system (heartbeats, market scans, signal evaluations, runtime logs),
followed by a shipped iOS product (**WitnessPro**), a 10-project ecosystem with swipeable
evidence galleries, a confidential-but-teased digital-human concept (**Nexus**), and an
embedded engineering assistant (**ATLAS**).

## Stack

- **React 18 + Vite** single-page app
- **Tailwind CSS** (dark, operational aesthetic)
- Client-only — no backend, no tracking, no data leaves the browser
- Mission Control reads a `status.json` heartbeat feed (see `mission-control/`)

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build -> dist/
npm run preview  # preview the production build
```

## Structure

```
src/
  App.jsx                  section composition + scroll spy
  data/
    portfolio.js           single source of truth (projects, copy, timeline)
    evidenceManifest.js     auto-generated curated screenshot paths
  components/
    MissionControl.jsx     live status dashboard (the homepage centerpiece)
    SwipeGallery.jsx       reusable swipeable gallery (touch / arrows / lightbox)
    WitnessProSection.jsx  App Store-quality iOS product section
    ProjectEcosystem.jsx   filterable project grid with galleries
    NexusSection.jsx       confidential, public-safe teaser
    AboutEngineer.jsx · EvidenceRepo.jsx · ContactSection.jsx · Nav.jsx
    NexusAI.jsx            ATLAS — client-side engineering assistant
public/
  status.json             live Mission Control feed (dry-run seed)
  evidence/<project>/      curated, public-safe screenshots
mission-control/
  update_status.py        bot-side writer (sanitized, every 30s) + README
```

## Mission Control feed

The bot writes a sanitized `status.json` every 30s; the site polls it. If the heartbeat
goes stale the dashboard flips to OFFLINE with a downtime counter, and back to ONLINE when
fresh heartbeats return. See [`mission-control/README.md`](mission-control/README.md).

## Evidence & privacy

Screenshots are the curated public slice of a larger per-project evidence repository.
All captures are public-safe: no wallets, keys, tokens, credentials, or precise PII
(location overlays in the WitnessPro shots are redacted). The Polymarket bot and Nexus
ecosystem source remain private.
