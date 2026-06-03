// Central data model for the engineering platform.
// Everything here is grounded in the ENGINEERING_EVIDENCE_PORTFOLIO repository:
// real source trees, runtime logs, SQLite/JSON state, and curated screenshots.
import evidence from './evidenceManifest';

export const personal = {
  name: 'Tochi Ugochukwu',
  handle: 'tochiugo',
  title: 'Software & Automation Engineer',
  subtitle: 'Live trading systems · iOS products · AI-driven automation',
  location: 'Los Angeles, CA',
  email: 'tu@tochiugo.com',
  phone: '(317) 833-2695',
  linkedin: 'https://linkedin.com/in/tochi-i-u-a539b8318',
  github: 'https://github.com/tochiugo',
  targetRoles: [
    'Software Engineer', 'Automation Engineer', 'Applied AI Engineer',
    'Backend / Systems Engineer', 'Founding Engineer',
  ],
  pitch:
    "I build systems that run — not slide decks. Autonomous trading bots with risk controls and " +
    "calibration, a published-grade iOS evidence app, browser-automation pipelines, and AI-driven " +
    "tooling. Everything on this site is backed by real runtime logs, databases, and screenshots.",
};

// Top navigation — order matters: proof first, person second.
export const nav = [
  { id: 'mission-control', label: 'Mission Control' },
  { id: 'witnesspro', label: 'WitnessPro' },
  { id: 'about', label: 'About' },
  { id: 'nexus', label: 'Nexus' },
  { id: 'projects', label: 'Projects' },
  { id: 'evidence', label: 'Evidence' },
  { id: 'contact', label: 'Contact' },
];

// ── Mission Control (homepage centerpiece) ──────────────────────────────────
export const missionControl = {
  system: 'Polymarket Mission Control',
  codename: 'V12-53',
  statusUrl: import.meta.env.VITE_STATUS_URL || '/status.json',
  // heartbeat older than this (seconds) => treat the live feed as OFFLINE
  offlineThresholdSec: 90,
  pollIntervalMs: 45000,
  summary:
    "A real prediction-market trading engine for Polymarket BTC/ETH up-down markets — shown here " +
    "in a public-safe, dry-run mode. No wallet, no live orders, no private data. Just the operational " +
    "surface: heartbeats, market scans, signal evaluations, risk state, and runtime logs.",
  strategyNote:
    "Three complementary edges run together: Latency-Arb (Binance leads Polymarket 2-55s), " +
    "Flash-Crash (contrarian bounce on a sudden 0.27+ probability drop), and Late-Window " +
    "(market mid + spot price confirmation inside the final two minutes). Every strategy carries " +
    "SL/TP exit logic, a 10-minute trend filter, and Kelly position sizing.",
  stack: ['Python', 'asyncio', 'Binance WS', 'Polymarket CLOB/Gamma', 'SQLite', 'Brier calibration', 'Telegram'],
  // Engineering timeline — show the journey, not perfection.
  timeline: [
    { v: 'V1', title: 'Initial Concept', body: 'First signal-based loop against Polymarket markets. Naive, no exits — but running.' },
    { v: 'V2', title: 'Risk Controls', body: 'Kill-switch, exposure caps, and SL/TP exit logic — the gap most bots never close.' },
    { v: 'V4', title: 'Signal Improvements', body: 'Latency-arb core: detect Binance moves before Polymarket reprices (2-55s window).' },
    { v: 'V6', title: 'Market Filtering', body: '10-minute trend filter added to kill the directional-bias drawdown documented in live runs.' },
    { v: 'V8', title: 'AI Evaluation', body: 'Model-scored market evaluation and contrarian flash-crash entries with confidence gating.' },
    { v: 'V10', title: 'Monitoring', body: 'Position monitor every 2s, Brier calibration, watchdog, and Telegram alerting.' },
    { v: 'V12-53', title: 'Current Operational Version', body: 'Three strategies, Kelly sizing, paper router by default. The version on this dashboard.' },
  ],
};

