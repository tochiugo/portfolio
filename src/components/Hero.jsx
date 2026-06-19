import React from 'react';
import { hero, personal, about, techStack } from '../data/portfolio';

// Brand / action icons (24×24 viewBox).
const LinkedInIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 110-4.12 2.06 2.06 0 010 4.12zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"/></svg>
);
const GitHubIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
);
const MailIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
);
const DocIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M8 13h8M8 17h6" /></svg>
);
const DownloadIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3v12" /><path d="m7 11 5 4 5-4" /><path d="M5 21h14" /></svg>
);

// Social + résumé links shown directly under the portrait. Résumé both opens
// (web version, new tab) and downloads (PDF).
const SOCIALS = [
  { label: 'LinkedIn', href: personal.linkedin, Icon: LinkedInIcon, external: true },
  { label: 'GitHub', href: personal.github, Icon: GitHubIcon, external: true },
  { label: 'Email', href: `mailto:${personal.email}`, Icon: MailIcon },
  { label: 'Open résumé', href: '/resume.html', Icon: DocIcon, external: true },
  { label: 'Download résumé (PDF)', href: '/resume.pdf', Icon: DownloadIcon, download: 'Tochi_Ugochukwu_Resume.pdf' },
];

// The opening identity band + the full "about me" — a single section. The
// portrait, social links, story, work authorization, and tech stack all live
// here so there is exactly one place that introduces the person.
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

        {/* portrait + social links — the single photo, shown fully, no crop */}
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

          {/* social / résumé icon row */}
          <div className="mt-5 flex items-center justify-center gap-3">
            {SOCIALS.map(({ label, href, Icon, external, download }) => (
              <a
                key={label}
                href={href}
                title={label}
                aria-label={label}
                download={download}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                className="grid place-items-center w-11 h-11 rounded-full border border-white/15 bg-zinc-900/40 text-zinc-300 transition-all hover:text-[#00E87A] hover:border-[#00E87A]/50 hover:bg-[#00E87A]/[0.08] hover:-translate-y-0.5"
              >
                <Icon className="w-[18px] h-[18px]" />
              </a>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 font-mono text-[11px] text-zinc-500">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E87A] soc-pulse" />
            Available now · {personal.location}
          </div>
        </div>
      </div>

      {/* ── merged "about" — the story, work authorization, and the stack ────── */}
      <div className="mt-16 lg:mt-24 pt-12 border-t border-white/10 grid lg:grid-cols-3 gap-10 lg:gap-12">
        <div className="lg:col-span-2">
          <div className="kicker mb-3">More About Me</div>
          <h2 className="font-syne text-3xl sm:text-4xl font-extrabold tracking-tight text-gradient">The story behind the work</h2>

          <div className="mt-5 space-y-4 text-zinc-300 leading-relaxed text-[15px]">
            {about.paragraphs.map((p, i) => (
              <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
            ))}
          </div>

          {/* work auth */}
          <div className="mt-6 rounded-xl border border-[#00E87A]/20 bg-[#00E87A]/[0.04] px-4 py-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#00E87A] mb-1">Work Authorization</div>
            <p className="text-sm text-zinc-300">{about.workAuthorization}</p>
          </div>

          {/* open to */}
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
          <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Tech Stack</div>
          {Object.entries(techStack).map(([group, items]) => (
            <div key={group} className="rounded-xl border border-white/10 bg-zinc-900/40 p-4 card-lift">
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

export default Hero;
