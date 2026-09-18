import { cleanText, json, sha256 } from './auth.js';

export const REGISTRATION_STATUSES = new Set(['pending', 'under_review', 'approved', 'rejected', 'waitlisted', 'withdrawn']);
export const MAX_SCREENSHOT_BYTES = 4 * 1024 * 1024;
export const EVENT_SLUG = 'codm-search-destroy';

export const normalizeUid = value => cleanText(value, 64).replace(/[\s-]+/g, '').toUpperCase();
export const boundedPage = value => Math.max(1, Math.min(100000, Number.parseInt(value, 10) || 1));
export const publicReference = () => `EW-CODM-${new Date().getUTCFullYear()}-${crypto.randomUUID().replace(/-/g, '').slice(0, 7).toUpperCase()}`;

export async function eventBySlug(env, slug = EVENT_SLUG) {
  return env.DB.prepare('SELECT id, slug, code, title, game, mode, format, team_size, max_substitutes, event_status, registration_status, starts_at, ends_at FROM tournament_events WHERE slug = ? LIMIT 1')
    .bind(cleanText(slug, 80)).first();
}

export async function submissionKey(request, env, eventId) {
  const address = request.headers.get('cf-connecting-ip') || (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
  return sha256(`${address}:${eventId}:${env.ADMIN_PASSWORD_HASH || 'eworld-registration'}`);
}

export async function inspectImage(file) {
  if (!(file instanceof File) || file.size < 12 || file.size > MAX_SCREENSHOT_BYTES) return null;
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((value, index) => bytes[index] === value);
  const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const webp = String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
  if (png) return { contentType: 'image/png', extension: 'png' };
  if (jpeg) return { contentType: 'image/jpeg', extension: 'jpg' };
  if (webp) return { contentType: 'image/webp', extension: 'webp' };
  return null;
}

export const tournamentError = (message, status = 400, field = '') => json({ error: message, field }, status);