// ── WitnessPro (second section — App Store-quality) ─────────────────────────
export const witnessPro = {
  slug: 'witnesspro',
  name: 'WitnessPro',
  tagline: 'The evidence operating system for your pocket.',
  platform: 'iOS · SwiftUI · AVFoundation',
  status: 'Product',
  summary:
    "A SwiftUI iOS app for tamper-aware evidence capture. Its signature feature is true dual-camera " +
    "recording — front and rear simultaneously — something the stock iOS camera can't do. Every capture " +
    "is sealed with timestamp and GPS metadata and filed into a searchable Evidence Vault.",
  features: [
    { icon: '🎥', title: 'Dual-Camera Recording', body: 'Front + rear at once via AVCaptureMultiCamSession — a deliberately uncommon AVFoundation API.' },
    { icon: '📍', title: 'Sealed Metadata', body: 'Timestamp, address, and GPS coordinates burned into every recording for chain-of-custody.' },
    { icon: '🛡️', title: 'Tamper Awareness', body: 'On-screen screenshot detection and overlay controls that hide PII without breaking the sealed evidence.' },
    { icon: '🗄️', title: 'Evidence Vault', body: 'Searchable, categorized vault — witness recordings and photos with a per-day overview.' },
  ],
  workflow: ['Launch', 'Capture', 'Seal metadata', 'Vault', 'Export'],
  stack: ['Swift', 'SwiftUI', 'AVFoundation', 'AVCaptureMultiCamSession', 'CoreLocation'],
  images: evidence.witnesspro,
  captions: [
    'Launch — the WitnessPro "Evidence Operating System" splash.',
    'Home — live dual-camera recording entry, Evidence Library, and operation presets.',
    'Dual-camera capture — rear + front picture-in-picture with sealed timestamp and GPS.',
    'Overlay controls — hide timestamp / address / coordinates while metadata stays sealed in the evidence.',
    'Tamper awareness — on-device screenshot detection during an active recording.',
    'Evidence Vault — searchable vault with per-day overview and witness recordings.',
  ],
  links: [
    { label: 'Learn More', kind: 'primary', href: '#witnesspro-detail' },
    { label: 'Request Trial Access', kind: 'ghost', href: 'mailto:tu@tochiugo.com?subject=WitnessPro%20Trial%20Access' },
  ],
};

// ── Nexus Ecosystem (curiosity — public-safe only) ──────────────────────────
export const nexus = {
  slug: 'nexus',
  name: 'Nexus Ecosystem',
  tagline: 'A digital-human platform. Most of it stays behind the curtain.',
  status: 'Confidential · public-safe surface only',
  summary:
    "Nexus is an in-progress digital-human ecosystem — body capture, twin creation, and an agentic " +
    "interface layer. The architecture and specifications are confidential. What's shown here is the " +
    "public-safe prototype surface only: enough to convey the product direction, nothing sensitive.",
  publicConcepts: ['Digital Human', 'Body Capture', 'Twin Creation', 'Public UI Concepts'],
  images: evidence.nexus,
  captions: [
    'Public prototype — the Nexus "Create your Digital Human" concept shell.',
    'Concept navigation — the digital-human capture and twin-creation surface.',
    'Onboarding concept — ownership and privacy framing for a personal digital twin.',
  ],
  withheld: ['Confidential architecture', 'Internal specifications', 'Capture pipeline', 'Strategy & roadmap'],
};

