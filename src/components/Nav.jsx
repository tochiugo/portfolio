import React, { useState } from 'react';
import { personal, nav } from '../data/portfolio';

export function Nav({ activeSection, scrollToSection }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-black/70 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-16">
          <button onClick={() => scrollToSection('mission-control')} className="flex items-center gap-2 group">
            <span className="w-2 h-2 rounded-full bg-[#00E87A] soc-pulse" />
            <span className="font-syne font-extrabold tracking-tight text-white">{personal.name.split(' ')[0]}<span className="text-[#00E87A]">.</span></span>
            <span className="hidden sm:inline font-mono text-[10px] text-zinc-500 uppercase tracking-wider">{personal.title}</span>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            {nav.map((n) => (
              <button key={n.id} onClick={() => scrollToSection(n.id)}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-colors ${
                  activeSection === n.id ? 'text-[#00E87A] bg-[#00E87A]/[0.08]' : 'text-zinc-400 hover:text-white'
                }`}>
                {n.label}
              </button>
            ))}
            <a href={`mailto:${personal.email}`} className="ml-2 px-3 py-1.5 rounded-lg font-mono text-xs font-semibold bg-[#00E87A] text-black hover:bg-[#00E87A]/90 transition-colors">
              Hire me
            </a>
          </nav>

          <button onClick={() => setOpen((o) => !o)} className="md:hidden p-2 text-zinc-300" aria-label="Menu">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/10 bg-black/95 px-6 py-3">
          <div className="grid grid-cols-2 gap-1">
            {nav.map((n) => (
              <button key={n.id} onClick={() => { scrollToSection(n.id); setOpen(false); }}
                className={`text-left px-3 py-2 rounded-lg font-mono text-sm ${activeSection === n.id ? 'text-[#00E87A]' : 'text-zinc-300'}`}>
                {n.label}
              </button>
            ))}
          </div>
          <a href={`mailto:${personal.email}`} className="mt-2 block text-center px-3 py-2 rounded-lg font-mono text-sm font-semibold bg-[#00E87A] text-black">Hire me</a>
        </div>
      )}
    </header>
  );
}

export default Nav;
