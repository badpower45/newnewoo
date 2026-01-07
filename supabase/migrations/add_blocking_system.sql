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

-- 3. Drop and recreate blocked_attempts table
DROP TABLE IF EXISTS blocked_attempts CASCADE;

CREATE TABLE blocked_attempts (
    id SERIAL PRIMARY KEY,
    attempt_email TEXT,
    attempt_user_id INTEGER,
    ip_address TEXT,
    attempt_type TEXT,
    reason TEXT,
    attempted_at TIMESTAMP DEFAULT NOW(),
    user_agent TEXT,
    location TEXT
);

CREATE INDEX idx_blocked_attempts_email ON blocked_attempts(attempt_email);
CREATE INDEX idx_blocked_attempts_ip ON blocked_attempts(ip_address);
CREATE INDEX idx_blocked_attempts_date ON blocked_attempts(attempted_at DESC);

-- 4. Function to check if user is blocked
CREATE OR REPLACE FUNCTION is_user_blocked(p_user_email TEXT)
RETURNS TABLE (
    out_is_blocked BOOLEAN,
    out_block_reason TEXT,
    out_blocked_at TIMESTAMP,
    out_banned_until TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.is_blocked,
        u.block_reason,
        u.blocked_at,
        u.banned_until
    FROM users u
    WHERE u.email = p_user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Function to block user by email (Admin only)
CREATE OR REPLACE FUNCTION block_user_by_email(
    p_target_email TEXT,
    p_reason TEXT,
    p_admin_id INTEGER DEFAULT NULL,
    p_ban_duration_days INTEGER DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    affected_rows INTEGER;
    ban_until TIMESTAMP;
BEGIN
    -- Calculate ban expiry if temporary
    IF p_ban_duration_days IS NOT NULL THEN
        ban_until := NOW() + (p_ban_duration_days || ' days')::INTERVAL;
    END IF;

    -- Update user
    UPDATE users
    SET 
        is_blocked = TRUE,
        block_reason = p_reason,
        blocked_at = NOW(),
        blocked_by = p_admin_id,
        banned_until = ban_until
    WHERE email = p_target_email;
    
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
        'email', p_target_email,
        'blocked_at', NOW(),
        'banned_until', ban_until
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Function to unblock user
CREATE OR REPLACE FUNCTION unblock_user_by_email(p_target_email TEXT)
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
    WHERE email = p_target_email;
    
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
        'email', p_target_email
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Function to log blocked attempt
CREATE OR REPLACE FUNCTION log_blocked_attempt(
    p_email TEXT,
    p_user_id INTEGER DEFAULT NULL,
    p_ip TEXT DEFAULT NULL,
    p_type TEXT DEFAULT 'login',
    p_reason TEXT DEFAULT NULL,
    p_agent TEXT DEFAULT NULL
)
RETURNS JSON AS $$
BEGIN
    INSERT INTO blocked_attempts (
        attempt_email,
        attempt_user_id,
        ip_address,
        attempt_type,
        reason,
        user_agent
    ) VALUES (
        p_email,
        p_user_id,
        p_ip,
        p_type,
        p_reason,
        p_agent
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

-- =============================================
-- MIGRATION COMPLETE
-- Blocking system ready to use
-- =============================================
