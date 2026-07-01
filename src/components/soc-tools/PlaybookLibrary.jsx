import React, { useState } from 'react';

const PLAYBOOKS = [
  {
    id: 'PB-001',
    title: 'Phishing Email Response',
    category: 'Initial Access',
    severity: 'HIGH',
    icon: '🎣',
    mitre: 'T1566',
    estimatedTime: '45 min',
    owner: 'SOC Tier 1',
    description: 'Response procedure for reported or detected phishing emails targeting corporate users.',
    steps: [
      { phase: 'Triage', action: 'Pull email headers from mail gateway logs — extract sender IP, reply-to, and all URLs', tool: 'Mail Gateway / Proofpoint', time: '5m', required: true },
      { phase: 'Triage', action: 'Submit all URLs to VirusTotal and URLscan.io. Check sender domain against threat intel feeds', tool: 'VirusTotal / URLscan', time: '5m', required: true },
      { phase: 'Containment', action: 'Search mail server for all recipients of the same email campaign. Pull message IDs', tool: 'Exchange/O365 Admin', time: '5m', required: true },
      { phase: 'Containment', action: 'Issue mass delete/quarantine of all matching emails using message trace results', tool: 'O365 Security & Compliance', time: '5m', required: true },
      { phase: 'Analysis', action: 'If user clicked: pull proxy logs for that user for past 2 hours. Check for malicious downloads or C2 callbacks', tool: 'Splunk SPL / Proxy Logs', time: '10m', required: true },
      { phase: 'Analysis', action: 'Check if credentials were entered: search for auth events post-click on phishing domain', tool: 'Auth Logs / SIEM', time: '5m', required: true },
      { phase: 'Remediation', action: 'Reset credentials for all users who interacted with phishing. Enable MFA if not active', tool: 'Active Directory / Azure AD', time: '5m', required: true },
      { phase: 'Recovery', action: 'Block sender domain and IP at mail gateway and firewall. Submit IOCs to threat intel platform', tool: 'Firewall / Mail Gateway', time: '5m', required: false },
      { phase: 'Documentation', action: 'Create incident report with timeline, IOCs, affected users, and remediation actions taken', tool: 'JIRA / Incident System', time: '5m', required: false },
    ],
  },
  {
    id: 'PB-002',
    title: 'Ransomware Containment',
    category: 'Impact',
    severity: 'CRITICAL',
    icon: '🔐',
    mitre: 'T1486',
    estimatedTime: '90 min',
    owner: 'SOC Tier 2 + IR Team',
    description: 'Emergency containment and eradication procedure for confirmed ransomware deployment.',
    steps: [
      { phase: 'Detection', action: 'Confirm ransomware activity: encrypted file extensions, ransom note, EDR alerts. Verify scope — single host vs. propagating', tool: 'EDR / File System', time: '5m', required: true },
      { phase: 'Containment', action: 'IMMEDIATE: Isolate affected host(s) from network. Disable network interface via EDR. Do NOT power off', tool: 'EDR Console', time: '5m', required: true },
      { phase: 'Containment', action: 'Identify patient zero: trace lateral movement in auth logs. Block compromised account credentials', tool: 'Active Directory / Splunk', time: '15m', required: true },
      { phase: 'Containment', action: 'Identify propagation path: check SMB shares, mapped drives, domain admin usage. Segment affected subnets', tool: 'Network Firewall / EDR', time: '15m', required: true },
      { phase: 'Analysis', action: 'Collect forensic image of infected host memory and disk before any changes. Preserve evidence chain', tool: 'FTK / Volatility', time: '20m', required: true },
      { phase: 'Analysis', action: 'Identify ransomware family via sample hash on VirusTotal/ID Ransomware. Check for known decryptors', tool: 'VirusTotal / nomoreransom.org', time: '10m', required: true },
      { phase: 'Eradication', action: 'Remove all persistence: scheduled tasks, registry run keys, startup items added by malware', tool: 'EDR / Registry', time: '10m', required: true },
      { phase: 'Recovery', action: 'Restore from clean backup — verify backup integrity and pre-infection timestamp', tool: 'Backup System', time: '10m', required: true },
      { phase: 'Documentation', action: 'Executive briefing: business impact, data loss scope, recovery timeline, lessons learned', tool: 'Incident Report', time: '10m', required: false },
    ],
  },
  {
    id: 'PB-003',
    title: 'C2 Beacon Detected',
    category: 'Command & Control',
    severity: 'CRITICAL',
    icon: '📡',
    mitre: 'T1071',
    estimatedTime: '60 min',
    owner: 'SOC Tier 2',
    description: 'Response to confirmed command-and-control beaconing activity detected via SIEM or EDR.',
    steps: [
      { phase: 'Triage', action: 'Confirm beacon characteristics: periodic intervals, consistent payload size, low stdev. Rule out legitimate tools (Cloudflare WARP, monitoring agents)', tool: 'Splunk SPL / Proxy Logs', time: '10m', required: true },
      { phase: 'Triage', action: 'Lookup C2 IP on VirusTotal, Shodan, AbuseIPDB. Check ASN, registrar, hosting history', tool: 'Threat Intel Platforms', time: '5m', required: true },
      { phase: 'Containment', action: 'Block C2 IP/domain at perimeter firewall and proxy. Monitor for new C2 channel pivot', tool: 'Firewall / Proxy', time: '5m', required: true },
      { phase: 'Containment', action: 'Isolate beaconing host from network (EDR network isolation). Preserve all in-memory evidence first', tool: 'EDR Console', time: '5m', required: true },
      { phase: 'Analysis', action: 'Memory dump analysis: extract injected shellcode, implant, C2 config (sleep jitter, watermark)', tool: 'Volatility / pe-sieve', time: '20m', required: true },
      { phase: 'Analysis', action: 'Determine initial access vector: scan endpoint for recent spearphish delivery, malicious macros, exploit activity', tool: 'EDR Timeline / Email Logs', time: '10m', required: true },
      { phase: 'Remediation', action: 'Full reimage of compromised endpoint. Reset all credentials that touched the host', tool: 'IT Operations', time: '5m', required: true },
    ],
  },
  {
    id: 'PB-004',
    title: 'Brute Force / Credential Stuffing',
    category: 'Credential Access',
    severity: 'HIGH',
    icon: '🔑',
    mitre: 'T1110',
    estimatedTime: '30 min',
    owner: 'SOC Tier 1',
    description: 'Response to automated credential attack detected via authentication log anomalies.',
    steps: [
      { phase: 'Triage', action: 'Query auth logs: auth failures by source IP. Identify threshold breach (>10 failures/hour from single IP)', tool: 'Splunk SIEM', time: '5m', required: true },
      { phase: 'Triage', action: 'Determine attack type: single-user brute force vs. credential stuffing (many accounts, 1-2 attempts each)', tool: 'Splunk SPL', time: '5m', required: true },
      { phase: 'Containment', action: 'Block offending source IP(s) at WAF and perimeter firewall. Submit to threat intel platform', tool: 'WAF / Firewall', time: '5m', required: true },
      { phase: 'Analysis', action: 'Check for successful auth from attacker IP — any successes constitute confirmed compromise', tool: 'Auth Logs / SIEM', time: '5m', required: true },
      { phase: 'Remediation', action: 'If any accounts successfully authenticated: force password reset and enable MFA immediately', tool: 'Active Directory', time: '5m', required: true },
      { phase: 'Hardening', action: 'Implement account lockout policy, CAPTCHA, or rate limiting on affected auth endpoint', tool: 'WAF / IdP', time: '5m', required: false },
    ],
  },
  {
    id: 'PB-005',
    title: 'Insider Threat Investigation',
    category: 'Exfiltration',
    severity: 'HIGH',
    icon: '🕵️',
    mitre: 'T1078.002',
    estimatedTime: '120 min',
    owner: 'SOC Tier 2 + HR + Legal',
    description: 'Confidential investigation procedure for suspected malicious insider activity or data exfiltration.',
    steps: [
      { phase: 'Initiation', action: 'Receive referral from HR/manager. Do NOT inform subject. Engage Legal and HR before any investigation steps', tool: 'Internal Escalation', time: '10m', required: true },
      { phase: 'Scoping', action: 'Pull DLP alerts for subject account — last 90 days. Identify any flagged data movements or policy violations', tool: 'DLP Platform', time: '15m', required: true },
      { phase: 'Evidence', action: 'O365/GSuite audit log export for subject: email forwarding rules, bulk downloads, external shares, Teams/Slack export', tool: 'O365 Compliance / CASB', time: '20m', required: true },
      { phase: 'Evidence', action: 'Endpoint activity: USB insertions, external drive mounts, screen captures, browser history, cloud sync activity', tool: 'EDR / DLP', time: '20m', required: true },
      { phase: 'Analysis', action: 'Correlate activity timeline: access spikes pre-resignation, holiday-adjacent behavior, after-hours access', tool: 'Splunk SIEM', time: '20m', required: true },
      { phase: 'Escalation', action: 'Brief Legal and HR with evidence package. Legal determines whether to involve law enforcement', tool: 'Evidence Package', time: '20m', required: true },
      { phase: 'Containment', action: 'Coordinate with HR: disable account at time of termination/confrontation. Preserve forensic evidence for chain of custody', tool: 'Active Directory / IT', time: '15m', required: true },
    ],
  },
  {
    id: 'PB-006',
    title: 'Business Email Compromise (BEC)',
    category: 'Financial Fraud',
    severity: 'CRITICAL',
    icon: '💸',
    mitre: 'T1566.002',
    estimatedTime: '60 min',
    owner: 'SOC + Finance + Legal',
    description: 'Response to suspected BEC attack targeting wire transfers or financial account changes.',
    steps: [
      { phase: 'Triage', action: 'Confirm BEC indicators: impersonated executive, urgent wire request, changed bank account details, invoice fraud', tool: 'Email Analysis', time: '5m', required: true },
      { phase: 'Containment', action: 'If wire not yet sent: IMMEDIATELY contact Finance to hold the transfer. Contact bank if wire sent within last hour', tool: 'Finance Team / Bank', time: '5m', required: true },
      { phase: 'Investigation', action: 'Determine if email account was compromised: check O365 for new inbox rules, forwarding, sign-in from unusual IPs', tool: 'O365 Admin / SIEM', time: '15m', required: true },
      { phase: 'Investigation', action: 'Check for email spoofing or domain impersonation. Review DMARC/DKIM/SPF headers', tool: 'Mail Headers / MX Toolbox', time: '10m', required: true },
      { phase: 'Remediation', action: 'If account compromised: revoke all sessions, reset credentials, remove malicious inbox rules, enable MFA', tool: 'O365 / Azure AD', time: '10m', required: true },
      { phase: 'Legal', action: 'File IC3 report (fbi.gov/ic3). Contact FBI Financial Fraud if > $100K. Preserve all evidence', tool: 'IC3 / Legal', time: '15m', required: false },
    ],
  },
];

