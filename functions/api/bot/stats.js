import { json, sha256 } from '../../_lib/auth.js';
export async function onRequestPost({ request, env }) {
  if (!env.DB || !env.BOT_STATS_SECRET) return json({ error: 'Unavailable' }, 503);
  const supplied = request.headers.get('authorization') || '';
  if (supplied.length > 256 || await sha256(supplied) !== await sha256(`Bearer ${env.BOT_STATS_SECRET}`)) return json({ error: 'Unauthorized' }, 401);
  if (!(request.headers.get('content-type') || '').includes('application/json')) return json({ error: 'JSON required' }, 415);
  const raw = await request.text();
  if (new TextEncoder().encode(raw).length > 4096) return json({ error: 'Too large' }, 413);
  let body;
  try { body = JSON.parse(raw); } catch { return json({ error: 'Invalid JSON' }, 400); }
  const validGuilds = ['1539496402890133574', '1555477347950665728'];
  if (!body || !validGuilds.includes(body.guildId)) return json({ error: 'Invalid guild' }, 400);
  const keys = ['online','idle','dnd','totalMembers','voiceConnected','voiceChannels','activeVoiceChannels','boosts','roles'];
  const payload = { guildId: body.guildId, source: 'bot', members: [], activeVoice: [], invite: 'https://discord.gg/ewld' };
  for (const key of keys) {
    if (!Number.isInteger(body[key]) || body[key] < 0 || body[key] > 10000000) return json({ error: `Invalid ${key}` }, 400);
    payload[key] = body[key];
  }
  payload.updatedAt = new Date().toISOString();
  const now = Math.floor(Date.now() / 1000);
  await env.DB.prepare('INSERT INTO discord_bot_stats(guild_id,payload_json,updated_at) VALUES(?,?,?) ON CONFLICT(guild_id) DO UPDATE SET payload_json=excluded.payload_json, updated_at=excluded.updated_at').bind(body.guildId, JSON.stringify(payload), now).run();
  return json({ ok: true });
}
