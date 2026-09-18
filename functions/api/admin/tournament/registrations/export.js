import { cleanText, requireAdmin } from '../../../../_lib/auth.js';
import { REGISTRATION_STATUSES } from '../../../../_lib/tournament.js';
import { safeCsv } from '../../../../_lib/security.js';

const csv = safeCsv;

export async function onRequestGet({ request, env }) {
  const auth = await requireAdmin(request, env);
  if (auth.error) return auth.error;
  const url = new URL(request.url);
  const status = cleanText(url.searchParams.get('status'), 24);
  const eventId = cleanText(url.searchParams.get('event'), 80);
  const conditions = [];
  const bindings = [];
  if (status && status !== 'all' && REGISTRATION_STATUSES.has(status)) { conditions.push('r.status = ?'); bindings.push(status); }
  if (eventId && eventId !== 'all') { conditions.push('r.event_id = ?'); bindings.push(eventId); }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const result = await env.DB.prepare(`SELECT r.public_registration_id, r.team_name, r.captain_name, r.captain_discord_username, r.status, r.submitted_at, SUM(CASE WHEN p.player_type = 'starter' THEN 1 ELSE 0 END) player_count, SUM(CASE WHEN p.player_type = 'substitute' THEN 1 ELSE 0 END) substitute_count FROM tournament_registrations r LEFT JOIN tournament_players p ON p.registration_id = r.id ${where} GROUP BY r.id ORDER BY r.submitted_at DESC LIMIT 5000`).bind(...bindings).all();
  const rows = [['Registration ID', 'Team', 'Captain', 'Captain Discord', 'Player Count', 'Substitute Count', 'Status', 'Submitted At']];
  for (const item of result.results || []) rows.push([item.public_registration_id, item.team_name, item.captain_name, item.captain_discord_username, item.player_count, item.substitute_count, item.status, new Date(item.submitted_at * 1000).toISOString()]);
  return new Response(rows.map(row => row.map(csv).join(',')).join('\r\n'), { headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': 'attachment; filename="eworld-tournament-registrations.csv"', 'cache-control': 'private, no-store', 'x-content-type-options': 'nosniff' } });
}
