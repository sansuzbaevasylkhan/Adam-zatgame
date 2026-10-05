-- Create invites table to track invite tokens and expiration
CREATE TABLE IF NOT EXISTS invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES game_rooms(id) ON DELETE CASCADE,
  token text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '24 hours'),
  used_count integer DEFAULT 0
);

-- RLS: Allow anyone to read invite validity if they have the token
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_public_invite_check" ON invites
FOR SELECT TO authenticated USING (true);

CREATE POLICY "allow_auth_insert_invite" ON invites
FOR INSERT TO authenticated WITH CHECK (true);
