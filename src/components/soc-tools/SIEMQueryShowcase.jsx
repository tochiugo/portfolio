import React, { useState } from 'react';

const QUERIES = [
  {
    platform: 'Splunk',
    title: 'Brute Force Detection',
    mitre: 'T1110',
    tactic: 'Credential Access',
    purpose: 'Detect automated credential stuffing and brute force attacks by counting authentication failures per source IP within a rolling time window.',
    query: `index=auth_logs action=failure earliest=-1h
| stats count by src_ip, user, dest
| where count > 10
| sort -count
| eval threat="BRUTE_FORCE"
| table src_ip, user, dest, count, threat`,
    result: 'Returns all source IPs with >10 auth failures in 1h. Sorted by count descending. Any IP exceeding threshold is flagged for investigation.',
    reasoning: 'Single-source repeated failures indicate automation. Human users rarely fail >10 consecutive authentications. The 1-hour window captures both slow (low-and-slow) and fast brute force patterns.',
  },
  {
    platform: 'Splunk',
    title: 'Data Exfiltration Anomaly',
    mitre: 'T1041',
    tactic: 'Exfiltration',
    purpose: 'Detect unusually large outbound data transfers that may indicate data exfiltration via C2 channel or compromised insider.',
    query: `index=proxy_logs earliest=-24h
| stats sum(bytes_out) as total_out,
        avg(bytes_out) as avg_session,
        count as sessions by src_ip, dest_ip
| where total_out > 1073741824
| eval total_gb=round(total_out/1073741824, 2)
| eval risk=if(total_gb > 5, "CRITICAL", "HIGH")
| sort -total_gb`,
    result: 'Returns endpoints that transferred >1GB outbound in 24 hours. Includes session count and per-session average to distinguish bulk transfer from distributed exfil.',
    reasoning: 'Exfiltration often blends into normal traffic. Aggregating by source+destination pair catches both single-session and multi-session exfil. The 1GB threshold balances sensitivity vs false positives in enterprise environments.',
  },
  {
    platform: 'Chronicle',
    title: 'Phishing Domain Detection',
    mitre: 'T1566',
    tactic: 'Initial Access',
    purpose: 'Detect typosquatting and lookalike domains used in spear-phishing campaigns by identifying domains with high similarity to trusted brands.',
    query: `-- Chronicle YARA-L 2.0 Detection Rule
rule phishing_lookalike_domain {
  meta:
    author = "Tochi Ugochukwu"
    description = "Detect typosquatting domains"
    mitre_attack = "T1566.001"
    severity = "HIGH"
  events:
    $dns.metadata.event_type = "NETWORK_DNS"
    $dns.network.dns.questions.name = /pay[p4]a[l1]|[a@]mazon|m[i1]crosoft/
  condition:
    $dns
}`,
    result: 'Fires on any DNS lookup matching typosquatting patterns for common phishing targets. Generates alert with source host, domain queried, and timestamp.',
    reasoning: 'DNS is logged for all network connections. Phishing kits frequently use typosquatted domains — regex patterns catch common substitutions (a→@, l→1, o→0). Lower false positive rate than pure domain similarity scoring.',
  },
  {
    platform: 'Splunk',
    title: 'C2 Beacon Pattern',
    mitre: 'T1071',
    tactic: 'Command & Control',
    purpose: 'Detect malware C2 beaconing by identifying machine-precision periodic connections with consistent payload sizes — a signature of automated implants.',
    query: `index=proxy_logs action=allowed earliest=-2h
| bin span=15s _time
| stats count,
        avg(bytes) as avg_bytes,
        stdev(bytes) as stdev_bytes by _time, src_ip, dest_ip
| where count > 0 AND avg_bytes < 1000 AND stdev_bytes < 50
| stats count as beacon_intervals by src_ip, dest_ip
| where beacon_intervals > 20
| eval verdict="C2_BEACON_LIKELY"`,
    result: 'Identifies host-destination pairs with 20+ 15-second intervals of consistent small payloads. Low stdev confirms machine timing vs human browsing.',
    reasoning: 'Human network traffic is irregular. C2 beacons are periodic and consistent. Binning in 15s windows (Cobalt Strike default) with stdev check on payload size distinguishes automated beacons from normal HTTPS traffic with high confidence.',
  },
  {
    platform: 'Splunk',
    title: 'Lateral Movement Detection',
    mitre: 'T1021',
    tactic: 'Lateral Movement',
    purpose: 'Detect internal lateral movement via remote services (RDP, SMB, PSExec, WMI) by identifying unusual authentication chains across internal hosts.',
    query: `index=auth_logs action=success
  [search index=auth_logs action=failure
   | stats count by src_ip
   | where count > 5
   | fields src_ip]
| stats count by src_ip, dest, user, auth_method
| where auth_method IN ("NTLM", "Kerberos", "RDP")
| eval lateral_move=if(count > 3, "HIGH", "MED")
| table src_ip, dest, user, auth_method, count, lateral_move`,
    result: 'Correlates prior failed auth attempts with subsequent successes. Returns source IPs that failed >5 times then succeeded — indicating credential theft followed by lateral movement.',
    reasoning: 'Lateral movement follows credential access. An IP that failed authentication multiple times and then succeeded is highly suspicious. Subsearch correlation links the brute force source to the eventual compromise path.',
  },
  {
    platform: 'Chronicle',
    title: 'Privileged Account Anomaly',
    mitre: 'T1078.002',
    tactic: 'Persistence',
    purpose: 'Detect anomalous use of privileged accounts — logins at unusual hours, from unusual locations, or accessing sensitive systems not in their normal baseline.',
    query: `-- Chronicle UDM Search
metadata.event_type = "USER_LOGIN" AND
principal.user.is_service_account = false AND
(
  principal.hostname != /corp-domain/ OR
  hour(metadata.event_timestamp.seconds) NOT IN [8, 9, 10, 11, 12, 13, 14, 15, 16, 17] OR
  target.resource.name IN ("finance-srv", "hr-db", "exec-shares")
) AND
security_result.severity = "HIGH"`,
    result: 'Returns privileged logins outside business hours (08:00-17:00), from non-corporate hosts, or accessing high-value targets. Used for after-hours and impossible travel detection.',
    reasoning: 'Privileged account misuse is a top insider threat vector. Baseline deviations — after-hours access, off-network logins, or sensitive resource access — are high-fidelity indicators when correlated with user behavior baselines.',
  },
];

