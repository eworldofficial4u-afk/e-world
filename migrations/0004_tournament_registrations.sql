PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS tournament_events (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  game TEXT NOT NULL,
  mode TEXT NOT NULL,
  format TEXT NOT NULL,
  team_size INTEGER NOT NULL DEFAULT 5 CHECK(team_size = 5),
  max_substitutes INTEGER NOT NULL DEFAULT 2 CHECK(max_substitutes BETWEEN 0 AND 2),
  event_status TEXT NOT NULL DEFAULT 'upcoming' CHECK(event_status IN ('upcoming', 'live', 'completed')),
  registration_status TEXT NOT NULL DEFAULT 'open' CHECK(registration_status IN ('not_open', 'open', 'closed')),
  starts_at TEXT,
  ends_at TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS tournament_registrations (
  id TEXT PRIMARY KEY,
  public_registration_id TEXT NOT NULL UNIQUE,
  event_id TEXT NOT NULL REFERENCES tournament_events(id) ON DELETE RESTRICT,
  team_name TEXT NOT NULL,
  captain_name TEXT NOT NULL,
  captain_discord_username TEXT NOT NULL,
  captain_discord_id TEXT NOT NULL DEFAULT '',
  captain_contact TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'under_review', 'approved', 'rejected', 'waitlisted', 'withdrawn')),
  staff_notes TEXT NOT NULL DEFAULT '',
  source_ip_hash TEXT NOT NULL,
  terms_version TEXT NOT NULL DEFAULT 'codm-snd-v1',
  submitted_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  reviewed_at INTEGER,
  reviewed_by TEXT
);

CREATE TABLE IF NOT EXISTS tournament_players (
  id TEXT PRIMARY KEY,
  registration_id TEXT NOT NULL REFERENCES tournament_registrations(id) ON DELETE CASCADE,
  event_id TEXT NOT NULL REFERENCES tournament_events(id) ON DELETE RESTRICT,
  player_type TEXT NOT NULL CHECK(player_type IN ('starter', 'substitute')),
  roster_position INTEGER NOT NULL CHECK(roster_position BETWEEN 1 AND 5),
  discord_username TEXT NOT NULL,
  in_game_name TEXT NOT NULL,
  uid TEXT NOT NULL,
  uid_normalized TEXT NOT NULL,
  streamer_mode INTEGER NOT NULL CHECK(streamer_mode IN (0, 1)),
  screenshot_object_key TEXT NOT NULL,
  screenshot_content_type TEXT NOT NULL CHECK(screenshot_content_type IN ('image/png', 'image/jpeg', 'image/webp')),
  screenshot_size INTEGER NOT NULL CHECK(screenshot_size > 0 AND screenshot_size <= 4194304),
  created_at INTEGER NOT NULL,
  UNIQUE(registration_id, player_type, roster_position),
  UNIQUE(event_id, uid_normalized)
);

CREATE TABLE IF NOT EXISTS tournament_submission_limits (
  attempt_key TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  window_started INTEGER NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tournament_registrations_event_status_submitted
ON tournament_registrations(event_id, status, submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_tournament_registrations_team
ON tournament_registrations(team_name);

CREATE UNIQUE INDEX IF NOT EXISTS idx_tournament_registrations_event_captain_discord
ON tournament_registrations(event_id, captain_discord_id)
WHERE captain_discord_id != '';

CREATE INDEX IF NOT EXISTS idx_tournament_players_registration
ON tournament_players(registration_id, player_type, roster_position);

CREATE INDEX IF NOT EXISTS idx_tournament_submission_limits_updated
ON tournament_submission_limits(updated_at);

INSERT OR IGNORE INTO tournament_events (
  id, slug, code, title, game, mode, format, team_size, max_substitutes,
  event_status, registration_status, starts_at, ends_at, created_at, updated_at
) VALUES (
  'codm-search-destroy-2026',
  'codm-search-destroy',
  'CODM-SND-2026',
  'COD Mobile Search & Destroy Tournament',
  'Call of Duty: Mobile',
  'Search & Destroy',
  'Single Elimination / Knockout',
  5,
  2,
  'upcoming',
  'open',
  '2026-09-12T00:00:00.000Z',
  NULL,
  unixepoch(),
  unixepoch()
);

PRAGMA optimize;
