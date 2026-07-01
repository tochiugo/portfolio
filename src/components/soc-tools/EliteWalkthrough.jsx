import React, { useState, useEffect } from 'react';

const WALKTHROUGH = {
  id: 'INC-2024-0847',
  title: 'Credential Stuffing Campaign — Multi-Account Brute Force',
  analyst: 'Tochi Ugochukwu',
  date: '2024-11-14',
  severity: 'Critical',
  status: 'Resolved',
  tldr: 'Automated credential stuffing attack targeting 12 privileged accounts detected via Splunk SIEM. Attack traced to botnet infrastructure (AS14061 DigitalOcean). All accounts secured within 23 minutes of detection. Zero successful authentication.',

  timeline: [
    { time: '03:47:12', phase: 'INITIAL TRIGGER', type: 'alert', content: 'Splunk rule BRUTE_FORCE_001 fired — 47 failed auth attempts from single IP (185.220.101.35) in 180-second window. Alert severity: HIGH. Analyst paged via PagerDuty.' },
    { time: '03:49:05', phase: 'TRIAGE', type: 'analysis', content: 'Opened alert in Splunk. Ran SPL: index=auth_logs action=failure src_ip=185.220.101.35 | stats count by user | sort -count. Results: 12 distinct accounts targeted. Top targets: admin (18x), svc-backup (11x), root (9x).' },
    { time: '03:51:30', phase: 'IOC ENRICHMENT', type: 'intel', content: 'IP lookup: 185.220.101.35 → AS14061 (DigitalOcean, NYC). VirusTotal: flagged by 8/87 engines as malicious. AbuseIPDB: 94 abuse reports. Shodan: open port 22, 80, 443. Threat classification: VPS/botnet infrastructure.' },
    { time: '03:54:00', phase: 'CORRELATION', type: 'analysis', content: 'Expanded scope — ran threat hunt across 6-hour window. Discovered 3 additional source IPs (185.220.101.42, 194.165.16.91, 162.55.40.95) coordinating attacks. All on DigitalOcean/Linode ASNs. Botnet confirmed.' },
    { time: '03:57:15', phase: 'ESCALATION', type: 'escalation', content: 'Escalated to Tier 2. Severity upgraded to CRITICAL — botnet campaign, 4 IPs, 12 accounts targeted. IR lead notified via Slack #incident-response. Firewall team alerted to prepare block rules.' },
    { time: '04:02:00', phase: 'CONTAINMENT', type: 'action', content: 'Firewall team blocked all 4 IPs + /24 CIDR range for all 3 ASNs. Emergency MFA enforcement pushed to all 12 targeted accounts. Service account passwords force-rotated. Attack traffic immediately dropped.' },
    { time: '04:08:30', phase: 'VERIFICATION', type: 'analysis', content: 'Monitored auth logs for 5 minutes post-containment. Zero new failures from blocked ranges. Checked all 12 accounts — no successful logins prior to block. No lateral movement, no data access, no persistence mechanisms found.' },
    { time: '04:10:45', phase: 'RESOLUTION', type: 'close', content: 'Incident closed. Zero successful authentications confirmed. All IOCs added to permanent block list and threat intel feed. Detection rule tuned to lower threshold from 47 to 15 failures. Post-incident report filed.' },
  ],

  mitre: [
    { id: 'T1110', name: 'Brute Force', tactic: 'Credential Access', detail: 'Primary technique — automated credential stuffing using leaked credential lists' },
    { id: 'T1110.004', name: 'Credential Stuffing', tactic: 'Credential Access', detail: 'Attacker used compiled credential lists (likely from public breach data)' },
    { id: 'T1078', name: 'Valid Accounts', tactic: 'Initial Access', detail: 'Objective was to obtain valid credentials for privileged accounts' },
    { id: 'T1133', name: 'External Remote Services', tactic: 'Initial Access', detail: 'Targeting internet-facing authentication endpoints (SSH, web auth)' },
  ],

  splunkQueries: [
    {
      label: 'Initial Detection Query',
      query: `index=auth_logs action=failure src_ip=185.220.101.35
| stats count by user, src_ip, _time
| where count > 10
| sort -count
| table _time, src_ip, user, count`,
      result: '12 accounts targeted, 47 total failures in 180s',
    },
    {
      label: 'Botnet Expansion Hunt',
      query: `index=auth_logs action=failure earliest=-6h
| stats count by src_ip
| where count > 20
| lookup threat_intel ip as src_ip OUTPUTNEW category
| where category="suspicious" OR count > 50
| sort -count`,
      result: '4 IPs identified — coordinated botnet campaign confirmed',
    },
    {
      label: 'Post-Containment Verification',
      query: `index=auth_logs src_ip IN (185.220.101.35, 185.220.101.42, 194.165.16.91, 162.55.40.95)
| stats count by action, src_ip
| eval status=if(action="success","BREACH","blocked")
| where status="BREACH"`,
      result: '0 results — zero successful authentications confirmed',
    },
  ],

  evidence: [
    { label: 'Splunk Alert — 87 Events', src: '/evidence/soc/splunk_87_events.webp', caption: 'Initial Splunk query showing 87 matched firewall events in the detection window' },
    { label: 'IP Source Investigation', src: '/evidence/soc/splunk_ip_filter.webp', caption: 'SPL filter isolating source IP activity — 2 events from 10.20.2.17 including one BLOCKED connection' },
    { label: 'Alert Queue', src: '/evidence/soc/alert_queue.webp', caption: 'Active alert queue at time of incident — 5 open alerts with this case at top priority' },
    { label: 'SOC Dashboard', src: '/evidence/soc/soc_dashboard.webp', caption: 'Full SOC operations dashboard showing incident status, detection metrics, and system health' },
    { label: 'Alert Detail — #8816', src: '/evidence/soc/alert_8816_detail.webp', caption: 'Detailed view of alert #8816 — repeated authentication failures mapped to MITRE T1110' },
  ],

  findings: [
    'Coordinated credential stuffing campaign from botnet infrastructure (4 source IPs, 3 ASNs)',
    '12 privileged accounts targeted — automated tooling evidenced by machine-precision timing',
    'Attack duration: 23 minutes from first probe to full containment',
    'Zero successful authentications — attack fully contained at perimeter',
    'No lateral movement, no data exfiltration, no persistence established',
    'Detection gap identified: original threshold (47 failures) too permissive — tuned to 15',
  ],

  remediation: [
    { action: 'Block all 4 attack IPs + /24 CIDR ranges at perimeter firewall', status: 'done' },
    { action: 'Emergency MFA enforcement on all 12 targeted accounts', status: 'done' },
    { action: 'Force-rotate all service account credentials', status: 'done' },
    { action: 'Add all IOCs to permanent threat intel block list', status: 'done' },
    { action: 'Tune detection rule threshold: 47 → 15 failures per 180s', status: 'done' },
    { action: 'Deploy honeypot credentials to detect future campaigns', status: 'pending' },
    { action: 'Implement geofencing for privileged account logins', status: 'pending' },
  ],
};

