/*
# АДАМ ЗАТ — Multiplayer Word Game Schema

## Overview
This migration creates the complete database schema for "АДАМ ЗАТ", a real-time multiplayer word game where players compete to fill in answers across categories before the timer runs out or someone hits STOP.

## New Tables

1. **profiles** — User display information (avatar, name, bio, stats)
   - `id` (uuid, PK, references auth.users)
   - `display_name` (text, the player's visible name)
   - `avatar_url` (text, nullable, profile picture URL)
   - `bio` (text, nullable, short bio)
   - `total_games` (int, default 0)
   - `total_wins` (int, default 0)
   - `total_score` (int, default 0)
   - `created_at` (timestamptz)

2. **game_rooms** — A game session / room
   - `id` (uuid, PK)
   - `code` (text, unique 6-char room code for joining)
   - `host_id` (uuid, references profiles)
   - `status` (text: 'waiting' | 'playing' | 'finished')
   - `round` (int, current round number, default 1)
   - `total_rounds` (int, default 3)
   - `round_duration` (int, seconds per round, default 60)
   - `letter` (text, nullable, current round's letter)
   - `categories` (text[], categories for the current round)
   - `stop_triggered_by` (uuid, nullable, who pressed STOP)
   - `current_answerer_order` (int, default 0, tracks whose turn to answer)
   - `created_at` (timestamptz)

3. **room_players** — Players in a room
   - `id` (uuid, PK)
   - `room_id` (uuid, references game_rooms)
   - `user_id` (uuid, references profiles)
   - `joined_at` (timestamptz)
   - `is_host` (boolean, default false)
   - `is_ready` (boolean, default false)
   - UNIQUE constraint on (room_id, user_id)

4. **player_answers** — Answers submitted during a round
   - `id` (uuid, PK)
   - `room_id` (uuid, references game_rooms)
   - `user_id` (uuid, references profiles)
   - `round` (int, which round)
   - `letter` (text, the letter for that round)
   - `category` (text, the category)
   - `answer` (text, the player's answer)
   - `score` (int, default 0, score awarded)
   - `created_at` (timestamptz)

5. **word_bank** — User-submitted words for the game's word pool
   - `id` (uuid, PK)
   - `user_id` (uuid, references profiles)
   - `word` (text, the word)
   - `category` (text, nullable, suggested category)
   - `created_at` (timestamptz)

6. **game_history** — Completed game records
   - `id` (uuid, PK)
   - `room_id` (uuid, references game_rooms)
   - `user_id` (uuid, references profiles)
   - `final_score` (int)
   - `position` (int, final position: 1 = first, 2 = second, etc.)
   - `total_players` (int)
   - `rounds_played` (int)
   - `created_at` (timestamptz)

## Security
- RLS enabled on ALL tables.
- profiles: owner-scoped CRUD (authenticated users manage their own profile)
- game_rooms: authenticated can create/read; host can update/delete
- room_players: authenticated can join/read/leave; host can manage
- player_answers: authenticated can create own answers; room members can read
- word_bank: authenticated can CRUD own words; all authenticated can read
- game_history: authenticated can create/read own; room members can read all
- All owner columns default to auth.uid()
*/

-- PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '',
  avatar_url text,
  bio text,
  total_games integer NOT NULL DEFAULT 0,
  total_wins integer NOT NULL DEFAULT 0,
  total_score integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- GAME ROOMS
CREATE TABLE IF NOT EXISTS game_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  host_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'waiting',
  round integer NOT NULL DEFAULT 1,
  total_rounds integer NOT NULL DEFAULT 3,
  round_duration integer NOT NULL DEFAULT 60,
  letter text,
  categories text[] DEFAULT '{}',
  stop_triggered_by uuid,
  current_answerer_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE game_rooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_game_rooms" ON game_rooms;
CREATE POLICY "select_game_rooms" ON game_rooms FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_game_rooms" ON game_rooms;
CREATE POLICY "insert_game_rooms" ON game_rooms FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = host_id);

