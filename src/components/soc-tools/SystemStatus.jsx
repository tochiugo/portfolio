import React, { useState, useEffect } from 'react';

const SYSTEMS = [
  { name: 'Threat Monitoring', status: 'ACTIVE', color: '[#00E87A]', uptime: '99.9%', detail: 'Chronicle + Splunk' },
  { name: 'SIEM Sync', status: 'HEALTHY', color: '[#00E87A]', uptime: '100%', detail: 'Real-time ingestion' },
  { name: 'IOC Feed', status: 'CONNECTED', color: '[#00E87A]', uptime: '99.7%', detail: '14 active feeds' },
  { name: 'Detection Pipeline', status: 'ONLINE', color: '[#00E87A]', uptime: '99.9%', detail: '247 active rules' },
  { name: 'Endpoint Telemetry', status: 'STREAMING', color: '[#00E87A]', uptime: '98.4%', detail: '23 hosts reporting' },
  { name: 'Alert Correlation', status: 'ACTIVE', color: '[#00E87A]', uptime: '100%', detail: 'ML engine running' },
];

const METRICS = [
  { label: 'True Positive Rate', value: 91, suffix: '%', color: 'text-[#00E87A]' },
  { label: 'FP Reduction', value: 34, suffix: '%', color: 'text-cyan-400' },
  { label: 'Detection Confidence', value: 88, suffix: '%', color: 'text-[#00E87A]' },
  { label: 'IOC Match Rate', value: 93, suffix: '%', color: 'text-[#00E87A]' },
  { label: 'MTTR (minutes)', value: 12, suffix: 'min', color: 'text-amber-400' },
  { label: 'Alerts / Day', value: 47, suffix: '', color: 'text-cyan-400' },
];

export function SystemStatus() {
  const [uptime, setUptime] = useState(0);
  const [events, setEvents] = useState(5614);
  const [metrics, setMetrics] = useState(METRICS.map(m => ({ ...m, displayed: 0 })));

  useEffect(() => {
    const start = Date.now();
    const tick = setInterval(() => {
      setUptime(Math.floor((Date.now() - start) / 1000));
      setEvents(e => e + Math.floor(Math.random() * 4));
    }, 1000);

    // Animate metrics
    let frame = 0;
    const animMetrics = setInterval(() => {
      frame++;
      setMetrics(METRICS.map(m => ({
        ...m,
        displayed: Math.min(m.value, Math.round((m.value * frame) / 60)),
      })));
      if (frame >= 60) clearInterval(animMetrics);
    }, 25);

    return () => { clearInterval(tick); clearInterval(animMetrics); };
  }, []);

  const formatUptime = (s) => {
    if (s < 60) return `${s}s`;
    if (s < 3600) return `${Math.floor(s / 60)}m ${s % 60}s`;
    return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#00E87A] bg-[#00E87A]/10 border border-[#00E87A]/30 rounded-full mb-4">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00E87A] opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#00E87A]" />
          </span>
          Live Operations
        </div>
        <h2 className="text-4xl font-bold font-syne mb-3">
          System <span className="text-[#00E87A]">Status</span>
        </h2>
        <p className="text-zinc-400 max-w-2xl">
          Real-time operational status of SOC infrastructure components.
        </p>
      </div>

      {/* System panels */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
        {SYSTEMS.map((sys, i) => (
          <div key={i} className="p-4 bg-zinc-900/50 border border-white/10 rounded-xl text-center hover:border-[#00E87A]/20 transition-colors">
            <div className="flex items-center justify-center gap-1 mb-3">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00E87A] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00E87A]" />
              </span>
            </div>
            <div className="font-mono text-xs font-bold text-[#00E87A] mb-1">{sys.status}</div>
            <div className="text-xs font-medium text-white mb-1 leading-snug">{sys.name}</div>
            <div className="font-mono text-xs text-zinc-600">{sys.uptime}</div>
          </div>
        ))}
      </div>

      {/* Detection Analytics */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6">
          <div className="font-mono text-xs uppercase tracking-wider text-zinc-500 mb-5">Detection Analytics</div>
          <div className="grid grid-cols-2 gap-4">
            {metrics.map((m, i) => (
              <div key={i} className="p-3 bg-black/40 rounded-xl border border-white/5">
                <div className={`text-2xl font-bold font-syne ${m.color} mb-0.5`}>
                  {m.displayed}{m.suffix}
                </div>
                <div className="font-mono text-xs text-zinc-500">{m.label}</div>
                <div className="mt-2 h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-1 rounded-full transition-all duration-[2000ms] ${
                      m.color === 'text-[#00E87A]' ? 'bg-[#00E87A]' :
                      m.color === 'text-cyan-400' ? 'bg-cyan-400' : 'bg-amber-400'
                    }`}
                    style={{ width: `${(m.displayed / (m.suffix === '%' ? 100 : m.value)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live counters */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6">
          <div className="font-mono text-xs uppercase tracking-wider text-zinc-500 mb-5">Live Session Counters</div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/5">
              <span className="font-mono text-xs text-zinc-400">Events Processed</span>
              <span className="font-mono text-base font-bold text-[#00E87A]">{events.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/5">
              <span className="font-mono text-xs text-zinc-400">Session Uptime</span>
              <span className="font-mono text-base font-bold text-cyan-400">{formatUptime(uptime)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/5">
              <span className="font-mono text-xs text-zinc-400">Detection Rules Active</span>
              <span className="font-mono text-base font-bold text-[#00E87A]">247</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/5">
              <span className="font-mono text-xs text-zinc-400">Active Investigations</span>
              <span className="font-mono text-base font-bold text-amber-400">3</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/5">
              <span className="font-mono text-xs text-zinc-400">Threat Intel Feeds</span>
              <span className="font-mono text-base font-bold text-[#00E87A]">14</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detection Pipeline visualization */}
      <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6">
        <div className="font-mono text-xs uppercase tracking-wider text-zinc-500 mb-5">Detection Pipeline Flow</div>
        <div className="flex items-center gap-0 overflow-x-auto pb-2">
          {[
            { stage: 'Logs', color: 'bg-zinc-700' },
            { stage: 'Correlation', color: 'bg-cyan-900' },
            { stage: 'Detection', color: 'bg-[#00E87A]/20' },
            { stage: 'Severity', color: 'bg-amber-900/50' },
            { stage: 'Escalation', color: 'bg-red-900/50' },
            { stage: 'Incident', color: 'bg-[#00E87A]/20' },
          ].map((stage, i, arr) => (
            <React.Fragment key={i}>
              <div className={`flex-shrink-0 px-4 py-2.5 ${stage.color} rounded-lg border border-white/10 text-center`}>
                <div className="font-mono text-xs text-white whitespace-nowrap">{stage.stage}</div>
              </div>
              {i < arr.length - 1 && (
                <div className="flex-shrink-0 w-8 flex items-center justify-center">
                  <div className="w-6 h-px bg-[#00E87A]/40" />
                  <span className="text-[#00E87A]/60 text-xs">→</span>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
