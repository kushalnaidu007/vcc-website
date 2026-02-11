import { put, list } from '@vercel/blob';

const BLOB_NAME = 'matches.json';

const withCors = (res) => {
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type,X-Admin-Token');
  return res;
};

const readCurrent = async () => {
  const { blobs } = await list({ prefix: BLOB_NAME, limit: 1 });
  if (!blobs.length) return [];
  const response = await fetch(blobs[0].url);
  if (!response.ok) return [];
  const data = await response.json();
  return Array.isArray(data) ? data : [];
};

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return withCors(new Response(null, { status: 204 }));
  }

  if (request.method === 'GET') {
    const data = await readCurrent();
    return withCors(new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    }));
  }

  if (request.method !== 'POST') {
    return withCors(new Response('Method Not Allowed', { status: 405 }));
  }

  const token = request.headers.get('x-admin-token');
  if (!token || token !== process.env.VCC_ADMIN_TOKEN) {
    return withCors(new Response('Unauthorized', { status: 401 }));
  }

  const body = await request.json();
  const { title, summary, date, result, link } = body || {};
  if (!title || !summary || !date || !result) {
    return withCors(new Response('Missing fields', { status: 400 }));
  }

  const current = await readCurrent();
  const entry = {
    id: crypto.randomUUID(),
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

  return withCors(new Response(JSON.stringify(entry), {
    headers: { 'Content-Type': 'application/json' },
  }));
}