// ── Project ecosystem (curated galleries) ───────────────────────────────────
// status: Operational | Shipped | Prototype | Research
export const projects = [
  {
    slug: 'polymarket-v3',
    name: 'Polymarket Bot V3',
    category: 'Trading System',
    status: 'Operational',
    published: false,
    tagline: 'Latency-arb + flash-crash + late-window, with real exits.',
    stack: ['Python', 'asyncio', 'Binance WS', 'py-clob-client', 'SQLite', 'Fernet/PBKDF2'],
    summary:
      "The architecture behind Mission Control. Three strategies share a data layer (tick-level Binance " +
      "feed, Gamma market discovery, CLOB websocket with REST fallback), an execution layer (2s position " +
      "monitor, paper router with 0.5% slippage, gasless CLOB redemption, encrypted key signer), and a " +
      "risk layer (kill-switch, exposure cap, Brier auto-tightening). Paper-trading by default.",
    highlights: [
      'Latency-Arb edge: Binance @trade stream sub-100ms, acts before Polymarket reprices',
      'Encrypted key handling — PBKDF2 + Fernet, never plaintext',
      'Walk-forward backtester + Brier calibration in SQLite',
      'DRY_RUN by default — zero real money until explicitly flipped',
    ],
    metrics: [{ label: 'Strategies', value: '3' }, { label: 'Scan interval', value: '2s' }, { label: 'Default mode', value: 'Paper' }],
    images: evidence['polymarket-v3'],
    captions: ['V3 runtime — async scan loop wiring data, strategy, execution, and risk modules.'],
  },
  {
    slug: 'polymarket',
    name: 'Polymarket Bot (Operational)',
    category: 'Trading System',
    status: 'Operational',
    published: false,
    tagline: 'Long-running process with a real trade ledger and Brier score.',
    stack: ['Python', 'SQLite', 'systemd/pm2', 'Telegram'],
    summary:
      "The operations-hardened lineage: a persistent process exposing PID / uptime / CPU / memory, a " +
      "structured trade ledger, and a live bot.log streaming scans, resolutions, risk updates, and a " +
      "running Brier score. Subsystems span signals, calibration, risk, execution, research, and forensics.",
    highlights: [
      'Live status output: PID, uptime, CPU, memory',
      'Structured trade ledger + calibration/trades.db',
      'bot.log shows scans, resolutions, and risk updates in real time',
    ],
    metrics: [{ label: 'State', value: 'Long-running' }, { label: 'Ledger', value: 'SQLite' }, { label: 'Calibration', value: 'Brier' }],
    images: evidence.polymarket,
    captions: [
      'Boot — configuration banner and subsystem initialization.',
      'Live market scan — Polymarket BTC/ETH markets with mid/spread.',
      'Structured evaluation log — signal gating and skip/act decisions.',
      'Trade ledger — resolved-trade rows persisted to the database.',
      'Operational status — uptime, risk state, and running Brier score.',
    ],
  },
  {
    slug: 'sniper',
    name: 'Polymarket Sniper',
    category: 'Trading System',
    status: 'Research',
    published: false,
    tagline: 'Multi-phase prediction engine — built, then honestly audited.',
    stack: ['Python', 'SQLite', 'Strategy/Reasoning/Risk modules'],
    summary:
      "A multi-module prediction-market project documented across phase reports — intelligence layer, " +
      "integration, calibration, and execution. What makes it interesting isn't a readiness claim; it's the " +
      "self-audit: a later concrete-audit report flags that several phase systems were never wired into the " +
      "execution flow. Shipping the audit alongside the code is the engineering signal here.",
    highlights: [
      'Phase reports tracing the system\'s evolution',
      'Strategy, reasoning, calibration, execution, and risk modules',
      'Critical self-audit that contradicts earlier "ready" reports — honesty over hype',
    ],
    metrics: [{ label: 'Phases', value: 'Multi' }, { label: 'Discipline', value: 'Self-audited' }],
    images: evidence.sniper,
    captions: [
      'Phase 1 — core intelligence layer completion report.',
      'Phase 3 — strategy + integration report.',
      'Integration audit — modules vs. actual execution wiring.',
      'Final concrete audit — honest gaps documented, not hidden.',
    ],
  },
  {
    slug: 'bet-bot',
    name: 'Bet Bot — Aviator',
    category: 'Browser Automation',
    status: 'Operational',
    published: false,
    tagline: 'Live crash-game automation, captured frame-by-frame.',
    stack: ['Node.js', 'Browser automation', 'Frame capture', 'Session logging'],
    summary:
      "Automation against a live SportyBet 'Aviator' crash game: reading the rising multiplier in real " +
      "time, driving the bet/cash-out panel, and recording the whole session as frames plus structured " +
      "logs and evidence JSON. The frame set captures the multiplier climbing and crashing across rounds.",
    highlights: [
      'Real-time multiplier read (4.18x → crash → recovery captured)',
      'Recorded session frames + JSON evidence artifacts',
      'Drives a live, hostile, constantly-changing game UI',
    ],
    metrics: [{ label: 'Capture', value: 'Frame-by-frame' }, { label: 'Evidence', value: 'JSON + frames' }],
    images: evidence['bet-bot'],
    captions: [
      'Live round — multiplier at 4.18x with the betting panel under automation.',
      'Volatility — a 6.11x round captured mid-flight.',
      'Reset — fresh round at 1.12x, panel re-armed.',
      'Climb — 2.03x with cash-out logic watching.',
      'Recovery — 4.48x captured later in the session.',
    ],
  },
  {
    slug: 'nexus-bot',
    name: 'Nexus Bot',
    category: 'Trading System',
    status: 'Operational',
    published: false,
    tagline: 'Node orchestration fusing news, crypto, weather, and AI scoring.',
    stack: ['Node.js', 'Kalshi', 'Perigon news', 'Claude scoring', 'async loops'],
    summary:
      "A production-style Node.js automation layer whose entrypoint wires Kalshi markets, Perigon news, " +
      "Claude-based scoring, and crypto / economics / weather signals. It runs a main trader loop plus a " +
      "parallel 15-minute crypto scalper, supports both dry-run and live modes, and logs every cycle.",
    highlights: [
      'Modular signal sources: news, crypto, economics, weather',
      'Claude-scored decisioning layer',
      'Main trader loop + parallel scalper, dry-run and live modes',
    ],
    metrics: [{ label: 'Signals', value: '4+ sources' }, { label: 'Loops', value: 'Trader + scalp' }],
    images: evidence['nexus-bot'],
    captions: [
      'Cycle log — multi-source orchestration with per-cycle summaries.',
      'Decisioning — skipped opportunities and scalp entries in dry-run.',
    ],
  },
  {
    slug: 'fifteen-min',
    name: '15 Minutes',
    category: 'Trading System',
    status: 'Operational',
    published: false,
    tagline: 'Time-windowed Kalshi bot with streak and late-entry logic.',
    stack: ['Node.js', 'Kalshi', 'time-window logic'],
    summary:
      "A Kalshi-oriented prediction bot built around a live scan / strike / execution loop. It carries " +
      "lead-score persistency, high-probability triggers, streak triggers, and a 'late-entry reaper' that " +
      "governs entries inside the final minutes of a window.",
    highlights: ['Scan → strike → execute loop', 'Streak + high-probability triggers', 'Late-entry reaper for end-of-window timing'],
    metrics: [{ label: 'Window', value: '15 min' }, { label: 'Triggers', value: 'Streak/late' }],
    images: evidence['fifteen-min'],
    captions: [
      'Boot — execution mode banner and scan loop start.',
      'Live scan — strike evaluation across the market table.',
    ],
  },
  {
    slug: 'sharp',
    name: 'SHARP',
    category: 'Automation',
    status: 'Operational',
    published: true,
    tagline: 'High-frequency scalper with resilient reconnect behavior.',
    stack: ['Node.js / Python', 'WebSocket', 'daily reporting'],
    summary:
      "A high-frequency scalping/automation system with a real report-generation footprint (daily_report.json) " +
      "and a runtime that demonstrates resilient WebSocket reconnect behavior under churn. Shown as a single " +
      "honest runtime capture — the evidence here is intentionally not oversold.",
    highlights: ['Continuous WebSocket scanning', 'Automatic reconnect on drop', 'Daily report generation'],
    metrics: [{ label: 'Cadence', value: 'High-freq' }, { label: 'Reporting', value: 'Daily JSON' }],
    images: evidence.sharp,
    captions: ['Runtime — continuous scanning with automatic WebSocket reconnect.'],
  },
  {
    slug: 'sporty',
    name: 'SportyBot',
    category: 'Browser Automation',
    status: 'Shipped',
    published: true,
    tagline: 'Playwright automation for SportyBet with DB-backed bet tracking.',
    stack: ['Python', 'Playwright', 'SQLite', 'Telegram'],
    summary:
      "A multi-module SportyBet automation system built on Playwright browser automation, with a database " +
      "schema for persistent bet tracking, Telegram notifications, and multiple betting modules. The runtime " +
      "capture shows the login/automation bootstrap; the depth is in the source and schema.",
    highlights: ['Playwright-driven browser automation', 'SQLite bet-tracking schema', 'Telegram notifications + modular betting flow'],
    metrics: [{ label: 'Engine', value: 'Playwright' }, { label: 'State', value: 'SQLite' }],
    images: evidence.sporty,
    captions: ['Runtime — browser bootstrap and SportyBet login automation.'],
  },
  {
    slug: 'nexus-drive',
    name: 'Nexus Drive',
    category: 'Automation',
    status: 'Operational',
    published: true,
    tagline: 'Rideshare-driver automation with on-device Android control.',
    stack: ['Python', 'Android device control', 'live-map logic', 'logging'],
    summary:
      "An automation project that drives a real Android device — launching the driver app, reading a live " +
      "map phase, and running a scheduled-rides phase. Logs capture device connection, phase transitions, " +
      "and a 'LAX hunter' module that biases toward high-value pickup zones.",
    highlights: ['On-device Android automation', 'Live-map + scheduled-rides phases', 'Zone-targeting hunter module'],
    metrics: [{ label: 'Target', value: 'Android' }, { label: 'Phases', value: 'Map + rides' }],
    images: evidence['nexus-drive'],
    captions: [
      'Boot — device connected, driver app launching.',
      'Active phase — scheduled-rides logic with phase transitions.',
      'Source — hunter module and logging configuration.',
    ],
  },
  {
    slug: 'tryon',
    name: 'TryOn',
    category: 'Mobile App',
    status: 'Shipped',
    published: true,
    tagline: 'Expo / React Native virtual try-on with a render pipeline.',
    stack: ['Expo', 'React Native', 'TypeScript', 'Node server'],
    summary:
      "A cross-platform virtual try-on app: capture or upload a photo, pick a garment, and run a render. " +
      "Built as an Expo / React Native client with hydration and navigator gating, backed by a separate " +
      "Node server. Tabs span TryOn, Wardrobe, Renders, and Profile with a credit-metered render workflow.",
    highlights: ['Expo / React Native with navigator gating', 'Separate app + server architecture', 'Upload → pick garment → render → history flow'],
    metrics: [{ label: 'Platform', value: 'iOS + Android' }, { label: 'Tabs', value: '4' }],
    images: evidence.tryon,
    captions: [
      'Home — capture-or-upload entry with the four-tab shell.',
      'Picker — selecting a source photo for try-on.',
      'Processing — render job in progress.',
      'Result — render workflow with credit metering and save/share.',
      'Wardrobe — saved garments and renders.',
    ],
  },
];

