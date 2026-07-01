import React, { useState } from 'react';

const HUNTS = [
  {
    id: 'TH-2024-031',
    title: 'Lateral Movement via NTLM Relay',
    hypothesis: 'An adversary may be using NTLM relay attacks to pivot from a compromised workstation to domain controllers within the corporate network.',
    status: 'IN PROGRESS',
    priority: 'CRITICAL',
    analyst: 'T. Ugochukwu',
    mitre: ['T1557.001', 'T1021.002', 'T1078'],
    tactics: ['Credential Access', 'Lateral Movement'],
    started: '2026-05-06',
    datasources: ['Windows Event Logs', 'Zeek Network Logs', 'Splunk SIEM'],
    timeline: [
      { time: '08:14', action: 'Hunt initiated — hypothesis documented in TH system', analyst: 'T. Ugochukwu', tag: 'INIT' },
      { time: '08:22', action: 'SPL query deployed: searching for Event ID 4624 NTLM auth chains across subnets', analyst: 'T. Ugochukwu', tag: 'QUERY' },
      { time: '08:51', action: 'Anomaly found — host WKST-114 authenticating to DC01 via NTLM at 02:14 (off-hours)', analyst: 'T. Ugochukwu', tag: 'FINDING' },
      { time: '09:05', action: 'Network capture requested for WKST-114 — Zeek pcap initiated', analyst: 'T. Ugochukwu', tag: 'ACTION' },
      { time: '09:34', action: 'SMB signing disabled confirmed on WKST-114 — high risk indicator', analyst: 'T. Ugochukwu', tag: 'FINDING' },
      { time: '10:02', action: 'Escalated to Incident INC-2026-0512 — containment team notified', analyst: 'T. Ugochukwu', tag: 'ESCALATE' },
    ],
    iocs: ['10.0.1.114', 'DC01.corp.local', 'NTLM Type3 Message hash: d8e8fca2dc0f896fd7cb4cb0031ba249'],
    findings: 'NTLM relay confirmed. WKST-114 relaying credentials to DC01. SMB signing disabled on 6 hosts. Potential domain compromise via Pass-the-Hash.',
    verdict: 'TRUE POSITIVE',
  },
  {
    id: 'TH-2024-029',
    title: 'Cobalt Strike C2 Beacon Detection',
    hypothesis: 'Suspected C2 beaconing based on periodic small-packet HTTP traffic to an unusual external IP. Pattern matches Cobalt Strike default profile.',
    status: 'COMPLETE',
    priority: 'HIGH',
    analyst: 'J. Rivera',
    mitre: ['T1071.001', 'T1095', 'T1041'],
    tactics: ['Command & Control', 'Exfiltration'],
    started: '2026-05-04',
    datasources: ['Proxy Logs', 'Splunk SIEM', 'Endpoint EDR'],
    timeline: [
      { time: '14:00', action: 'Hypothesis created from anomaly alert on 10.0.2.88', analyst: 'J. Rivera', tag: 'INIT' },
      { time: '14:18', action: 'SPL beacon detection query run — 15-second interval pattern confirmed', analyst: 'J. Rivera', tag: 'QUERY' },
      { time: '14:35', action: 'C2 IP 45.33.32.156 identified — VT score 42/72', analyst: 'J. Rivera', tag: 'FINDING' },
      { time: '14:52', action: 'Cobalt Strike watermark extracted from beacon: 0x0ea3', analyst: 'J. Rivera', tag: 'FINDING' },
      { time: '15:10', action: 'Host isolated, malware sample preserved for analysis', analyst: 'J. Rivera', tag: 'ACTION' },
      { time: '15:30', action: 'Hunt closed — transitioned to IR. All indicators blocked.', analyst: 'J. Rivera', tag: 'CLOSE' },
    ],
    iocs: ['45.33.32.156', 'http://45.33.32.156/jquery-3.3.1.min.js', 'Watermark: 0x0ea3', 'SHA256: a94a8fe5ccb19ba61c4c0873d391e987982fbbd3'],
    findings: 'Confirmed Cobalt Strike beacon on host 10.0.2.88. C2 channel operated for ~72 hours before detection. Watermark matched known threat actor infrastructure.',
    verdict: 'TRUE POSITIVE',
  },
  {
    id: 'TH-2024-027',
    title: 'Insider Data Exfiltration via Cloud Storage',
    hypothesis: 'Terminated employee badge access logs show three after-hours entries. Hypothesis: credential sharing or unauthorized access to exfiltrate proprietary data.',
    status: 'COMPLETE',
    priority: 'HIGH',
    analyst: 'K. Okafor',
    mitre: ['T1078.002', 'T1567.002', 'T1083'],
    tactics: ['Initial Access', 'Exfiltration', 'Discovery'],
    started: '2026-05-01',
    datasources: ['DLP Logs', 'O365 Audit', 'Proxy Logs', 'HR Systems'],
    timeline: [
      { time: '09:00', action: 'HR tip received — former employee account still active', analyst: 'K. Okafor', tag: 'INIT' },
      { time: '09:15', action: 'O365 audit logs pulled — 4.2GB uploaded to personal Dropbox', analyst: 'K. Okafor', tag: 'FINDING' },
      { time: '09:40', action: 'DLP review — 847 files accessed in final 48hrs of employment', analyst: 'K. Okafor', tag: 'FINDING' },
      { time: '10:05', action: 'Account disabled, legal counsel notified, forensic image ordered', analyst: 'K. Okafor', tag: 'ACTION' },
      { time: '10:30', action: 'Hunt complete — insider threat case opened with Legal team', analyst: 'K. Okafor', tag: 'CLOSE' },
    ],
    iocs: ['j.smith@corp.com (former employee)', 'dropbox.com/sh/exfilpath', '4.2GB outbound O365', '10.0.3.91 (last workstation)'],
    findings: 'Confirmed insider exfiltration of 4.2GB to personal cloud storage. 847 proprietary files accessed. Account remained active 3 days post-termination.',
    verdict: 'TRUE POSITIVE',
  },
  {
    id: 'TH-2024-025',
    title: 'DNS Tunneling — Data Exfil via TXT Records',
    hypothesis: 'Unusually long DNS queries detected from 10.0.4.22. TXT record queries with base64-encoded subdomains suggest DNS tunneling for C2 or data exfil.',
    status: 'FALSE POSITIVE',
    priority: 'MED',
    analyst: 'M. Chen',
    mitre: ['T1071.004', 'T1048.003'],
    tactics: ['Command & Control', 'Exfiltration'],
    started: '2026-04-28',
    datasources: ['DNS Logs', 'Zeek Network Logs'],
    timeline: [
      { time: '11:00', action: 'Automated alert triggered on DNS anomaly threshold', analyst: 'M. Chen', tag: 'INIT' },
      { time: '11:20', action: 'DNS logs reviewed — base64 subdomains confirmed', analyst: 'M. Chen', tag: 'QUERY' },
      { time: '11:45', action: 'Traffic decoded — legitimate Cloudflare WARP client DNS-over-HTTPS', analyst: 'M. Chen', tag: 'FINDING' },
      { time: '12:00', action: 'Whitelist updated — hunt closed as FP. Detection tuned.', analyst: 'M. Chen', tag: 'CLOSE' },
    ],
    iocs: ['10.0.4.22', 'cloudflare-dns.com'],
    findings: 'False positive. Traffic matched Cloudflare WARP client DNS-over-HTTPS pattern. Detection rule updated with allowlist for enterprise WARP deployment.',
    verdict: 'FALSE POSITIVE',
  },
];

