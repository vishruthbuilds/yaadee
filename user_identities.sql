/*
SQL script to create the user_identities table.
This table maps a Google email to a directory user ID.
The directory user ID type matches the users.id column (text).
*/
CREATE TABLE IF NOT EXISTS user_identities (
  email TEXT PRIMARY KEY,
  directory_user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (optional)
ALTER TABLE user_identities ENABLE ROW LEVEL SECURITY;

-- Simple policy allowing all operations for the application.
CREATE POLICY "allow_all" ON user_identities
  FOR ALL USING (TRUE) WITH CHECK (TRUE);
