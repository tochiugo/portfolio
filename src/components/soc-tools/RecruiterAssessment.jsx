import React, { useEffect } from 'react';
import { personal } from '../../data/portfolio';

const ASSESSMENT = {
  name: 'Tochi Ugochukwu',
  title: 'Cybersecurity & Automation Engineer',
  location: 'Los Angeles, CA',
  available: 'Immediately · No Notice Period',
  email: 'tu@tochiugo.com',
  linkedin: 'https://linkedin.com/in/tochi-i-u-a539b8318',
  github: 'https://github.com/tochiugo',
  credly: 'https://credly.com/users/tochi-ikedinachi-ugochukwu',

  topCerts: [
    { name: 'CompTIA Security+', issuer: 'CompTIA · Feb 2025', verified: true },
    { name: 'Google Cybersecurity Professional', issuer: 'Google / Coursera · Aug 2024', verified: true },
    { name: 'Google IT Support Professional', issuer: 'Google + CompTIA Dual · Feb 2025', verified: true },
  ],

  socCapabilities: [
    'Alert Triage & Incident Response',
    'Splunk SIEM — SPL queries, detection rules',
    'Google Chronicle SIEM',
    'MITRE ATT&CK Framework',
    'IR Playbook Authoring (NIST-aligned)',
    'Log Correlation & Threat Detection',
    'Wireshark / Network Analysis',
    'Detection Engineering & Automation',
  ],

  keyMetrics: [
    { label: 'Events Triaged', value: '200+' },
    { label: 'SIEM Platforms', value: '3' },
    { label: 'TryHackMe', value: 'Top 8%' },
    { label: 'Case Studies', value: '5' },
    { label: 'TryHackMe Rank', value: 'Top 8%' },
  ],

  targetRoles: [
    'SOC Analyst (Tier 1/2)',
    'Detection Engineer',
    'Security Operations Engineer',
    'Cybersecurity Analyst',
  ],
};

export function RecruiterAssessment({ onClose }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-zinc-900 border border-white/20 rounded-2xl shadow-2xl shadow-black/50">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 bg-zinc-900/95 backdrop-blur-sm border-b border-white/10 z-10">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00E87A] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00E87A]" />
            </span>
            <span className="font-mono text-xs uppercase tracking-wider text-[#00E87A]">Quick Assessment</span>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors text-lg leading-none">✕</button>
        </div>

        <div className="p-6 space-y-6">
          {/* Identity */}
          <div className="flex items-start gap-5">
            <img
              src={personal.profilePicture}
              alt="Tochi Ugochukwu"
              className="w-20 h-20 rounded-xl object-cover object-top flex-shrink-0 border border-white/10"
              onError={e => { e.target.style.display = 'none'; }}
            />
            <div>
              <h2 className="text-2xl font-bold text-white font-syne">{ASSESSMENT.name}</h2>
              <p className="font-mono text-sm text-[#00E87A] mt-1">{ASSESSMENT.title}</p>
              <div className="flex flex-wrap gap-3 mt-2 font-mono text-xs text-zinc-500">
                <span>📍 {ASSESSMENT.location}</span>
                <span className="text-[#00E87A]">⚡ {ASSESSMENT.available}</span>
              </div>
            </div>
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {ASSESSMENT.keyMetrics.map((m, i) => (
              <div key={i} className="p-3 bg-black/40 rounded-xl border border-white/5 text-center">
                <div className="text-lg font-bold text-[#00E87A] font-syne">{m.value}</div>
                <div className="font-mono text-xs text-zinc-500 mt-0.5 leading-snug">{m.label}</div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {/* SOC Capabilities */}
            <div>
              <div className="font-mono text-xs uppercase tracking-wider text-zinc-500 mb-3">SOC Capabilities</div>
              <div className="space-y-1.5">
                {ASSESSMENT.socCapabilities.map((cap, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00E87A] flex-shrink-0" />
                    <span className="text-sm text-zinc-300">{cap}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Certs + Target Roles */}
            <div className="space-y-5">
              <div>
                <div className="font-mono text-xs uppercase tracking-wider text-zinc-500 mb-3">
                  Verified Certifications
                  <a href={ASSESSMENT.credly} target="_blank" rel="noopener noreferrer" className="text-[#00E87A] ml-2 normal-case">↗ Credly</a>
                </div>
                <div className="space-y-2">
                  {ASSESSMENT.topCerts.map((cert, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 bg-black/30 rounded-lg border border-white/5">
                      <div>
                        <div className="text-sm font-medium text-white">{cert.name}</div>
                        <div className="font-mono text-xs text-zinc-500">{cert.issuer}</div>
                      </div>
                      <span className="font-mono text-xs text-[#00E87A]">✓ Verified</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="font-mono text-xs uppercase tracking-wider text-zinc-500 mb-3">Target Roles</div>
                <div className="flex flex-wrap gap-2">
                  {ASSESSMENT.targetRoles.map((role, i) => (
                    <span key={i} className="px-3 py-1.5 text-xs font-mono text-[#00E87A] bg-[#00E87A]/10 border border-[#00E87A]/30 rounded-full">
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CTA row */}
          <div className="flex flex-wrap gap-3 pt-2 border-t border-white/10">
            <a
              href={`mailto:${ASSESSMENT.email}`}
              className="flex-1 min-w-[140px] inline-flex items-center justify-center px-5 py-3 text-sm font-bold tracking-wider uppercase text-black bg-[#00E87A] rounded-xl hover:bg-[#00E87A]/90 transition-colors"
            >
              📧 Contact Now
            </a>
            <a
              href="/resume.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-[140px] inline-flex items-center justify-center px-5 py-3 text-sm font-bold tracking-wider uppercase text-zinc-300 bg-zinc-800 border border-white/20 rounded-xl hover:border-[#00E87A]/40 hover:text-white transition-colors"
            >
              ⬇ Resume
            </a>
            <a
              href={ASSESSMENT.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-[140px] inline-flex items-center justify-center px-5 py-3 text-sm font-bold tracking-wider uppercase text-zinc-300 bg-zinc-800 border border-white/20 rounded-xl hover:border-[#00E87A]/40 hover:text-white transition-colors"
            >
              💼 LinkedIn
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