DROP POLICY IF EXISTS "update_game_rooms" ON game_rooms;
CREATE POLICY "update_game_rooms" ON game_rooms FOR UPDATE
  TO authenticated USING (auth.uid() = host_id) WITH CHECK (auth.uid() = host_id);

DROP POLICY IF EXISTS "delete_game_rooms" ON game_rooms;
CREATE POLICY "delete_game_rooms" ON game_rooms FOR DELETE
  TO authenticated USING (auth.uid() = host_id);

-- ROOM PLAYERS
CREATE TABLE IF NOT EXISTS room_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES game_rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  is_host boolean NOT NULL DEFAULT false,
  is_ready boolean NOT NULL DEFAULT false,
  UNIQUE(room_id, user_id)
);

ALTER TABLE room_players ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_room_players" ON room_players;
CREATE POLICY "select_room_players" ON room_players FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_room_players" ON room_players;
CREATE POLICY "insert_room_players" ON room_players FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_room_players" ON room_players;
CREATE POLICY "update_room_players" ON room_players FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_room_players" ON room_players;
CREATE POLICY "delete_room_players" ON room_players FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- PLAYER ANSWERS
CREATE TABLE IF NOT EXISTS player_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES game_rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  round integer NOT NULL,
  letter text,
  category text NOT NULL,
  answer text NOT NULL DEFAULT '',
  score integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE player_answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_player_answers" ON player_answers;
CREATE POLICY "select_player_answers" ON player_answers FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_player_answers" ON player_answers;
CREATE POLICY "insert_player_answers" ON player_answers FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_player_answers" ON player_answers;
CREATE POLICY "update_player_answers" ON player_answers FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_player_answers" ON player_answers;
CREATE POLICY "delete_player_answers" ON player_answers FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- WORD BANK
CREATE TABLE IF NOT EXISTS word_bank (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  word text NOT NULL,
  category text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE word_bank ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_word_bank" ON word_bank;
CREATE POLICY "select_word_bank" ON word_bank FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_word_bank" ON word_bank;
CREATE POLICY "insert_word_bank" ON word_bank FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_word_bank" ON word_bank;
CREATE POLICY "update_word_bank" ON word_bank FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_word_bank" ON word_bank;
CREATE POLICY "delete_word_bank" ON word_bank FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- GAME HISTORY
CREATE TABLE IF NOT EXISTS game_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES game_rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  final_score integer NOT NULL DEFAULT 0,
  position integer NOT NULL DEFAULT 0,
  total_players integer NOT NULL DEFAULT 0,
  rounds_played integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE game_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_game_history" ON game_history;
CREATE POLICY "select_game_history" ON game_history FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_game_history" ON game_history;
CREATE POLICY "insert_game_history" ON game_history FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_game_history" ON game_history;
CREATE POLICY "update_game_history" ON game_history FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_game_history" ON game_history;
CREATE POLICY "delete_game_history" ON game_history FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_game_rooms_code ON game_rooms(code);
CREATE INDEX IF NOT EXISTS idx_game_rooms_status ON game_rooms(status);
CREATE INDEX IF NOT EXISTS idx_room_players_room ON room_players(room_id);
CREATE INDEX IF NOT EXISTS idx_player_answers_room ON player_answers(room_id);
CREATE INDEX IF NOT EXISTS idx_player_answers_room_round ON player_answers(room_id, round);
CREATE INDEX IF NOT EXISTS idx_word_bank_user ON word_bank(user_id);
CREATE INDEX IF NOT EXISTS idx_game_history_user ON game_history(user_id);

-- Enable realtime for game_rooms, room_players, player_answers
ALTER TABLE game_rooms REPLICA IDENTITY FULL;
ALTER TABLE room_players REPLICA IDENTITY FULL;
ALTER TABLE player_answers REPLICA IDENTITY FULL;