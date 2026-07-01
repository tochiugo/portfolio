import React, { useState, useEffect, useRef } from 'react';

const BASE_EVENTS = [
  { type: 'SIEM', msg: 'SIEM ACTIVE · Chronicle Connected', color: 'text-[#00E87A]' },
  { type: 'THREAT', msg: 'MITRE T1110 Investigation Active', color: 'text-red-400' },
  { type: 'SYNC', msg: 'Detection Rules Synced · 247 Rules Loaded', color: 'text-[#00E87A]' },
  { type: 'IOC', msg: 'IOC Feed Updated · 14 New Indicators', color: 'text-amber-400' },
  { type: 'CORR', msg: 'Threat Correlation Running', color: 'text-cyan-400' },
  { type: 'TELEM', msg: 'Endpoint Telemetry Streaming · 23 Hosts', color: 'text-[#00E87A]' },
  { type: 'QUEUE', msg: 'Incident Queue Monitoring Active', color: 'text-[#00E87A]' },
  { type: 'LOG', msg: 'Log Correlation Pipeline Healthy', color: 'text-cyan-400' },
  { type: 'AUTH', msg: 'Authentication Monitoring Running', color: 'text-[#00E87A]' },
  { type: 'INTEL', msg: 'Threat Intelligence Pipeline Active', color: 'text-amber-400' },
  { type: 'DETECT', msg: 'Security Event Correlation Healthy', color: 'text-[#00E87A]' },
  { type: 'SPLUNK', msg: 'Splunk SIEM · 3,291 Events Today', color: 'text-[#00E87A]' },
  { type: 'NET', msg: 'Network Anomaly Detection Running', color: 'text-cyan-400' },
  { type: 'RULE', msg: 'MITRE T1566 Phishing Detection Active', color: 'text-red-400' },
  { type: 'FEED', msg: 'Threat Intelligence Feed Synchronized', color: 'text-[#00E87A]' },
  { type: 'DLP', msg: 'Data Loss Prevention Monitor Active', color: 'text-cyan-400' },
  { type: 'VPN', msg: 'VPN Access Logging Active', color: 'text-[#00E87A]' },
  { type: 'DNS', msg: 'DNS Sinkhole Monitoring Online', color: 'text-amber-400' },
];

export function SOCTelemetryFeed() {
  const [events, setEvents] = useState([...BASE_EVENTS, ...BASE_EVENTS]);
  const [liveEvent, setLiveEvent] = useState(null);

  useEffect(() => {
    const liveMessages = [
      { type: 'ALERT', msg: 'NEW ALERT · Suspicious Auth Attempt · 192.168.1.45', color: 'text-red-400' },
      { type: 'BLOCK', msg: 'IOC MATCH · IP 91.189.45.122 Blocked at Perimeter', color: 'text-amber-400' },
      { type: 'CLEAR', msg: 'ALERT CLEARED · False Positive Confirmed', color: 'text-[#00E87A]' },
      { type: 'SYNC', msg: 'RULES UPDATED · 3 New Detection Signatures Loaded', color: 'text-cyan-400' },
      { type: 'TRIAGE', msg: 'TRIAGE ACTIVE · Analyst Investigating Alert #9042', color: 'text-amber-400' },
    ];

    const interval = setInterval(() => {
      const msg = liveMessages[Math.floor(Math.random() * liveMessages.length)];
      setLiveEvent({ ...msg, id: Date.now() });
      setTimeout(() => setLiveEvent(null), 4000);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="border-y border-white/5 bg-black/90 backdrop-blur-sm overflow-hidden relative">
      <div className="flex items-center h-8">
        {/* Live badge */}
        <div className="flex-shrink-0 flex items-center gap-2 px-4 h-full border-r border-white/10 bg-zinc-900/80 z-10">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00E87A] opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#00E87A]" />
          </span>
          <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-[#00E87A]">
            SOC FEED
          </span>
          <span className="font-mono text-[9px] tracking-wider uppercase text-zinc-600 border border-zinc-700 rounded px-1 ml-1">
            simulated lab
          </span>
        </div>

        {/* Scrolling events */}
        <div className="flex-1 overflow-hidden relative">
          {liveEvent ? (
            <div className="flex items-center gap-6 px-4 h-8 animate-pulse">
              <span className="font-mono text-[10px] font-bold tracking-wider text-amber-400 uppercase">
                ⚡ LIVE
              </span>
              <span className={`font-mono text-[10px] tracking-wide ${liveEvent.color}`}>
                {liveEvent.msg}
              </span>
            </div>
          ) : (
            <div className="scroll-left flex items-center gap-0 whitespace-nowrap">
              {events.map((event, i) => (
                <div key={i} className="inline-flex items-center gap-3 px-6">
                  <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-zinc-600">
                    {event.type}
                  </span>
                  <span className={`font-mono text-[10px] tracking-wide ${event.color}`}>
                    {event.msg}
                  </span>
                  <span className="text-zinc-700 text-xs">·</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right status */}
        <div className="flex-shrink-0 flex items-center gap-3 px-4 h-full border-l border-white/10 bg-zinc-900/80">
          <span className="font-mono text-[10px] text-zinc-600 tracking-wide">
            {new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="font-mono text-[10px] text-[#00E87A]">SECURE</span>
        </div>
      </div>
    </div>
  );
}
