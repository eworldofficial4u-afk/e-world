import { cleanText, json, requireSameOrigin } from '../../_lib/auth.js';
import { eventBySlug, normalizeUid, publicReference, submissionKey, tournamentError } from '../../_lib/tournament.js';

const validPlayer = (player, type, position) => {
  const discordUsername = cleanText(player?.discordUsername, 64);
  const inGameName = cleanText(player?.inGameName, 64);
  const uid = cleanText(player?.uid, 64);
  const uidNormalized = normalizeUid(uid);
  const streamerMode = player?.streamerMode === 'enabled' ? 1 : player?.streamerMode === 'disabled' ? 0 : null;
  if (discordUsername.length < 2) return { error: `Enter the Discord username for ${type} ${position}.`, field: `${type}-${position}-discord` };
  if (inGameName.length < 2) return { error: `Enter the in-game name for ${type} ${position}.`, field: `${type}-${position}-ign` };
  if (uidNormalized.length < 4) return { error: `Enter a valid UID for ${type} ${position}.`, field: `${type}-${position}-uid` };
  if (streamerMode === null) return { error: `Choose Streamer Mode status for ${type} ${position}.`, field: `${type}-${position}-streamer` };
  return { discordUsername, inGameName, uid, uidNormalized, streamerMode };
};

