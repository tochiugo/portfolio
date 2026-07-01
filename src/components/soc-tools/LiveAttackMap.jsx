import React, { useState, useEffect, useRef } from 'react';

const SOURCES = [
  { id: 'cn', label: 'China', x: 778, y: 155, flag: '🇨🇳', color: '#ef4444' },
  { id: 'ru', label: 'Russia', x: 612, y: 88, flag: '🇷🇺', color: '#ef4444' },
  { id: 'kp', label: 'N. Korea', x: 812, y: 142, flag: '🇰🇵', color: '#dc2626' },
  { id: 'ir', label: 'Iran', x: 646, y: 190, flag: '🇮🇷', color: '#f97316' },
  { id: 'de', label: 'Germany', x: 514, y: 116, flag: '🇩🇪', color: '#eab308' },
  { id: 'nl', label: 'Netherlands', x: 502, y: 108, flag: '🇳🇱', color: '#eab308' },
  { id: 'ng', label: 'Nigeria', x: 512, y: 244, flag: '🇳🇬', color: '#f97316' },
  { id: 'br', label: 'Brazil', x: 306, y: 312, flag: '🇧🇷', color: '#eab308' },
  { id: 'in', label: 'India', x: 703, y: 212, flag: '🇮🇳', color: '#f97316' },
  { id: 'ua', label: 'Ukraine', x: 578, y: 120, flag: '🇺🇦', color: '#eab308' },
];

const TARGET = { x: 172, y: 192 };
const DURATION = 2800;

const ATTACK_TYPES = [
  'Brute Force', 'Port Scan', 'Phishing', 'C2 Beacon',
  'SQL Injection', 'DDoS', 'Credential Stuffing', 'Exploit Kit',
];

function bezierPoint(t, p0, p1, p2) {
  const mt = 1 - t;
  return {
    x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
    y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y,
  };
}

function controlPoint(src, tgt) {
  return {
    x: (src.x + tgt.x) / 2,
    y: Math.min(src.y, tgt.y) - Math.abs(tgt.x - src.x) * 0.18 - 30,
  };
}

function arcPath(src, tgt) {
  const cp = controlPoint(src, tgt);
  return `M ${src.x},${src.y} Q ${cp.x},${cp.y} ${tgt.x},${tgt.y}`;
}

