-- =============================================
-- BLOCKING SYSTEM - Supabase Integration
-- Adds comprehensive blocking functionality
-- =============================================

-- 1. Add blocking columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS block_reason TEXT,
ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS blocked_by INTEGER,
ADD COLUMN IF NOT EXISTS banned_until TIMESTAMP;

-- 2. Create index for faster blocking checks
CREATE INDEX IF NOT EXISTS idx_users_is_blocked ON users(is_blocked) WHERE is_blocked = TRUE;
CREATE INDEX IF NOT EXISTS idx_users_email_blocked ON users(email, is_blocked);

-- 3. Create blocked_attempts table for tracking
CREATE TABLE IF NOT EXISTS blocked_attempts (
    id SERIAL PRIMARY KEY,
    user_email TEXT,
    user_id INTEGER,
    ip_address TEXT,
    attempt_type TEXT, -- 'login', 'register', 'api_call'
    block_reason TEXT,
    attempted_at TIMESTAMP DEFAULT NOW(),
    user_agent TEXT,
    location TEXT
);

CREATE INDEX IF NOT EXISTS idx_blocked_attempts_email ON blocked_attempts(user_email);
CREATE INDEX IF NOT EXISTS idx_blocked_attempts_ip ON blocked_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_blocked_attempts_date ON blocked_attempts(attempted_at DESC);

