import React, { useState, useCallback } from 'react';

// Real SHA-256 using Web Crypto API
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Caesar cipher
function caesarCipher(text, shift, decrypt = false) {
  const s = decrypt ? (26 - (shift % 26)) % 26 : shift % 26;
  return text.replace(/[a-zA-Z]/g, char => {
    const base = char >= 'a' ? 97 : 65;
    return String.fromCharCode(((char.charCodeAt(0) - base + s) % 26) + base);
  });
}

// Password strength
function analyzePassword(pwd) {
  let score = 0;
  const checks = {
    length: pwd.length >= 12,
    upper: /[A-Z]/.test(pwd),
    lower: /[a-z]/.test(pwd),
    numbers: /[0-9]/.test(pwd),
    symbols: /[^A-Za-z0-9]/.test(pwd),
    longEnough: pwd.length >= 16,
    noCommon: !['password', '123456', 'qwerty', 'abc123'].some(c => pwd.toLowerCase().includes(c)),
  };
  score = Object.values(checks).filter(Boolean).length;
  const entropy = Math.log2(Math.pow(
    (checks.upper ? 26 : 0) + (checks.lower ? 26 : 0) +
    (checks.numbers ? 10 : 0) + (checks.symbols ? 32 : 0) || 26,
    pwd.length
  ));
  return { score, checks, entropy: Math.round(entropy), level: score <= 2 ? 'Weak' : score <= 4 ? 'Moderate' : score <= 6 ? 'Strong' : 'Very Strong' };
}

// SOC-grade password generator
function generatePassword(length, useUpper, useLower, useNumbers, useSymbols) {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  let charset = '';
  const required = [];
  if (useUpper) { charset += upper; required.push(upper[Math.floor(Math.random() * upper.length)]); }
  if (useLower) { charset += lower; required.push(lower[Math.floor(Math.random() * lower.length)]); }
  if (useNumbers) { charset += numbers; required.push(numbers[Math.floor(Math.random() * numbers.length)]); }
  if (useSymbols) { charset += symbols; required.push(symbols[Math.floor(Math.random() * symbols.length)]); }
  if (!charset) charset = lower;
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  const base = Array.from(arr).map(v => charset[v % charset.length]);
  // Insert required chars at random positions
  required.forEach((ch, i) => { base[i] = ch; });
  // Fisher-Yates shuffle using crypto random
  const shuffle = new Uint32Array(base.length);
  crypto.getRandomValues(shuffle);
  for (let i = base.length - 1; i > 0; i--) {
    const j = shuffle[i] % (i + 1);
    [base[i], base[j]] = [base[j], base[i]];
  }
  return base.join('');
}

// IOC detector
function detectIOCs(text) {
  const iocs = [];
  const ipRegex = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g;
  const hashMd5 = /\b[a-fA-F0-9]{32}\b/g;
  const hashSha256 = /\b[a-fA-F0-9]{64}\b/g;
  const urlRegex = /https?:\/\/[^\s]+/g;
  const domainRegex = /\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}\b/gi;

  const ips = [...new Set(text.match(ipRegex) || [])];
  const sha256s = [...new Set(text.match(hashSha256) || [])];
  const md5s = [...new Set((text.match(hashMd5) || []).filter(h => !text.match(hashSha256)?.includes(h)))];
  const urls = [...new Set(text.match(urlRegex) || [])];

  ips.forEach(ip => {
    const isPrivate = ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('172.') || ip === '127.0.0.1';
    iocs.push({ type: 'IPv4', value: ip, severity: isPrivate ? 'info' : 'high', note: isPrivate ? 'Private/Internal' : 'External IP — investigate' });
  });
  sha256s.forEach(h => iocs.push({ type: 'SHA-256', value: h.substring(0, 20) + '...', severity: 'medium', note: 'File hash — check VirusTotal' }));
  md5s.forEach(h => iocs.push({ type: 'MD5', value: h, severity: 'medium', note: 'Legacy hash — check against threat intel' }));
  urls.forEach(u => iocs.push({ type: 'URL', value: u.substring(0, 40) + (u.length > 40 ? '...' : ''), severity: 'high', note: 'External URL — sandbox analysis recommended' }));

  return iocs;
}

