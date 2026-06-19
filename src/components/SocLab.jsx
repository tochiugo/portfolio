import React from 'react';
import { socLab as S } from '../data/portfolio';
import SwipeGallery from './SwipeGallery';

const SEV = { High: '#ff4d4d', Medium: '#f5b301', Low: '#38bdf8' };

export function SocLab() {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-zinc-500">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E87A] soc-pulse" /> Security Operations · Live Lab
          </div>
          <h2 className="mt-3 font-syne text-4xl sm:text-5xl font-extrabold tracking-tight text-gradient">Home SOC Lab</h2>
          <p className="mt-3 text-lg text-zinc-300 max-w-2xl">{S.tagline}</p>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {S.stats.map((st) => (
            <div key={st.label} className="rounded-xl border border-white/10 bg-zinc-900/40 px-3 py-2 text-center">
              <div className="font-syne text-lg font-bold text-[#00E87A]">{st.value}</div>
              <div className="font-mono text-[8px] uppercase tracking-wider text-zinc-500 leading-tight">{st.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-10 items-start">
        {/* gallery */}
        <div>
          <SwipeGallery images={S.images} captions={S.captions} frame="wide" label="SOC Lab" />
          <p className="mt-4 text-zinc-400 leading-relaxed text-[15px]">{S.summary}</p>

          {/* architecture */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            {S.architecture.map((a) => (
              <div key={a.title} className="rounded-xl border border-white/10 bg-zinc-900/40 p-3 card-lift">
                <div className="text-xl mb-1">{a.icon}</div>
                <div className="font-syne text-sm font-semibold text-white">{a.title}</div>
                <div className="text-[11px] text-zinc-500 leading-snug mt-0.5">{a.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* case studies + SPL */}
        <div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-3">Documented Investigations · MITRE ATT&CK</div>
          <div className="space-y-2.5">
            {S.caseStudies.map((c) => (
              <div key={c.title} className="rounded-xl border border-white/10 bg-zinc-900/30 p-3.5">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-syne text-sm font-semibold text-white">{c.title}</span>
                  <span className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded border" style={{ color: SEV[c.sev], borderColor: `${SEV[c.sev]}55` }}>{c.sev}</span>
                    <span className="font-mono text-[10px] text-zinc-500">{c.mitre}</span>
                  </span>
                </div>
                <p className="text-[13px] text-zinc-400 leading-snug">{c.body}</p>
              </div>
            ))}
          </div>

          {/* SPL queries */}
          <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mt-6 mb-3">Detection Queries · Splunk SPL</div>
          <div className="space-y-3">
            {S.spl.map((q) => (
              <div key={q.title} className="soc-terminal p-3">
                <div className="font-mono text-[11px] text-[#00E87A] mb-1.5">{q.title}</div>
                <pre className="font-mono text-[10.5px] text-zinc-400 leading-relaxed whitespace-pre-wrap overflow-x-auto">{q.code}</pre>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SocLab;
