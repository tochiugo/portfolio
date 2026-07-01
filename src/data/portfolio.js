// Central data model for the engineering platform.
// Everything here is grounded in the ENGINEERING_EVIDENCE_PORTFOLIO repository:
// real source trees, runtime logs, SQLite/JSON state, and curated screenshots.
import evidence from './evidenceManifest';

export const personal = {
  name: 'Tochi Ugochukwu',
  handle: 'tochiugo',
  title: 'Cybersecurity & Automation Engineer',
  subtitle: 'SOC analyst · live trading systems · iOS · AI automation · founder',
  location: 'Los Angeles, CA',
  email: 'tu@tochiugo.com',
  phone: '(317) 833-2695',
  linkedin: 'https://linkedin.com/in/tochi-i-u-a539b8318',
  github: 'https://github.com/tochiugo',
  tryhackme: 'https://tryhackme.com/p/tochiugo',
  credly: 'https://credly.com/users/tochi-ikedinachi-ugochukwu',
  profilePicture: '/images/tochi_ugochukwu.jpg',
  targetRoles: [
    'SOC Analyst (Tier 1/2)', 'Cybersecurity Engineer', 'Detection Engineer',
    'Automation Engineer', 'Applied AI Engineer', 'Software Engineer',
  ],
  pitch:
    "I build and operate systems that run in production. A live cross-venue trading engine (Arbiter) " +
    "with real risk controls and an honest, published ledger; a SwiftUI iOS evidence app; " +
    "browser-automation pipelines; AI-driven tooling; and a home SOC lab where I triage and document " +
    "real investigations. CompTIA Security+ certified, with 10+ years of building and running " +
    "businesses behind it.",
};

// ── Hero (identity band — the very top of the page) ─────────────────────────
export const hero = {
  photo: '/images/tochi_ugochukwu.jpg',
  greeting: 'Hi, I’m Tochi',
  headline: ['I build systems that', 'run in production', '— and keep the receipts.'],
  blurb:
    "Cybersecurity & automation engineer and founder in Los Angeles. A live cross-venue trading engine " +
    "streaming real numbers 24/7, a shipped SwiftUI iOS app, a home SOC lab, and a 10-project " +
    "ecosystem — every claim on this page backed by real runtime logs, databases, and screenshots.",
  stats: [
    { value: '24/7', label: 'Live trading system' },
    { value: '10+', label: 'Shipped projects' },
    { value: '200+', label: 'SOC events triaged' },
    { value: 'Security+', label: 'CompTIA certified' },
  ],
  ctas: [
    { label: 'Get in touch', kind: 'primary', href: '#contact' },
    { label: 'See the live system', kind: 'ghost', href: '#mission-control' },
  ],
};

// Top navigation — order matters: proof first, person second.
export const nav = [
  { id: 'top', label: 'About' },
  { id: 'mission-control', label: 'Mission Control' },
  { id: 'witnesspro', label: 'WitnessPro' },
  { id: 'soc-lab', label: 'SOC Lab' },
  { id: 'soc-console', label: 'SOC Console' },
  { id: 'nexus', label: 'Nexus' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'certs', label: 'Certs' },
  { id: 'evidence', label: 'Evidence' },
  { id: 'contact', label: 'Contact' },
];

