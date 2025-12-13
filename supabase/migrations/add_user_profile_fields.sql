-- Add phone and avatar columns to users table if they don't exist
-- Run this in Supabase SQL Editor

-- Add phone column
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Add avatar column
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT;

-- Add index on phone for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