const sevColors = {
  CRITICAL: 'text-red-400 bg-red-500/10 border-red-500/30',
  HIGH: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  MED: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
};
const phaseColors = {
  Triage: '#06b6d4',
  Containment: '#ef4444',
  Analysis: '#eab308',
  Evidence: '#a78bfa',
  Scoping: '#6366f1',
  Initiation: '#ec4899',
  Investigation: '#f97316',
  Remediation: '#00E87A',
  Eradication: '#00E87A',
  Recovery: '#00E87A',
  Hardening: '#00E87A',
  Detection: '#ef4444',
  Escalation: '#f97316',
  Documentation: '#71717a',
  Legal: '#71717a',
};

export function PlaybookLibrary() {
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState({});

  const toggleCheck = (key) => setChecked(prev => ({ ...prev, [key]: !prev[key] }));

  const pb = selected !== null ? PLAYBOOKS[selected] : null;
  const completedCount = pb
    ? pb.steps.filter((_, i) => checked[`${pb.id}-${i}`]).length
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12">
      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 rounded-full mb-4">
          <span className="w-2 h-2 bg-cyan-400 rounded-full" />
          Incident Response
        </div>
        <h2 className="text-4xl font-bold font-syne mb-3">
          SOC Playbook <span className="text-[#00E87A]">Library</span>
        </h2>
        <p className="text-zinc-400 max-w-2xl text-sm">
          Documented IR runbooks for common attack scenarios. Each playbook includes phase-by-phase steps, tool assignments, and time estimates.
        </p>
      </div>

      {!pb ? (
        /* Grid view */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PLAYBOOKS.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setSelected(i)}
              className="text-left bg-zinc-900/50 border border-white/10 rounded-2xl p-5 hover:border-[#00E87A]/30 hover:bg-zinc-800/30 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{p.icon}</span>
                <span className={`font-mono text-xs px-2 py-0.5 rounded border ${sevColors[p.severity]}`}>
                  {p.severity}
                </span>
              </div>
              <div className="font-mono text-xs text-zinc-500 mb-1">{p.id} · {p.mitre}</div>
              <h3 className="text-base font-bold text-white font-syne mb-2 group-hover:text-[#00E87A] transition-colors">
                {p.title}
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed mb-4">{p.description}</p>
              <div className="flex items-center justify-between font-mono text-xs text-zinc-600">
                <span>⏱ {p.estimatedTime}</span>
                <span>{p.steps.length} steps</span>
              </div>
              <div className="mt-3 pt-3 border-t border-white/5 font-mono text-xs text-zinc-600">{p.owner}</div>
            </button>
          ))}
        </div>
      ) : (
        /* Detail view */
        <div>
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => { setSelected(null); setChecked({}); }}
              className="font-mono text-xs text-zinc-500 hover:text-[#00E87A] transition-colors"
            >
              ← All Playbooks
            </button>
            <span className="text-zinc-700">/</span>
            <span className="font-mono text-xs text-zinc-400">{pb.title}</span>
          </div>

          {/* Playbook header */}
          <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 mb-5">
            <div className="flex items-start gap-4">
              <span className="text-4xl">{pb.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-xs text-zinc-500">{pb.id}</span>
                  <span className={`font-mono text-xs px-2 py-0.5 rounded border ${sevColors[pb.severity]}`}>{pb.severity}</span>
                  <span className="font-mono text-xs text-amber-400">{pb.mitre}</span>
                  <span className="font-mono text-xs text-zinc-600">{pb.category}</span>
                </div>
                <h3 className="text-2xl font-bold text-white font-syne mb-2">{pb.title}</h3>
                <p className="text-sm text-zinc-400">{pb.description}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-mono text-2xl font-bold text-[#00E87A]">{completedCount}/{pb.steps.length}</div>
                <div className="font-mono text-xs text-zinc-500">steps done</div>
                <div className="w-24 h-1.5 bg-zinc-800 rounded-full mt-2 ml-auto">
                  <div
                    className="h-1.5 rounded-full bg-[#00E87A] transition-all duration-300"
                    style={{ width: `${(completedCount / pb.steps.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/10">
              <div><div className="font-mono text-xs text-zinc-600">Estimated Time</div><div className="font-mono text-sm text-zinc-300">⏱ {pb.estimatedTime}</div></div>
              <div><div className="font-mono text-xs text-zinc-600">Owner</div><div className="font-mono text-sm text-zinc-300">{pb.owner}</div></div>
              <div><div className="font-mono text-xs text-zinc-600">MITRE Technique</div><div className="font-mono text-sm text-amber-400">{pb.mitre}</div></div>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-2">
            {pb.steps.map((step, i) => {
              const key = `${pb.id}-${i}`;
              const done = !!checked[key];
              const phColor = phaseColors[step.phase] || '#71717a';
              return (
                <button
                  key={i}
                  onClick={() => toggleCheck(key)}
                  className={`w-full text-left flex items-start gap-4 p-4 rounded-xl border transition-all ${
                    done
                      ? 'bg-[#00E87A]/5 border-[#00E87A]/20 opacity-70'
                      : 'bg-zinc-900/50 border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Checkbox */}
                  <div className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 transition-all ${
                    done ? 'bg-[#00E87A] border-[#00E87A]' : 'border-zinc-600'
                  }`}>
                    {done && <span className="text-black text-xs font-bold">✓</span>}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ background: `${phColor}20`, color: phColor, border: `1px solid ${phColor}40` }}>
                        {step.phase}
                      </span>
                      {step.required && (
                        <span className="font-mono text-xs text-red-400">Required</span>
                      )}
                    </div>
                    <p className={`text-sm leading-relaxed ${done ? 'line-through text-zinc-600' : 'text-zinc-300'}`}>
                      {step.action}
                    </p>
                    <div className="mt-1.5 flex items-center gap-4">
                      <span className="font-mono text-xs text-zinc-600">Tool: <span className="text-zinc-500">{step.tool}</span></span>
                      <span className="font-mono text-xs text-zinc-600">⏱ {step.time}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {completedCount === pb.steps.length && (
            <div className="mt-6 p-4 bg-[#00E87A]/10 border border-[#00E87A]/30 rounded-xl text-center">
              <div className="text-[#00E87A] font-mono text-sm font-bold">✓ Playbook Complete — All steps executed</div>
              <div className="font-mono text-xs text-zinc-500 mt-1">Document findings in the incident system and close the ticket</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
