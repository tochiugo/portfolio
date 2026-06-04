// Live Mission Control proxy.
// The polymarket-bot's local bridge pushes a sanitized status to a GitHub Gist
// every ~20s. This function reads it fresh via the GitHub API (no CDN cache) and
// serves it to the site from a stable same-origin URL (/api/status).
export default async function handler(req, res) {
  const GIST_ID = process.env.GIST_ID;
  const TOKEN = process.env.GH_GIST_TOKEN;
  // edge-cache briefly so traffic spikes don't hammer the GitHub API
  res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate=30');
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (!GIST_ID) {
    return res.status(200).json({ status: 'unconfigured', source: 'none' });
  }
  try {
    const headers = { 'User-Agent': 'tochi-portfolio', Accept: 'application/vnd.github+json' };
    if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;
    const r = await fetch(`https://api.github.com/gists/${GIST_ID}`, { headers });
    if (!r.ok) throw new Error(`gist api ${r.status}`);
    const gist = await r.json();
    const file = gist.files['live_status.json'] || Object.values(gist.files)[0];
    let content = file?.content;
    // gists truncate large files; fetch raw_url if so
    if (file?.truncated && file?.raw_url) {
      content = await (await fetch(file.raw_url, { headers: { 'User-Agent': 'tochi-portfolio' } })).text();
    }
    const data = JSON.parse(content);
    data._proxy_at = new Date().toISOString();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(200).json({ status: 'error', source: 'proxy', error: String(e).slice(0, 120) });
  }
}