export function LiveAttackMap() {
  const nextId = useRef(0);
  const [attacks, setAttacks] = useState([]);
  const [tick, setTick] = useState(0);
  const [counts, setCounts] = useState(() => {
    const c = {};
    SOURCES.forEach(s => { c[s.id] = Math.floor(Math.random() * 400) + 80; });
    return c;
  });
  const [typeCounts, setTypeCounts] = useState(() => {
    const t = {};
    ATTACK_TYPES.forEach(type => { t[type] = Math.floor(Math.random() * 250) + 40; });
    return t;
  });
  const [totalBlocked, setTotalBlocked] = useState(14382);

  // Animation tick at 20fps
  useEffect(() => {
    const raf = setInterval(() => setTick(t => t + 1), 50);
    return () => clearInterval(raf);
  }, []);

  // Spawn new attacks
  useEffect(() => {
    const interval = setInterval(() => {
      const src = SOURCES[Math.floor(Math.random() * SOURCES.length)];
      const type = ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)];
      const id = nextId.current++;
      setAttacks(prev => [
        ...prev.filter(a => Date.now() - a.startTime < DURATION + 200),
        { id, sourceId: src.id, startTime: Date.now(), color: src.color, type },
      ]);
      setCounts(prev => ({ ...prev, [src.id]: prev[src.id] + 1 }));
      setTypeCounts(prev => ({ ...prev, [type]: prev[type] + 1 }));
      setTotalBlocked(prev => prev + Math.floor(Math.random() * 4) + 1);
    }, 900);
    return () => clearInterval(interval);
  }, []);

  const topSources = [...SOURCES]
    .sort((a, b) => (counts[b.id] || 0) - (counts[a.id] || 0))
    .slice(0, 5);

  const maxCount = Math.max(...SOURCES.map(s => counts[s.id] || 0));
  const maxTypeCount = Math.max(...ATTACK_TYPES.map(t => typeCounts[t] || 0));
  const typeColors = ['#ef4444', '#f97316', '#eab308', '#8b5cf6', '#06b6d4', '#ec4899', '#10b981', '#6366f1'];

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/30 rounded-full mb-4">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-400" />
          </span>
          Global Threat Map — Live
        </div>
        <h2 className="text-4xl font-bold font-syne mb-3">
          Attack <span className="text-[#00E87A]">Surface Monitor</span>
        </h2>
        <p className="text-zinc-400 max-w-2xl text-sm">
          Threat intelligence dashboard visualization — UI demonstration inspired by commercial SOC monitoring platforms.
        </p>
        <div className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 bg-amber-500/10 border border-amber-500/25 rounded-lg">
          <span className="text-amber-400 text-xs">⚠</span>
          <span className="font-mono text-xs text-amber-400/80">Simulated visualization — not connected to live threat feeds</span>
        </div>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Blocked', value: totalBlocked.toLocaleString(), color: 'text-[#00E87A]', border: 'border-[#00E87A]/20' },
          { label: 'Active Sources', value: SOURCES.length, color: 'text-red-400', border: 'border-red-500/20' },
          { label: 'Attack Vectors', value: ATTACK_TYPES.length, color: 'text-amber-400', border: 'border-amber-500/20' },
          { label: 'Threat Level', value: 'HIGH', color: 'text-orange-400', border: 'border-orange-500/20' },
        ].map((s, i) => (
          <div key={i} className={`bg-zinc-900/60 border ${s.border} rounded-xl p-4 text-center`}>
            <div className={`text-2xl font-bold font-syne ${s.color}`}>{s.value}</div>
            <div className="font-mono text-xs text-zinc-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_290px] gap-6">
        {/* SVG Map */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-zinc-800/30">
            <div className="flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-400" />
              </span>
              <span className="font-mono text-xs uppercase tracking-wider text-zinc-400">Global Attack Map</span>
            </div>
            <span className="font-mono text-xs text-[#00E87A]">● Perimeter Active</span>
          </div>

          <div className="relative bg-black" style={{ paddingBottom: '52%' }}>
            <svg
              viewBox="0 0 1000 520"
              className="absolute inset-0 w-full h-full"
            >
              {/* Radial glow at target */}
              <defs>
                <radialGradient id="targetGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#00E87A" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#00E87A" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="bgGlow" cx="17%" cy="37%" r="30%">
                  <stop offset="0%" stopColor="#00E87A" stopOpacity="0.04" />
                  <stop offset="100%" stopColor="#00E87A" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect width="1000" height="520" fill="url(#bgGlow)" />

              {/* Grid */}
              {Array.from({ length: 11 }, (_, i) => (
                <line key={`v${i}`} x1={i * 100} y1={0} x2={i * 100} y2={520}
                  stroke="rgba(255,255,255,0.035)" strokeWidth={1} />
              ))}
              {Array.from({ length: 6 }, (_, i) => (
                <line key={`h${i}`} x1={0} y1={i * 100} x2={1000} y2={i * 100}
                  stroke="rgba(255,255,255,0.035)" strokeWidth={1} />
              ))}

              {/* Static faint paths */}
              {SOURCES.map(src => (
                <path
                  key={`path-${src.id}`}
                  d={arcPath(src, TARGET)}
                  fill="none"
                  stroke={src.color}
                  strokeWidth={0.5}
                  strokeOpacity={0.12}
                  strokeDasharray="4 6"
                />
              ))}

              {/* Active attack dots */}
              {attacks.map(attack => {
                const src = SOURCES.find(s => s.id === attack.sourceId);
                if (!src) return null;
                const elapsed = Date.now() - attack.startTime;
                const t = Math.min(elapsed / DURATION, 1);
                const cp = controlPoint(src, TARGET);
                const pos = bezierPoint(t, src, cp, TARGET);
                const opacity = t > 0.85 ? (1 - t) / 0.15 : 1;
                return (
                  <g key={attack.id}>
                    <circle cx={pos.x} cy={pos.y} r={5} fill={attack.color} opacity={opacity * 0.25} />
                    <circle cx={pos.x} cy={pos.y} r={2.5} fill={attack.color} opacity={opacity} />
                  </g>
                );
              })}

              {/* Source nodes */}
              {SOURCES.map(src => (
                <g key={`node-${src.id}`}>
                  <circle cx={src.x} cy={src.y} r={14} fill={src.color} opacity={0.06} />
                  <circle cx={src.x} cy={src.y} r={4} fill={src.color} opacity={0.85} />
                  <circle cx={src.x} cy={src.y} r={4} fill={src.color} opacity={0.4}>
                    <animate attributeName="r" values="4;13;4" dur="3s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.5;0;0.5" dur="3s" repeatCount="indefinite" />
                  </circle>
                  <text x={src.x + 8} y={src.y - 7} fill="rgba(255,255,255,0.65)" fontSize="9.5" fontFamily="monospace">{src.label}</text>
                  <text x={src.x + 8} y={src.y + 4} fill={src.color} fontSize="8.5" fontFamily="monospace" opacity="0.8">
                    {(counts[src.id] || 0).toLocaleString()}
                  </text>
                </g>
              ))}

              {/* Target */}
              <circle cx={TARGET.x} cy={TARGET.y} r={32} fill="url(#targetGlow)" />
              <circle cx={TARGET.x} cy={TARGET.y} r={10} fill="#00E87A" opacity={0.15} />
              <circle cx={TARGET.x} cy={TARGET.y} r={6} fill="#00E87A" opacity={0.9} />
              <circle cx={TARGET.x} cy={TARGET.y} r={6} fill="#00E87A" opacity={0.4}>
                <animate attributeName="r" values="6;22;6" dur="2.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0;0.5" dur="2.5s" repeatCount="indefinite" />
              </circle>
              <text x={TARGET.x + 14} y={TARGET.y - 8} fill="#00E87A" fontSize="11" fontFamily="monospace" fontWeight="bold">US Infrastructure</text>
              <text x={TARGET.x + 14} y={TARGET.y + 5} fill="rgba(0,232,122,0.55)" fontSize="9" fontFamily="monospace">● DEFENDED</text>
            </svg>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Top sources */}
          <div className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 bg-zinc-800/30">
              <span className="font-mono text-xs uppercase tracking-wider text-zinc-400">Top Threat Sources</span>
            </div>
            <div className="divide-y divide-white/5">
              {topSources.map((src, i) => (
                <div key={src.id} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="font-mono text-xs text-zinc-600 w-4">{i + 1}</span>
                  <span className="text-base leading-none">{src.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-xs text-zinc-300 mb-1">{src.label}</div>
                    <div className="h-1 bg-zinc-800 rounded-full">
                      <div
                        className="h-1 rounded-full transition-all duration-500"
                        style={{ width: `${((counts[src.id] || 0) / maxCount) * 100}%`, background: src.color }}
                      />
                    </div>
                  </div>
                  <span className="font-mono text-xs flex-shrink-0" style={{ color: src.color }}>
                    {(counts[src.id] || 0).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Attack vectors */}
          <div className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 bg-zinc-800/30">
              <span className="font-mono text-xs uppercase tracking-wider text-zinc-400">Attack Vectors</span>
            </div>
            <div className="divide-y divide-white/5">
              {ATTACK_TYPES.map((type, i) => (
                <div key={type} className="flex items-center gap-3 px-4 py-2">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: typeColors[i] }} />
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-xs text-zinc-400 truncate">{type}</div>
                    <div className="h-0.5 bg-zinc-800 rounded-full mt-1">
                      <div
                        className="h-0.5 rounded-full transition-all duration-500"
                        style={{ width: `${((typeCounts[type] || 0) / maxTypeCount) * 100}%`, background: typeColors[i] }}
                      />
                    </div>
                  </div>
                  <span className="font-mono text-xs text-zinc-600 flex-shrink-0">
                    {(typeCounts[type] || 0).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
