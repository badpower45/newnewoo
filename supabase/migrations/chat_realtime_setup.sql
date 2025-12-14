-- =============================================
-- Chat System Complete Setup for Supabase
-- Run this in Supabase SQL Editor
-- =============================================

-- =============================================
-- STEP 1: Create Tables if not exist
-- =============================================

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER,
    customer_name VARCHAR(255) NOT NULL DEFAULT 'زائر',
    agent_id INTEGER,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'pending')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id INTEGER,
    sender_type VARCHAR(50) NOT NULL CHECK (sender_type IN ('customer', 'agent', 'bot')),
    message TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE
);

-- =============================================
-- STEP 2: Create Indexes for Performance
-- =============================================

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_customer_id ON conversations(customer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);

-- =============================================
-- STEP 3: Enable Realtime
-- =============================================

-- Enable Realtime for messages table
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
EXCEPTION WHEN duplicate_object THEN
    -- Already added
    NULL;
END $$;

-- Enable Realtime for conversations table  
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
EXCEPTION WHEN duplicate_object THEN
    -- Already added
    NULL;
END $$;

-- =============================================
-- STEP 4: Grant Permissions
-- =============================================

GRANT SELECT, INSERT, UPDATE ON messages TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON conversations TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE messages_id_seq TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE conversations_id_seq TO anon, authenticated;

-- =============================================
-- STEP 5: Enable Row Level Security with Policies
-- =============================================

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Allow read messages" ON messages;
DROP POLICY IF EXISTS "Allow insert messages" ON messages;
DROP POLICY IF EXISTS "Allow update messages" ON messages;
DROP POLICY IF EXISTS "Allow read conversations" ON conversations;
DROP POLICY IF EXISTS "Allow insert conversations" ON conversations;
DROP POLICY IF EXISTS "Allow update conversations" ON conversations;

-- Create permissive policies for chat (public access for customer support)
CREATE POLICY "Allow read messages" ON messages FOR SELECT USING (true);
CREATE POLICY "Allow insert messages" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update messages" ON messages FOR UPDATE USING (true);

CREATE POLICY "Allow read conversations" ON conversations FOR SELECT USING (true);
CREATE POLICY "Allow insert conversations" ON conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update conversations" ON conversations FOR UPDATE USING (true);

-- =============================================
-- STEP 6: Verification Query
-- =============================================

-- Run this to verify setup:
-- SELECT table_name FROM information_schema.tables WHERE table_name IN ('conversations', 'messages');
-- SELECT * FROM pg_policies WHERE tablename IN ('conversations', 'messages');
