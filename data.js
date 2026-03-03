// api/data.js — GET y POST para guardar/leer datos del SGC
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { key } = req.query;
  if (!key) return res.status(400).json({ error: 'key requerida' });

  try {
    if (req.method === 'GET') {
      const value = await kv.get(key);
      return res.status(200).json({ value: value ?? null });
    }
    if (req.method === 'POST') {
      const { value } = req.body;
      await kv.set(key, value);
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('KV error:', error);
    return res.status(500).json({ error: error.message });
  }
}
