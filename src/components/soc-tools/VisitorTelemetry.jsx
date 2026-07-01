import React, { useState, useEffect } from 'react';

function getBrowser() {
  const ua = navigator.userAgent;
  if (ua.includes('Edg/')) return 'Edge';
  if (ua.includes('Chrome/') && !ua.includes('Chromium')) return 'Chrome';
  if (ua.includes('Firefox/')) return 'Firefox';
  if (ua.includes('Safari/') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('OPR/') || ua.includes('Opera')) return 'Opera';
  return 'Browser';
}

function getOS() {
  const ua = navigator.userAgent;
  if (ua.includes('Windows NT 10')) return 'Windows 11';
  if (ua.includes('Windows NT')) return 'Windows';
  if (ua.includes('Mac OS X')) return 'macOS';
  if (ua.includes('Linux') && !ua.includes('Android')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  return 'Unknown OS';
}

function getDevice() {
  const ua = navigator.userAgent;
  if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) return 'Mobile';
  if (/Tablet|iPad/i.test(ua)) return 'Tablet';
  return 'Desktop';
}

function getTimestamp() {
  return new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

const SIMULATED_SESSIONS = [
  { location: 'San Francisco, CA', browser: 'Chrome', os: 'macOS', device: 'Desktop', ago: '2m ago' },
  { location: 'New York, NY', browser: 'Safari', os: 'iOS', device: 'Mobile', ago: '5m ago' },
  { location: 'Austin, TX', browser: 'Firefox', os: 'Windows 11', device: 'Desktop', ago: '11m ago' },
  { location: 'Seattle, WA', browser: 'Edge', os: 'Windows 11', device: 'Desktop', ago: '18m ago' },
  { location: 'Boston, MA', browser: 'Chrome', os: 'Linux', device: 'Desktop', ago: '34m ago' },
];

export function VisitorTelemetry() {
  const [session, setSession] = useState(null);
  const [sessionTime, setSessionTime] = useState(0);

  useEffect(() => {
    const start = Date.now();
    setSession({
      browser: getBrowser(),
      os: getOS(),
      device: getDevice(),
      screen: `${screen.width}×${screen.height}`,
      sessionStart: getTimestamp(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown',
      language: navigator.language || 'en-US',
    });

    const tick = setInterval(() => {
      setSessionTime(Math.floor((Date.now() - start) / 1000));
    }, 1000);

    return () => clearInterval(tick);
  }, []);

  const formatTime = (s) => {
    if (s < 60) return `${s}s`;
    return `${Math.floor(s / 60)}m ${s % 60}s`;
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 rounded-full mb-4">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-400" />
          </span>
          Visitor Operations Telemetry
        </div>
        <h2 className="text-4xl font-bold font-syne mb-3">
          Session <span className="text-[#00E87A]">Monitor</span>
        </h2>
        <p className="text-zinc-400 max-w-2xl text-sm">
          Privacy-safe client-side telemetry — no server calls, no data collection, no tracking. Your session data never leaves your browser.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Current session */}
        <div className="bg-zinc-900/50 border border-[#00E87A]/20 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-white/10 bg-[#00E87A]/5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00E87A] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00E87A]" />
            </span>
            <span className="font-mono text-xs uppercase tracking-wider text-[#00E87A]">Your Session — Live</span>
          </div>
          <div className="p-5">
            {session ? (
              <div className="space-y-3">
                <div className="p-3 bg-black/30 rounded-lg border border-white/5">
                  <div className="font-mono text-xs text-zinc-500 mb-1">New Session Detected</div>
                  <div className="font-mono text-sm text-[#00E87A]">
                    {session.device} Connected · {session.browser} · {session.os}
                  </div>
                </div>

                {[
                  { label: 'Browser', value: session.browser },
                  { label: 'Operating System', value: session.os },
                  { label: 'Device Type', value: session.device },
                  { label: 'Resolution', value: session.screen },
                  { label: 'Timezone', value: session.timezone },
                  { label: 'Language', value: session.language },
                  { label: 'Session Start', value: session.sessionStart },
                  { label: 'Duration', value: formatTime(sessionTime) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-1.5 border-b border-white/5">
                    <span className="font-mono text-xs text-zinc-500">{label}</span>
                    <span className="font-mono text-xs text-zinc-200">{value}</span>
                  </div>
                ))}

                <div className="pt-2">
                  <div className="font-mono text-xs text-zinc-600 text-center">
                    ⓘ No data transmitted · Client-side only · Privacy preserved
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 py-4">
                <span className="w-2 h-2 bg-[#00E87A] rounded-full animate-pulse" />
                <span className="font-mono text-xs text-zinc-500">Initializing session telemetry...</span>
              </div>
            )}
          </div>
        </div>

        {/* Simulated recent sessions */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-zinc-800/30">
            <span className="font-mono text-xs uppercase tracking-wider text-zinc-400">Recent Analyst Sessions</span>
            <span className="font-mono text-xs text-zinc-600">Simulated</span>
          </div>
          <div className="divide-y divide-white/5">
            {SIMULATED_SESSIONS.map((s, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-zinc-800/20 transition-colors">
                <div className="w-2 h-2 rounded-full bg-zinc-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-xs text-zinc-300">{s.device} · {s.browser} · {s.os}</div>
                  <div className="font-mono text-xs text-zinc-600">{s.location}</div>
                </div>
                <span className="font-mono text-xs text-zinc-600 flex-shrink-0">{s.ago}</span>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-white/10">
            <div className="font-mono text-xs text-zinc-600 text-center">
              Demo data · For illustration only · Not real visitor tracking
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
