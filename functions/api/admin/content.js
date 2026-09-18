import { cleanText, json, requireAdmin } from '../../_lib/auth.js';

const TYPES = new Set(['giveaway', 'community', 'event', 'alert']);
const STATUSES = new Set(['draft', 'active', 'completed', 'cancelled']);
const isoOrNull = value => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const boundedNumber = (value, max = 10_000_000) => Math.max(0, Math.min(max, Number.parseInt(value, 10) || 0));
const cleanMetadata = (type, input) => {
  const source = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  if (type === 'giveaway') return {
    grandPrize: cleanText(source.grandPrize, 80), bonusPrizes: cleanText(source.bonusPrizes, 100),
    communityRewards: cleanText(source.communityRewards, 100), participantGoal: boundedNumber(source.participantGoal)
  };
  if (type === 'community') return {
    channels: boundedNumber(source.channels, 100_000), roles: boundedNumber(source.roles, 100_000),
    boosts: boundedNumber(source.boosts, 100_000), onlineLabel: cleanText(source.onlineLabel, 24).toUpperCase()
  };
  return {};
};

export async function onRequestGet({ request, env }) {
  const auth = await requireAdmin(request, env);
  if (auth.error) return auth.error;
  const items = await env.DB.prepare('SELECT * FROM content_items ORDER BY CASE status WHEN \'active\' THEN 0 WHEN \'draft\' THEN 1 ELSE 2 END, COALESCE(ends_at, starts_at) ASC, updated_at DESC LIMIT 200').all();
  const audit = await env.DB.prepare('SELECT actor_name, action, entity_type, entity_id, detail, created_at FROM admin_audit_log ORDER BY created_at DESC LIMIT 30').all();
  return json({ items: items.results || [], audit: audit.results || [] });
}

export async function onRequestPost({ request, env }) {
  const auth = await requireAdmin(request, env, { csrf: true });
  if (auth.error) return auth.error;
  if (!(request.headers.get('content-type') || '').includes('application/json')) return json({ error: 'JSON required' }, 415);
  if (Number(request.headers.get('content-length') || 0) > 20_000) return json({ error: 'Request too large' }, 413);
  let body;
  try { body = await request.json(); } catch { return json({ error: 'Invalid JSON body' }, 400); }
  const type = cleanText(body.type, 20);
  const status = cleanText(body.status || 'draft', 20);
  const title = cleanText(body.title, 100);
  const description = cleanText(body.description, 1000);
  const startsAt = isoOrNull(body.startsAt);
  const endsAt = isoOrNull(body.endsAt);
  const participants = boundedNumber(body.participantCount);
  if (!TYPES.has(type) || !STATUSES.has(status)) return json({ error: 'Invalid content type or status' }, 400);
  if (title.length < 2) return json({ error: 'Title must contain at least 2 characters' }, 400);
  if (status === 'active' && type === 'giveaway' && !endsAt) return json({ error: 'Active giveaways require an end time' }, 400);
  if (status === 'active' && type === 'event' && !startsAt) return json({ error: 'Active events require a start time' }, 400);
  if (startsAt && endsAt && new Date(endsAt) <= new Date(startsAt)) return json({ error: 'End time must be after start time' }, 400);
  if (status === 'active' && ['giveaway', 'community'].includes(type)) {
    const conflict = await env.DB.prepare("SELECT id FROM content_items WHERE type = ? AND status = 'active' LIMIT 1").bind(type).first();
    if (conflict) return json({ error: `Another ${type} is already active. Complete or cancel it first.` }, 409);
  }
  const id = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);
  const notification = body.notificationEnabled === false ? 0 : 1;
  const metadata = JSON.stringify(cleanMetadata(type, body.metadata));
  try {
    await env.DB.batch([
      env.DB.prepare('INSERT INTO content_items (id, type, title, description, starts_at, ends_at, participant_count, status, notification_enabled, metadata_json, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .bind(id, type, title, description, startsAt, endsAt, participants, status, notification, metadata, auth.session.discord_user_id, now, now),
      env.DB.prepare('INSERT INTO admin_audit_log (actor_id, actor_name, action, entity_type, entity_id, detail, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .bind(auth.session.discord_user_id, auth.session.username, 'create', type, id, title, now)
    ]);
  } catch (error) {
    if (String(error).includes('UNIQUE')) return json({ error: `Another ${type} is already active.` }, 409);
    throw error;
  }
  return json({ ok: true, id }, 201);
}
