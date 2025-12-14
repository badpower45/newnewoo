-- =============================================
-- Chat Realtime Setup for Supabase
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable Realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Enable Realtime for conversations table  
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- Create index for faster message queries
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);

-- Add bot as valid sender_type if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'messages_sender_type_check'
    ) THEN
        ALTER TABLE messages ADD CONSTRAINT messages_sender_type_check 
        CHECK (sender_type IN ('customer', 'agent', 'bot'));
    END IF;
EXCEPTION WHEN duplicate_object THEN
    -- Constraint already exists, update it
    ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_sender_type_check;
    ALTER TABLE messages ADD CONSTRAINT messages_sender_type_check 
    CHECK (sender_type IN ('customer', 'agent', 'bot'));
END $$;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON messages TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON conversations TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE messages_id_seq TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE conversations_id_seq TO anon, authenticated;

-- Enable Row Level Security (optional but recommended)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "Users can read messages from their conversations" ON messages;
DROP POLICY IF EXISTS "Users can insert messages" ON messages;
DROP POLICY IF EXISTS "Users can read conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update conversations" ON conversations;

-- Policy: Anyone can read messages from their conversation
CREATE POLICY "Users can read messages from their conversations"
ON messages FOR SELECT
USING (true);

-- Policy: Anyone can insert messages
CREATE POLICY "Users can insert messages"
ON messages FOR INSERT
WITH CHECK (true);

-- Policy: Anyone can read conversations
CREATE POLICY "Users can read conversations"
ON conversations FOR SELECT
USING (true);

-- Policy: Anyone can create conversations
CREATE POLICY "Users can create conversations"
ON conversations FOR INSERT
WITH CHECK (true);

-- Policy: Anyone can update conversations (for agent assignment, status change)
CREATE POLICY "Users can update conversations"
ON conversations FOR UPDATE
USING (true);