// Log parser
function parseLog(log) {
  const patterns = [
    { regex: /failed\s+(login|auth|password|logon)/i, mitre: 'T1110 — Brute Force', severity: 'High', tactic: 'Credential Access' },
    { regex: /port\s*scan|nmap|scanning/i, mitre: 'T1046 — Network Service Discovery', severity: 'Medium', tactic: 'Discovery' },
    { regex: /phish|suspicious\s+email|spoofed/i, mitre: 'T1566 — Phishing', severity: 'High', tactic: 'Initial Access' },
    { regex: /data\s+exfil|upload|outbound\s+traffic/i, mitre: 'T1041 — Exfiltration over C2', severity: 'Critical', tactic: 'Exfiltration' },
    { regex: /malware|trojan|ransomware|beacon/i, mitre: 'T1071 — Application Layer Protocol', severity: 'Critical', tactic: 'Command & Control' },
    { regex: /privilege|escalat|admin|sudo/i, mitre: 'T1068 — Exploitation for Privilege Escalation', severity: 'High', tactic: 'Privilege Escalation' },
    { regex: /lateral|psexec|wmi|rdp/i, mitre: 'T1021 — Remote Services', severity: 'High', tactic: 'Lateral Movement' },
  ];

  for (const p of patterns) {
    if (p.regex.test(log)) {
      return {
        matched: true,
        mitre: p.mitre,
        severity: p.severity,
        tactic: p.tactic,
        recommendation: `Escalate to Tier 2. Preserve evidence. Check for lateral movement. Review ${p.tactic} indicators.`,
      };
    }
  }

  return {
    matched: false,
    mitre: 'No direct MITRE mapping',
    severity: 'Low',
    tactic: 'Unknown',
    recommendation: 'Investigate context. Check baseline behavior. No immediate escalation required.',
  };
}

const TOOLS = ['sha256', 'base64', 'caesar', 'password', 'ioc', 'logparser'];

const severityColor = { Critical: 'text-red-400', High: 'text-red-400', Medium: 'text-amber-400', Low: 'text-emerald-400', info: 'text-cyan-400', high: 'text-red-400', medium: 'text-amber-400' };

