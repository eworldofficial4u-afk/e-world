import { sha256 } from './auth.js';

export async function boundedBody(request, maxBytes) {
  if (Number(request.headers.get('content-length') || 0) > maxBytes) throw Object.assign(new Error('Request too large'), { status: 413 });
  const reader = request.body?.getReader();
  if (!reader) return '';
  const parts = []; let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > maxBytes) { await reader.cancel(); throw Object.assign(new Error('Request too large'), { status: 413 }); }
    parts.push(value);
  }
  const bytes = new Uint8Array(length); let offset = 0;
  for (const part of parts) { bytes.set(part, offset); offset += part.length; }
  return new TextDecoder().decode(bytes);
}

export async function rateLimit(request, env, scope, limit, seconds) {
  if (!env.DB) throw new Error('Database unavailable');
  const now = Math.floor(Date.now() / 1000);
  const bucket = Math.floor(now / seconds) * seconds;
  // Cloudflare supplies this header. Never trust caller-controlled forwarding headers.
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  const key = await sha256(`${scope}:${ip}:${env.ADMIN_PASSWORD_HASH || env.BOT_STATS_SECRET || ''}`);
  const row = await env.DB.prepare(`INSERT INTO security_rate_limits (rate_key, window_start, attempts, expires_at) VALUES (?, ?, 1, ?)
    ON CONFLICT(rate_key) DO UPDATE SET
    attempts = CASE WHEN window_start = excluded.window_start THEN attempts + 1 ELSE 1 END,
    window_start = excluded.window_start, expires_at = excluded.expires_at RETURNING attempts`)
    .bind(key, bucket, bucket + seconds).first();
  return { allowed: row.attempts <= limit, retryAfter: bucket + seconds - now };
}

export function safeCsv(value) {
  let text = String(value ?? '');
  if (/^[\s\u0000-\u001f]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text = "'" + text;
  return `"${text.replace(/"/g, '""')}"`;
}
