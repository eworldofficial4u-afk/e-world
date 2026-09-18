CREATE TABLE IF NOT EXISTS admin_login_attempts (
  ip_hash TEXT PRIMARY KEY,
  failures INTEGER NOT NULL DEFAULT 0,
  window_started INTEGER NOT NULL,
  blocked_until INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_login_attempts_updated_at
ON admin_login_attempts(updated_at);

CREATE UNIQUE INDEX IF NOT EXISTS idx_content_single_active_type
ON content_items(type)
WHERE status = 'active' AND type IN ('giveaway', 'community');

PRAGMA optimize;
