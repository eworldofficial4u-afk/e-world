PRAGMA foreign_keys = OFF;

CREATE TABLE content_items_next (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK(type IN ('giveaway', 'community', 'event', 'alert')),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  starts_at TEXT,
  ends_at TEXT,
  participant_count INTEGER NOT NULL DEFAULT 0 CHECK(participant_count >= 0),
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'active', 'completed', 'cancelled')),
  notification_enabled INTEGER NOT NULL DEFAULT 1 CHECK(notification_enabled IN (0, 1)),
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_by TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

INSERT INTO content_items_next (
  id, type, title, description, starts_at, ends_at, participant_count,
  status, notification_enabled, metadata_json, created_by, created_at, updated_at
)
SELECT
  id, type, title, description, starts_at, ends_at, participant_count,
  status, notification_enabled, '{}', created_by, created_at, updated_at
FROM content_items;

DROP TABLE content_items;
ALTER TABLE content_items_next RENAME TO content_items;

CREATE INDEX idx_content_items_type_status ON content_items(type, status);
CREATE INDEX idx_content_items_ends_at ON content_items(ends_at);

PRAGMA foreign_keys = ON;
