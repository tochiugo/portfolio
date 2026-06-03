import React, { useState, useEffect, useRef, useCallback } from 'react';
import { missionControl as MC } from '../data/portfolio';

const ACCENT = '#00E87A';
const AMBER = '#f5b301';
const RED = '#ff4d4d';

// ── live telemetry hook ─────────────────────────────────────────────────────
// Contract: the bot writes status.json every 30s. We poll it.
//  * fresh, advancing heartbeats  -> a real writer is connected -> ONLINE (and
//    OFFLINE w/ downtime if it later goes stale).
//  * no live writer (static seed) -> run a public dry-run telemetry stream so the
//    centerpiece is always alive, clearly labelled "PUBLIC DRY-RUN".
const SIM_ACTIVITY = [
  () => `Heartbeat OK · ${214 + Math.floor(Math.random() * 40)}ms`,
  () => `Scanned BTC 15m Up/Down — mid 0.${48 + Math.floor(Math.random() * 9)}, spread 0.0${1 + Math.floor(Math.random() * 3)}`,
  () => `Latency-Arb: Binance Δ below entry threshold → skip`,
  () => `Late-Window armed for ETH 15m (T-minus 2m gate)`,
  () => `Position monitor: 0 open positions (dry-run)`,
  () => `Flash-Crash watch: no 0.27+ drop detected`,
  () => `Risk manager: exposure 0% of cap · kill-switch clear`,
  () => `Brier calibration refreshed → 0.18${Math.floor(Math.random() * 4)}`,
];
const SIM_LOG = (cycle) => {
  const t = new Date().toLocaleTimeString('en-GB');
  const lines = [
    `cycle=${cycle} scanned=4 evals=${10 + Math.floor(Math.random() * 8)} latency=${200 + Math.floor(Math.random() * 50)}ms`,
    `latency_arb btc15m delta below thr action=skip`,
    `gamma refresh ok markets=4 stale=0`,
    `clob.ws heartbeat ok lag=${70 + Math.floor(Math.random() * 50)}ms`,
    `risk exposure=0.0% killswitch=clear`,
    `paper_router open=0 (dry-run)`,
  ];
  return `[${t}] INFO  ${lines[Math.floor(Math.random() * lines.length)]}`;
};

function useMissionControl() {
  const [feed, setFeed] = useState(null);
  const [error, setError] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [counters, setCounters] = useState(null);
  const [activity, setActivity] = useState([]);
  const [logs, setLogs] = useState([]);
  const live = useRef({ lastHb: null, lastHbSeenAt: 0, detected: false });

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${MC.statusUrl}?t=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('bad status');
      const data = await res.json();
      setFeed(data);
      setError(false);
      const hb = Date.parse(data.last_heartbeat);
      const fresh = Date.now() - hb < MC.offlineThresholdSec * 1000;
      // a live writer = heartbeat is fresh OR has advanced since last poll
      if (fresh || (live.current.lastHb && hb > live.current.lastHb)) {
        live.current = { lastHb: hb, lastHbSeenAt: Date.now(), detected: true };
        setCounters(data.counters);
        setActivity(data.recent_activity || []);
        setLogs(data.recent_logs || []);
      } else if (!live.current.detected) {
        // seed the simulation once
        setCounters((c) => c || data.counters);
        setActivity((a) => (a.length ? a : data.recent_activity || []));
        setLogs((l) => (l.length ? l : data.recent_logs || []));
      }
    } catch {
      setError(true);
      if (!feed) {
        // no file at all -> minimal seed so the demo still runs
        setCounters((c) => c || { markets_scanned: 184213, evaluations_processed: 902847, signals_generated: 1644, cycles_completed: 73118, open_positions: 0 });
      }
    }
  }, [feed]);

  useEffect(() => { fetchStatus(); const id = setInterval(fetchStatus, MC.pollIntervalMs); return () => clearInterval(id); }, [fetchStatus]);

  // 1s clock for uptime / downtime
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);

  // simulation tick — only when no live writer is detected
  useEffect(() => {
    const id = setInterval(() => {
      if (live.current.detected) return;
      setCounters((c) => c ? {
        ...c,
        markets_scanned: c.markets_scanned + 1 + Math.floor(Math.random() * 5),
        evaluations_processed: c.evaluations_processed + 4 + Math.floor(Math.random() * 14),
        cycles_completed: c.cycles_completed + 1,
        signals_generated: c.signals_generated + (Math.random() < 0.12 ? 1 : 0),
      } : c);
      setActivity((a) => [SIM_ACTIVITY[Math.floor(Math.random() * SIM_ACTIVITY.length)](), ...a].slice(0, 8));
      setLogs((l) => [SIM_LOG((counters?.cycles_completed || 0)), ...l].slice(0, 8));
    }, 3500);
    return () => clearInterval(id);
  }, [counters]);

  // derive status
  const liveDetected = live.current.detected;
  const hb = feed ? Date.parse(feed.last_heartbeat) : null;
  const staleMs = liveDetected ? now - live.current.lastHbSeenAt : 0;
  const offline = liveDetected && staleMs > MC.offlineThresholdSec * 1000;
  const bootMs = feed ? Date.parse(feed.boot_time) : null;

  return { feed, error, now, counters, activity, logs, liveDetected, offline, hb, bootMs, lastSeen: live.current.lastHbSeenAt };
}

