import React from 'react';
import { hero, personal } from '../data/portfolio';

// Identity band — the first thing a visitor (or recruiter) sees. Puts the
// person up front with a full, uncropped portrait, then hands off to the live
// Mission Control dashboard as the proof centerpiece.
export function Hero() {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12">
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-12 lg:gap-16 items-center">
        {/* copy */}
        <div className="min-w-0">
          <div className="kicker mb-5">{personal.title} · {personal.location}</div>

          <p className="font-mono text-sm text-[#00E87A] mb-3">{hero.greeting}</p>
          <h1 className="font-syne text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1] break-words">
            <span className="text-gradient">{hero.headline[0]}</span>{' '}
            <span className="text-accent-gradient">{hero.headline[1]}</span>{' '}
            <span className="text-white">{hero.headline[2]}</span>
          </h1>

          <p className="mt-6 text-zinc-300 leading-relaxed text-[16px] max-w-2xl">{hero.blurb}</p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {hero.ctas.map((c) => (
              <a key={c.label} href={c.href}
                className={`px-6 py-3 rounded-full font-mono text-sm transition-all ${
                  c.kind === 'primary'
                    ? 'bg-[#00E87A] text-black font-semibold hover:bg-[#00E87A]/90 hover:shadow-[0_8px_30px_-8px_rgba(0,232,122,0.6)]'
                    : 'border border-white/15 text-zinc-200 hover:border-[#00E87A]/50 hover:text-[#00E87A]'
                }`}>
                {c.label} →
              </a>
            ))}
            <a href={personal.linkedin} target="_blank" rel="noopener noreferrer"
              className="font-mono text-xs text-zinc-500 hover:text-[#00E87A] transition-colors px-2">LinkedIn</a>
            <a href={personal.github} target="_blank" rel="noopener noreferrer"
              className="font-mono text-xs text-zinc-500 hover:text-[#00E87A] transition-colors px-2">GitHub</a>
          </div>

          {/* stats */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl">
            {hero.stats.map((s) => (
              <div key={s.label} className="rounded-xl border border-white/10 bg-zinc-900/40 px-4 py-3 card-lift">
                <div className="font-syne text-2xl font-bold text-[#00E87A] leading-none">{s.value}</div>
                <div className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 mt-2 leading-tight">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* portrait — shown fully, no crop */}
        <div className="order-first lg:order-last mx-auto w-full max-w-[320px] sm:max-w-[360px]">
          <div className="hero-photo-frame">
            <img
              src={hero.photo}
              alt={`${personal.name} — ${personal.title}`}
              width="420"
              height="560"
              decoding="async"
              fetchpriority="high"
            />
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 font-mono text-[11px] text-zinc-500">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E87A] soc-pulse" />
            Available now · {personal.location}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;
