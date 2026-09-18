import { json } from '../_lib/auth.js';

export async function onRequestGet({ env }) {
  if (!env.DB) return json({ items: [] });
  const result = await env.DB.prepare("SELECT id, type, title, description, starts_at, ends_at, participant_count, status, notification_enabled, metadata_json FROM content_items WHERE notification_enabled = 1 AND status IN ('active', 'completed') AND (status != 'active' OR ends_at IS NULL OR ends_at > strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) ORDER BY CASE status WHEN 'active' THEN 0 ELSE 1 END, COALESCE(ends_at, starts_at) ASC LIMIT 30").all();
  return new Response(JSON.stringify({ items: result.results || [], updatedAt: new Date().toISOString() }), {
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=15, s-maxage=30', 'x-content-type-options': 'nosniff' }
  });
}
