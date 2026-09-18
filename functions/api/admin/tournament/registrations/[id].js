import { cleanText, json, requireAdmin } from '../../../../_lib/auth.js';
import { REGISTRATION_STATUSES, tournamentError } from '../../../../_lib/tournament.js';

export async function onRequestGet({ request, env, params }) {
  const auth = await requireAdmin(request, env);
  if (auth.error) return auth.error;
  const registration = await env.DB.prepare('SELECT r.*, e.title event_title, e.slug event_slug FROM tournament_registrations r JOIN tournament_events e ON e.id = r.event_id WHERE r.id = ? LIMIT 1').bind(params.id).first();
  if (!registration) return tournamentError('Registration not found', 404);
  const players = await env.DB.prepare('SELECT id, player_type, roster_position, discord_username, in_game_name, uid, streamer_mode, screenshot_content_type, screenshot_size FROM tournament_players WHERE registration_id = ? ORDER BY CASE player_type WHEN \'starter\' THEN 0 ELSE 1 END, roster_position').bind(params.id).all();
  return json({ registration, players: players.results || [] });
}

export async function onRequestPatch({ request, env, params }) {
  const auth = await requireAdmin(request, env, { csrf: true });
  if (auth.error) return auth.error;
  if (!(request.headers.get('content-type') || '').includes('application/json')) return tournamentError('JSON required', 415);
  if (Number(request.headers.get('content-length') || 0) > 10_000) return tournamentError('Request too large', 413);
  let body;
  try { body = await request.json(); } catch { return tournamentError('Invalid JSON body'); }
  const current = await env.DB.prepare('SELECT public_registration_id, team_name, status, staff_notes FROM tournament_registrations WHERE id = ? LIMIT 1').bind(params.id).first();
  if (!current) return tournamentError('Registration not found', 404);
  const status = body.status === undefined ? current.status : cleanText(body.status, 24);
  const staffNotes = body.staffNotes === undefined ? current.staff_notes : cleanText(body.staffNotes, 2000);
  if (!REGISTRATION_STATUSES.has(status)) return tournamentError('Invalid registration status');
  const now = Math.floor(Date.now() / 1000);
  await env.DB.batch([
    env.DB.prepare('UPDATE tournament_registrations SET status = ?, staff_notes = ?, updated_at = ?, reviewed_at = ?, reviewed_by = ? WHERE id = ?').bind(status, staffNotes, now, now, auth.session.discord_user_id, params.id),
    env.DB.prepare('INSERT INTO admin_audit_log (actor_id, actor_name, action, entity_type, entity_id, detail, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(auth.session.discord_user_id, auth.session.username, status === current.status ? 'notes' : `status:${status}`, 'tournament_registration', params.id, `${current.public_registration_id} · ${current.team_name}`, now)
  ]);
  return json({ ok: true, status, staffNotes });
}
