import React from 'react';
import { witnessPro as W } from '../data/portfolio';
import SwipeGallery from './SwipeGallery';

export function WitnessProSection() {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12">
      {/* header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-zinc-500">
            <span>📱</span> Shipped iOS Product
          </div>
          <h2 className="mt-3 font-syne text-4xl sm:text-5xl font-extrabold tracking-tight">{W.name}</h2>
          <p className="mt-3 text-lg text-zinc-300 max-w-2xl">{W.tagline}</p>
          <p className="mt-1 font-mono text-xs text-zinc-500">{W.platform}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {W.links.map((l) => (
            <a key={l.label} href={l.href}
              className={`px-5 py-2.5 rounded-full font-mono text-sm transition-all ${
                l.kind === 'primary'
                  ? 'bg-[#00E87A] text-black hover:bg-[#00E87A]/90 font-semibold'
                  : 'border border-white/15 text-zinc-300 hover:border-[#00E87A]/40 hover:text-[#00E87A]'
              }`}>
              {l.label}
            </a>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* phone gallery */}
        <div id="witnesspro-detail">
          <SwipeGallery images={W.images} captions={W.captions} frame="phone" label="WitnessPro" />
        </div>

        {/* features + workflow */}
        <div>
          <p className="text-zinc-300 leading-relaxed text-[15px]">{W.summary}</p>

          <div className="mt-7 grid sm:grid-cols-2 gap-4">
            {W.features.map((f) => (
              <div key={f.title} className="rounded-xl border border-white/10 bg-zinc-900/40 p-4">
                <div className="text-2xl mb-2">{f.icon}</div>
                <div className="font-syne font-semibold text-white">{f.title}</div>
                <div className="text-sm text-zinc-400 mt-1 leading-snug">{f.body}</div>
              </div>
            ))}
          </div>

          {/* workflow */}
          <div className="mt-7">
            <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-3">Recording → Export Workflow</div>
            <div className="flex flex-wrap items-center gap-2">
              {W.workflow.map((step, i) => (
                <React.Fragment key={step}>
                  <span className="font-mono text-xs px-3 py-1.5 rounded-full border border-[#00E87A]/25 text-[#00E87A] bg-[#00E87A]/[0.05]">{step}</span>
                  {i < W.workflow.length - 1 && <span className="text-zinc-600">→</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* stack */}
          <div className="mt-7 flex flex-wrap gap-2">
            {W.stack.map((s) => (
              <span key={s} className="font-mono text-[11px] px-2.5 py-1 rounded-full border border-white/10 text-zinc-400">{s}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WitnessProSection;
