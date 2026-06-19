import React from 'react';
import { experience } from '../data/portfolio';

export function Experience() {
  return (
    <div className="max-w-5xl mx-auto px-6 lg:px-12">
      <div className="mb-10">
        <div className="kicker mb-3">A Decade of Building & Operating</div>
        <h2 className="font-syne text-4xl font-extrabold tracking-tight text-gradient">Experience</h2>
        <p className="mt-2 text-zinc-400 max-w-2xl">Two companies founded, a security practice, an engineering practice, and the discipline behind it.</p>
      </div>

      <div className="relative">
        <div className="absolute left-2 top-2 bottom-2 w-px bg-gradient-to-b from-[#00E87A]/40 via-white/10 to-transparent" />
        <div className="space-y-6">
          {experience.map((e) => (
            <div key={e.org + e.role} className="relative pl-10">
              <span className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 bg-black"
                style={{ borderColor: e.current ? '#00E87A' : 'rgba(255,255,255,0.25)' }}>
                {e.current && <span className="absolute inset-0.5 rounded-full bg-[#00E87A] soc-pulse" />}
              </span>
              <div className="rounded-2xl border border-white/10 bg-zinc-900/30 p-5 card-lift">
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                  <div>
                    <span className="font-syne text-lg font-bold text-white">{e.role}</span>
                    <span className="text-zinc-500"> · </span>
                    <span className="text-zinc-300">{e.org}</span>
                  </div>
                  <span className="font-mono text-[11px] text-zinc-500 flex-shrink-0">{e.period}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#00E87A]/25 text-[#00E87A]">{e.tag}</span>
                  <span className="font-mono text-[11px] text-zinc-600">📍 {e.where}</span>
                </div>
                <p className="mt-3 text-sm text-zinc-400 leading-relaxed">{e.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Experience;
