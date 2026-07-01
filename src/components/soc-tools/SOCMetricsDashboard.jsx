import React, { useState, useEffect } from 'react';

function genSparkline(base, variance, points = 14) {
  return Array.from({ length: points }, () =>
    Math.max(0, base + (Math.random() - 0.5) * variance * 2)
  );
}

function Sparkline({ data, color, height = 36 }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 130;
  const h = height;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 2) - 1}`)
    .join(' ');
  const areaClose = `${w},${h} 0,${h}`;
  return (
    <svg width={w} height={h}>
      <defs>
        <linearGradient id={`spark-fill-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polyline
        points={`${pts} ${areaClose}`}
        fill={`url(#spark-fill-${color.replace('#', '')})`}
        stroke="none"
      />
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
      {/* Latest value dot */}
      <circle
        cx={(data.length - 1) / (data.length - 1) * w}
        cy={h - ((data[data.length - 1] - min) / range) * (h - 2) - 1}
        r={2.5}
        fill={color}
      />
    </svg>
  );
}

const METRIC_DEFS = [
  { id: 'mttd', label: 'Mean Time to Detect', value: 23, unit: 'min', trend: -8, good: 'down', base: 28, var: 9, color: '#00E87A', desc: 'vs 31m last month' },
  { id: 'mttr', label: 'Mean Time to Respond', value: 4.2, unit: 'hrs', trend: -12, good: 'down', base: 5, var: 1.5, color: '#00E87A', desc: 'vs 4.8h last month' },
  { id: 'fpr', label: 'False Positive Rate', value: 11.4, unit: '%', trend: -3.2, good: 'down', base: 14, var: 4, color: '#06b6d4', desc: 'vs 14.6% last month' },
  { id: 'sla', label: 'SLA Compliance', value: 98.7, unit: '%', trend: 1.2, good: 'up', base: 97, var: 2, color: '#00E87A', desc: 'vs 97.5% last month' },
  { id: 'alerts', label: 'Alerts / Day', value: 847, unit: '', trend: 5, good: 'neutral', base: 820, var: 120, color: '#eab308', desc: 'avg 7-day rolling' },
  { id: 'esc', label: 'Escalation Rate', value: 6.8, unit: '%', trend: -1.4, good: 'down', base: 8, var: 2, color: '#a78bfa', desc: 'T1→T2 escalations' },
];

const ANALYSTS = [
  { name: 'T. Ugochukwu', alerts: 234, incidents: 8, mttd: 18, accuracy: 96.2 },
  { name: 'J. Rivera', alerts: 198, incidents: 6, mttd: 22, accuracy: 94.8 },
  { name: 'K. Okafor', alerts: 187, incidents: 5, mttd: 25, accuracy: 93.1 },
  { name: 'M. Chen', alerts: 156, incidents: 4, mttd: 31, accuracy: 91.5 },
];

const SLA_CATEGORIES = [
  { label: 'P1 Critical', target: '15m', actual: '12m', met: true },
  { label: 'P2 High', target: '1h', actual: '48m', met: true },
  { label: 'P3 Medium', target: '4h', actual: '3.8h', met: true },
  { label: 'P4 Low', target: '24h', actual: '26h', met: false },
];

