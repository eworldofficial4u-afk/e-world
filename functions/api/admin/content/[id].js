import { cleanText, json, requireAdmin } from '../../../_lib/auth.js';

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

export async function onRequestPatch({ request, env, params }) {
  const auth = await requireAdmin(request, env, { csrf: true });
  if (auth.error) return auth.error;
  const existing = await env.DB.prepare('SELECT * FROM content_items WHERE id = ?').bind(params.id).first();
  if (!existing) return json({ error: 'Content item not found' }, 404);
  if (!(request.headers.get('content-type') || '').includes('application/json')) return json({ error: 'JSON required' }, 415);
  if (Number(request.headers.get('content-length') || 0) > 20_000) return json({ error: 'Request too large' }, 413);
  let body;
  try { body = await request.json(); } catch { return json({ error: 'Invalid JSON body' }, 400); }
  const next = {
    type: body.type === undefined ? existing.type : cleanText(body.type, 20),
    title: body.title === undefined ? existing.title : cleanText(body.title, 100),
    description: body.description === undefined ? existing.description : cleanText(body.description, 1000),
    startsAt: body.startsAt === undefined ? existing.starts_at : isoOrNull(body.startsAt),
    endsAt: body.endsAt === undefined ? existing.ends_at : isoOrNull(body.endsAt),
    participantCount: body.participantCount === undefined ? existing.participant_count : boundedNumber(body.participantCount),
    status: body.status === undefined ? existing.status : cleanText(body.status, 20),
    notificationEnabled: body.notificationEnabled === undefined ? existing.notification_enabled : body.notificationEnabled ? 1 : 0,
    metadata: body.metadata === undefined ? existing.metadata_json : JSON.stringify(cleanMetadata(body.type === undefined ? existing.type : cleanText(body.type, 20), body.metadata))
  };
  if (!TYPES.has(next.type) || !STATUSES.has(next.status) || next.title.length < 2) return json({ error: 'Invalid update' }, 400);
  if (next.status === 'active' && next.type === 'giveaway' && !next.endsAt) return json({ error: 'Active giveaways require an end time' }, 400);
  if (next.status === 'active' && next.type === 'event' && !next.startsAt) return json({ error: 'Active events require a start time' }, 400);
  if (next.startsAt && next.endsAt && new Date(next.endsAt) <= new Date(next.startsAt)) return json({ error: 'End time must be after start time' }, 400);
  if (next.status === 'active' && ['giveaway', 'community'].includes(next.type)) {
    const conflict = await env.DB.prepare("SELECT id FROM content_items WHERE type = ? AND status = 'active' AND id != ? LIMIT 1").bind(next.type, params.id).first();
    if (conflict) return json({ error: `Another ${next.type} is already active. Complete or cancel it first.` }, 409);
  }
  const now = Math.floor(Date.now() / 1000);
  try {
    await env.DB.batch([
      env.DB.prepare('UPDATE content_items SET type = ?, title = ?, description = ?, starts_at = ?, ends_at = ?, participant_count = ?, status = ?, notification_enabled = ?, metadata_json = ?, updated_at = ? WHERE id = ?')
        .bind(next.type, next.title, next.description, next.startsAt, next.endsAt, next.participantCount, next.status, next.notificationEnabled, next.metadata, now, params.id),
      env.DB.prepare('INSERT INTO admin_audit_log (actor_id, actor_name, action, entity_type, entity_id, detail, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .bind(auth.session.discord_user_id, auth.session.username, 'update', next.type, params.id, next.title, now)
    ]);
  } catch (error) {
    if (String(error).includes('UNIQUE')) return json({ error: `Another ${next.type} is already active.` }, 409);
    throw error;
  }
  return json({ ok: true });
}

export async function onRequestDelete({ request, env, params }) {
  const auth = await requireAdmin(request, env, { csrf: true });
  if (auth.error) return auth.error;
  const existing = await env.DB.prepare('SELECT type, title FROM content_items WHERE id = ?').bind(params.id).first();
  if (!existing) return json({ error: 'Content item not found' }, 404);
  const now = Math.floor(Date.now() / 1000);
  await env.DB.batch([
    env.DB.prepare('DELETE FROM content_items WHERE id = ?').bind(params.id),
    env.DB.prepare('INSERT INTO admin_audit_log (actor_id, actor_name, action, entity_type, entity_id, detail, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(auth.session.discord_user_id, auth.session.username, 'delete', existing.type, params.id, existing.title, now)
  ]);
  return json({ ok: true });
}
