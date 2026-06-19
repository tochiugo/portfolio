import React from 'react';
import { personal, about, techStack } from '../data/portfolio';

export function AboutEngineer() {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12">
      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <div className="kicker mb-3">The Person Behind the Systems</div>
          <h2 className="font-syne text-4xl font-extrabold tracking-tight text-gradient">About {personal.name.split(' ')[0]}</h2>

          {/* photo + intro */}
          <div className="mt-6 flex flex-col sm:flex-row gap-6 items-start">
            <div className="hero-photo-frame w-36 sm:w-40 flex-shrink-0">
              <img
                src={about.photo}
                alt={personal.name}
                loading="lazy"
                decoding="async"
                width="420"
                height="560"
              />
            </div>
            <div className="space-y-4 text-zinc-300 leading-relaxed text-[15px]">
              {about.paragraphs.map((p, i) => (
                <p key={i} dangerouslySetInnerHTML={{ __html: i === 0 ? p.replace(personal.name, `<strong class="text-white">${personal.name}</strong>`) : p }} />
              ))}
            </div>
          </div>

          {/* highlights */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {about.highlights.map((h) => (
              <div key={h.label} className="rounded-xl border border-white/10 bg-zinc-900/40 p-3 text-center card-lift">
                <div className="font-syne text-xl font-bold text-[#00E87A]">{h.value}</div>
                <div className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 mt-1 leading-tight">{h.label}</div>
              </div>
            ))}
          </div>

          {/* work auth */}
          <div className="mt-6 rounded-xl border border-[#00E87A]/20 bg-[#00E87A]/[0.04] px-4 py-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#00E87A] mb-1">Work Authorization</div>
            <p className="text-sm text-zinc-300">{about.workAuthorization}</p>
          </div>

          <div className="mt-6">
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
