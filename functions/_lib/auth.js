export const GUILD_ID = '1539496402890133574';
export const ADMIN_ROLE_ID = '1543263077502554123';
export const SESSION_COOKIE = '__Host-eworld_admin';
export const OAUTH_COOKIE = '__Host-eworld_oauth';
export const SESSION_TTL_SECONDS = 60 * 60 * 2;

const encoder = new TextEncoder();
const base64url = bytes => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');

export const randomToken = (size = 32) => {
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  return base64url(bytes);
};

export const sha256 = async value => {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(value));
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
};

const hmac = async (value, secret) => {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return base64url(new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(value))));
};

export const makeSignedValue = async (value, secret) => `${value}.${await hmac(value, secret)}`;

export const readSignedValue = async (signed, secret) => {
  if (!signed || !secret) return null;
  const split = signed.lastIndexOf('.');
  if (split < 1) return null;
  const value = signed.slice(0, split);
  const signature = signed.slice(split + 1);
  const expected = await hmac(value, secret);
  if (signature.length !== expected.length) return null;
  let mismatch = 0;
  for (let index = 0; index < signature.length; index += 1) mismatch |= signature.charCodeAt(index) ^ expected.charCodeAt(index);
  return mismatch === 0 ? value : null;
};

export const cookieValue = (request, name) => {
  const cookie = request.headers.get('Cookie') || '';
  for (const item of cookie.split(';')) {
    const [key, ...parts] = item.trim().split('=');
    if (key === name) { try { return decodeURIComponent(parts.join('=')); } catch { return ''; } }
  }
  return '';
};

export const setCookie = (name, value, maxAge) => `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
export const clearCookie = name => `${name}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;

export const json = (data, status = 200, extraHeaders = {}) => new Response(JSON.stringify(data), {
  status,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'no-referrer',
    ...extraHeaders
  }
});

export const allowedOrigin = env => (env.ALLOWED_ORIGIN || 'https://e-world-community.pages.dev').replace(/\/$/, '');

export const requireSameOrigin = (request, env) => {
  if (request.headers.get('sec-fetch-site') === 'cross-site') return false;
  const origin = request.headers.get('Origin');
  const requestOrigin = new URL(request.url).origin;
  if (!origin) return ['GET', 'HEAD'].includes(request.method);
  return origin === requestOrigin || origin === allowedOrigin(env);
};

export const getSession = async (request, env) => {
  if (!env.DB) return null;
  const token = cookieValue(request, SESSION_COOKIE);
  if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  const tokenHash = await sha256(token);
  const now = Math.floor(Date.now() / 1000);
  const session = await env.DB.prepare('SELECT token_hash, discord_user_id, username, avatar_url, csrf_token, expires_at FROM admin_sessions WHERE token_hash = ? AND expires_at > ?')
    .bind(tokenHash, now).first();
  return session || null;
};

export const requireAdmin = async (request, env, { csrf = false } = {}) => {
  if (!requireSameOrigin(request, env)) return { error: json({ error: 'Origin not allowed' }, 403) };
  const session = await getSession(request, env);
  if (!session) return { error: json({ error: 'Authentication required' }, 401) };
  if (csrf && request.headers.get('x-csrf-token') !== session.csrf_token) return { error: json({ error: 'Invalid CSRF token' }, 403) };
  return { session };
};

export const cleanText = (value, max = 500) => String(value || '').replace(/[<>]/g, '').trim().slice(0, max);
