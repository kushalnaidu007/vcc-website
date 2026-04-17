const getConfig = () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase env vars');
  }

  return { supabaseUrl, supabaseAnonKey };
};

const getBearerToken = (req) => {
  const header = req.headers.authorization || req.headers.Authorization;
  if (!header || typeof header !== 'string') return '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : '';
};

const getAllowedEmails = () =>
  String(process.env.SUPABASE_ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

const verifyAdmin = async (req) => {
  const accessToken = getBearerToken(req);
  if (!accessToken) return null;

  const { supabaseUrl, supabaseAnonKey } = getConfig();
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) return null;
  const user = await response.json();
  const allowedEmails = getAllowedEmails();

  if (allowedEmails.length) {
    const email = String(user.email || '').toLowerCase();
    if (!allowedEmails.includes(email)) return null;
  }

  return user;
};

module.exports = { getConfig, verifyAdmin };