const platformColors = {
  Splunk: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  Chronicle: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
};

export function SIEMQueryShowcase() {
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);

  const copyQuery = () => {
    navigator.clipboard.writeText(QUERIES[active].query);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const q = QUERIES[active];

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 rounded-full mb-4">
          <span className="w-2 h-2 bg-cyan-400 rounded-full" />
          Detection Engineering
        </div>
        <h2 className="text-4xl font-bold font-syne mb-3">
          SIEM <span className="text-[#00E87A]">Query Showcase</span>
        </h2>
        <p className="text-zinc-400 max-w-2xl">
          Splunk SPL and Chronicle YARA-L queries written for lab investigations. Each includes detection purpose, analyst reasoning, and expected output.
        </p>
      </div>

      {/* Query selector */}
      <div className="flex flex-wrap gap-2 mb-8">
        {QUERIES.map((query, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`flex items-center gap-2 px-3 py-2 font-mono text-xs rounded-lg border transition-all ${
              active === i
                ? 'bg-[#00E87A]/10 text-[#00E87A] border-[#00E87A]/40'
                : 'bg-zinc-900 text-zinc-500 border-white/10 hover:border-white/20 hover:text-zinc-300'
            }`}
          >
            <span className={`px-1.5 py-0.5 text-xs rounded border ${platformColors[query.platform]}`}>
              {query.platform}
            </span>
            {query.title}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        {/* Main query panel */}
        <div className="space-y-4 min-w-0 overflow-hidden">
          {/* Header */}
          <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className={`px-2 py-0.5 text-xs font-bold border rounded ${platformColors[q.platform]}`}>
                    {q.platform}
                  </span>
                  <span className="font-mono text-xs text-amber-400">{q.mitre}</span>
                  <span className="font-mono text-xs text-zinc-500">{q.tactic}</span>
                </div>
                <h3 className="text-lg font-bold text-white font-syne">{q.title}</h3>
              </div>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">{q.purpose}</p>
          </div>

          {/* Query code */}
          <div className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-zinc-800/50 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#00E87A]" />
                <span className="font-mono text-xs text-zinc-500 ml-2">{q.platform.toLowerCase()}-query.spl</span>
              </div>
              <button
                onClick={copyQuery}
                className="font-mono text-xs text-zinc-500 hover:text-[#00E87A] transition-colors"
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <pre className="p-5 font-mono text-sm text-[#00E87A] overflow-x-auto leading-relaxed whitespace-pre bg-black/60">
              {q.query}
            </pre>
          </div>

          {/* Result + Reasoning */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-5">
              <div className="font-mono text-xs uppercase tracking-wider text-zinc-500 mb-3">Expected Result</div>
              <p className="text-sm text-zinc-300 leading-relaxed">{q.result}</p>
            </div>
            <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-5">
              <div className="font-mono text-xs uppercase tracking-wider text-zinc-500 mb-3">Analyst Reasoning</div>
              <p className="text-sm text-zinc-300 leading-relaxed">{q.reasoning}</p>
            </div>
          </div>
        </div>

        {/* Sidebar — all queries index */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden self-start">
          <div className="px-4 py-3 border-b border-white/10 bg-zinc-800/30">
            <span className="font-mono text-xs uppercase tracking-wider text-zinc-500">Query Library</span>
          </div>
          <div className="divide-y divide-white/5">
            {QUERIES.map((query, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`w-full text-left px-4 py-3 transition-all hover:bg-zinc-800/50 ${
                  active === i ? 'bg-zinc-800/60 border-l-2 border-l-[#00E87A]' : ''
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-1.5 py-0.5 text-xs rounded border ${platformColors[query.platform]}`}>
                    {query.platform}
                  </span>
                  <span className="font-mono text-xs text-amber-400">{query.mitre}</span>
                </div>
                <div className="text-sm font-medium text-zinc-300">{query.title}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