const statusColors = {
  'IN PROGRESS': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  'COMPLETE': 'text-[#00E87A] bg-[#00E87A]/10 border-[#00E87A]/30',
  'FALSE POSITIVE': 'text-zinc-500 bg-zinc-800 border-white/10',
  'BLOCKED': 'text-red-400 bg-red-500/10 border-red-500/30',
};
const priorityColors = {
  'CRITICAL': 'text-red-400',
  'HIGH': 'text-amber-400',
  'MED': 'text-blue-400',
  'LOW': 'text-zinc-500',
};
const tagColors = {
  INIT: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  QUERY: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  FINDING: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  ACTION: 'text-[#00E87A] bg-[#00E87A]/10 border-[#00E87A]/20',
  ESCALATE: 'text-red-400 bg-red-500/10 border-red-500/20',
  CLOSE: 'text-zinc-400 bg-zinc-800 border-white/10',
};

export function ThreatHuntConsole() {
  const [selected, setSelected] = useState(0);
  const hunt = HUNTS[selected];

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12">
      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-400 bg-purple-500/10 border border-purple-500/30 rounded-full mb-4">
          <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
          Proactive Threat Hunting
        </div>
        <h2 className="text-4xl font-bold font-syne mb-3">
          Threat Hunt <span className="text-[#00E87A]">Console</span>
        </h2>
        <p className="text-zinc-400 max-w-2xl text-sm">
          Hypothesis-driven hunting operations. Each hunt documents methodology, findings, IOCs, and MITRE ATT&CK coverage.
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Hunts', value: HUNTS.length, color: 'text-zinc-200' },
          { label: 'In Progress', value: HUNTS.filter(h => h.status === 'IN PROGRESS').length, color: 'text-amber-400' },
          { label: 'True Positives', value: HUNTS.filter(h => h.verdict === 'TRUE POSITIVE').length, color: 'text-[#00E87A]' },
          { label: 'MITRE Coverage', value: `${new Set(HUNTS.flatMap(h => h.mitre)).size} TTPs`, color: 'text-cyan-400' },
        ].map((s, i) => (
          <div key={i} className="bg-zinc-900/50 border border-white/10 rounded-xl p-3 text-center">
            <div className={`text-xl font-bold font-syne ${s.color}`}>{s.value}</div>
            <div className="font-mono text-xs text-zinc-600 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        {/* Hunt list */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden self-start">
          <div className="px-4 py-3 border-b border-white/10 bg-zinc-800/30">
            <span className="font-mono text-xs uppercase tracking-wider text-zinc-400">Active Hunt Queue</span>
          </div>
          <div className="divide-y divide-white/5">
            {HUNTS.map((h, i) => (
              <button
                key={h.id}
                onClick={() => setSelected(i)}
                className={`w-full text-left px-4 py-3.5 transition-all hover:bg-zinc-800/40 ${
                  selected === i ? 'bg-zinc-800/60 border-l-2 border-l-[#00E87A]' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-xs text-zinc-500">{h.id}</span>
                  <span className={`font-mono text-xs px-1.5 py-0.5 rounded border ${statusColors[h.status]}`}>
                    {h.status === 'IN PROGRESS' ? '● ACTIVE' : h.status === 'COMPLETE' ? '✓' : h.status === 'FALSE POSITIVE' ? 'FP' : h.status}
                  </span>
                </div>
                <div className="text-sm font-medium text-zinc-200 leading-snug mb-1">{h.title}</div>
                <div className="flex items-center gap-2">
                  <span className={`font-mono text-xs ${priorityColors[h.priority]}`}>{h.priority}</span>
                  <span className="font-mono text-xs text-zinc-600">· {h.analyst.split(' ')[0]}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Hunt detail */}
        <div className="space-y-4">
          {/* Header card */}
          <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-xs text-zinc-500">{hunt.id}</span>
                  <span className={`font-mono text-xs px-2 py-0.5 rounded border ${statusColors[hunt.status]}`}>{hunt.status}</span>
                  <span className={`font-mono text-xs ${priorityColors[hunt.priority]}`}>{hunt.priority}</span>
                </div>
                <h3 className="text-xl font-bold text-white font-syne">{hunt.title}</h3>
                <div className="font-mono text-xs text-zinc-500 mt-1">
                  Analyst: <span className="text-zinc-300">{hunt.analyst}</span> · Started: {hunt.started}
                </div>
              </div>
              <div className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-bold flex-shrink-0 ${
                hunt.verdict === 'TRUE POSITIVE'
                  ? 'text-red-400 bg-red-500/10 border-red-500/30'
                  : hunt.verdict === 'FALSE POSITIVE'
                  ? 'text-zinc-500 bg-zinc-800 border-white/10'
                  : 'text-amber-400 bg-amber-500/10 border-amber-500/30'
              }`}>
                {hunt.verdict || 'PENDING'}
              </div>
            </div>
            <div className="p-3 bg-black/30 rounded-lg border border-white/5">
              <div className="font-mono text-xs text-zinc-500 mb-1">Hypothesis</div>
              <p className="text-sm text-zinc-300 leading-relaxed">{hunt.hypothesis}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* MITRE techniques */}
            <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-4">
              <div className="font-mono text-xs uppercase tracking-wider text-zinc-500 mb-3">MITRE ATT&CK Coverage</div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {hunt.mitre.map(t => (
                  <span key={t} className="font-mono text-xs px-2 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded">
                    {t}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-1">
                {hunt.tactics.map(t => (
                  <span key={t} className="font-mono text-xs px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Data sources */}
            <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-4">
              <div className="font-mono text-xs uppercase tracking-wider text-zinc-500 mb-3">Data Sources</div>
              <div className="space-y-1.5">
                {hunt.datasources.map((ds, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
                    <span className="font-mono text-xs text-zinc-300">{ds}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Hunt timeline */}
          <div className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-white/10 bg-zinc-800/30">
              <span className="font-mono text-xs uppercase tracking-wider text-zinc-400">Hunt Timeline</span>
            </div>
            <div className="p-4 space-y-2">
              {hunt.timeline.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <span className="font-mono text-xs text-zinc-600 w-12 flex-shrink-0 pt-0.5">{step.time}</span>
                  </div>
                  <div className={`w-px flex-shrink-0 mt-1 ${i < hunt.timeline.length - 1 ? 'self-stretch bg-white/10' : ''}`} style={{ minHeight: '20px' }} />
                  <div className="flex-1 pb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-mono text-xs px-1.5 py-0.5 rounded border ${tagColors[step.tag] || tagColors.INIT}`}>
                        {step.tag}
                      </span>
                    </div>
                    <p className="font-mono text-xs text-zinc-300 leading-relaxed">{step.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* IOCs + Findings */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-4">
              <div className="font-mono text-xs uppercase tracking-wider text-zinc-500 mb-3">IOCs Discovered</div>
              <div className="space-y-1.5">
                {hunt.iocs.map((ioc, i) => (
                  <div key={i} className="font-mono text-xs text-zinc-300 bg-black/30 px-3 py-1.5 rounded border border-white/5 break-all">
                    {ioc}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-4">
              <div className="font-mono text-xs uppercase tracking-wider text-zinc-500 mb-3">Analyst Findings</div>
              <p className="text-sm text-zinc-300 leading-relaxed">{hunt.findings}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
