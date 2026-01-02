-- Adds manual email blocking support
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS block_reason TEXT,
    ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS blocked_by INTEGER;

COMMENT ON COLUMN users.is_blocked IS 'Whether the user is blocked from logging in';
COMMENT ON COLUMN users.block_reason IS 'Admin-provided reason for block';
COMMENT ON COLUMN users.blocked_at IS 'Timestamp when block was applied';
COMMENT ON COLUMN users.blocked_by IS 'Admin user id who applied the block';
