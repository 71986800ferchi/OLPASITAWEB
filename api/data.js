export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { key } = req.query;
  if (!key) return res.status(400).json({ error: 'key requerida' });

  const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
  const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    if (req.method === 'GET') return res.status(200).json({ value: null });
    return res.status(200).json({ ok: true });
  }

  try {
    if (req.method === 'GET') {
      const r = await fetch(`${UPSTASH_URL}/get/${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` }
      });
      const data = await r.json();
      return res.status(200).json({ value: data.result ?? null });
    }
    if (req.method === 'POST') {
      const { value } = req.body;
      await fetch(`${UPSTASH_URL}/set/${encodeURIComponent(key)}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${UPSTASH_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify([value, 'EX', 31536000])
      });
      return res.status(200).json({ ok: true });
    }
  } catch (e) {
    if (req.method === 'GET') return res.status(200).json({ value: null });
    return res.status(200).json({ ok: true });
  }
}
