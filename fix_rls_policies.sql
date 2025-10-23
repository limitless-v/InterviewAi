-- Alternative RLS policies that work better with Edge Functions
-- Run this in your Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert own documents" ON documents;
DROP POLICY IF EXISTS "Users can insert own chat sessions" ON chat_sessions;

-- Create more permissive policies for Edge Functions
CREATE POLICY "Allow authenticated inserts to documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated inserts to chat_sessions"
  ON chat_sessions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Keep the existing SELECT, UPDATE, DELETE policies as they are
-- (They should already be working fine)
