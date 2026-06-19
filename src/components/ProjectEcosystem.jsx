import React, { useState, useMemo } from 'react';
import { projects } from '../data/portfolio';
import SwipeGallery from './SwipeGallery';

const STATUS_STYLE = {
  Operational: { color: '#00E87A', label: 'Operational' },
  Shipped: { color: '#38bdf8', label: 'Shipped' },
  Prototype: { color: '#f5b301', label: 'Prototype' },
  Research: { color: '#c084fc', label: 'Research' },
};

function ProjectCard({ p }) {
  const [open, setOpen] = useState(false);
  const s = STATUS_STYLE[p.status] || STATUS_STYLE.Operational;
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/30 p-4 flex flex-col card-lift">
      <SwipeGallery images={p.images} captions={p.captions} frame="wide" label={p.name} />

      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-syne text-lg font-bold text-white leading-tight">{p.name}</h3>
          <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mt-0.5">{p.category}</div>
        </div>
        <span className="inline-flex items-center gap-1.5 flex-shrink-0 font-mono text-[10px] uppercase px-2 py-1 rounded-full border"
          style={{ color: s.color, borderColor: `${s.color}55`, background: `${s.color}10` }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />{s.label}
        </span>
      </div>

      <p className="mt-2 text-sm text-zinc-400 leading-snug">{p.tagline}</p>

      {/* metrics */}
      {p.metrics?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {p.metrics.map((m) => (
            <span key={m.label} className="font-mono text-[10px] px-2 py-1 rounded-md bg-black/40 border border-white/5 text-zinc-300">
              <span className="text-zinc-500">{m.label}: </span>{m.value}
            </span>
          ))}
        </div>
      )}

      {/* details toggle */}
      <button onClick={() => setOpen((o) => !o)}
        className="mt-3 self-start font-mono text-[11px] text-zinc-400 hover:text-[#00E87A] transition-colors flex items-center gap-1">
        {open ? '▾ Hide details' : '▸ Details & evidence'}
      </button>

      {open && (
        <div className="mt-3 space-y-3 border-t border-white/5 pt-3">
          <p className="text-sm text-zinc-400 leading-relaxed">{p.summary}</p>
          <ul className="space-y-1.5">
            {p.highlights.map((h) => (
              <li key={h} className="flex items-start gap-2 text-[13px] text-zinc-300">
                <span className="text-[#00E87A] mt-0.5">▹</span><span className="leading-snug">{h}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-1.5">
            {p.stack.map((t) => (
              <span key={t} className="font-mono text-[10px] px-2 py-0.5 rounded-md border border-white/10 text-zinc-400">{t}</span>
            ))}
          </div>
          <div className="font-mono text-[10px] text-zinc-600">
            {p.published ? '↗ Source publishable' : '🔒 Source private'}
          </div>
        </div>
      )}
    </div>
  );
}

export function ProjectEcosystem() {
  const categories = useMemo(() => ['All', ...Array.from(new Set(projects.map((p) => p.category)))], []);
  const [filter, setFilter] = useState('All');
  const shown = filter === 'All' ? projects : projects.filter((p) => p.category === filter);

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <div className="kicker mb-3">A Living Engineering Ecosystem</div>
          <h2 className="font-syne text-4xl font-extrabold tracking-tight text-gradient">Project Ecosystem</h2>
          <p className="mt-2 text-zinc-400 max-w-2xl">{projects.length} systems. Swipe each gallery — evidence first, text second.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button key={c} onClick={() => setFilter(c)}
              className={`font-mono text-xs px-3 py-1.5 rounded-full border transition-all ${
                filter === c ? 'border-[#00E87A]/50 text-[#00E87A] bg-[#00E87A]/[0.08]' : 'border-white/10 text-zinc-500 hover:text-zinc-300'
              }`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {shown.map((p) => <ProjectCard key={p.slug} p={p} />)}
      </div>
    </div>
  );
}

export default ProjectEcosystem;
