import React from 'react';
import { nexus as N } from '../data/portfolio';
import SwipeGallery from './SwipeGallery';

export function NexusSection() {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-zinc-500 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Confidential · Public-Safe Surface
          </div>
          <h2 className="font-syne text-4xl font-extrabold tracking-tight">{N.name}</h2>
          <p className="mt-3 text-lg text-zinc-300">{N.tagline}</p>
          <p className="mt-5 text-zinc-400 leading-relaxed text-[15px]">{N.summary}</p>

          <div className="mt-7 grid grid-cols-2 gap-3">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-[#00E87A] mb-2">Public Concepts</div>
              <ul className="space-y-1.5">
                {N.publicConcepts.map((c) => (
                  <li key={c} className="flex items-center gap-2 text-sm text-zinc-300">
                    <span className="text-[#00E87A]">✓</span> {c}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-600 mb-2">Withheld</div>
              <ul className="space-y-1.5">
                {N.withheld.map((c) => (
                  <li key={c} className="flex items-center gap-2 text-sm text-zinc-600">
                    <span>🔒</span> {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mt-7 font-mono text-xs text-zinc-600 border-l-2 border-amber-400/30 pl-3">
            This is a teaser by design. Architecture, specifications, and strategy stay private.
          </p>
        </div>

        <div>
          <SwipeGallery images={N.images} captions={N.captions} frame="phone" label="Nexus" accent="#f5b301" />
        </div>
      </div>
    </div>
  );
}

export default NexusSection;
