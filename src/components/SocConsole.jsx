import React, { useState } from 'react';
import { CyberTools } from './soc-tools/CyberTools';
import { PlaybookLibrary } from './soc-tools/PlaybookLibrary';
import { SIEMQueryShowcase } from './soc-tools/SIEMQueryShowcase';
import { VisitorTelemetry } from './soc-tools/VisitorTelemetry';
import { RecruiterAssessment } from './soc-tools/RecruiterAssessment';

const TABS = [
  { id: 'tools', label: 'Cyber Tools', Component: CyberTools },
  { id: 'playbooks', label: 'Playbooks', Component: PlaybookLibrary },
  { id: 'siem', label: 'SIEM Queries', Component: SIEMQueryShowcase },
  { id: 'session', label: 'Session Monitor', Component: VisitorTelemetry },
];

export function SocConsole() {
  const [active, setActive] = useState('tools');
  const [showAssessment, setShowAssessment] = useState(false);
  const ActiveComponent = TABS.find((t) => t.id === active).Component;

  return (
    <div>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-zinc-500">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E87A] soc-pulse" /> Real Tools · Real Writing
          </div>
          <h2 className="mt-3 font-syne text-4xl sm:text-5xl font-extrabold tracking-tight text-gradient">Security Toolkit</h2>
          <p className="mt-3 text-lg text-zinc-300 max-w-2xl">
            Working crypto utilities plus documented playbooks and detection queries — everything here is either functional code or real writing, nothing staged as a fake live feed.
          </p>
        </div>
        <button
          onClick={() => setShowAssessment(true)}
          className="flex-shrink-0 px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-[#00E87A] bg-[#00E87A]/10 border border-[#00E87A]/30 rounded-full hover:bg-[#00E87A]/20 transition-colors"
        >
          Recruiter Quick View →
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-wrap gap-2 mb-8">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`px-3.5 py-2 font-mono text-xs uppercase tracking-wider rounded-lg transition-all border ${
              active === t.id
                ? 'bg-[#00E87A]/10 text-[#00E87A] border-[#00E87A]/40'
                : 'bg-zinc-900 text-zinc-500 border-white/10 hover:border-[#00E87A]/30 hover:text-zinc-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <ActiveComponent />

      {showAssessment && <RecruiterAssessment onClose={() => setShowAssessment(false)} />}
    </div>
  );
}

export default SocConsole;
