-- Quick fix for RLS policies - run this in Supabase SQL Editor
-- This makes the policies more permissive for Edge Functions

-- Drop existing insert policies
DROP POLICY IF EXISTS "Users can insert own documents" ON documents;
DROP POLICY IF EXISTS "Users can insert own chat sessions" ON chat_sessions;

-- Create more permissive insert policies
CREATE POLICY "Allow authenticated inserts to documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated inserts to chat_sessions"  
  ON chat_sessions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- The existing SELECT, UPDATE, DELETE policies should remain unchanged
-- as they already work correctly
