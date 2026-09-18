import { cleanText, json, requireAdmin } from '../../../../_lib/auth.js';
import { tournamentError } from '../../../../_lib/tournament.js';

const REGISTRATION_STATES = new Set(['not_open', 'open', 'closed']);
const EVENT_STATES = new Set(['upcoming', 'live', 'completed']);

export async function onRequestPatch({ request, env, params }) {
  const auth = await requireAdmin(request, env, { csrf: true });
  if (auth.error) return auth.error;
  if (!(request.headers.get('content-type') || '').includes('application/json')) return tournamentError('JSON required', 415);
  let body;
  try { body = await request.json(); } catch { return tournamentError('Invalid JSON body'); }
  const event = await env.DB.prepare('SELECT title, event_status, registration_status FROM tournament_events WHERE id = ? LIMIT 1').bind(params.id).first();
  if (!event) return tournamentError('Tournament event not found', 404);
  const registrationStatus = body.registrationStatus === undefined ? event.registration_status : cleanText(body.registrationStatus, 20);
  const eventStatus = body.eventStatus === undefined ? event.event_status : cleanText(body.eventStatus, 20);
  if (!REGISTRATION_STATES.has(registrationStatus) || !EVENT_STATES.has(eventStatus)) return tournamentError('Invalid tournament availability state');
  const now = Math.floor(Date.now() / 1000);
  await env.DB.batch([
    env.DB.prepare('UPDATE tournament_events SET registration_status = ?, event_status = ?, updated_at = ? WHERE id = ?').bind(registrationStatus, eventStatus, now, params.id),
    env.DB.prepare('INSERT INTO admin_audit_log (actor_id, actor_name, action, entity_type, entity_id, detail, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(auth.session.discord_user_id, auth.session.username, 'availability', 'tournament_event', params.id, `${event.title} · registration ${registrationStatus}`, now)
  ]);
  return json({ ok: true, registrationStatus, eventStatus });
}