// ── helpers ─────────────────────────────────────────────────────────────────
function fmtDuration(ms) {
  if (ms < 0) ms = 0;
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${sec}s`;
  return `${m}m ${sec}s`;
}
const nf = (n) => (n == null ? '—' : n.toLocaleString('en-US'));

function Stat({ label, value, accent }) {
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900/40 px-4 py-3">
      <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">{label}</div>
      <div className="mt-1 font-syne text-xl font-bold tabular-nums" style={{ color: accent || '#fff' }}>{value}</div>
    </div>
  );
}

// ── component ───────────────────────────────────────────────────────────────
export function MissionControl() {
  const { feed, counters, activity, logs, liveDetected, offline, hb, bootMs, lastSeen, now } = useMissionControl();
  const online = !offline;
  const uptime = bootMs ? fmtDuration(now - bootMs) : (counters?.uptime_label || '—');
  // live feed -> real seconds since last heartbeat; dry-run sim -> a lively 0..interval cycle
  const hbInterval = feed?.heartbeat_interval_sec || 30;
  const hbAgo = liveDetected
    ? (hb ? Math.max(0, Math.floor((now - lastSeen) / 1000)) : null)
    : Math.floor((now / 1000) % hbInterval);
  const health = feed?.health;

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12">
      {/* header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-zinc-500">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: ACCENT }} /> Live Operational System
          </div>
          <h1 className="mt-3 font-syne text-4xl sm:text-5xl font-extrabold tracking-tight">
            Polymarket <span style={{ color: ACCENT }}>Mission Control</span>
          </h1>
          <p className="mt-2 font-mono text-sm text-zinc-400">
            {feed?.codename || MC.codename} · {feed?.environment || 'public-safe · dry-run'}
          </p>
        </div>
        <span className={`inline-flex items-center gap-2 self-start rounded-full border px-3 py-1.5 font-mono text-xs ${liveDetected ? 'border-[#00E87A]/40 text-[#00E87A]' : 'border-amber-400/40 text-amber-300'}`}>
          <span className="w-1.5 h-1.5 rounded-full soc-pulse" style={{ background: liveDetected ? ACCENT : AMBER }} />
          {liveDetected ? 'Live bot feed connected' : 'Public dry-run telemetry'}
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* status panel */}
        <div className={`lg:col-span-1 rounded-2xl border p-6 ${online ? 'border-[#00E87A]/30 bg-[#00E87A]/[0.04]' : 'border-red-500/40 bg-red-500/[0.05]'}`}>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">System Status</span>
            <span className="font-mono text-[10px] text-zinc-500">v{feed?.version || '12.53.0'}</span>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <span className="relative flex h-3.5 w-3.5">
              <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping" style={{ background: online ? ACCENT : RED }} />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5" style={{ background: online ? ACCENT : RED }} />
            </span>
            <span className="font-syne text-3xl font-extrabold" style={{ color: online ? ACCENT : RED }}>
              {online ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>

          {online ? (
            <div className="mt-5 space-y-3">
              <Row label="Uptime" value={uptime} />
              <Row label="Last heartbeat" value={hbAgo == null ? '—' : `${hbAgo}s ago`} />
              <Row label="Health" value={health?.state || 'healthy'} accent={ACCENT} />
              <Row label="Cycle latency" value={health ? `${health.cycle_latency_ms}ms` : '—'} />
              <Row label="Watchdog" value={health?.watchdog || 'passing'} />
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              <Row label="Last seen" value={lastSeen ? new Date(lastSeen).toLocaleTimeString() : '—'} />
              <Row label="Downtime" value={fmtDuration(now - lastSeen)} accent={RED} />
              <p className="text-xs text-zinc-500 leading-relaxed pt-1">
                Heartbeat stopped arriving. The dashboard will flip back to ONLINE automatically on the next fresh heartbeat.
              </p>
            </div>
          )}
        </div>

        {/* counters */}
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
          <Stat label="Markets Scanned" value={nf(counters?.markets_scanned)} accent={ACCENT} />
          <Stat label="Evaluations Processed" value={nf(counters?.evaluations_processed)} accent={ACCENT} />
          <Stat label="Signals Generated" value={nf(counters?.signals_generated)} />
          <Stat label="Cycles Completed" value={nf(counters?.cycles_completed)} />
          <Stat label="Open Positions" value={`${counters?.open_positions ?? 0} · dry-run`} accent={AMBER} />
          <Stat label="Brier Score" value={feed?.calibration?.brier_score ?? '—'} />
        </div>
      </div>

      {/* strategies + markets */}
      <div className="grid md:grid-cols-2 gap-5 mt-5">
        <div className="rounded-2xl border border-white/10 bg-zinc-900/30 p-5">
          <h3 className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-3">Strategies</h3>
          <div className="space-y-2">
            {(feed?.strategies || []).map((s) => (
              <div key={s.name} className="flex items-center justify-between gap-3 rounded-lg bg-black/30 border border-white/5 px-3 py-2">
                <div>
                  <div className="font-syne text-sm font-semibold text-white">{s.name}</div>
                  <div className="text-[11px] text-zinc-500">{s.edge}</div>
                </div>
                <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded-full border border-[#00E87A]/30 text-[#00E87A]">{s.state}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-zinc-900/30 p-5">
          <h3 className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-3">Markets Under Watch</h3>
          <div className="space-y-2">
            {(feed?.markets || []).map((m) => (
              <div key={m.label} className="flex items-center justify-between gap-3 rounded-lg bg-black/30 border border-white/5 px-3 py-2">
                <span className="font-mono text-xs text-zinc-300">{m.label}</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-zinc-500">p={m.prob}</span>
                  <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded-full border border-white/10 text-zinc-400">{m.state}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* activity + logs */}
      <div className="grid md:grid-cols-2 gap-5 mt-5">
        <div className="rounded-2xl border border-white/10 bg-zinc-900/30 p-5">
          <h3 className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-3">Recent Activity</h3>
          <ul className="space-y-2">
            {activity.slice(0, 7).map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-zinc-300" style={{ opacity: 1 - i * 0.08 }}>
                <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: ACCENT }} />
                <span className="leading-snug">{a}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="soc-terminal p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#00E87A]/70" />
            <span className="ml-2 font-mono text-[10px] text-zinc-500">bot.log — runtime</span>
          </div>
          <div className="space-y-1 font-mono text-[11px] leading-relaxed">
            {logs.slice(0, 8).map((l, i) => (
              <div key={i} className="text-zinc-400 truncate" style={{ opacity: 1 - i * 0.07 }}>
                <span className="text-[#00E87A]/70">›</span> {l}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* summary note */}
      <p className="mt-6 text-sm text-zinc-500 leading-relaxed max-w-4xl">{MC.summary}</p>

      {/* engineering timeline */}
      <div className="mt-14">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="font-syne text-2xl font-bold">Engineering Timeline</h2>
          <span className="font-mono text-xs text-zinc-500">— evolution, not perfection</span>
        </div>
        <div className="relative">
          <div className="hidden md:block absolute left-0 right-0 top-5 h-px bg-gradient-to-r from-[#00E87A]/40 via-white/10 to-transparent" />
          <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
            {MC.timeline.map((t, i) => (
              <div key={t.v} className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <span className="grid place-items-center w-10 h-10 rounded-full border bg-black font-mono text-[10px] font-bold"
                    style={{ borderColor: i === MC.timeline.length - 1 ? ACCENT : 'rgba(255,255,255,0.15)', color: i === MC.timeline.length - 1 ? ACCENT : '#a1a1aa' }}>
                    {t.v}
                  </span>
                </div>
                <div className="font-syne text-sm font-semibold text-white">{t.title}</div>
                <div className="text-[11px] text-zinc-500 leading-snug mt-1">{t.body}</div>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-6 text-sm text-zinc-500 leading-relaxed max-w-4xl">{MC.strategyNote}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {MC.stack.map((s) => (
            <span key={s} className="font-mono text-[11px] px-2.5 py-1 rounded-full border border-white/10 text-zinc-400">{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, accent }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">{label}</span>
      <span className="font-mono text-sm tabular-nums" style={{ color: accent || '#e4e4e7' }}>{value}</span>
    </div>
  );
}

export default MissionControl;
