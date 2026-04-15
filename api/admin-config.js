const { getConfig } = require('./_supabaseAuth');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.end('Method Not Allowed');
    return;
  }

  try {
    const { supabaseUrl, supabaseAnonKey } = getConfig();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    res.statusCode = 200;
    res.end(JSON.stringify({ supabaseUrl, supabaseAnonKey }));
  } catch (error) {
    res.statusCode = 500;
    res.end('Supabase config is not available');
  }
};
