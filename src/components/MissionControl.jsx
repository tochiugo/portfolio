import React, { useState, useEffect, useRef, useCallback } from 'react';
import { missionControl as MC } from '../data/portfolio';

const ACCENT = '#00E87A';
const AMBER = '#f5b301';
const RED = '#ff4d4d';
const CYAN = '#38bdf8';

// Reads the REAL arbiter status (arbiter.log + arbiter.db) via /api/status,
// which a local bridge pushes to a gist every ~60s. No mock data.
function useLiveStatus() {
  const [data, setData] = useState(null);
  const lastGood = useRef(null);
  const fetchStatus = useCallback(async () => {
    try {
      const r = await fetch(`${MC.statusUrl}?t=${Date.now()}`, { cache: 'no-store' });
      const d = await r.json();
      if (d && d.metrics) { setData(d); lastGood.current = d; }
    } catch { /* keep last good */ }
  }, []);
  useEffect(() => { fetchStatus(); const id = setInterval(fetchStatus, MC.pollIntervalMs); return () => clearInterval(id); }, [fetchStatus]);
  return { data: data || lastGood.current };
}

// tiny self-ticking leaves — only THESE re-render each second, not the whole dashboard
function useSecond() { const [, set] = useState(0); useEffect(() => { const id = setInterval(() => set((n) => n + 1), 1000); return () => clearInterval(id); }, []); }
function LiveHeartbeat({ iso, online }) {
  useSecond();
  const sec = iso ? Math.max(0, Math.floor((Date.now() - Date.parse(iso)) / 1000)) : null;
  return <span style={{ color: online ? ACCENT : RED }}>{sec == null ? '—' : `${sec}s ago`}</span>;
}

