import React from 'react';
import { certifications as C } from '../data/portfolio';

export function Certifications() {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12">
      <div className="mb-10">
        <div className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-500 mb-3">Verified Credentials</div>
        <h2 className="font-syne text-4xl font-extrabold tracking-tight">Certifications & Education</h2>
        <p className="mt-2 text-zinc-400 max-w-2xl">CompTIA Security+ and the Google Cybersecurity track — all independently verifiable on Credly.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* certs */}
        <div className="lg:col-span-2">
          <div className="grid sm:grid-cols-2 gap-3">
            {C.items.map((c) => (
              <a key={c.name} href={c.url} target="_blank" rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-xl border border-white/10 bg-zinc-900/40 p-4 hover:border-[#00E87A]/40 transition-colors">
                <span className="text-2xl flex-shrink-0">{c.icon}</span>
                <div className="min-w-0">
                  <div className="font-syne text-sm font-semibold text-white group-hover:text-[#00E87A] transition-colors leading-tight">{c.name}</div>
                  <div className="font-mono text-[10px] text-zinc-500 mt-0.5">{c.issuer}</div>
                </div>
                <span className="ml-auto font-mono text-[9px] text-[#00E87A] flex-shrink-0">✓ verify</span>
              </a>
            ))}
          </div>

          {/* education */}
          <div className="mt-6">
            <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-3">Education</div>
            <div className="space-y-2">
              {C.education.items.map((e) => (
                <div key={e.title} className="rounded-xl border border-white/10 bg-zinc-900/30 px-4 py-3">
                  <div className="font-syne text-sm font-semibold text-white">{e.title}</div>
                  <div className="text-[12px] text-zinc-500 mt-0.5">{e.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* tryhackme */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900/50 to-black p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="font-syne font-bold text-white">TryHackMe</span>
            <a href={C.tryhackme.url} target="_blank" rel="noopener noreferrer" className="font-mono text-[10px] text-[#00E87A] hover:underline">profile ↗</a>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {C.tryhackme.stats.map((s) => (
              <div key={s.label} className="rounded-lg border border-white/10 bg-black/40 p-2.5 text-center">
                <div className="font-syne text-lg font-bold text-[#00E87A]">{s.value}</div>
                <div className="font-mono text-[8px] uppercase tracking-wider text-zinc-500">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-2">Badges</div>
            <div className="flex flex-wrap gap-1.5">
              {C.tryhackme.badges.map((b) => (
                <span key={b} className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-black/40 border border-white/5 text-zinc-300">{b}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Certifications;
