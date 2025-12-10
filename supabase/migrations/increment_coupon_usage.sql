-- SQL Function: increment_coupon_usage
-- Safely increments the used_count for a coupon
-- Used by the record-coupon-usage edge function

CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_id_param INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE coupons
    SET 
        used_count = COALESCE(used_count, 0) + 1,
        updated_at = NOW()
    WHERE id = coupon_id_param;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_coupon_usage(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_coupon_usage(INTEGER) TO service_role;

-- Example usage:
-- SELECT increment_coupon_usage(1);