-- 4. Function to check if user is blocked
CREATE OR REPLACE FUNCTION is_user_blocked(user_email TEXT)
RETURNS TABLE (
    is_blocked BOOLEAN,
    block_reason TEXT,
    blocked_at TIMESTAMP,
    banned_until TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.is_blocked,
        u.block_reason,
        u.blocked_at,
        u.banned_until
    FROM users u
    WHERE u.email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Function to block user by email (Admin only)
CREATE OR REPLACE FUNCTION block_user_by_email(
    target_email TEXT,
    reason TEXT,
    admin_id INTEGER DEFAULT NULL,
    ban_duration_days INTEGER DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    affected_rows INTEGER;
    ban_until TIMESTAMP;
BEGIN
    -- Calculate ban expiry if temporary
    IF ban_duration_days IS NOT NULL THEN
        ban_until := NOW() + (ban_duration_days || ' days')::INTERVAL;
    END IF;

    -- Update user
    UPDATE users
    SET 
        is_blocked = TRUE,
        block_reason = reason,
        blocked_at = NOW(),
        blocked_by = admin_id,
        banned_until = ban_until
    WHERE email = target_email;
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    
    IF affected_rows = 0 THEN
        RETURN json_build_object(
            'success', FALSE,
            'error', 'User not found'
        );
    END IF;
    
    RETURN json_build_object(
        'success', TRUE,
        'message', 'User blocked successfully',
        'email', target_email,
        'blocked_at', NOW(),
        'banned_until', ban_until
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Function to unblock user
CREATE OR REPLACE FUNCTION unblock_user_by_email(target_email TEXT)
RETURNS JSON AS $$
DECLARE
    affected_rows INTEGER;
BEGIN
    UPDATE users
    SET 
        is_blocked = FALSE,
        block_reason = NULL,
        blocked_at = NULL,
        blocked_by = NULL,
        banned_until = NULL
    WHERE email = target_email;
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    
    IF affected_rows = 0 THEN
        RETURN json_build_object(
            'success', FALSE,
            'error', 'User not found'
        );
    END IF;
    
    RETURN json_build_object(
        'success', TRUE,
        'message', 'User unblocked successfully',
        'email', target_email
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Function to log blocked attempt
CREATE OR REPLACE FUNCTION log_blocked_attempt(
    p_user_email TEXT,
    p_user_id INTEGER DEFAULT NULL,
    p_ip_address TEXT DEFAULT NULL,
    p_attempt_type TEXT DEFAULT 'login',
    p_block_reason TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS JSON AS $$
BEGIN
    INSERT INTO blocked_attempts (
        user_email,
        user_id,
        ip_address,
        attempt_type,
        block_reason,
        user_agent
    ) VALUES (
        p_user_email,
        p_user_id,
        p_ip_address,
        p_attempt_type,
        p_block_reason,
        p_user_agent
    );
    
    RETURN json_build_object(
        'success', TRUE,
        'message', 'Blocked attempt logged'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Function to auto-unblock expired temporary bans
CREATE OR REPLACE FUNCTION auto_unblock_expired_bans()
RETURNS INTEGER AS $$
DECLARE
    unblocked_count INTEGER;
BEGIN
    UPDATE users
    SET 
        is_blocked = FALSE,
        block_reason = NULL,
        blocked_at = NULL,
        blocked_by = NULL,
        banned_until = NULL
    WHERE 
        is_blocked = TRUE 
        AND banned_until IS NOT NULL 
        AND banned_until < NOW();
    
    GET DIAGNOSTICS unblocked_count = ROW_COUNT;
    
    RETURN unblocked_count;
END;
$$ LANGUAGE plpgsql;

-- 12. Trigger to sync with Supabase Auth
CREATE OR REPLACE FUNCTION sync_block_to_auth()
RETURNS TRIGGER AS $$
BEGIN
    -- When user is blocked, we could disable their auth
    -- This requires admin API access which we'll handle in backend
    -- For now, just log it
    IF NEW.is_blocked = TRUE AND (OLD.is_blocked IS NULL OR OLD.is_blocked = FALSE) THEN
        RAISE NOTICE 'User % blocked at %', NEW.email, NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_block_to_auth
    AFTER UPDATE OF is_blocked ON users
    FOR EACH ROW
    EXECUTE FUNCTION sync_block_to_auth();

-- 13. View for blocked users report
CREATE OR REPLACE VIEW blocked_users_report AS
SELECT 
    u.id,
    u.email,
    u.name,
    u.is_blocked,
    u.block_reason,
    u.blocked_at,
    u.banned_until,
    blocker.email as blocked_by_email,
    blocker.name as blocked_by_name,
    CASE 
        WHEN u.banned_until IS NOT NULL AND u.banned_until > NOW() THEN 'Temporary'
        WHEN u.banned_until IS NOT NULL AND u.banned_until <= NOW() THEN 'Expired'
        ELSE 'Permanent'
    END as ban_type,
    CASE 
        WHEN u.banned_until IS NOT NULL AND u.banned_until > NOW() THEN 
            EXTRACT(EPOCH FROM (u.banned_until - NOW()))/86400
        ELSE NULL
    END as days_remaining
FROM users u
LEFT JOIN users blocker ON u.blocked_by = blocker.id
WHERE u.is_blocked = TRUE
ORDER BY u.blocked_at DESC;

-- 14. Grant permissions
GRANT SELECT ON blocked_users_report TO authenticated;
GRANT EXECUTE ON FUNCTION is_user_blocked(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION log_blocked_attempt(TEXT, INTEGER, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;

-- 15. Comments
COMMENT ON COLUMN users.is_blocked IS 'User blocking status - prevents login and all actions';
COMMENT ON COLUMN users.block_reason IS 'Reason for blocking the user';
COMMENT ON COLUMN users.blocked_at IS 'Timestamp when user was blocked';
COMMENT ON COLUMN users.blocked_by IS 'Admin user ID who blocked this user';
COMMENT ON COLUMN users.banned_until IS 'Temporary ban expiry (NULL = permanent)';
COMMENT ON FUNCTION is_user_blocked IS 'Check if user is blocked by email';
COMMENT ON FUNCTION block_user_by_email IS 'Block a user by email (admin only)';
COMMENT ON FUNCTION unblock_user_by_email IS 'Unblock a user by email';
COMMENT ON FUNCTION auto_unblock_expired_bans IS 'Auto-unblock users with expired temporary bans';

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
-- You can now use the blocking functions:
-- SELECT * FROM is_user_blocked('email@example.com');
-- SELECT block_user_by_email('email@example.com', 'Violation of terms', NULL, 7);
-- SELECT unblock_user_by_email('email@example.com');
