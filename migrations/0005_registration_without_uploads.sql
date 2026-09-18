CREATE TABLE tournament_players_v2 (
 id TEXT PRIMARY KEY,
 registration_id TEXT NOT NULL REFERENCES tournament_registrations(id) ON DELETE CASCADE,
 event_id TEXT NOT NULL REFERENCES tournament_events(id) ON DELETE RESTRICT,
 player_type TEXT NOT NULL CHECK(player_type IN ('starter','substitute')),
 roster_position INTEGER NOT NULL CHECK(roster_position BETWEEN 1 AND 5),
 discord_username TEXT NOT NULL, in_game_name TEXT NOT NULL,
 uid TEXT NOT NULL, uid_normalized TEXT NOT NULL,
 streamer_mode INTEGER NOT NULL CHECK(streamer_mode IN (0,1)),
 screenshot_object_key TEXT,
 screenshot_content_type TEXT CHECK(screenshot_content_type IN ('image/png','image/jpeg','image/webp')),
 screenshot_size INTEGER CHECK(screenshot_size > 0 AND screenshot_size <= 4194304),
 created_at INTEGER NOT NULL,
 UNIQUE(registration_id,player_type,roster_position),
 UNIQUE(event_id,uid_normalized)
);
INSERT INTO tournament_players_v2 SELECT * FROM tournament_players;
DROP TABLE tournament_players;
ALTER TABLE tournament_players_v2 RENAME TO tournament_players;
CREATE INDEX idx_tournament_players_registration ON tournament_players(registration_id,player_type,roster_position);
