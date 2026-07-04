import React, { useState, useRef, useEffect } from 'react';
import { personal, missionControl, witnessPro, about, socLab, experience, certifications, projects, evidenceRepo, techStack } from '../data/portfolio';

// ATLAS — the portfolio's engineering assistant.
// Primary path: /api/chat (Claude, grounded in real Tochi facts + free-form
// conversation for everything else). Falls back to this file's rule-based
// responder — derived from the same data module that renders the site — if
// the API key isn't configured or the call fails, so the widget never breaks.

const ATLAS = 'ATLAS';

function escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
// word-boundary match — plain .includes() false-positives on substrings
// (e.g. "bot" inside "robot", "real" inside "really").
function wordMatch(text, term) { return new RegExp(`\\b${escapeRegex(term)}\\b`, 'i').test(text); }

// ── retrieval: build a keyword index over projects + sections ────────────────
const PROJECT_KEYWORDS = {
  polymarket: ['v15', 'sleeve', 'allocator', 'governor', 'maker entry', 'readiness gate', 'tca', 'xgboost', 'brain', 'fund', 'polymarket engine', 'polymarket bot', 'trade ledger', 'operational bot', 'brier', 'pid', 'uptime'],
  'polymarket-v3': ['v3', 'latency', 'flash crash', 'late window', 'clob', 'gamma'],
  sniper: ['sniper', 'phase', 'audit', 'reasoning'],
  'bet-bot': ['bet bot', 'aviator', 'crash game', 'sportybet', 'multiplier', 'cash out'],
  'nexus-bot': ['nexus bot', 'kalshi', 'perigon', 'claude scoring'],
  'fifteen-min': ['15 minutes', '15 min', 'fifteen', 'streak', 'late entry', 'reaper'],
  sharp: ['sharp', 'scalper', 'reconnect', 'high frequency', 'high-frequency'],
  sporty: ['sporty', 'sportybot', 'playwright'],
  'nexus-drive': ['nexus drive', 'rideshare', 'lyft', 'driver', 'lax', 'hunter'],
  tryon: ['tryon', 'try on', 'try-on', 'expo', 'react native', 'wardrobe', 'garment', 'render'],
  'weather-bot': ['weather bot', 'gefs', 'ecmwf', 'temperature market', 'ensemble forecast'],
};

function projectBySlug(slug) { return projects.find((p) => p.slug === slug); }

function describeProject(p) {
  const lines = [
    `**${p.name}** — ${p.category} · ${p.status}`,
    '',
    p.summary,
    '',
    'Highlights:',
    ...p.highlights.map((h) => `• ${h}`),
    '',
    `Stack: ${p.stack.join(', ')}`,
    p.published ? 'Source: publishable.' : 'Source: kept private (operational system).',
  ];
  return lines.join('\n');
}

