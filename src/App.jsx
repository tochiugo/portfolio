import React, { useState, useEffect, useRef } from 'react';
import { personal, nav } from './data/portfolio';
import { Nav } from './components/Nav';
import { MissionControl } from './components/MissionControl';
import { WitnessProSection } from './components/WitnessProSection';
import { AboutEngineer } from './components/AboutEngineer';
import { SocLab } from './components/SocLab';
import { ProjectEcosystem } from './components/ProjectEcosystem';
import { Experience } from './components/Experience';
import { Certifications } from './components/Certifications';
import { EvidenceRepo } from './components/EvidenceRepo';
import { ContactSection } from './components/ContactSection';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NexusAI } from './components/NexusAI';

function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // touch devices: no visible cursor — skip the listener + rAF loop entirely (saves mobile CPU/battery)
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(hover: none)').matches) return;
    const onMove = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) { dotRef.current.style.left = `${e.clientX}px`; dotRef.current.style.top = `${e.clientY}px`; }
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const clickable = el && (el.tagName === 'BUTTON' || el.tagName === 'A' || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.closest('button') || el.closest('a'));
      if (ringRef.current) ringRef.current.classList.toggle('hover', !!clickable);
    };
    let raf;
    const animate = () => {
      ring.current.x += (mouse.current.x - ring.current.x) * 0.14;
      ring.current.y += (mouse.current.y - ring.current.y) * 0.14;
      if (ringRef.current) { ringRef.current.style.left = `${ring.current.x}px`; ringRef.current.style.top = `${ring.current.y}px`; }
      raf = requestAnimationFrame(animate);
    };
    document.addEventListener('mousemove', onMove);
    raf = requestAnimationFrame(animate);
    return () => { document.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf); };
  }, []);
  return (<><div ref={dotRef} className="cursor-dot" /><div ref={ringRef} className="cursor-ring" /></>);
}

const SECTION_IDS = nav.map((n) => n.id);

export default function App() {
  const [activeSection, setActiveSection] = useState('mission-control');
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(h > 0 ? Math.min((window.scrollY / h) * 100, 100) : 0);
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (el) {
          const r = el.getBoundingClientRect();
          if (r.top <= 160 && r.bottom >= 160) { setActiveSection(id); break; }
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <CustomCursor />

      {/* scroll progress */}
      <div className="fixed top-0 left-0 h-0.5 z-[55] transition-all duration-100"
        style={{ width: `${scrollProgress}%`, background: 'linear-gradient(90deg,#00E87A,#06b6d4)', boxShadow: '0 0 8px rgba(0,232,122,0.6)' }} />

      <Nav activeSection={activeSection} scrollToSection={scrollToSection} />

      {/* MISSION CONTROL — homepage centerpiece */}
      <section id="mission-control" className="relative pt-28 pb-24 border-b border-white/10 overflow-hidden">
        {/* decorative glow — skipped on mobile where large-radius blur is GPU-expensive */}
        <div className="hidden md:block absolute inset-0 opacity-[0.07] pointer-events-none">
          <div className="absolute top-10 left-1/4 w-[32rem] h-[32rem] rounded-full bg-[#00E87A] blur-[90px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-cyan-500 blur-[90px]" />
        </div>
        <div className="relative"><ErrorBoundary name="mission-control"><MissionControl /></ErrorBoundary></div>
      </section>

      {/* WITNESSPRO */}
      <section id="witnesspro" className="py-24 bg-zinc-950 border-b border-white/10"><ErrorBoundary name="witnesspro"><WitnessProSection /></ErrorBoundary></section>

      {/* ABOUT */}
      <section id="about" className="py-24 bg-black border-b border-white/10"><ErrorBoundary name="about"><AboutEngineer /></ErrorBoundary></section>

      {/* SOC LAB — replaces the former Nexus slot */}
      <section id="soc-lab" className="py-24 bg-zinc-950 border-b border-white/10"><ErrorBoundary name="soc-lab"><SocLab /></ErrorBoundary></section>

      {/* PROJECTS */}
      <section id="projects" className="py-24 bg-black border-b border-white/10"><ErrorBoundary name="projects"><ProjectEcosystem /></ErrorBoundary></section>

      {/* EXPERIENCE */}
      <section id="experience" className="py-24 bg-zinc-950 border-b border-white/10"><ErrorBoundary name="experience"><Experience /></ErrorBoundary></section>

      {/* CERTIFICATIONS */}
      <section id="certs" className="py-24 bg-black border-b border-white/10"><ErrorBoundary name="certs"><Certifications /></ErrorBoundary></section>

      {/* EVIDENCE */}
      <section id="evidence" className="py-24 bg-zinc-950 border-b border-white/10"><ErrorBoundary name="evidence"><EvidenceRepo /></ErrorBoundary></section>

      {/* CONTACT */}
      <section id="contact" className="py-24 bg-black"><ErrorBoundary name="contact"><ContactSection /></ErrorBoundary></section>

      {/* footer */}
      <footer className="border-t border-white/10 py-8 bg-black">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-zinc-500">
            © 2026 <span className="text-zinc-300">{personal.name}</span> · Software & Automation Engineer · {personal.location}
          </p>
          <div className="flex flex-wrap gap-4 items-center">
            <a href={personal.linkedin} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-zinc-500 hover:text-[#00E87A]">LinkedIn</a>
            <a href={personal.github} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-zinc-500 hover:text-[#00E87A]">GitHub</a>
            <a href="/resume.html" target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-zinc-500 hover:text-[#00E87A]">Résumé</a>
            <a href={`mailto:${personal.email}`} className="font-mono text-xs text-[#00E87A] border border-[#00E87A]/30 px-3 py-1 rounded-full hover:bg-[#00E87A]/10">Hire me →</a>
          </div>
        </div>
      </footer>

      {/* AI assistant */}
      <ErrorBoundary name="assistant"><NexusAI /></ErrorBoundary>
    </div>
  );
}
