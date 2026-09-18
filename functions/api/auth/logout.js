import { SESSION_COOKIE, clearCookie, cookieValue, json, requireAdmin, sha256 } from '../../_lib/auth.js';

export async function onRequestPost({ request, env }) {
  const auth = await requireAdmin(request, env, { csrf: true });
  if (auth.error) return auth.error;
  const token = cookieValue(request, SESSION_COOKIE);
  if (token) await env.DB.prepare('DELETE FROM admin_sessions WHERE token_hash = ?').bind(await sha256(token)).run();
  return json({ ok: true }, 200, { 'set-cookie': clearCookie(SESSION_COOKIE) });
}