// ── Mission Control (homepage centerpiece) ──────────────────────────────────
export const missionControl = {
  system: 'Arbiter — Cross-Venue Divergence Engine',
  codename: 'Arbiter',
  statusUrl: import.meta.env.VITE_STATUS_URL || '/api/status',
  // heartbeat (arbiter.log mtime) older than this (seconds) => OFFLINE
  offlineThresholdSec: 600,
  pollIntervalMs: 15000,
  summary:
    "This is the real thing — a live trading bot running against Polymarket and Kalshi, reading straight " +
    "from its own runtime log and SQLite ledger. Arbiter does one job: it fades Polymarket prices toward " +
    "Kalshi's fair value wherever Kalshi is the sharper book, holds to settlement, and books the P&L — " +
    "wins and losses both. No prediction model, no forecasting. The prior engine (V13) tried pure " +
    "prediction and lost $1,133 over 16,000 trades; the only thing that graded positive was cross-venue " +
    "divergence itself, especially weather. That's the entire reason Arbiter exists.",
  strategyNote:
    "This is deliberately small — an $25 R&D bankroll, not an income strategy. Polymarket's $1-minimum-" +
    "per-order is the binding constraint at this size, so capital velocity is low: a weather position " +
    "locks money for roughly 21 hours until it resolves. On 2026-06-18 a basket executor was armed live " +
    "before its $1-per-leg economics were validated — it repeatedly bought one leg of an unfillable " +
    "basket and unwound it a cent worse, a real ~$11 loss over about 4 hours before the abort/unwind logic " +
    "caught it. It's now back to paper and won't re-arm live without a clean paper run and more capital. " +
    "The plan is explicit: prove the edge is real over 40–50 resolved trades before ever adding capital — " +
    "not the other way around.",
  stack: ['Python', 'asyncio', 'SQLite', 'Polymarket CLOB API', 'Kalshi API', 'launchd', 'pm2'],
  // Engineering evolution — real capabilities, layered over many runs.
  timeline: [
    { v: 'v12', title: 'Provenance Core', body: 'Every decision, input, and outcome recorded in SQLite — any trade replayable end-to-end.' },
    { v: 'v13', title: 'Prediction Attempt', body: 'A pure ML prediction engine traded 16,000+ trades and lost $1,133. Only divergence-based trades graded positive — the seed of Arbiter\'s core rule.' },
    { v: 'Rule', title: '"Never Predict"', body: 'Arbiter is built on the opposite premise of v13: no forecasting, no outcome model — pure book disagreement between Polymarket and Kalshi.' },
    { v: 'Live', title: 'Engine Goes Live', body: 'The engine job starts placing real divergence trades, sized to clear Polymarket\'s $1-per-order minimum.' },
    { v: '6/18', title: 'Basket Incident', body: 'A basket executor armed live before $1-per-leg economics were validated caused a real ~$11 loss in 4 hours. Abort/unwind logic held — no stuck positions. Reverted to paper.' },
    { v: 'Now', title: 'Proving the Edge', body: 'Running weather + sports divergence feeds live at small size, tracking toward a 40–50 trade sample before any capital decision.' },
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

// ── About (the person — photo, story, the businesses behind it) ──────────────
export const about = {
  photo: '/images/tochi_ugochukwu.jpg',
  paragraphs: [
    "I'm <strong class=\"text-white\">Tochi Ugochukwu</strong> — a cybersecurity & automation engineer in " +
    "Los Angeles, and a founder who has been building and running real businesses for over a decade. " +
    "Below this you'll find the proof: a live trading system, a shipped iOS product, a home SOC lab, and more.",
    "My range is wide on purpose. Python trading engines with real risk controls and Brier calibration. " +
    "A SwiftUI iOS app touching low-level AVFoundation. Node orchestration fusing news, crypto, and AI " +
    "signals. Playwright automation against live UIs. And a home SOC lab where I triage simulated " +
    "investigations end-to-end with Splunk and Google Chronicle, map findings to MITRE ATT&CK, and write " +
    "them up the way a Tier-1 analyst does — evidence-first.",
    "That entrepreneurial background is the throughline: I've built supply chains, automated my own " +
    "operations, and shipped products end-to-end. I bring the same instinct to engineering — understand " +
    "the system, build the thing, run it, log it, and keep the receipts.",
  ],
  workAuthorization:
    "Authorized to work in the United States — no employer sponsorship required. Open to on-site " +
    "(Southern California) or remote. Available immediately.",
  highlights: [
    { value: '10+ yrs', label: 'Building businesses' },
    { value: '200+', label: 'SOC events triaged' },
    { value: 'Security+', label: 'CompTIA certified' },
    { value: '2', label: 'Companies founded' },
  ],
};

// ── SOC Homelab (replaces the former Nexus slot) ────────────────────────────
export const socLab = {
  slug: 'soc',
  name: 'Home SOC Lab',
  tagline: 'A real security operations environment — triage, detect, document.',
  status: 'Operational · Active',
  summary:
    "A functional home SOC built on UTM virtual machines: Splunk Enterprise and Google Chronicle for " +
    "SIEM, Kali Linux for recon, and Wireshark for packet analysis. I've worked 200+ simulated events " +
    "end-to-end, written SPL and YARA-L detections, authored NIST-aligned IR playbooks, and documented " +
    "five full case studies — every finding mapped to MITRE ATT&CK.",
  stats: [
    { value: '200+', label: 'Events triaged' },
    { value: '5', label: 'Case studies' },
    { value: '6', label: 'IR playbooks' },
    { value: '3', label: 'SIEM platforms' },
  ],
  architecture: [
    { icon: '🔍', title: 'SIEM', desc: 'Splunk Enterprise + Google Chronicle — ingest, search, correlate' },
    { icon: '🐧', title: 'Attack Sim', desc: 'Kali Linux — Nmap scans and recon exercises' },
    { icon: '🌐', title: 'Network', desc: 'Wireshark — packet capture and protocol analysis' },
    { icon: '🧱', title: 'Isolated Lab', desc: 'UTM VMs with separate attacker / target segments' },
  ],
  images: evidence.soc,
  captions: [
    'Splunk — SPL query returning 87 firewall events, filtered by source IP and event type.',
    'Splunk — isolating a single source IP across the firewall log timeline.',
    'SOC dashboard — alert counts with TP/FP triage classification and alert-type breakdown.',
    'Alert #8816 — brute-force investigation detail mapped to MITRE T1110.',
    'Alert queue — active triage prioritized by severity.',
    'Kali Linux — Nmap -sV scan identifying open services on a lab target.',
    'Wireshark — live packet capture, filtered for suspicious connection patterns.',
    'UTM — the isolated virtualization lab hosting attacker and target VMs.',
  ],
  caseStudies: [
    { sev: 'High', mitre: 'T1110', title: 'Brute-Force Authentication', body: '47 failed logins from one IP in 12 minutes — credential-stuffing confirmed, contained, MFA enforced.' },
    { sev: 'High', mitre: 'T1566', title: 'Phishing Campaign', body: 'Four coordinated alerts in 3 minutes; one account phished within 8 minutes. Suspended, reset, domain blacklisted.' },
    { sev: 'Medium', mitre: 'T1041', title: 'Suspected Exfiltration', body: '2.3 GB outbound to an uncategorized IP off-hours. Host isolated, forensic image captured, DLP updated.' },
    { sev: 'High', mitre: 'T1071', title: 'C2 Beaconing', body: '15-second beacon interval, Cobalt Strike profile via VirusTotal. Host isolated, endpoint hunt initiated.' },
  ],
  spl: [
    { title: 'Brute-Force Detection', code: 'index=auth_logs action=failure\n| stats count by src_ip, user\n| where count > 10\n| sort -count' },
    { title: 'Data-Exfil Anomaly', code: 'index=proxy_logs\n| stats sum(bytes_out) as out by src_ip\n| where out > 1000000000' },
    { title: 'C2 Beacon Pattern', code: 'index=proxy_logs\n| bin _time span=15s\n| stats count, avg(bytes) as a by _time, dst_ip\n| where a<600' },
  ],
};

// ── Experience (the businesses + roles that were missing) ───────────────────
export const experience = [
  {
    org: 'Meridian Nexus Global LLC',
    role: 'Founder & CEO',
    where: 'Los Angeles, CA',
    period: 'Mar 2025 — Present',
    tag: 'International Trade · Vehicle Export',
    body: 'Founded and operate an international logistics and vehicle-export business serving U.S. and ' +
      'Nigerian markets — sourcing vehicles at U.S. auctions and managing full export logistics. Built ' +
      'internal automation tools for operations, lead management, and shipment tracking, and develop ' +
      'software and AI-powered tools under the Meridian Nexus brand.',
    current: true,
  },
  {
    org: 'Tochiugo Global Mark Limited',
    role: 'Founder & CEO',
    where: 'Nigeria — Active (family-managed)',
    period: '2012 — Present',
    tag: 'Manufacturing · Import · Brand Owner',
    body: 'Founded and built a Nigeria-based manufacturing and distribution company. Created TOCHIUGO ' +
      'BOND — a proprietary branded aluminium-composite-panel product (ISO 9001:2000 certified) with a ' +
      'supply chain sourced from China and Brazil. Ran it for 10 years before relocating to the USA; it ' +
      'continues under family management while I remain CEO.',
    current: true,
  },
  {
    org: 'Independent — Home SOC Lab',
    role: 'Security Analyst',
    where: 'Los Angeles, CA',
    period: '2024 — Present',
    tag: 'Cybersecurity · SOC',
    body: 'Operate a home SOC: 200+ simulated events triaged with Splunk and Chronicle, SPL/YARA-L ' +
      'detections authored, six NIST-aligned IR playbooks, and five MITRE-mapped case studies.',
    current: true,
  },
  {
    org: 'Independent',
    role: 'Automation & AI Engineer',
    where: 'Remote',
    period: '2022 — Present',
    tag: 'Engineering',
    body: 'Build event-driven automation and trading systems (Polymarket, Kalshi, Aviator), the WitnessPro ' +
      'iOS app, and AI-assisted tooling — all backed by runtime logs and live operational evidence.',
    current: true,
  },
  {
    org: 'State of Indiana — Dept. of Corrections',
    role: 'Correctional Officer',
    where: 'Indiana, USA — On-site',
    period: 'Oct 2024 — Apr 2025',
    tag: 'Government · Security',
    body: 'Monitored facility security systems and documented incidents with structured reporting while ' +
      'building an IT/engineering career — discipline and operational vigilance directly transferable to ' +
      'SOC monitoring and incident response.',
    current: false,
  },
];

// ── Certifications & education ───────────────────────────────────────────────
export const certifications = {
  items: [
    { icon: '🔒', name: 'CompTIA Security+ ce', issuer: 'CompTIA · Feb 2025 (exp. 2028)', url: 'https://credly.com/users/tochi-ikedinachi-ugochukwu' },
    { icon: '🌐', name: 'Google Cybersecurity Professional', issuer: 'Google / Coursera · 2024', url: 'https://credly.com/users/tochi-ikedinachi-ugochukwu' },
    { icon: '🖥️', name: 'Google IT Support Professional', issuer: 'Google / Coursera · 2025', url: 'https://credly.com/users/tochi-ikedinachi-ugochukwu' },
    { icon: '🛡', name: 'Detection & Response', issuer: 'Google / Coursera', url: 'https://credly.com/users/tochi-ikedinachi-ugochukwu' },
    { icon: '🌐', name: 'Networks & Network Security', issuer: 'Google / Coursera', url: 'https://credly.com/users/tochi-ikedinachi-ugochukwu' },
    { icon: '🐧', name: 'Linux & SQL', issuer: 'Google / Coursera', url: 'https://credly.com/users/tochi-ikedinachi-ugochukwu' },
  ],
  tryhackme: {
    url: 'https://tryhackme.com/p/tochiugo',
    stats: [
      { value: 'Top 8%', label: 'Global rank' },
      { value: '50+', label: 'Rooms' },
      { value: '11', label: 'Badges' },
      { value: '172K+', label: 'Score' },
    ],
    badges: ['OWASP Top 10 (Rare)', 'Advent of Cyber 2024 (Rare)', 'Privilege Escalation (Rare)', 'SOC Level 1', 'cat linux.txt', 'Webbed'],
  },
  education: {
    items: [
      { title: 'High School Diploma (GED)', detail: 'United States' },
      { title: 'Self-Directed Technical Training', detail: 'AI/ML · Software Development · Cybersecurity · Automation Engineering — 2022–present' },
    ],
  },
};

// ── Nexus Ecosystem (confidential digital-human platform — public-safe teaser only) ──
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
  images: ['/evidence/nexus/01.png', '/evidence/nexus/02.png', '/evidence/nexus/03.png'],
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
    slug: 'polymarket',
    name: 'Polymarket Engine — V15.4',
    category: 'Trading System',
    status: 'Shipped',
    published: false,
    tagline: 'The prior AI trading engine — retired; its −$1,133 lesson is why Arbiter (Mission Control, live now) exists.',
    stack: ['Python', 'asyncio', 'XGBoost', 'SQLite', 'Kalshi', 'Polymarket CLOB/Gamma', 'pm2'],
    summary:
      "89 production runs and 15 major versions of a pure-prediction trading fund, now retired in favor of " +
      "Arbiter's divergence-only approach (see Mission Control). V15 restructured it from a single-brain bot " +
      "into an institutional design: independent strategy " +
      "sleeves with per-sleeve P&L and drawdown budgets, a Bayesian capital allocator, a pre-trade risk " +
      "veto chain, and an autonomous governor that tunes policy and self-demotes to paper when calibration " +
      "slips. V15.4 added passive maker-entry execution — recovering a measured −1.9% taker spread cost — " +
      "and a 7-gate objective live-readiness scorecard.",
    highlights: [
      '5-layer architecture: governance → capital allocation → sleeves → risk authority → execution + TCA, on a full provenance record',
      'XGBoost brain with a quality gate — it earns veto power only at validation AUC ≥ 0.55',
      'Transaction-cost analysis on every fill, measured against the decision book',
      'Calibration judged as skill vs. the market baseline — not an absolute Brier threshold',
      'Honest ledger: every loss recorded and published live, including $1 "probe tuition" trades',
    ],
    metrics: [{ label: 'Version', value: 'V15.4' }, { label: 'Runs', value: '89' }, { label: 'Trades', value: '15K+' }],
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
    slug: 'polymarket-v3',
    name: 'Polymarket Bot V3',
    category: 'Trading System',
    status: 'Research',
    published: false,
    tagline: 'The earlier architecture: latency-arb + flash-crash + late-window.',
    stack: ['Python', 'asyncio', 'Binance WS', 'py-clob-client', 'SQLite', 'Fernet/PBKDF2'],
    summary:
      "An earlier generation of the engine, kept as a clean reference architecture. Three strategies share " +
      "a data layer (tick-level Binance feed, Gamma market discovery, CLOB websocket with REST fallback), " +
      "an execution layer (2s position monitor, paper router with 0.5% slippage, gasless CLOB redemption, " +
      "encrypted key signer), and a risk layer (kill-switch, exposure cap, Brier auto-tightening). " +
      "Paper-trading by default.",
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
    { label: 'Projects documented', value: '12' },
    { label: 'Screenshots reviewed', value: '200+' },
    { label: 'Curated to', value: '43' },
    { label: 'Evidence sections', value: '7' },
  ],
};

export const techStack = {
  Languages: ['Python', 'JavaScript / TypeScript', 'Swift', 'Node.js', 'Bash'],
  'Mobile & UI': ['SwiftUI', 'AVFoundation', 'React Native', 'Expo', 'React', 'Tailwind'],
  'Automation & Data': ['Playwright', 'WebSockets', 'asyncio', 'SQLite', 'REST APIs'],
  'Trading & AI': ['Polymarket CLOB/Gamma', 'Kalshi', 'Binance feeds', 'XGBoost', 'Claude / LLM scoring', 'Bayesian allocation', 'Brier calibration', 'Kelly sizing'],
};

export default {
  personal, hero, nav, missionControl, witnessPro, about, socLab, experience,
  certifications, projects, evidenceRepo, techStack,
};
