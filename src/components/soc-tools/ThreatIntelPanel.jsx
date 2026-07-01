import React, { useState, useEffect } from 'react';

const INITIAL_IOCS = [
  { ip: '91.189.45.122', type: 'IPv4', threat: 'Brute Force', severity: 'HIGH', country: 'US (ASN14061)', age: '2h ago' },
  { ip: '194.165.16.91', type: 'IPv4', threat: 'Scanning', severity: 'MED', country: 'NL (ASN16509)', age: '4h ago' },
  { ip: '185.220.101.35', type: 'IPv4', threat: 'C2 Beacon', severity: 'CRIT', country: 'DE (ASN24940)', age: '6h ago' },
  { ip: 'paypa1.com', type: 'Domain', threat: 'Phishing Kit', severity: 'HIGH', country: 'Registrar: Namecheap', age: '1d ago' },
  { ip: 'd8e8fca2dc0f896fd7cb4cb0031ba249', type: 'MD5', threat: 'Known Malware', severity: 'CRIT', country: 'CobaltStrike Beacon', age: '3d ago' },
];

const THREAT_EVENTS = [
  { time: '', type: 'IOC', msg: 'Brute force activity detected — 91.189.45.122 flagged', sev: 'HIGH' },
  { time: '', type: 'SYNC', msg: 'IOC feed synchronized — 14 new indicators loaded', sev: 'INFO' },
  { time: '', type: 'MITRE', msg: 'MITRE T1110 correlation active — 3 alerts matched', sev: 'HIGH' },
  { time: '', type: 'ANOMALY', msg: 'Endpoint anomaly flagged — 10.0.1.45 beaconing', sev: 'CRIT' },
  { time: '', type: 'PHISH', msg: 'Phishing domain detected — paypa1.com active kit', sev: 'HIGH' },
  { time: '', type: 'CLEAR', msg: 'False positive confirmed — alert #9038 cleared', sev: 'INFO' },
  { time: '', type: 'HUNT', msg: 'Threat hunt initiated — lateral movement scan', sev: 'MED' },
  { time: '', type: 'BLOCK', msg: 'ASN14061 range blocked at perimeter — 4 IPs', sev: 'INFO' },
];

const sevColors = {
  CRIT: 'text-red-400 bg-red-500/10 border-red-500/30',
  HIGH: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  MED: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  INFO: 'text-[#00E87A] bg-[#00E87A]/10 border-[#00E87A]/30',
};