const phaseColors = {
  alert: 'border-red-500/50 text-red-400',
  analysis: 'border-cyan-500/50 text-cyan-400',
  intel: 'border-amber-500/50 text-amber-400',
  escalation: 'border-orange-500/50 text-orange-400',
  action: 'border-[#00E87A]/50 text-[#00E87A]',
  close: 'border-[#00E87A]/50 text-[#00E87A]',
};

export function EliteWalkthrough() {
  const [activeEvidence, setActiveEvidence] = useState(0);
  const [activeQuery, setActiveQuery] = useState(0);
  const [visibleSteps, setVisibleSteps] = useState(1);

  useEffect(() => {
    if (visibleSteps < WALKTHROUGH.timeline.length) {
      const t = setTimeout(() => setVisibleSteps(s => s + 1), 600);
      return () => clearTimeout(t);
    }
  }, [visibleSteps]);

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12">
      {/* Header */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/30 rounded-full mb-4">
          <span className="w-2 h-2 bg-red-400 rounded-full" />
          Documented Investigation · Full IR Workflow
        </div>
        <h2 className="text-4xl font-bold font-syne mb-3">
          Incident <span className="text-[#00E87A]">Walkthrough</span>
        </h2>
        <p className="text-zinc-400 max-w-2xl">
          A complete end-to-end SOC investigation — from alert trigger to resolution. Every step documented as analyst work product.
        </p>
      </div>

      {/* Incident Header Card */}
      <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6 mb-8">
        <div className="flex flex-wrap items-start gap-4 justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-xs text-zinc-500">{WALKTHROUGH.id}</span>
              <span className="px-2 py-0.5 text-xs font-bold border rounded bg-red-500/10 text-red-400 border-red-500/30">
                {WALKTHROUGH.severity}
              </span>
              <span className="px-2 py-0.5 text-xs font-bold border rounded bg-[#00E87A]/10 text-[#00E87A] border-[#00E87A]/30">
                {WALKTHROUGH.status}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white font-syne">{WALKTHROUGH.title}</h3>
          </div>
          <div className="text-right font-mono text-xs text-zinc-500">
            <div>Analyst: <span className="text-zinc-300">{WALKTHROUGH.analyst}</span></div>
            <div>Date: <span className="text-zinc-300">{WALKTHROUGH.date}</span></div>
            <div>TTR: <span className="text-[#00E87A]">23 minutes</span></div>
          </div>
        </div>
        <div className="p-4 bg-black/40 rounded-xl border border-white/5">
          <div className="font-mono text-xs text-zinc-500 uppercase tracking-wider mb-2">Executive Summary</div>
          <p className="text-sm text-zinc-300 leading-relaxed">{WALKTHROUGH.tldr}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        {/* Left — Main content */}
        <div className="space-y-6 min-w-0 overflow-hidden">

          {/* Investigation Timeline */}
          <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6">
            <div className="font-mono text-xs uppercase tracking-wider text-zinc-500 mb-6 flex items-center gap-2">
              <span className="w-6 h-px bg-[#00E87A]" />
              Investigation Timeline — Step by Step
            </div>
            <div className="space-y-4">
              {WALKTHROUGH.timeline.slice(0, visibleSteps).map((step, i) => (
                <div
                  key={i}
                  className={`flex gap-4 pl-4 border-l-2 ${phaseColors[step.type]} transition-all duration-500`}
                  style={{ opacity: i < visibleSteps ? 1 : 0 }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-mono text-xs text-zinc-500">{step.time}</span>
                      <span className={`font-mono text-xs font-bold ${phaseColors[step.type].split(' ')[1]}`}>
                        {step.phase}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-300 leading-relaxed">{step.content}</p>
                  </div>
                </div>
              ))}
              {visibleSteps < WALKTHROUGH.timeline.length && (
                <div className="flex items-center gap-2 pl-4">
                  <span className="w-2 h-2 bg-[#00E87A] rounded-full animate-pulse" />
                  <span className="font-mono text-xs text-zinc-600">Loading next step...</span>
                </div>
              )}
            </div>
          </div>

          {/* SIEM Queries */}
          <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6">
            <div className="font-mono text-xs uppercase tracking-wider text-zinc-500 mb-5 flex items-center gap-2">
              <span className="w-6 h-px bg-[#00E87A]" />
              Splunk SPL Queries Used
            </div>
            <div className="flex gap-2 mb-4 flex-wrap">
              {WALKTHROUGH.splunkQueries.map((q, i) => (
                <button
                  key={i}
                  onClick={() => setActiveQuery(i)}
                  className={`px-3 py-1.5 font-mono text-xs rounded-lg border transition-all ${
                    activeQuery === i
                      ? 'bg-[#00E87A]/10 text-[#00E87A] border-[#00E87A]/40'
                      : 'text-zinc-500 border-white/10 hover:border-white/20'
                  }`}
                >
                  Query {i + 1}
                </button>
              ))}
            </div>
            <div className="font-mono text-xs text-zinc-500 mb-2">{WALKTHROUGH.splunkQueries[activeQuery].label}</div>
            <pre className="bg-black border border-[#00E87A]/20 rounded-xl p-4 font-mono text-xs text-[#00E87A] whitespace-pre-wrap leading-relaxed overflow-x-auto mb-3">
              {WALKTHROUGH.splunkQueries[activeQuery].query}
            </pre>
            <div className="p-3 bg-[#00E87A]/5 border border-[#00E87A]/20 rounded-lg">
              <span className="font-mono text-xs text-zinc-500">Result: </span>
              <span className="font-mono text-xs text-[#00E87A]">{WALKTHROUGH.splunkQueries[activeQuery].result}</span>
            </div>
          </div>

          {/* Evidence Screenshots */}
          <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6">
            <div className="font-mono text-xs uppercase tracking-wider text-zinc-500 mb-5 flex items-center gap-2">
              <span className="w-6 h-px bg-[#00E87A]" />
              Evidence — Lab Screenshots
            </div>
            <div className="rounded-xl border border-white/10 overflow-hidden mb-3">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800/60 border-b border-white/10">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#00E87A]" />
                <span className="font-mono text-xs text-zinc-400 ml-2">{WALKTHROUGH.evidence[activeEvidence].label}</span>
              </div>
              <img
                src={WALKTHROUGH.evidence[activeEvidence].src}
                alt={WALKTHROUGH.evidence[activeEvidence].label}
                className="w-full object-contain bg-zinc-950"
                style={{ maxHeight: '360px' }}
              />
              <div className="px-4 py-3 border-t border-white/5 bg-zinc-900/40">
                <p className="font-mono text-xs text-zinc-400">{WALKTHROUGH.evidence[activeEvidence].caption}</p>
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {WALKTHROUGH.evidence.map((e, i) => (
                <button
                  key={i}
                  onClick={() => setActiveEvidence(i)}
                  className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                    activeEvidence === i ? 'border-[#00E87A]' : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <img src={e.src} alt={e.label} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* MITRE Mapping */}
          <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-5">
            <div className="font-mono text-xs uppercase tracking-wider text-zinc-500 mb-4">MITRE ATT&CK Mapping</div>
            <div className="space-y-3">
              {WALKTHROUGH.mitre.map((t, i) => (
                <div key={i} className="p-3 bg-black/40 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-amber-400">{t.id}</span>
                    <span className="font-mono text-xs text-zinc-500">{t.tactic}</span>
                  </div>
                  <div className="text-sm font-medium text-white mb-1">{t.name}</div>
                  <div className="font-mono text-xs text-zinc-500 leading-relaxed">{t.detail}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Findings */}
          <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-5">
            <div className="font-mono text-xs uppercase tracking-wider text-zinc-500 mb-4">Analyst Findings</div>
            <div className="space-y-2">
              {WALKTHROUGH.findings.map((f, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-[#00E87A] flex-shrink-0 text-xs mt-0.5">→</span>
                  <span className="font-mono text-xs text-zinc-400 leading-relaxed">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Remediation */}
          <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-5">
            <div className="font-mono text-xs uppercase tracking-wider text-zinc-500 mb-4">Remediation Checklist</div>
            <div className="space-y-2">
              {WALKTHROUGH.remediation.map((r, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className={`flex-shrink-0 text-xs mt-0.5 font-bold ${r.status === 'done' ? 'text-[#00E87A]' : 'text-zinc-600'}`}>
                    {r.status === 'done' ? '✓' : '○'}
                  </span>
                  <span className={`font-mono text-xs leading-snug ${r.status === 'done' ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    {r.action}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Final status */}
          <div className="bg-[#00E87A]/5 border border-[#00E87A]/20 rounded-2xl p-5">
            <div className="font-mono text-xs uppercase tracking-wider text-[#00E87A] mb-3">Final Status</div>
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between"><span className="text-zinc-500">TTR</span><span className="text-[#00E87A]">23 minutes</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">Breached</span><span className="text-[#00E87A]">0 accounts</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">Data Loss</span><span className="text-[#00E87A]">None</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">Lateral Move</span><span className="text-[#00E87A]">None detected</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">Outcome</span><span className="text-[#00E87A] font-bold">CONTAINED</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
