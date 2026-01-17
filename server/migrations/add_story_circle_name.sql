-- Add circle_name to stories table for story circles
ALTER TABLE stories ADD COLUMN IF NOT EXISTS circle_name TEXT;