export function SOCMetricsDashboard() {
  const [metrics, setMetrics] = useState(() =>
    METRIC_DEFS.map(m => ({ ...m, sparkData: genSparkline(m.base, m.var) }))
  );
  const [alertsByHour] = useState(() =>
    Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      count: Math.floor(
        (i >= 8 && i <= 18 ? 55 : 15) + Math.random() * 35
      ),
    }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev =>
        prev.map(m => ({
          ...m,
          sparkData: [
            ...m.sparkData.slice(1),
            Math.max(0, m.base + (Math.random() - 0.5) * m.var * 2),
          ],
        }))
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const maxAlert = Math.max(...alertsByHour.map(a => a.count));

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12">
      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#00E87A] bg-[#00E87A]/10 border border-[#00E87A]/30 rounded-full mb-4">
          <span className="w-2 h-2 bg-[#00E87A] rounded-full animate-pulse" />
          SOC Performance Analytics
        </div>
        <h2 className="text-4xl font-bold font-syne mb-3">
          Operations <span className="text-[#00E87A]">Metrics</span>
        </h2>
        <p className="text-zinc-400 max-w-2xl text-sm">
          Key performance indicators, analyst efficiency, detection coverage, and SLA compliance tracking.
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {metrics.map(m => {
          const isGood =
            (m.good === 'down' && m.trend < 0) ||
            (m.good === 'up' && m.trend > 0) ||
            m.good === 'neutral';
          return (
            <div key={m.id} className="bg-zinc-900/50 border border-white/10 rounded-2xl p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-mono text-xs text-zinc-500 mb-1.5">{m.label}</div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-bold font-syne" style={{ color: m.color }}>
                      {m.value}
                    </span>
                    {m.unit && (
                      <span className="font-mono text-sm text-zinc-500">{m.unit}</span>
                    )}
                  </div>
                  <div className="font-mono text-xs text-zinc-600 mt-0.5">{m.desc}</div>
                </div>
                <span
                  className={`font-mono text-xs px-2 py-1 rounded border flex-shrink-0 ${
                    isGood
                      ? 'text-[#00E87A] bg-[#00E87A]/10 border-[#00E87A]/30'
                      : 'text-red-400 bg-red-500/10 border-red-500/30'
                  }`}
                >
                  {m.trend > 0 ? '+' : ''}{m.trend}
                  {m.good === 'neutral' ? '%' : ''}
                </span>
              </div>
              <Sparkline data={m.sparkData} color={m.color} />
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-6 mb-6">
        {/* Alert volume chart */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-5">
          <div className="font-mono text-xs uppercase tracking-wider text-zinc-500 mb-1">Alert Volume — Last 24 Hours</div>
          <div className="font-mono text-xs text-zinc-600 mb-4">Peak: {maxAlert} alerts at hour {alertsByHour.findIndex(a => a.count === maxAlert).toString().padStart(2,'0')}:00</div>
          <div className="flex items-end gap-0.5 h-28">
            {alertsByHour.map(({ hour, count }) => {
              const pct = (count / maxAlert) * 100;
              const isHigh = count > maxAlert * 0.72;
              const isMed = count > maxAlert * 0.44;
              const bg = isHigh ? '#ef4444' : isMed ? '#eab308' : '#00E87A';
              return (
                <div key={hour} className="flex-1 flex flex-col items-center justify-end h-full group">
                  <div
                    className="w-full rounded-t-sm transition-all duration-700 relative"
                    style={{ height: `${pct}%`, background: bg, opacity: 0.75 }}
                  >
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 font-mono text-xs text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {count}
                    </div>
                  </div>
                  {hour % 4 === 0 && (
                    <div className="font-mono text-xs text-zinc-700 mt-1.5">
                      {hour.toString().padStart(2, '0')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-5 mt-4">
            {[['#00E87A', 'Low'], ['#eab308', 'Elevated'], ['#ef4444', 'High']].map(([c, l]) => (
              <div key={l} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-sm" style={{ background: c, opacity: 0.75 }} />
                <span className="font-mono text-xs text-zinc-500">{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SLA compliance */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-white/10 bg-zinc-800/30">
            <span className="font-mono text-xs uppercase tracking-wider text-zinc-400">SLA Compliance by Priority</span>
          </div>
          <div className="divide-y divide-white/5">
            {SLA_CATEGORIES.map(s => (
              <div key={s.label} className="px-5 py-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-zinc-300">{s.label}</span>
                  <span className={`font-mono text-xs px-2 py-0.5 rounded border ${
                    s.met
                      ? 'text-[#00E87A] bg-[#00E87A]/10 border-[#00E87A]/30'
                      : 'text-red-400 bg-red-500/10 border-red-500/30'
                  }`}>
                    {s.met ? '✓ MET' : '✗ BREACH'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: s.met ? '100%' : '85%',
                        background: s.met ? '#00E87A' : '#ef4444',
                      }}
                    />
                  </div>
                  <div className="font-mono text-xs text-zinc-500 flex-shrink-0">
                    {s.actual} / {s.target}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-white/10 bg-zinc-800/20 flex items-center justify-between">
            <span className="font-mono text-xs text-zinc-600">Overall SLA</span>
            <span className="font-mono text-xs text-[#00E87A]">75% categories met</span>
          </div>
        </div>
      </div>

      {/* Analyst leaderboard */}
      <div className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-white/10 bg-zinc-800/30 flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-wider text-zinc-400">Analyst Performance Board</span>
          <span className="font-mono text-xs text-zinc-600">Last 30 days</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 bg-zinc-800/20">
                {['Rank', 'Analyst', 'Alerts Handled', 'Incidents Opened', 'MTTD', 'Accuracy', 'Score'].map(h => (
                  <th key={h} className="px-5 py-2.5 text-left font-mono text-xs uppercase tracking-wider text-zinc-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {ANALYSTS.map((a, i) => {
                const score = Math.round(
                  (a.accuracy * 0.4) + ((50 - a.mttd) * 0.3) + ((a.alerts / 250) * 30)
                );
                return (
                  <tr key={a.name} className={`hover:bg-zinc-800/20 transition-colors ${i === 0 ? 'bg-[#00E87A]/5' : ''}`}>
                    <td className="px-5 py-3 font-mono text-sm">
                      <span className={i === 0 ? 'text-[#00E87A]' : 'text-zinc-600'}>#{i + 1}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-zinc-200">{a.name}</span>
                        {i === 0 && (
                          <span className="font-mono text-xs px-1.5 py-0.5 bg-[#00E87A]/15 text-[#00E87A] border border-[#00E87A]/30 rounded">
                            Top Analyst
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-sm text-zinc-300">{a.alerts}</td>
                    <td className="px-5 py-3 font-mono text-sm text-zinc-300">{a.incidents}</td>
                    <td className="px-5 py-3 font-mono text-sm text-cyan-400">{a.mttd}m</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-zinc-800 rounded-full">
                          <div
                            className="h-1.5 rounded-full bg-[#00E87A]"
                            style={{ width: `${a.accuracy}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs text-zinc-400">{a.accuracy}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-sm text-[#00E87A] font-bold">{score}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