// ── Evidence repository ─────────────────────────────────────────────────────
export const evidenceRepo = {
  summary:
    "Every claim on this site traces back to an evidence repository: real source trees, runtime logs, " +
    "SQLite/JSON state, and screenshots, organized per project. This site ships a curated slice — the " +
    "strongest few shots per project — not the full dump.",
  sections: ['01 Overview', '02 Runtime', '03 Logs', '04 Database', '05 Code', '06 Screenshots', '07 Resume Evidence'],
  stats: [
    { label: 'Projects documented', value: '13' },
    { label: 'Screenshots reviewed', value: '200+' },
    { label: 'Curated to', value: '38' },
    { label: 'Evidence sections', value: '7' },
  ],
};

export const techStack = {
  Languages: ['Python', 'JavaScript / TypeScript', 'Swift', 'Node.js', 'Bash'],
  'Mobile & UI': ['SwiftUI', 'AVFoundation', 'React Native', 'Expo', 'React', 'Tailwind'],
  'Automation & Data': ['Playwright', 'WebSockets', 'asyncio', 'SQLite', 'REST APIs'],
  'Trading & AI': ['Polymarket CLOB/Gamma', 'Kalshi', 'Binance feeds', 'Claude / LLM scoring', 'Brier calibration', 'Kelly sizing'],
};

export default {
  personal, nav, missionControl, witnessPro, nexus, projects, evidenceRepo, techStack,
};