function getTimestamp() {
  return new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function ThreatIntelPanel() {
  const [events, setEvents] = useState(
    THREAT_EVENTS.map(e => ({ ...e, time: getTimestamp() }))
  );
  const [iocs] = useState(INITIAL_IOCS);
  const [feedCount, setFeedCount] = useState(14);

  useEffect(() => {
    const newEvents = [
      { type: 'IOC', msg: 'New external IP flagged — 45.33.32.156 scanning ports', sev: 'MED' },
      { type: 'SYNC', msg: 'Threat intelligence feed refreshed', sev: 'INFO' },
      { type: 'MITRE', msg: 'T1566 Phishing pattern detected in email logs', sev: 'HIGH' },
      { type: 'ANOMALY', msg: 'Unusual DNS lookup volume on host 10.0.2.11', sev: 'MED' },
      { type: 'BLOCK', msg: 'Credential stuffing attempt blocked at WAF', sev: 'HIGH' },
    ];

    const interval = setInterval(() => {
      const ev = newEvents[Math.floor(Math.random() * newEvents.length)];
      setEvents(prev => [{ ...ev, time: getTimestamp() }, ...prev.slice(0, 9)]);
      setFeedCount(c => c + 1);
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-full mb-4">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-400" />
          </span>
          Live Threat Intelligence
        </div>
        <h2 className="text-4xl font-bold font-syne mb-3">
          Threat <span className="text-[#00E87A]">Intelligence Feed</span>
        </h2>
        <p className="text-zinc-400 max-w-2xl">
          Active IOC feed, threat indicators, and correlation engine output. Updates in real time.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        {/* IOC Table */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-zinc-800/30">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-wider text-zinc-400">Active IOC Registry</span>
            </div>
            <span className="font-mono text-xs text-[#00E87A]">{feedCount} indicators</span>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-[80px_1fr_100px_80px_80px] gap-3 px-5 py-2 border-b border-white/5 bg-zinc-800/20">
            {['Type', 'Indicator', 'Threat', 'Severity', 'Age'].map(h => (
              <div key={h} className="font-mono text-xs uppercase tracking-wider text-zinc-600">{h}</div>
            ))}
          </div>

          <div className="divide-y divide-white/5">
            {iocs.map((ioc, i) => (
              <div key={i} className="grid grid-cols-[80px_1fr_100px_80px_80px] gap-3 px-5 py-3 hover:bg-zinc-800/30 transition-colors items-center">
                <span className="font-mono text-xs text-cyan-400">{ioc.type}</span>
                <span className="font-mono text-xs text-zinc-300 truncate" title={ioc.ip}>{ioc.ip}</span>
                <span className="font-mono text-xs text-zinc-400">{ioc.threat}</span>
                <span className={`font-mono text-xs px-2 py-0.5 rounded border text-center ${sevColors[ioc.severity]}`}>
                  {ioc.severity}
                </span>
                <span className="font-mono text-xs text-zinc-600">{ioc.age}</span>
              </div>
            ))}
          </div>

          <div className="px-5 py-3 border-t border-white/10 bg-zinc-800/20">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-zinc-600">Last sync: {getTimestamp()}</span>
              <span className="font-mono text-xs text-[#00E87A]">● Feed Active</span>
            </div>
          </div>
        </div>

        {/* Live Event Feed */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-zinc-800/30">
            <div className="flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00E87A] opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#00E87A]" />
              </span>
              <span className="font-mono text-xs uppercase tracking-wider text-zinc-400">Live Intel Stream</span>
            </div>
          </div>
          <div className="p-4 space-y-2 overflow-y-auto" style={{ maxHeight: '420px' }}>
            {events.map((ev, i) => (
              <div
                key={`${ev.time}-${i}`}
                className={`p-3 rounded-lg border transition-all ${i === 0 ? 'border-[#00E87A]/30 bg-[#00E87A]/5' : 'border-white/5 bg-black/20'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs text-zinc-600">{ev.time}</span>
                  <span className={`font-mono text-xs px-1.5 py-0.5 rounded border ${sevColors[ev.sev]}`}>{ev.sev}</span>
                  <span className="font-mono text-xs text-zinc-500">[{ev.type}]</span>
                </div>
                <p className="font-mono text-xs text-zinc-300 leading-snug">{ev.msg}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MITRE Coverage */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { tactic: 'Initial Access', techniques: ['T1566', 'T1078', 'T1133'], coverage: 3 },
          { tactic: 'Credential Access', techniques: ['T1110', 'T1552', 'T1555'], coverage: 3 },
          { tactic: 'Discovery', techniques: ['T1046', 'T1083', 'T1018'], coverage: 2 },
          { tactic: 'Command & Control', techniques: ['T1071', 'T1095', 'T1041'], coverage: 2 },
        ].map((cat, i) => (
          <div key={i} className="p-4 bg-zinc-900/50 border border-white/10 rounded-xl">
            <div className="font-mono text-xs text-zinc-500 mb-2">{cat.tactic}</div>
            <div className="flex flex-wrap gap-1 mb-2">
              {cat.techniques.map((t, j) => (
                <span key={j} className={`font-mono text-xs px-1.5 py-0.5 rounded ${j < cat.coverage ? 'text-amber-400 bg-amber-500/10' : 'text-zinc-700 bg-zinc-800'}`}>
                  {t}
                </span>
              ))}
            </div>
            <div className="h-1 bg-zinc-800 rounded-full">
              <div className="h-1 bg-amber-400 rounded-full" style={{ width: `${(cat.coverage / cat.techniques.length) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