export async function onRequestPost({ request, env }) {
  if (!requireSameOrigin(request, env)) return tournamentError('Origin not allowed', 403);
  if (!env.DB) return tournamentError('Registration service is unavailable', 503);
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) return tournamentError('JSON form data is required', 415);
  const reader = request.body?.getReader();
  if (!reader) return tournamentError('Registration details are required');
  let size = 0;
  const chunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 16384) { await reader.cancel(); return tournamentError('Registration is too large', 413); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  let body;
  try { body = JSON.parse(new TextDecoder().decode(bytes)); } catch { return tournamentError('Registration details are invalid'); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return tournamentError('Registration details are invalid');
  if (body.website) return json({ ok: true, publicRegistrationId: 'EW-RECEIVED' }, 202);

  const event = await eventBySlug(env, body.eventSlug);
  if (!event) return tournamentError('Tournament not found', 404);
  if (event.registration_status !== 'open') return tournamentError('Registration is currently closed', 409);

  const now = Math.floor(Date.now() / 1000);
  const attemptKey = await submissionKey(request, env, event.id);
  const limit = await env.DB.prepare('SELECT attempts, window_started FROM tournament_submission_limits WHERE attempt_key = ?').bind(attemptKey).first();
  const withinWindow = limit && now - Number(limit.window_started) < 3600;
  if (withinWindow && Number(limit.attempts) >= 5) return tournamentError('Too many registration attempts. Try again later.', 429);
  const attempts = withinWindow ? Number(limit.attempts) + 1 : 1;
  const windowStarted = withinWindow ? Number(limit.window_started) : now;
  await env.DB.prepare('INSERT INTO tournament_submission_limits (attempt_key, event_id, window_started, attempts, updated_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(attempt_key) DO UPDATE SET event_id = excluded.event_id, window_started = excluded.window_started, attempts = excluded.attempts, updated_at = excluded.updated_at')
    .bind(attemptKey, event.id, windowStarted, attempts, now).run();

  const teamName = cleanText(body.teamName, 80);
  const captainName = cleanText(body.captainName, 80);
  const captainDiscordUsername = cleanText(body.captainDiscordUsername, 64);
  const captainDiscordId = cleanText(body.captainDiscordId, 24).replace(/\D/g, '');
  const captainContact = cleanText(body.captainContact, 100);
  const notes = cleanText(body.notes, 800);
  if (teamName.length < 2) return tournamentError('Enter a team name', 400, 'team-name');
  if (captainName.length < 2) return tournamentError('Enter the team captain', 400, 'captain-name');
  if (captainDiscordUsername.length < 2) return tournamentError('Enter the captain Discord username', 400, 'captain-discord');
  if (body.captainDiscordId && !/^\d{17,20}$/.test(String(body.captainDiscordId))) return tournamentError('Captain Discord User ID must contain 17–20 digits', 400, 'captain-discord-id');
  if (captainContact.length < 2) return tournamentError('Enter captain contact information', 400, 'captain-contact');

  const starters = Array.isArray(body.starters) ? body.starters : [];
  const substitutes = Array.isArray(body.substitutes) ? body.substitutes : [];
  if (starters.length !== 5) return tournamentError('Exactly five starting players are required', 400, 'roster');
  if (substitutes.length > 2) return tournamentError('A maximum of two substitutes is allowed', 400, 'roster');
  if (![body.confirmAccurate, body.confirmAuthorized, body.confirmRules, body.confirmPenalties].every(value => value === true)) return tournamentError('All rule confirmations are required', 400, 'confirmations');

  const rosterInput = [...starters.map((player, index) => ({ player, type: 'starter', position: index + 1 })), ...substitutes.map((player, index) => ({ player, type: 'substitute', position: index + 1 }))];
  const roster = [];
  const uidSet = new Set();
  for (let index = 0; index < rosterInput.length; index += 1) {
    const entry = rosterInput[index];
    const checked = validPlayer(entry.player, entry.type, entry.position);
    if (checked.error) return tournamentError(checked.error, 400, checked.field);
    if (uidSet.has(checked.uidNormalized)) return tournamentError('The same UID cannot appear twice in one roster', 409, `${entry.type}-${entry.position}-uid`);
    uidSet.add(checked.uidNormalized);
    roster.push({ ...entry, ...checked, id: crypto.randomUUID() });
  }

  const duplicateChecks = await env.DB.batch(roster.map(player => env.DB.prepare('SELECT public_registration_id FROM tournament_players p JOIN tournament_registrations r ON r.id = p.registration_id WHERE p.event_id = ? AND p.uid_normalized = ? LIMIT 1').bind(event.id, player.uidNormalized)));
  if (duplicateChecks.some(result => result.results?.length)) return tournamentError('One or more player UIDs are already registered for another team in this tournament', 409, 'roster');
  if (captainDiscordId) {
    const captainDuplicate = await env.DB.prepare('SELECT public_registration_id FROM tournament_registrations WHERE event_id = ? AND captain_discord_id = ? LIMIT 1').bind(event.id, captainDiscordId).first();
    if (captainDuplicate) return tournamentError('This captain Discord ID is already attached to a tournament registration', 409, 'captain-discord-id');
  }

  const registrationId = crypto.randomUUID();
  const publicId = publicReference();
  try {
    const statements = [
      env.DB.prepare('INSERT INTO tournament_registrations (id, public_registration_id, event_id, team_name, captain_name, captain_discord_username, captain_discord_id, captain_contact, notes, status, staff_notes, source_ip_hash, terms_version, submitted_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .bind(registrationId, publicId, event.id, teamName, captainName, captainDiscordUsername, captainDiscordId, captainContact, notes, 'pending', '', attemptKey, 'codm-snd-v1', now, now),
      ...roster.map(player => env.DB.prepare('INSERT INTO tournament_players (id, registration_id, event_id, player_type, roster_position, discord_username, in_game_name, uid, uid_normalized, streamer_mode, screenshot_object_key, screenshot_content_type, screenshot_size, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .bind(player.id, registrationId, event.id, player.type, player.position, player.discordUsername, player.inGameName, player.uid, player.uidNormalized, player.streamerMode, null, null, null, now)),
      env.DB.prepare('INSERT INTO admin_audit_log (actor_id, actor_name, action, entity_type, entity_id, detail, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .bind('public-registration', captainDiscordUsername, 'submit', 'tournament_registration', registrationId, `${publicId} · ${teamName}`, now)
    ];
    await env.DB.batch(statements);
  } catch (error) {
    if (String(error).includes('UNIQUE')) return tournamentError('A player UID, captain Discord ID, or registration is already in use for this tournament', 409, 'roster');
    throw error;
  }

  return json({ ok: true, publicRegistrationId: publicId, teamName, players: 5, substitutes: substitutes.length, status: 'pending' }, 201);
}
