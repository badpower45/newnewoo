-- Make order_id nullable in coupon_usage table
-- This allows recording coupon usage even before order is finalized

ALTER TABLE coupon_usage 
ALTER COLUMN order_id DROP NOT NULL;

-- Add comment
COMMENT ON COLUMN coupon_usage.order_id IS 'Order ID (nullable - can be null during validation, updated after order creation)';
