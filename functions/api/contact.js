const reply = (data, status = 200, origin = '*') => new Response(JSON.stringify(data), {
  status,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': origin,
    'vary': 'Origin',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff'
  }
});

const clean = (value, max) => String(value || '')
  .trim()
  .replace(/[<>]/g, '')
  .slice(0, max);

export async function onRequestOptions({ request, env }) {
  const origin = request.headers.get('Origin') || '';
  const allowed = env.ALLOWED_ORIGIN || 'https://e-world-community.pages.dev';
  if (origin && allowed && origin !== allowed) return reply({ error: 'Origin not allowed' }, 403, allowed);
  return new Response(null, {
    status: 204,
    headers: {
      'access-control-allow-origin': allowed || '*',
      'access-control-allow-methods': 'POST, OPTIONS',
      'access-control-allow-headers': 'content-type',
      'access-control-max-age': '86400'
    }
  });
}

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get('Origin') || '';
  const allowed = env.ALLOWED_ORIGIN || 'https://e-world-community.pages.dev';
  if (origin && allowed && origin !== allowed) return reply({ error: 'Origin not allowed' }, 403, allowed);
  if (!env.DISCORD_WEBHOOK_URL) return reply({ error: 'Contact relay is not configured yet' }, 503, allowed);
  if (!(request.headers.get('content-type') || '').includes('application/json')) return reply({ error: 'JSON required' }, 415, allowed);

  let body;
  try { body = await request.json(); } catch { return reply({ error: 'Invalid form data' }, 400, allowed); }
  if (body.website) return reply({ ok: true, message: 'Signal received' }, 200, allowed);

  const name = clean(body.name, 60);
  const discord = clean(body.discord, 60) || 'Not provided';
  const message = clean(body.message, 1200);
  if (name.length < 2) return reply({ error: 'Please enter your name' }, 400, allowed);
  if (message.length < 8) return reply({ error: 'Your message must contain at least 8 characters' }, 400, allowed);

  const reference = `EW-${Date.now().toString(36).toUpperCase()}`;
  const discordResponse = await fetch(env.DISCORD_WEBHOOK_URL, {
    signal: AbortSignal.timeout(10000),
    redirect: 'error',
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      username: 'E-WORLD Website',
      allowed_mentions: { parse: [] },
      embeds: [{
        author: { name: 'E-WORLD / COMMUNITY RELAY' },
        title: '🌍 CONTACT THE COMMUNITY',
        description: message,
        color: 13038138,
        fields: [
          { name: 'NAME', value: name, inline: true },
          { name: 'DISCORD', value: discord, inline: true },
          { name: 'REFERENCE', value: reference, inline: false }
        ],
        footer: { text: 'E-WORLD • One World. One Community.' },
        timestamp: new Date().toISOString()
      }]
    })
  });

  if (!discordResponse.ok) return reply({ error: 'Discord relay is temporarily unavailable' }, 502, allowed);
  return reply({ ok: true, message: 'Your message was delivered to E-WORLD staff', reference }, 200, allowed);
}
