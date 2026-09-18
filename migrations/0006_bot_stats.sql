CREATE TABLE IF NOT EXISTS discord_bot_stats (
 guild_id TEXT PRIMARY KEY,
 payload_json TEXT NOT NULL,
 updated_at INTEGER NOT NULL
);
