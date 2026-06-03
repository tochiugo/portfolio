import React from 'react';
import { personal } from '../data/portfolio';

const LINKS = [
  { label: 'Email', value: personal.email, href: `mailto:${personal.email}`, primary: true },
  { label: 'Phone', value: personal.phone, href: `tel:${personal.phone.replace(/[^0-9+]/g, '')}` },
  { label: 'LinkedIn', value: 'in/tochi-i-u', href: personal.linkedin },
  { label: 'GitHub', value: `github.com/${personal.handle}`, href: personal.github },
];

export function ContactSection() {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12">
      <div className="text-center max-w-2xl mx-auto">
        <div className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-500 mb-3">Let's Build</div>
        <h2 className="font-syne text-4xl sm:text-5xl font-extrabold tracking-tight">
          You've seen the systems. <span className="text-[#00E87A]">Now hire the engineer.</span>
        </h2>
        <p className="mt-5 text-zinc-400 leading-relaxed">
          Available for software, automation, and applied-AI roles. Fastest path is email — I usually reply within a few hours.
        </p>
      </div>

      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
        {LINKS.map((l) => (
          <a key={l.label} href={l.href} target={l.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
            className={`group rounded-2xl border p-5 transition-all ${
              l.primary ? 'border-[#00E87A]/40 bg-[#00E87A]/[0.06] hover:bg-[#00E87A]/[0.12]' : 'border-white/10 bg-zinc-900/40 hover:border-[#00E87A]/30'
            }`}>
            <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">{l.label}</div>
            <div className={`mt-1.5 font-mono text-sm break-all ${l.primary ? 'text-[#00E87A]' : 'text-zinc-200 group-hover:text-[#00E87A]'} transition-colors`}>{l.value}</div>
          </a>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
        {personal.targetRoles.map((r) => (
          <span key={r} className="font-mono text-[11px] px-3 py-1.5 rounded-full border border-white/10 text-zinc-400">{r}</span>
        ))}
      </div>
    </div>
  );
}

export default ContactSection;
