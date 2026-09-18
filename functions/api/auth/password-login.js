import { SESSION_COOKIE, SESSION_TTL_SECONDS, json, randomToken, requireSameOrigin, setCookie, sha256 } from '../../_lib/auth.js';

const constantTimeEqual = (left, right) => {
  if (!left || !right || left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return mismatch === 0;
};

export async function onRequestPost({ request, env }) {
  if (!requireSameOrigin(request, env)) return json({ error: 'Origin not allowed' }, 403);
  if (!env.DB || !env.ADMIN_PASSWORD_HASH) return json({ error: 'Password login is not configured' }, 503);
  if (!(request.headers.get('content-type') || '').includes('application/json')) return json({ error: 'JSON required' }, 415);
  if (Number(request.headers.get('content-length') || 0) > 4096) return json({ error: 'Request too large' }, 413);
  const now = Math.floor(Date.now() / 1000);
  const address = request.headers.get('cf-connecting-ip') || (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
  const attemptKey = await sha256(`${address}:${env.ADMIN_PASSWORD_HASH}`);
  const attempt = await env.DB.prepare('SELECT failures, window_started, blocked_until FROM admin_login_attempts WHERE ip_hash = ?').bind(attemptKey).first();
  if (attempt?.blocked_until > now) {
    const retryAfter = Math.max(1, attempt.blocked_until - now);
    return json({ error: 'Too many attempts. Try again later.' }, 429, { 'retry-after': String(retryAfter) });
  }
  let body;
  try { body = await request.json(); } catch { return json({ error: 'Invalid request' }, 400); }
  const suppliedHash = await sha256(String(body.password || ''));
  if (!constantTimeEqual(suppliedHash, env.ADMIN_PASSWORD_HASH)) {
    const withinWindow = attempt && now - attempt.window_started < 900;
    const failures = withinWindow ? Number(attempt.failures) + 1 : 1;
    const windowStarted = withinWindow ? attempt.window_started : now;
    const blockedUntil = failures >= 5 ? now + 900 : 0;
    await env.DB.prepare('INSERT INTO admin_login_attempts (ip_hash, failures, window_started, blocked_until, updated_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(ip_hash) DO UPDATE SET failures = excluded.failures, window_started = excluded.window_started, blocked_until = excluded.blocked_until, updated_at = excluded.updated_at')
      .bind(attemptKey, failures, windowStarted, blockedUntil, now).run();
    await new Promise(resolve => setTimeout(resolve, 350));
    return failures >= 5
      ? json({ error: 'Too many attempts. Try again in 15 minutes.' }, 429, { 'retry-after': '900' })
      : json({ error: 'Incorrect admin password' }, 401);
  }
  const sessionToken = randomToken(32), csrfToken = randomToken(24), tokenHash = await sha256(sessionToken);
  await env.DB.batch([
    env.DB.prepare('DELETE FROM admin_sessions WHERE expires_at <= ?').bind(now),
    env.DB.prepare('DELETE FROM admin_login_attempts WHERE ip_hash = ?').bind(attemptKey),
    env.DB.prepare('INSERT INTO admin_sessions (token_hash, discord_user_id, username, avatar_url, csrf_token, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(tokenHash, 'password-admin', 'E-WORLD Administrator', '/assets/eworld-logo.webp', csrfToken, now + SESSION_TTL_SECONDS, now)
  ]);
  return json({ ok: true }, 200, { 'set-cookie': setCookie(SESSION_COOKIE, sessionToken, SESSION_TTL_SECONDS) });
}
