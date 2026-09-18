CREATE TABLE IF NOT EXISTS security_rate_limits (
 rate_key TEXT PRIMARY KEY,
 window_start INTEGER NOT NULL,
 attempts INTEGER NOT NULL,
 expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_security_limits_expiry ON security_rate_limits(expires_at);
