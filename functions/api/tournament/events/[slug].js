import { eventBySlug, tournamentError } from '../../../_lib/tournament.js';
import { json } from '../../../_lib/auth.js';

export async function onRequestGet({ env, params }) {
  if (!env.DB) return tournamentError('Tournament service is unavailable', 503);
  const event = await eventBySlug(env, params.slug);
  if (!event) return tournamentError('Tournament not found', 404);
  return json({ event });
}
