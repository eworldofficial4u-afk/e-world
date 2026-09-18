import { requireAdmin } from '../../../../../../_lib/auth.js';
import { tournamentError } from '../../../../../../_lib/tournament.js';

export async function onRequestGet({ request, env, params }) {
  const auth = await requireAdmin(request, env);
  if (auth.error) return auth.error;
  if (!env.TOURNAMENT_UPLOADS) return tournamentError('Screenshot storage is unavailable', 503);
  const player = await env.DB.prepare('SELECT screenshot_object_key, screenshot_content_type FROM tournament_players WHERE id = ? AND registration_id = ? LIMIT 1').bind(params.playerId, params.id).first();
  if (!player) return tournamentError('Screenshot not found', 404);
  const object = await env.TOURNAMENT_UPLOADS.get(player.screenshot_object_key);
  if (!object) return tournamentError('Screenshot file is unavailable', 404);
  return new Response(object.body, { headers: { 'content-type': player.screenshot_content_type, 'cache-control': 'private, no-store', 'content-disposition': 'inline', 'x-content-type-options': 'nosniff', 'content-security-policy': "default-src 'none'; img-src 'self'" } });
}