function classifyIntent(text) {
  const t = text.toLowerCase().trim();
  if (!t) return { intent: 'empty' };

  // direct project match first
  for (const [slug, kws] of Object.entries(PROJECT_KEYWORDS)) {
    if (kws.some((k) => wordMatch(t, k))) return { intent: 'project', slug };
  }

  const has = (...terms) => terms.some((term) => wordMatch(t, term));
  if (has('how is the bot', 'bot doing', 'how is it doing', 'how is it performing', 'current pnl', 'live pnl', 'live numbers', "pnl", "p&l", 'how much profit', 'how much has', 'bot status', 'doing right now', 'how is the trading')) return { intent: 'bot_status' };
  if (/\b(hi|hello|hey|yo|howdy)\b/.test(t) || has('good morning', 'good afternoon', 'good evening')) return { intent: 'greeting' };
  if (has('thank', 'awesome', 'great', 'perfect', 'nice')) return { intent: 'thanks' };
  if (has('bye', 'goodbye', 'see you', 'later', 'take care')) return { intent: 'goodbye' };
  if (has('mission control', 'dashboard', 'live system', 'status', 'online', 'offline', 'heartbeat', 'uptime', 'dry run', 'dry-run')) return { intent: 'mission_control' };
  if (has('trading', 'bot', 'trade', 'strategy', 'strategies', 'risk', 'kelly', 'signal', 'arbiter', 'divergence')) return { intent: 'trading' };
  if (has('witness', 'ios', 'iphone', 'swift', 'camera', 'mobile app', 'avfoundation', 'evidence vault')) return { intent: 'witnesspro' };
  if (has('soc', 'splunk', 'chronicle', 'siem', 'mitre', 'wireshark', 'kali', 'nmap', 'threat', 'incident', 'security analyst', 'detection', 'triage', 'home lab', 'homelab')) return { intent: 'soc' };
  if (has('business', 'founder', 'ceo', 'company', 'llc', 'entrepreneur', 'meridian', 'tochiugo global', 'export', 'experience', 'work history', 'correctional')) return { intent: 'experience' };
  if (has('cert', 'security+', 'comptia', 'google cyber', 'tryhackme', 'credential', 'education', 'ged', 'degree', 'qualified')) return { intent: 'certs' };
  if (has('architecture', 'how does it work', 'how do you build', 'design', 'how is it built', 'engineering decision')) return { intent: 'architecture' };
  if (has('evidence', 'proof', 'screenshot', 'logs', 'how do i know', 'verify', 'real')) return { intent: 'evidence' };
  if (has('skill', 'tech', 'stack', 'language', 'tools', 'technolog')) return { intent: 'tech' };
  if (has('project', 'built', 'what has he', 'what did he', 'portfolio', 'systems', 'show me')) return { intent: 'projects' };
  if (has('hire', 'available', 'job', 'role', 'open to', 'recruit', 'looking', 'opportunity')) return { intent: 'hiring' };
  if (has('resume', 'résumé', 'cv', 'download')) return { intent: 'resume' };
  if (has('contact', 'email', 'reach', 'phone', 'call', 'linkedin', 'github')) return { intent: 'contact' };
  if (has('location', 'where', 'los angeles', 'remote', 'relocat', 'based')) return { intent: 'location' };
  if (has('who', 'about', 'background', 'tochi', 'introduce', 'yourself')) return { intent: 'identity' };
  if (has('help', 'what can you', 'options', 'topics', 'menu', 'capabilities')) return { intent: 'help' };
  return { intent: 'unknown' };
}

function R(text, chips) { return { text, chips: chips || [] }; }

