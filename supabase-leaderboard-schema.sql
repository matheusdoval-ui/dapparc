-- Run this in Supabase SQL Editor to create tables for the game leaderboard indexer.
--
-- Table "leaderboard" required columns:
--   wallet     TEXT PRIMARY KEY
--   name       TEXT
--   best_score INTEGER NOT NULL
--   updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
-- Upsert must NOT include "name" so existing names are not overwritten with null.

CREATE TABLE IF NOT EXISTS leaderboard (
  wallet TEXT PRIMARY KEY,
  best_score INTEGER NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add name if table already existed without it:
-- ALTER TABLE leaderboard ADD COLUMN IF NOT EXISTS name TEXT;
-- (If your Postgres version does not support IF NOT EXISTS: ALTER TABLE leaderboard ADD COLUMN name TEXT;)

-- Index for sorted reads (top by score)
CREATE INDEX IF NOT EXISTS idx_leaderboard_best_score_desc ON leaderboard (best_score DESC);

-- Indexer state: last processed block
CREATE TABLE IF NOT EXISTS indexer_state (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Incremental sync: single row tracking last indexed block (id always 1)
CREATE TABLE IF NOT EXISTS sync_state (
  id INTEGER PRIMARY KEY,
  last_block BIGINT NOT NULL DEFAULT 0
);

INSERT INTO sync_state (id, last_block) VALUES (1, 0)
ON CONFLICT (id) DO NOTHING;

-- Optional: allow anon read for leaderboard (if using RLS)
-- ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow public read" ON leaderboard FOR SELECT USING (true);
