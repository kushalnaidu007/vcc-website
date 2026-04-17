const { put, list } = require('@vercel/blob');
const { randomUUID } = require('crypto');
const { verifyAdmin } = require('./_supabaseAuth');

const BLOB_NAME = 'news.json';

const withCors = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
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
  const { blobs } = await list({ prefix: BLOB_NAME, limit: 100 });
  if (!blobs.length) return [];
  const latest = [...blobs].sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  )[0];
  const response = await fetch(latest.url, { cache: 'no-store' });
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
    res.setHeader('Cache-Control', 'no-store');
    res.statusCode = 200;
    res.end(JSON.stringify(data));
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end('Method Not Allowed');
    return;
  }

  const user = await verifyAdmin(req);
  if (!user) {
    res.statusCode = 401;
    res.end('Unauthorized');
    return;
  }

  const body = await readBody(req);
  const { action = 'create' } = body || {};
  const current = await readCurrent();

  let next = current;
  let entry = null;

  if (action === 'create') {
    const { title, summary, date, link } = body || {};
    if (!title || !summary || !date) {
      res.statusCode = 400;
      res.end('Missing fields');
      return;
    }
    entry = {
      id: randomUUID(),
      title: String(title),
      summary: String(summary),
      date: String(date),
      link: link ? String(link) : '',
      archived: false,
      createdAt: new Date().toISOString(),
    };
    next = [entry, ...current].slice(0, 50);
  } else if (action === 'update') {
    const { id, title, summary, date, link } = body || {};
    if (!id || !title || !summary || !date) {
      res.statusCode = 400;
      res.end('Missing fields');
      return;
    }
    next = current.map((item) =>
      item.id === id
        ? {
            ...item,
            title: String(title),
            summary: String(summary),
            date: String(date),
            link: link ? String(link) : '',
            updatedAt: new Date().toISOString(),
          }
        : item
    );
    entry = next.find((item) => item.id === id) || null;
    if (!entry) {
      res.statusCode = 404;
      res.end('Item not found');
      return;
    }
  } else if (action === 'delete') {
    const { id } = body || {};
    if (!id) {
      res.statusCode = 400;
      res.end('Missing id');
      return;
    }
    next = current.filter((item) => item.id !== id);
  } else if (action === 'archive' || action === 'unarchive') {
    const { id } = body || {};
    if (!id) {
      res.statusCode = 400;
      res.end('Missing id');
      return;
    }
    const archived = action === 'archive';
    next = current.map((item) =>
      item.id === id ? { ...item, archived, updatedAt: new Date().toISOString() } : item
    );
    entry = next.find((item) => item.id === id) || null;
    if (!entry) {
      res.statusCode = 404;
      res.end('Item not found');
      return;
    }
  } else {
    res.statusCode = 400;
    res.end('Invalid action');
    return;
  }

  await put(BLOB_NAME, JSON.stringify(next, null, 2), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
  });

  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 200;
  res.end(JSON.stringify(entry || { ok: true }));
};
