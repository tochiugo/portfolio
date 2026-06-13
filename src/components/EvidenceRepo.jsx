import React from 'react';
import { evidenceRepo as E } from '../data/portfolio';

export function EvidenceRepo() {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900/60 to-black p-8 lg:p-12">
        <div className="grid lg:grid-cols-2 gap-10">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-500 mb-3">Chain of Custody</div>
            <h2 className="font-syne text-4xl font-extrabold tracking-tight">Evidence Repository</h2>
            <p className="mt-5 text-zinc-300 leading-relaxed text-[15px]">{E.summary}</p>

            <div className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {E.stats.map((s) => (
                <div key={s.label} className="rounded-xl border border-white/10 bg-black/40 p-3 text-center">
                  <div className="font-syne text-2xl font-bold text-[#00E87A]">{s.value}</div>
                  <div className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 mt-1 leading-tight">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* repo taxonomy */}
          <div>
            <div className="soc-terminal p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#00E87A]/70" />
                <span className="ml-2 font-mono text-[10px] text-zinc-500">ENGINEERING_EVIDENCE/&lt;project&gt;/</span>
              </div>
              <div className="space-y-1.5 font-mono text-[12px]">
                {E.sections.map((s, i) => (
                  <div key={s} className="flex items-center gap-2 text-zinc-300">
                    <span className="text-zinc-600">{i === E.sections.length - 1 ? '└─' : '├─'}</span>
                    <span className="text-[#00E87A]/80">{s.split(' ')[0]}</span>
                    <span className="text-zinc-500">{s.split(' ').slice(1).join(' ')}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {[
                ['View Screenshots', '#witnesspro'],
                ['View Runtime Evidence', '#mission-control'],
                ['View Logs & Databases', '#soc-lab'],
                ['View Engineering Artifacts', '#projects'],
              ].map(([a, href]) => (
                <a key={a} href={href}
                  className="group font-mono text-[11px] text-zinc-400 rounded-lg border border-white/10 bg-black/30 px-3 py-2 flex items-center gap-2 hover:border-[#00E87A]/40 hover:text-[#00E87A] transition-colors">
                  <span className="text-[#00E87A] group-hover:translate-x-0.5 transition-transform">›</span> {a}
                </a>
              ))}
            </div>
            <p className="mt-4 font-mono text-[11px] text-zinc-600 leading-relaxed">
              The galleries on this site are the curated public slice. The full per-project evidence — source trees,
              raw logs, databases, and the complete screenshot set — is walked through live in technical interviews.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EvidenceRepo;
