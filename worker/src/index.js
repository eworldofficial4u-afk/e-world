const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', ...headers }
});

const clean = (value, max) => String(value || '').trim().replace(/[<>]/g, '').slice(0, max);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const allowedOrigin = env.ALLOWED_ORIGIN || url.origin;
    const cors = { 'Access-Control-Allow-Origin': allowedOrigin, 'Vary': 'Origin' };

    if (origin && origin !== allowedOrigin) return json({ error: 'Origin not allowed' }, 403, cors);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...cors, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'content-type' } });
    if (url.pathname !== '/api/contact' || request.method !== 'POST') return json({ error: 'Not found' }, 404, cors);

    if (!env.DISCORD_WEBHOOK_URL) return json({ error: 'Relay not configured' }, 503, cors);
    const type = request.headers.get('content-type') || '';
    if (!type.includes('application/json')) return json({ error: 'JSON required' }, 415, cors);

    let body;
    try { body = await request.json(); } catch { return json({ error: 'Invalid request' }, 400, cors); }
    if (body.website) return json({ ok: true }, 200, cors);

    const name = clean(body.name, 60);
    const discord = clean(body.discord, 60) || 'Not provided';
    const message = clean(body.message, 1200);
    if (name.length < 2 || message.length < 8) return json({ error: 'Please complete all required fields' }, 400, cors);

    const payload = {
      username: 'E-WORLD Website',
      allowed_mentions: { parse: [] },
      embeds: [{
        title: '🌍 NEW COMMUNITY SIGNAL',
        color: 13038138,
        fields: [
          { name: 'Name', value: name, inline: true },
          { name: 'Discord', value: discord, inline: true },
          { name: 'Message', value: message }
        ],
        footer: { text: 'E-WORLD • One World. One Community.' },
        timestamp: new Date().toISOString()
      }]
    };

    const sent = await fetch(env.DISCORD_WEBHOOK_URL, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload)
    });
    if (!sent.ok) return json({ error: 'Message relay unavailable' }, 502, cors);
    return json({ ok: true }, 200, cors);
  }
};