const nf = (n) => (n == null ? '—' : Number(n).toLocaleString('en-US'));
const money = (n) => (n == null ? '—' : `${n < 0 ? '-' : ''}$${Math.abs(Number(n)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
const pnlColor = (n) => (n == null ? '#e4e4e7' : n > 0 ? ACCENT : n < 0 ? RED : '#e4e4e7');

function Metric({ label, value, color, sub }) {
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900/40 px-4 py-3">
      <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">{label}</div>
      <div className="mt-1 font-syne text-xl font-bold tabular-nums truncate" style={{ color: color || '#fff' }}>{value}</div>
      {sub && <div className="font-mono text-[10px] text-zinc-500 mt-0.5 truncate">{sub}</div>}
    </div>
  );
}
function Row({ label, value, color }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">{label}</span>
      <span className="font-mono text-sm tabular-nums" style={{ color: color || '#e4e4e7' }}>{value}</span>
    </div>
  );
}

export function MissionControl() {
  const { data } = useLiveStatus();
  const m = data?.metrics || {};
  const categories = data?.categories || [];
  const hbAgeAtRender = data?.last_heartbeat ? Math.floor((Date.now() - Date.parse(data.last_heartbeat)) / 1000) : null;
  const connecting = !data;
  const online = data ? (data.status === 'online' && (hbAgeAtRender == null || hbAgeAtRender < MC.offlineThresholdSec)) : false;
  const statusLabel = connecting ? 'CONNECTING' : online ? 'ONLINE' : 'OFFLINE';
  const statusColor = connecting ? AMBER : online ? ACCENT : RED;

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12">
      {/* header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-zinc-500">
            <span className="w-1.5 h-1.5 rounded-full soc-pulse" style={{ background: online ? ACCENT : RED }} /> Live Operational System · reads the bot's real log + trade DB
          </div>
          <h1 className="mt-3 font-syne text-4xl sm:text-5xl font-extrabold tracking-tight">
            Arbiter <span style={{ color: ACCENT }}>Mission Control</span>
          </h1>
          <p className="mt-2 font-mono text-sm text-zinc-400">
            {data?.codename || MC.codename} · cross-venue divergence · Polymarket ↔ Kalshi
          </p>
        </div>
        <span className="inline-flex items-center gap-2 self-start whitespace-nowrap rounded-full border px-3 py-1.5 font-mono text-xs border-red-500/50 text-red-300">
          <span className="w-1.5 h-1.5 rounded-full soc-pulse flex-shrink-0" style={{ background: RED }} />
          LIVE TRADING · real money
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* status panel */}
        <div className={`lg:col-span-1 rounded-2xl border p-6 ${online ? 'border-[#00E87A]/30 bg-[#00E87A]/[0.04]' : connecting ? 'border-white/15 bg-zinc-900/40' : 'border-red-500/40 bg-red-500/[0.05]'}`}>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">System Status</span>
            <span className="font-mono text-[10px] text-zinc-500">v{data?.version || '1.0'}</span>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <span className="relative flex h-3.5 w-3.5">
              <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping" style={{ background: statusColor }} />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5" style={{ background: statusColor }} />
            </span>
            <span className="font-syne text-3xl font-extrabold" style={{ color: statusColor }}>{statusLabel}</span>
          </div>
          <div className="mt-5 space-y-3">
            <Row label="Mode" value="LIVE" color={RED} />
            <Row label="Last heartbeat" value={<LiveHeartbeat iso={data?.last_heartbeat} online={online} />} />
            <Row label="Health" value={data?.health?.state || '—'} color={online ? ACCENT : RED} />
            <Row label="Deployed capital" value={money(m.deployed_usd)} color={AMBER} />
          </div>
          {!online && (
            <p className="mt-4 text-xs text-zinc-500 leading-relaxed">
              The bot's log has gone quiet. The dashboard flips back to ONLINE automatically on the next heartbeat.
            </p>
          )}
        </div>

        {/* trading metrics */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Metric label="Net PnL" value={money(m.total_pnl)} color={pnlColor(m.total_pnl)} sub={`${nf(m.resolved_total)} resolved trades`} />
          <Metric label="Win Rate" value={m.win_rate != null ? `${m.win_rate}%` : '—'} color={CYAN} sub={`${nf(m.wins)}W · ${nf(m.losses)}L`} />
          <Metric label="Open Positions" value={nf(m.open_positions)} color={m.open_positions > 0 ? AMBER : '#fff'} sub="live book" />
          <Metric label="Total Trades" value={nf(m.total_trades)} sub="all-time" />
        </div>
      </div>

      <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-zinc-600">
        Small by design — $25 R&D bankroll. This is proof of the edge, not income yet.
      </p>

      {/* category breakdown */}
      {categories.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-zinc-900/30 p-5 mt-5">
          <h3 className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-3">PnL by Divergence Category</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {categories.map((c) => (
              <div key={c.category} className="flex items-center justify-between gap-2 rounded-lg bg-black/30 border border-white/5 px-3 py-2">
                <span className="font-mono text-xs text-zinc-200 capitalize">{c.category}</span>
                <span className="font-mono text-[11px] tabular-nums" style={{ color: pnlColor(c.pnl) }}>{money(c.pnl)} · {c.trades}x</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* recent trades + live log */}
      <div className="grid md:grid-cols-2 gap-5 mt-5">
        <div className="rounded-2xl border border-white/10 bg-zinc-900/30 p-5">
          <h3 className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-3">Recent Trades · real ledger</h3>
          <div className="space-y-1.5">
            {(data?.recent_trades || []).map((t, i) => (
              <div key={i} className="flex items-center justify-between gap-2 rounded-lg bg-black/30 border border-white/5 px-3 py-2 font-mono text-xs">
                <span className="flex items-center gap-2 min-w-0">
                  <span className="font-bold capitalize flex-shrink-0" style={{ color: CYAN }}>{t.category}</span>
                  <span className="text-zinc-500 truncate">{t.label}</span>
                </span>
                <span className="flex-shrink-0" style={{ color: t.open ? AMBER : pnlColor(t.pnl) }}>{t.open ? `${money(t.cost)} open` : money(t.pnl)}</span>
              </div>
            ))}
            {(!data?.recent_trades || data.recent_trades.length === 0) && <span className="font-mono text-xs text-zinc-600">loading…</span>}
          </div>
        </div>
        <div className="soc-terminal p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#00E87A]/70" />
            <span className="ml-2 font-mono text-[10px] text-zinc-500">arbiter.log — live tail</span>
            <span className="ml-auto font-mono text-[9px] text-zinc-600">{data?.health?.log_age_sec != null ? `${data.health.log_age_sec}s ago` : ''}</span>
          </div>
          <div className="space-y-1 font-mono text-[10.5px] leading-relaxed">
            {(data?.feed || []).slice(0, 10).map((l, i) => (
              <div key={i} className="text-zinc-400 truncate" style={{ opacity: 1 - i * 0.06 }}>
                <span className="text-[#00E87A]/70">›</span> {l}
              </div>
            ))}
            {(!data?.feed || data.feed.length === 0) && <span className="text-zinc-600">connecting to bot…</span>}
          </div>
        </div>
      </div>

      {/* summary + timeline */}
      <p className="mt-6 text-sm text-zinc-500 leading-relaxed max-w-4xl">{MC.summary}</p>

      <div className="mt-14">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="font-syne text-2xl font-bold">How It's Built</h2>
          <span className="font-mono text-xs text-zinc-500">— the engineering behind the numbers</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {MC.timeline.map((t, i) => (
            <div key={t.v} className="relative">
              <span className="grid place-items-center w-12 h-8 rounded-md border bg-black font-mono text-[9px] font-bold mb-2"
                style={{ borderColor: i === MC.timeline.length - 1 ? RED : 'rgba(255,255,255,0.15)', color: i === MC.timeline.length - 1 ? RED : '#a1a1aa' }}>
                {t.v}
              </span>
              <div className="font-syne text-sm font-semibold text-white">{t.title}</div>
              <div className="text-[11px] text-zinc-500 leading-snug mt-1">{t.body}</div>
            </div>
          ))}
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

export default MissionControl;