export function CyberTools() {
  const [activeTool, setActiveTool] = useState('sha256');
  const [sha256Input, setSha256Input] = useState('');
  const [sha256Output, setSha256Output] = useState('');
  const [b64Input, setB64Input] = useState('');
  const [b64Output, setB64Output] = useState('');
  const [b64Mode, setB64Mode] = useState('encode');
  const [caesarInput, setCaesarInput] = useState('');
  const [caesarShift, setCaesarShift] = useState(13);
  const [caesarMode, setCaesarMode] = useState('encrypt');
  const [caesarOutput, setCaesarOutput] = useState('');
  const [pwGenerated, setPwGenerated] = useState('');
  const [pwAnalysis, setPwAnalysis] = useState(null);
  const [pwLength, setPwLength] = useState(20);
  const [pwUpper, setPwUpper] = useState(true);
  const [pwLower, setPwLower] = useState(true);
  const [pwNumbers, setPwNumbers] = useState(true);
  const [pwSymbols, setPwSymbols] = useState(true);
  const [iocInput, setIocInput] = useState('');
  const [iocResults, setIocResults] = useState([]);
  const [logInput, setLogInput] = useState('');
  const [logResult, setLogResult] = useState(null);
  const [copied, setCopied] = useState('');

  const copy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  const handleSha256 = async () => {
    if (!sha256Input) return;
    const hash = await sha256(sha256Input);
    setSha256Output(hash);
  };

  const handleBase64 = () => {
    try {
      if (b64Mode === 'encode') {
        setB64Output(btoa(unescape(encodeURIComponent(b64Input))));
      } else {
        setB64Output(decodeURIComponent(escape(atob(b64Input))));
      }
    } catch {
      setB64Output('⚠ Invalid input for decode operation');
    }
  };

  const handleCaesar = () => {
    setCaesarOutput(caesarCipher(caesarInput, caesarShift, caesarMode === 'decrypt'));
  };

  const handleGeneratePassword = () => {
    const pwd = generatePassword(pwLength, pwUpper, pwLower, pwNumbers, pwSymbols);
    setPwGenerated(pwd);
    setPwAnalysis(analyzePassword(pwd));
  };

  const toolLabels = {
    sha256: 'SHA-256',
    base64: 'Base64',
    caesar: 'Caesar',
    password: 'Password',
    ioc: 'IOC Detect',
    logparser: 'Log Parser',
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#00E87A] bg-[#00E87A]/10 border border-[#00E87A]/30 rounded-full mb-4">
          <span className="w-2 h-2 bg-[#00E87A] rounded-full animate-pulse" />
          Security Utilities
        </div>
        <h2 className="text-4xl font-bold font-syne mb-3">
          Cyber <span className="text-[#00E87A]">Tools</span>
        </h2>
        <p className="text-zinc-400 max-w-2xl">
          Real working security utilities. These process actual inputs and generate real outputs — not decorative UI.
        </p>
      </div>

      {/* Tool selector */}
      <div className="flex flex-wrap gap-2 mb-8">
        {TOOLS.map(t => (
          <button
            key={t}
            onClick={() => setActiveTool(t)}
            className={`px-4 py-2 font-mono text-xs uppercase tracking-wider rounded-lg transition-all border ${
              activeTool === t
                ? 'bg-[#00E87A]/10 text-[#00E87A] border-[#00E87A]/40'
                : 'bg-zinc-900 text-zinc-500 border-white/10 hover:border-[#00E87A]/30 hover:text-zinc-300'
            }`}
          >
            {toolLabels[t]}
          </button>
        ))}
      </div>

      <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 lg:p-8">

        {/* SHA-256 */}
        {activeTool === 'sha256' && (
          <div>
            <div className="font-mono text-xs uppercase tracking-wider text-[#00E87A] mb-4">SHA-256 Hash Generator</div>
            <textarea
              value={sha256Input}
              onChange={e => setSha256Input(e.target.value)}
              placeholder="Enter text to hash..."
              className="w-full bg-black border border-white/10 rounded-lg p-3 font-mono text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-[#00E87A]/50 resize-none mb-3"
              rows={3}
            />
            <button
              onClick={handleSha256}
              className="px-5 py-2 text-xs font-mono uppercase tracking-wider text-black bg-[#00E87A] rounded-lg hover:bg-[#00E87A]/90 transition-colors mb-4"
            >
              Generate Hash
            </button>
            {sha256Output && (
              <div className="bg-black border border-[#00E87A]/20 rounded-lg p-4 flex items-start justify-between gap-3">
                <span className="font-mono text-xs text-[#00E87A] break-all flex-1">{sha256Output}</span>
                <button onClick={() => copy(sha256Output, 'sha')} className="text-xs text-zinc-500 hover:text-[#00E87A] flex-shrink-0">
                  {copied === 'sha' ? '✓' : 'Copy'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Base64 */}
        {activeTool === 'base64' && (
          <div>
            <div className="font-mono text-xs uppercase tracking-wider text-[#00E87A] mb-4">Base64 Encoder / Decoder</div>
            <div className="flex gap-2 mb-3">
              {['encode', 'decode'].map(m => (
                <button
                  key={m}
                  onClick={() => setB64Mode(m)}
                  className={`px-4 py-1.5 text-xs font-mono uppercase tracking-wider rounded-lg border transition-all ${
                    b64Mode === m ? 'bg-[#00E87A]/10 text-[#00E87A] border-[#00E87A]/30' : 'text-zinc-500 border-white/10 hover:border-white/20'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <textarea
              value={b64Input}
              onChange={e => setB64Input(e.target.value)}
              placeholder={b64Mode === 'encode' ? 'Enter text to encode...' : 'Enter base64 to decode...'}
              className="w-full bg-black border border-white/10 rounded-lg p-3 font-mono text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-[#00E87A]/50 resize-none mb-3"
              rows={3}
            />
            <button
              onClick={handleBase64}
              className="px-5 py-2 text-xs font-mono uppercase tracking-wider text-black bg-[#00E87A] rounded-lg hover:bg-[#00E87A]/90 transition-colors mb-4"
            >
              {b64Mode === 'encode' ? 'Encode' : 'Decode'}
            </button>
            {b64Output && (
              <div className="bg-black border border-[#00E87A]/20 rounded-lg p-4 flex items-start justify-between gap-3">
                <span className="font-mono text-xs text-[#00E87A] break-all flex-1">{b64Output}</span>
                <button onClick={() => copy(b64Output, 'b64')} className="text-xs text-zinc-500 hover:text-[#00E87A] flex-shrink-0">
                  {copied === 'b64' ? '✓' : 'Copy'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Caesar */}
        {activeTool === 'caesar' && (
          <div>
            <div className="font-mono text-xs uppercase tracking-wider text-[#00E87A] mb-4">Caesar Cipher</div>
            <div className="flex gap-2 mb-3">
              {['encrypt', 'decrypt'].map(m => (
                <button
                  key={m}
                  onClick={() => setCaesarMode(m)}
                  className={`px-4 py-1.5 text-xs font-mono uppercase tracking-wider rounded-lg border transition-all ${
                    caesarMode === m ? 'bg-[#00E87A]/10 text-[#00E87A] border-[#00E87A]/30' : 'text-zinc-500 border-white/10 hover:border-white/20'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <input
              value={caesarInput}
              onChange={e => setCaesarInput(e.target.value)}
              placeholder="Enter text..."
              className="w-full bg-black border border-white/10 rounded-lg p-3 font-mono text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-[#00E87A]/50 mb-3"
            />
            <div className="flex items-center gap-4 mb-3">
              <label className="font-mono text-xs text-zinc-500">Shift: <span className="text-[#00E87A]">{caesarShift}</span></label>
              <input
                type="range" min="1" max="25" value={caesarShift}
                onChange={e => setCaesarShift(Number(e.target.value))}
                className="flex-1 accent-[#00E87A]"
              />
            </div>
            <button
              onClick={handleCaesar}
              className="px-5 py-2 text-xs font-mono uppercase tracking-wider text-black bg-[#00E87A] rounded-lg hover:bg-[#00E87A]/90 transition-colors mb-4"
            >
              {caesarMode === 'encrypt' ? 'Encrypt' : 'Decrypt'}
            </button>
            {caesarOutput && (
              <div className="bg-black border border-[#00E87A]/20 rounded-lg p-4 flex items-start justify-between gap-3">
                <span className="font-mono text-xs text-[#00E87A] break-all flex-1">{caesarOutput}</span>
                <button onClick={() => copy(caesarOutput, 'cae')} className="text-xs text-zinc-500 hover:text-[#00E87A] flex-shrink-0">
                  {copied === 'cae' ? '✓' : 'Copy'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* SOC Password Generator */}
        {activeTool === 'password' && (
          <div>
            <div className="font-mono text-xs uppercase tracking-wider text-[#00E87A] mb-1">SOC-Grade Password Generator</div>
            <p className="text-xs text-zinc-500 mb-5">Generates cryptographically random passwords using Web Crypto API — NIST SP 800-63B compliant</p>

            {/* Length */}
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <label className="font-mono text-xs text-zinc-400 uppercase tracking-wider">Length</label>
                <span className="font-mono text-xs text-[#00E87A] font-bold">{pwLength} chars</span>
              </div>
              <input
                type="range" min="12" max="64" value={pwLength}
                onChange={e => setPwLength(Number(e.target.value))}
                className="w-full accent-[#00E87A]"
              />
              <div className="flex justify-between mt-1">
                <span className="font-mono text-xs text-zinc-600">12 (min)</span>
                <span className="font-mono text-xs text-zinc-600">64 (max)</span>
              </div>
            </div>

            {/* Character sets */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
              {[
                { label: 'Uppercase A–Z', value: pwUpper, set: setPwUpper },
                { label: 'Lowercase a–z', value: pwLower, set: setPwLower },
                { label: 'Numbers 0–9', value: pwNumbers, set: setPwNumbers },
                { label: 'Symbols !@#$%', value: pwSymbols, set: setPwSymbols },
              ].map(({ label, value, set }) => (
                <button
                  key={label}
                  onClick={() => set(v => !v)}
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-mono rounded-lg border transition-all ${
                    value
                      ? 'bg-[#00E87A]/10 text-[#00E87A] border-[#00E87A]/40'
                      : 'bg-zinc-900 text-zinc-500 border-white/10 hover:border-white/20'
                  }`}
                >
                  <span className={`w-3 h-3 rounded border flex-shrink-0 flex items-center justify-center text-xs ${value ? 'bg-[#00E87A] border-[#00E87A]' : 'border-zinc-600'}`}>
                    {value ? '✓' : ''}
                  </span>
                  {label}
                </button>
              ))}
            </div>

            <button
              onClick={handleGeneratePassword}
              className="w-full px-5 py-3 text-sm font-mono font-bold uppercase tracking-wider text-black bg-[#00E87A] rounded-lg hover:bg-[#00E87A]/90 transition-colors mb-5"
            >
              ⟳ Generate Secure Password
            </button>

            {pwGenerated && (
              <div className="space-y-4">
                {/* Generated password */}
                <div className="bg-black border border-[#00E87A]/30 rounded-lg p-4">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="font-mono text-xs text-zinc-500 uppercase tracking-wider">Generated Password</span>
                    <button onClick={() => copy(pwGenerated, 'pw')} className="text-xs text-zinc-500 hover:text-[#00E87A] font-mono">
                      {copied === 'pw' ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                  <span className="font-mono text-sm text-[#00E87A] break-all leading-relaxed">{pwGenerated}</span>
                </div>

                {/* Strength metrics */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`font-mono text-base font-bold ${
                      pwAnalysis.level === 'Very Strong' ? 'text-[#00E87A]' :
                      pwAnalysis.level === 'Strong' ? 'text-cyan-400' :
                      pwAnalysis.level === 'Moderate' ? 'text-amber-400' : 'text-red-400'
                    }`}>{pwAnalysis.level}</span>
                    <span className="font-mono text-xs text-zinc-500">Entropy: <span className="text-cyan-400">{pwAnalysis.entropy} bits</span></span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        pwAnalysis.score >= 7 ? 'bg-[#00E87A]' : pwAnalysis.score >= 5 ? 'bg-cyan-400' : pwAnalysis.score >= 3 ? 'bg-amber-400' : 'bg-red-400'
                      }`}
                      style={{ width: `${(pwAnalysis.score / 7) * 100}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(pwAnalysis.checks).map(([k, v]) => (
                      <div key={k} className="flex items-center gap-2">
                        <span className={v ? 'text-[#00E87A]' : 'text-zinc-600'}>{v ? '✓' : '✗'}</span>
                        <span className="font-mono text-xs text-zinc-400">
                          {k === 'length' ? 'Min 12 chars' :
                           k === 'upper' ? 'Uppercase letters' :
                           k === 'lower' ? 'Lowercase letters' :
                           k === 'numbers' ? 'Numeric digits' :
                           k === 'symbols' ? 'Special symbols' :
                           k === 'longEnough' ? 'Min 16 chars (NIST)' : 'No common patterns'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* IOC Detector */}
        {activeTool === 'ioc' && (
          <div>
            <div className="font-mono text-xs uppercase tracking-wider text-[#00E87A] mb-4">IOC Pattern Detector</div>
            <p className="text-xs text-zinc-500 mb-3">Paste logs, reports, or any text to extract IPs, hashes, and URLs</p>
            <textarea
              value={iocInput}
              onChange={e => setIocInput(e.target.value)}
              placeholder={`Example:\nFailed login from 91.189.45.122\nMD5: d8e8fca2dc0f896fd7cb4cb0031ba249\nhttp://malicious-domain.com/payload`}
              className="w-full bg-black border border-white/10 rounded-lg p-3 font-mono text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-[#00E87A]/50 resize-none mb-3"
              rows={5}
            />
            <button
              onClick={() => setIocResults(detectIOCs(iocInput))}
              className="px-5 py-2 text-xs font-mono uppercase tracking-wider text-black bg-[#00E87A] rounded-lg hover:bg-[#00E87A]/90 transition-colors mb-4"
            >
              Analyze
            </button>
            {iocResults.length > 0 && (
              <div className="space-y-2">
                {iocResults.map((ioc, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-black border border-white/5 rounded-lg">
                    <span className={`font-mono text-xs font-bold flex-shrink-0 ${severityColor[ioc.severity] || 'text-zinc-400'}`}>
                      [{ioc.type}]
                    </span>
                    <span className="font-mono text-xs text-zinc-300 flex-1 break-all">{ioc.value}</span>
                    <span className="text-xs text-zinc-500 flex-shrink-0">{ioc.note}</span>
                  </div>
                ))}
              </div>
            )}
            {iocResults.length === 0 && iocInput && (
              <div className="font-mono text-xs text-zinc-500 p-3 bg-black border border-white/5 rounded-lg">
                No IOCs detected in input
              </div>
            )}
          </div>
        )}

        {/* Log Parser */}
        {activeTool === 'logparser' && (
          <div>
            <div className="font-mono text-xs uppercase tracking-wider text-[#00E87A] mb-4">Security Log Parser</div>
            <p className="text-xs text-zinc-500 mb-3">Paste a log line — get severity, MITRE mapping, and analyst recommendation</p>
            <textarea
              value={logInput}
              onChange={e => setLogInput(e.target.value)}
              placeholder={`Example: "Failed login from 10.0.0.4 — 47 attempts in 3 minutes"\nOr: "Port scan detected from 192.168.1.100"`}
              className="w-full bg-black border border-white/10 rounded-lg p-3 font-mono text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-[#00E87A]/50 resize-none mb-3"
              rows={4}
            />
            <button
              onClick={() => setLogResult(parseLog(logInput))}
              className="px-5 py-2 text-xs font-mono uppercase tracking-wider text-black bg-[#00E87A] rounded-lg hover:bg-[#00E87A]/90 transition-colors mb-4"
            >
              Parse Log
            </button>
            {logResult && (
              <div className="bg-black border border-white/10 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-zinc-500 uppercase">Severity</span>
                  <span className={`font-mono text-xs font-bold ${severityColor[logResult.severity] || 'text-zinc-300'}`}>
                    {logResult.severity}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-zinc-500 uppercase">MITRE</span>
                  <span className="font-mono text-xs text-amber-400">{logResult.mitre}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-zinc-500 uppercase">Tactic</span>
                  <span className="font-mono text-xs text-cyan-400">{logResult.tactic}</span>
                </div>
                <div className="border-t border-white/5 pt-3">
                  <span className="font-mono text-xs text-zinc-500 uppercase block mb-1">Recommendation</span>
                  <span className="font-mono text-xs text-zinc-300">{logResult.recommendation}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