function generateResponse({ intent, slug }) {
  switch (intent) {
    case 'greeting':
      return R(
        `Hi — I'm ${ATLAS}, ${personal.name.split(' ')[0]}'s assistant.\n\nThis is a proof-driven platform. The homepage is a **live** trading dashboard wired to a real bot running 24/7; below it are a shipped iOS app, a home SOC lab, a 10-project ecosystem, his certifications, and his experience as a founder of two companies — all backed by real evidence.\n\nAsk me about any of that, or just chat — I'm not limited to Tochi topics.`,
        ["How's the bot doing right now?", 'Tell me about the SOC lab', 'What businesses has he founded?', 'What certifications?']
      );

    case 'identity':
      return R(
        `**${personal.name}** — ${personal.title} in ${personal.location}.\n\n${personal.pitch}\n\nThe range spans live trading engines (Python/asyncio with real risk controls and Brier calibration), a SwiftUI iOS product (WitnessPro), Node orchestration fusing news/crypto/AI signals, and Playwright automation against live UIs. Everything here is backed by runtime logs, databases, and screenshots.`,
        ['Show me Mission Control', 'What projects has he built?', 'How is the evidence verified?', 'How do I contact him?']
      );

    case 'mission_control':
      return R(
        `**Mission Control** is the homepage centerpiece — and it's **the real, live bot**, not a demo. A bridge reads Arbiter's own \`arbiter.log\` and SQLite trade ledger and pushes a sanitized snapshot every ~60s; the dashboard renders it through a \`/api/status\` proxy.\n\nIt shows real numbers: net PnL, win rate, open positions, deployed capital, PnL by divergence category (weather/sports), recent trades, and a live tail of the bot log. If the bot's log goes quiet for 10+ minutes, it flips to OFFLINE automatically.\n\n${missionControl.summary}\n\nWhat's hidden: wallet keys, addresses, and API secrets never leave the machine — only public-safe metrics are published.`,
        ['How is Arbiter architected?', 'What is the strategy?', 'What happened with V15.4?', 'Is this real?']
      );

    case 'trading':
      return R(
        `Tochi runs several trading/automation systems. The flagship is **Arbiter** behind Mission Control — a cross-venue divergence engine, not a prediction bot:\n\n${missionControl.summary}\n\n${missionControl.strategyNote}\n\nBeyond Arbiter: the retired **Polymarket Engine V15.4** (a pure-prediction fund whose losses are the reason Arbiter exists), **Nexus Bot** (Kalshi + news + crypto + AI scoring), **15 Minutes** (time-windowed Kalshi), **SHARP** (high-frequency scalper), plus betting automation (**Bet Bot / Aviator**, **SportyBot**).`,
        ['Tell me about Arbiter', 'What happened with V15.4?', 'How is risk handled?', 'List all projects']
      );

    case 'witnesspro':
      return R(
        `**${witnessPro.name}** — ${witnessPro.tagline}\n\n${witnessPro.summary}\n\nKey features:\n${witnessPro.features.map((f) => `• ${f.title} — ${f.body}`).join('\n')}\n\nStack: ${witnessPro.stack.join(', ')}. The signature engineering choice is AVCaptureMultiCamSession — simultaneous front+rear capture, an uncommon AVFoundation API that needs careful session config and multi-stream buffer handling.`,
        ['What other projects exist?', 'Show me Mission Control', 'How is the evidence verified?', 'Is Tochi hireable?']
      );

    case 'soc':
      return R(
        `**${socLab.name}** — ${socLab.tagline}\n\n${socLab.summary}\n\nDocumented investigations include ${socLab.caseStudies.map((c) => `${c.title} (${c.mitre})`).join(', ')} — each written up evidence-first and mapped to MITRE ATT&CK. The SOC Lab section has the Splunk / Kali / Wireshark screenshots, the architecture, and the SPL detection queries.`,
        ['What certifications does he hold?', 'Tell me about his experience', 'Show me the projects', 'Is he available to hire?']
      );

    case 'experience':
      return R(
        `Beyond engineering, ${personal.name.split(' ')[0]} is a founder with 10+ years of building businesses:\n\n${experience.slice(0, 3).map((e) => `**${e.role} — ${e.org}** (${e.period}) · ${e.tag}`).join('\n')}\n\nHe founded **Tochiugo Global Mark Limited** (Nigeria manufacturing — created the ISO-certified TOCHIUGO BOND product) and **Meridian Nexus Global LLC** (US vehicle export, with automation tooling he built himself), and also worked as a Correctional Officer for the State of Indiana. Full timeline is in the Experience section.`,
        ['What certifications?', 'Tell me about the SOC lab', 'What has he built?', 'How do I contact him?']
      );

    case 'certs':
      return R(
        `Credentials (all verifiable on Credly):\n${certifications.items.map((c) => `• ${c.name} — ${c.issuer}`).join('\n')}\n\nPlus **TryHackMe ${certifications.tryhackme.stats[0].value}** global (${certifications.tryhackme.stats[3].value} score). Education: ${certifications.education.items.map((e) => e.title).join(' · ')}. The Certifications section has the verify links.`,
        ['Tell me about the SOC lab', 'Is he available to hire?', 'View the résumé']
      );

    case 'architecture':
      return R(
        `A few representative engineering decisions:\n\n**Arbiter** — deliberately the opposite design of its predecessor: no ML model, no forecasting, just cross-venue book disagreement between Polymarket and Kalshi, held to settlement. Sized to clear Polymarket's $1-per-order minimum, with abort/unwind safety that held during a real ~$11 incident on 2026-06-18. The predecessor, **Polymarket Engine V15.4**, was structured like a fund — an autonomous governor, a Bayesian capital allocator, independent strategy sleeves, a pre-trade risk veto chain, and an XGBoost brain that only earned veto power at validation AUC ≥ 0.55 — but its pure-prediction approach still lost $1,133 over 16,000 trades, which is why Arbiter exists.\n\n**Mission Control** — intentionally tiny contract: the bot writes \`status.json\` every ~60s; the site polls it. "Offline" is just "the file stopped changing," so down/recovery needs no extra wiring.\n\n**WitnessPro** — built on AVCaptureMultiCamSession with sealed metadata so evidence keeps chain-of-custody even when PII is hidden on screen.\n\n**Nexus Bot** — modular signal sources (news/crypto/economics/weather) feeding a Claude-scored decision loop, with a parallel scalper.`,
        ['Tell me about Arbiter', 'How does Mission Control stay live?', 'How is the evidence organized?', 'What is the full tech stack?']
      );

    case 'evidence':
      return R(
        `${evidenceRepo.summary}\n\nEach project is documented under a standard structure: ${evidenceRepo.sections.join(' · ')}.\n\nThis site ships the curated public slice — the strongest few shots per project (${evidenceRepo.stats.find((s) => s.label === 'Curated to')?.value} images selected from ${evidenceRepo.stats.find((s) => s.label === 'Screenshots reviewed')?.value}). The full per-project evidence — source trees, raw logs, databases, complete screenshot sets — is walked through live in technical interviews.\n\nEvery gallery here is real: live app captures, runtime logs, or working application behavior. Nothing synthetic.`,
        ['Show me a project', 'What is Mission Control?', 'How do I reach Tochi?']
      );

    case 'projects': {
      const byCat = {};
      projects.forEach((p) => { (byCat[p.category] ||= []).push(p.name); });
      const list = Object.entries(byCat).map(([c, names]) => `**${c}:** ${names.join(', ')}`).join('\n');
      return R(
        `Here's the ecosystem — ${projects.length} systems plus WitnessPro (iOS):\n\n${list}\n\nAsk me about any one by name and I'll give you the architecture, highlights, and stack.`,
        ['Tell me about Arbiter', 'What is Bet Bot / Aviator?', 'Tell me about Nexus Bot', 'Tell me about TryOn']
      );
    }

    case 'project': {
      const p = projectBySlug(slug);
      if (!p) return generateResponse({ intent: 'projects' });
      const related = projects.filter((x) => x.slug !== slug && x.category === p.category).slice(0, 2).map((x) => `Tell me about ${x.name}`);
      return R(describeProject(p), [...related, 'List all projects', 'How is the evidence verified?']);
    }

    case 'tech': {
      const groups = Object.entries(techStack).map(([g, items]) => `**${g}:** ${items.join(', ')}`).join('\n');
      return R(`Technical stack by domain:\n\n${groups}`, ['Show me the trading systems', 'Tell me about WitnessPro', 'Is Tochi available?']);
    }

    case 'hiring':
      return R(
        `Status: actively open.\n\nTarget roles: ${personal.targetRoles.join(' · ')}.\n\nWhat he brings: shipped systems you can inspect — a live trading engine with risk controls, a SwiftUI iOS product, Node/Python automation, and applied-AI tooling — each backed by runtime evidence. He's at his best on teams that ship and operate real systems.\n\nFastest contact: ${personal.email} · ${personal.phone}`,
        ['How do I contact him?', 'Where is he located?', 'What has he built?']
      );

    case 'contact':
      return R(
        `Reach ${personal.name.split(' ')[0]}:\n\n• Email: ${personal.email}\n• Phone: ${personal.phone}\n• LinkedIn: ${personal.linkedin.replace('https://', '')}\n• GitHub: ${personal.github.replace('https://', '')}\n\nEmail is fastest — usually a reply within a few hours. A downloadable résumé is in the Contact section and the footer.`,
        ['Is he available to hire?', 'View the résumé', 'Where is he based?']
      );

    case 'resume':
      return R(
        `${personal.name.split(' ')[0]}'s résumé downloads in one click — the **Download Résumé (PDF)** button in the Contact section grabs **/resume.pdf** directly, and there's a web version at /resume.html.\n\nIt covers the Arbiter cross-venue trading engine, WitnessPro, the automation ecosystem, security lab experience, CompTIA Security+ and Google certificates, founder experience, and work history. This whole site is the deeper proof; the résumé is the recruiter-friendly summary.`,
        ['Is he available to hire?', 'List all projects', 'How do I contact him?']
      );

    case 'location':
      return R(
        `Based in ${personal.location}. Open to on-site/hybrid in California and to remote roles. Available to start quickly.`,
        ['Is he available to hire?', 'How do I contact him?', 'What has he built?']
      );

    case 'thanks':
      return R(`Glad to help. For next steps, ${personal.name.split(' ')[0]} is at ${personal.email}.\n\nAnything else you want to explore?`,
        ['List all projects', 'What is Mission Control?', 'Is he available to hire?']);

    case 'goodbye':
      return R(`Thanks for stopping by. Reach ${personal.name.split(' ')[0]} anytime at ${personal.email}.`, ['How do I contact him?']);

    case 'help':
    default:
      return R(
        `I'm ${ATLAS} — I answer questions about this platform. Good starting points:\n\n🛰️  Mission Control — the live trading dashboard\n📱  WitnessPro — the shipped iOS app\n🛡️  SOC Lab — the home security-operations lab\n🧩  Projects — the 10-system ecosystem (ask by name)\n🏢  Experience — two companies founded + roles\n🎓  Certifications — Security+ & the Google cyber track\n💼  Hiring — availability & target roles\n\nJust ask in plain language.`,
        ['What is Mission Control?', 'Tell me about the SOC lab', 'What businesses has he founded?', 'Is Tochi available to hire?']
      );
  }
}

