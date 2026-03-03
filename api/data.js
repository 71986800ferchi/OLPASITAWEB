// api/data.js — usa REDIS_URL que Upstash inyecta automáticamente
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { key } = req.query;
  if (!key) return res.status(400).json({ error: 'key requerida' });

  const redisUrl = process.env.REDIS_URL || process.env.STORAGE_URL;
  if (!redisUrl) return res.status(500).json({ error: 'REDIS_URL no configurada' });

  // Parse Redis URL: redis://:password@host:port
  let host, port, password;
  try {
    const url = new URL(redisUrl);
    host = url.hostname;
    port = url.port || 6379;
    password = url.password || url.username;
  } catch(e) {
    return res.status(500).json({ error: 'Redis URL inválida: ' + e.message });
  }

  async function redisCmd(args) {
    const cmd = args.map(a => {
      const s = String(a);
      return `$${Buffer.byteLength(s)}\r\n${s}\r\n`;
    }).join('');
    const body = `*${args.length}\r\n${cmd}`;

    const protocol = redisUrl.startsWith('rediss') ? 'https' : 'http';
    const baseUrl = `${protocol}://${host}:${port}`;

    // Use Upstash REST API if available (rediss:// with upstash.io)
    if (redisUrl.includes('upstash.io') || redisUrl.includes('upstash')) {
      const restUrl = redisUrl
        .replace('rediss://', 'https://')
        .replace('redis://', 'http://')
        .replace(`:${password}@`, '@')
        .replace(/@([^:]+):(\d+)/, '/$1');

      // Extract token and endpoint for Upstash REST
      const upstashEndpoint = `https://${host}`;
      const upstashToken = password;

      const response = await fetch(`${upstashEndpoint}/${args.join('/')}`, {
        method: args[0] === 'GET' ? 'GET' : 'POST',
        headers: {
          'Authorization': `Bearer ${upstashToken}`,
          'Content-Type': 'application/json'
        },
        body: args[0] !== 'GET' ? JSON.stringify(args.slice(1)) : undefined
      });
      return await response.json();
    }
    return null;
  }

  try {
    // Use Upstash HTTP REST API directly
    const upstashEndpoint = `https://${host}`;
    const upstashToken = password;

    if (req.method === 'GET') {
      const response = await fetch(`${upstashEndpoint}/get/${encodeURIComponent(key)}`, {
        headers: { 'Authorization': `Bearer ${upstashToken}` }
      });
      const data = await response.json();
      return res.status(200).json({ value: data.result ?? null });
    }

    if (req.method === 'POST') {
      const { value } = req.body;
      const response = await fetch(`${upstashEndpoint}/set/${encodeURIComponent(key)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${upstashToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([value])
      });
      const data = await response.json();
      return res.status(200).json({ ok: true, result: data.result });
    }

  } catch (error) {
    console.error('Redis error:', error);
    return res.status(500).json({ error: error.message });
  }
}
