import { getSession, json } from '../../_lib/auth.js';

export async function onRequestGet({ request, env }) {
  const session = await getSession(request, env);
  if (!session) return json({ authenticated: false }, 401);
  return json({
    authenticated: true,
    user: { id: session.discord_user_id, username: session.username, avatar: session.avatar_url },
    csrfToken: session.csrf_token,
    expiresAt: session.expires_at
  });
}
