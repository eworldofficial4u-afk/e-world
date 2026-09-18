import { cleanText, json, requireAdmin } from '../../../_lib/auth.js';
import { boundedPage, REGISTRATION_STATUSES } from '../../../_lib/tournament.js';

export async function onRequestGet({ request, env }) {
  const auth = await requireAdmin(request, env);
  if (auth.error) return auth.error;
  const url = new URL(request.url);
  const page = boundedPage(url.searchParams.get('page'));
  const pageSize = 20;
  const status = cleanText(url.searchParams.get('status'), 24);
  const eventId = cleanText(url.searchParams.get('event'), 80);
  const search = cleanText(url.searchParams.get('search'), 80);
  const conditions = [];
  const bindings = [];
  if (status && status !== 'all' && REGISTRATION_STATUSES.has(status)) { conditions.push('r.status = ?'); bindings.push(status); }
  if (eventId && eventId !== 'all') { conditions.push('r.event_id = ?'); bindings.push(eventId); }
  if (search) { conditions.push('(r.public_registration_id LIKE ? OR r.team_name LIKE ? OR r.captain_name LIKE ? OR r.captain_discord_username LIKE ?)'); const term = `%${search}%`; bindings.push(term, term, term, term); }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const listSql = `SELECT r.id, r.public_registration_id, r.event_id, e.title event_title, r.team_name, r.captain_name, r.captain_discord_username, r.status, r.submitted_at, r.updated_at, SUM(CASE WHEN p.player_type = 'starter' THEN 1 ELSE 0 END) player_count, SUM(CASE WHEN p.player_type = 'substitute' THEN 1 ELSE 0 END) substitute_count FROM tournament_registrations r JOIN tournament_events e ON e.id = r.event_id LEFT JOIN tournament_players p ON p.registration_id = r.id ${where} GROUP BY r.id ORDER BY r.submitted_at DESC LIMIT ? OFFSET ?`;
  const countSql = `SELECT COUNT(*) total FROM tournament_registrations r ${where}`;
  const [list, count, stats, events] = await Promise.all([
    env.DB.prepare(listSql).bind(...bindings, pageSize, (page - 1) * pageSize).all(),
    env.DB.prepare(countSql).bind(...bindings).first(),
    env.DB.prepare("SELECT COUNT(*) total, SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) pending, SUM(CASE WHEN status = 'under_review' THEN 1 ELSE 0 END) under_review, SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) approved, SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) rejected, (SELECT COUNT(*) FROM tournament_players) total_players FROM tournament_registrations").first(),
    env.DB.prepare('SELECT id, title, event_status, registration_status FROM tournament_events ORDER BY starts_at DESC').all()
  ]);
  return json({ registrations: list.results || [], total: Number(count?.total || 0), page, pageSize, stats: stats || {}, events: events.results || [] });
}
