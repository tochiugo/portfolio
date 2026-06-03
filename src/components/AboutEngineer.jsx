import React from 'react';
import { personal, techStack } from '../data/portfolio';

export function AboutEngineer() {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12">
      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <div className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-500 mb-3">The Person Behind the Systems</div>
          <h2 className="font-syne text-4xl font-extrabold tracking-tight">About {personal.name.split(' ')[0]}</h2>
          <div className="mt-6 space-y-4 text-zinc-300 leading-relaxed text-[15px] max-w-2xl">
            <p>
              You've now seen a live trading system and a shipped iOS product. So here's the short version of who built them:
              I'm <strong className="text-white">{personal.name}</strong>, a software & automation engineer in {personal.location}.
            </p>
            <p>{personal.pitch}</p>
            <p>
              My range is deliberately wide — Python trading engines with real risk controls and Brier calibration, SwiftUI
              apps touching low-level AVFoundation, Node orchestration layers fusing news/crypto/AI signals, and Playwright
              automation against live, hostile UIs. The throughline is the same: <strong className="text-white">build the thing,
              run it, log it, and keep the receipts.</strong>
            </p>
            <p>
              I'm drawn to roles where shipping and operating real systems matters more than slideware — automation, applied
              AI, and backend/systems work at teams that move fast.
            </p>
          </div>

          <div className="mt-8">
            <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-3">Open To</div>
            <div className="flex flex-wrap gap-2">
              {personal.targetRoles.map((r) => (
                <span key={r} className="font-mono text-xs px-3 py-1.5 rounded-full border border-[#00E87A]/25 text-[#00E87A] bg-[#00E87A]/[0.05]">{r}</span>
              ))}
            </div>
          </div>
        </div>

        {/* tech stack */}
        <div className="space-y-5">
          {Object.entries(techStack).map(([group, items]) => (
            <div key={group} className="rounded-xl border border-white/10 bg-zinc-900/40 p-4">
              <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-2">{group}</div>
              <div className="flex flex-wrap gap-1.5">
                {items.map((t) => (
                  <span key={t} className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-black/40 border border-white/5 text-zinc-300">{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AboutEngineer;
