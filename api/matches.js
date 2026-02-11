const { put, list } = require('@vercel/blob');
const { randomUUID } = require('crypto');

const BLOB_NAME = 'matches.json';

const withCors = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,X-Admin-Token');
};

const readBody = async (req) => {
  if (req.body) return req.body;
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf-8');
  return raw ? JSON.parse(raw) : {};
};

const readCurrent = async () => {
  const { blobs } = await list({ prefix: BLOB_NAME, limit: 1 });
  if (!blobs.length) return [];
  const response = await fetch(blobs[0].url);
  if (!response.ok) return [];
  const data = await response.json();
  return Array.isArray(data) ? data : [];
};

module.exports = async (req, res) => {
  withCors(res);

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method === 'GET') {
    const data = await readCurrent();
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify(data));
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end('Method Not Allowed');
    return;
  }

  const token = req.headers['x-admin-token'];
  if (!token || token !== process.env.VCC_ADMIN_TOKEN) {
    res.statusCode = 401;
    res.end('Unauthorized');
    return;
  }

  const body = await readBody(req);
  const { title, summary, date, result, link } = body || {};
  if (!title || !summary || !date || !result) {
    res.statusCode = 400;
    res.end('Missing fields');
    return;
  }

  const current = await readCurrent();
  const entry = {
    id: randomUUID(),
    title: String(title),
    summary: String(summary),
    date: String(date),
    result: String(result),
    link: link ? String(link) : '',
    createdAt: new Date().toISOString(),
  };

  const next = [entry, ...current].slice(0, 50);
  await put(BLOB_NAME, JSON.stringify(next, null, 2), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
  });

  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 200;
  res.end(JSON.stringify(entry));
};