export function NexusAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showPing, setShowPing] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  // Ask the real Claude-backed endpoint; returns null if unconfigured/unreachable
  // so the caller can fall back to the rule-based responder.
  const askAtlas = async (history) => {
    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history.slice(-10).map((m) => ({ role: m.role, content: m.content })) }),
      });
      if (!r.ok) return null;
      const d = await r.json();
      return d.text ? d.text : null;
    } catch {
      return null;
    }
  };

  const sendMessage = async (text) => {
    const msg = text.trim();
    if (!msg || isTyping) return;
    setInput('');
    const nextHistory = [...messages, { role: 'user', content: msg, chips: [] }];
    setMessages(nextHistory);
    setIsTyping(true);
    await new Promise((r) => setTimeout(r, 500 + Math.random() * 400));
    const cls = classifyIntent(msg);
    let responseText, chips;
    if (cls.intent === 'bot_status') {
      try {
        const r = await fetch(`${missionControl.statusUrl}?t=${Date.now()}`, { cache: 'no-store' });
        const d = await r.json();
        const m = d.metrics || {};
        const f = (n) => (n == null ? '—' : Number(n).toLocaleString('en-US'));
        const money = (n) => (n == null ? '—' : `${n < 0 ? '-' : ''}$${Math.abs(Number(n)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
        const cats = (d.categories || []).map((c) => `${c.category} ${money(c.pnl)}`).join(' · ');
        responseText =
          `Here's **Arbiter right now** — straight from its live log + trade ledger:\n\n` +
          `• Status: **${(d.status || '').toUpperCase()}** · mode **LIVE** · real money\n` +
          `• Net PnL: **${money(m.total_pnl)}** across ${f(m.resolved_total)} resolved trades · ${m.win_rate}% win rate (${f(m.wins)}W · ${f(m.losses)}L)\n` +
          `• Open positions: ${f(m.open_positions)} · deployed capital ~${money(m.deployed_usd)}\n` +
          `• By category: ${cats || '—'}\n` +
          `• Total trades logged: ${f(m.total_trades)}\n\n` +
          `This is deliberately small — a ~$25 R&D bankroll proving the divergence edge before any capital gets added. Scroll up to **Mission Control** for the full live dashboard.`;
        chips = ['How is Arbiter architected?', 'What is the strategy?', 'Is this real?'];
      } catch {
        responseText = "I couldn't reach the live feed this second — the Mission Control dashboard at the top of the page has the latest real numbers.";
        chips = ['What is Mission Control?', 'How is the bot architected?'];
      }
    } else {
      const llmText = await askAtlas(nextHistory);
      if (llmText) {
        responseText = llmText;
        chips = [];
      } else {
        ({ text: responseText, chips } = generateResponse(cls));
      }
    }
    setMessages((prev) => [...prev, { role: 'assistant', content: responseText, chips }]);
    setIsTyping(false);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setShowPing(false);
    if (messages.length === 0) {
      setTimeout(() => {
        const { text, chips } = generateResponse({ intent: 'greeting' });
        setMessages([{ role: 'assistant', content: text, chips }]);
      }, 250);
    }
    setTimeout(() => inputRef.current?.focus(), 320);
  };

  const lastAssistantIndex = messages.reduce((last, m, i) => (m.role === 'assistant' ? i : last), -1);

  // very light markdown: **bold**
  const renderContent = (content) => content.split('\n').map((line, i) => (
    <span key={i} className="block">
      {line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
        part.startsWith('**') && part.endsWith('**')
          ? <strong key={j} className="text-white font-semibold">{part.slice(2, -2)}</strong>
          : <React.Fragment key={j}>{part}</React.Fragment>
      )}
    </span>
  ));

  return (
    <>
      <button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#00E87A] hover:bg-[#00E87A]/90 rounded-full shadow-lg shadow-[#00E87A]/25 flex items-center justify-center transition-all hover:scale-105"
        aria-label={`Chat with ${ATLAS}`} title={`Chat with ${ATLAS} — engineering assistant`}
      >
        <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        {showPing && (<><span className="absolute -top-1 -right-1 w-4 h-4 bg-[#00E87A] rounded-full animate-ping opacity-75" /><span className="absolute -top-1 -right-1 w-4 h-4 bg-[#00E87A] rounded-full border-2 border-black" /></>)}
      </button>

      {isOpen && (
        <div className="fixed z-50 bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl shadow-black/60 flex flex-col overflow-hidden"
          style={{ bottom: '5.5rem', right: '1.5rem', width: 'min(420px, calc(100vw - 3rem))', maxHeight: '72vh' }}>
          <div className="flex items-center gap-3 px-4 py-3 bg-zinc-900 border-b border-white/10 flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-[#00E87A]/15 border border-[#00E87A]/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-[#00E87A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2"><span className="font-bold text-white text-sm">{ATLAS}</span><span className="font-mono text-xs text-zinc-600 truncate">Engineering Assistant</span></div>
              <div className="flex items-center gap-1.5 mt-0.5"><span className="w-1.5 h-1.5 rounded-full bg-[#00E87A] animate-pulse" /><span className="font-mono text-xs text-[#00E87A]">Online</span></div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-white/5" aria-label="Close chat">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
            {messages.map((msg, i) => (
              <div key={i}>
                <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-lg bg-[#00E87A]/15 border border-[#00E87A]/25 flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                      <svg className="w-3 h-3 text-[#00E87A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                  )}
                  <div className={`max-w-[84%] px-3.5 py-2.5 rounded-xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-[#00E87A] text-black rounded-br-sm font-medium' : 'bg-zinc-800/80 text-zinc-100 rounded-bl-sm border border-white/5'}`}>
                    <div className="whitespace-pre-line">{renderContent(msg.content)}</div>
                  </div>
                </div>
                {msg.role === 'assistant' && i === lastAssistantIndex && msg.chips?.length > 0 && !isTyping && (
                  <div className="ml-8 mt-2 flex flex-wrap gap-1.5">
                    {msg.chips.map((chip, ci) => (
                      <button key={ci} onClick={() => sendMessage(chip)} className="px-2.5 py-1 text-xs text-[#00E87A] bg-[#00E87A]/8 border border-[#00E87A]/25 rounded-full hover:bg-[#00E87A]/15 hover:border-[#00E87A]/50 transition-all font-mono">{chip}</button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start items-end gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#00E87A]/15 border border-[#00E87A]/25 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-[#00E87A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div className="bg-zinc-800/80 border border-white/5 px-3.5 py-2.5 rounded-xl rounded-bl-sm">
                  <div className="flex gap-1">{[0, 150, 300].map((d) => <span key={d} className="w-1.5 h-1.5 bg-[#00E87A]/60 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}</div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 bg-zinc-900 border-t border-white/10 flex-shrink-0">
            <div className="flex items-center gap-2">
              <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                placeholder="Ask about the projects, or anything else…"
                className="flex-1 px-3.5 py-2.5 bg-zinc-800 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#00E87A]/40 transition-colors" />
              <button onClick={() => sendMessage(input)} disabled={!input.trim() || isTyping}
                className="p-2.5 bg-[#00E87A] hover:bg-[#00E87A]/90 disabled:bg-zinc-700 disabled:text-zinc-500 text-black rounded-xl transition-all flex-shrink-0" aria-label="Send">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default NexusAI;
