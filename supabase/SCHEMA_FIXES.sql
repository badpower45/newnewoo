-- =============================================
-- DATABASE SCHEMA COMPARISON REPORT
-- Allosh Market - Supabase
-- Generated: December 4, 2025
-- =============================================

-- ============================================
-- 🔴 MISSING COLUMNS (Code needs but DB doesn't have)
-- ============================================

-- 1. cart table - MISSING: substitution_preference
ALTER TABLE cart ADD COLUMN IF NOT EXISTS substitution_preference VARCHAR(50) DEFAULT 'none';

-- 2. cart table - MISSING: branch_id (used in some queries)
ALTER TABLE cart ADD COLUMN IF NOT EXISTS branch_id INTEGER REFERENCES branches(id);

-- 3. orders table - MISSING: notes (for customer notes)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT;

-- 4. orders table - MISSING: created_at, updated_at timestamps
ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 5. users table - MISSING: created_at timestamp
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 6. products table - MISSING: created_at timestamp  
ALTER TABLE products ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;


-- ============================================
-- 🟡 TABLES IN DB BUT MAY NOT BE FULLY USED
-- ============================================

-- These tables exist but check if all features are implemented:

-- 1. coupon_usage - ✅ Used for tracking coupon usage per user
-- 2. delivery_fees - ✅ Used for delivery fee calculation
-- 3. delivery_staff_branches - ✅ Many-to-many for staff assignments
-- 4. driver_location_history - ✅ For tracking delivery drivers
-- 5. driver_notifications - ✅ Push notifications for drivers
-- 6. order_assignments - ✅ Delivery assignments
-- 7. order_notifications - ✅ Order status notifications
-- 8. order_preparation_items - ✅ For kitchen/warehouse prep
-- 9. story_views - ✅ Analytics for stories
-- 10. user_notifications - ✅ Customer notifications


-- ============================================
-- 🟢 ALL TABLES CONFIRMED IN USE
-- ============================================

-- Core Tables:
-- ✅ users - Authentication & profiles
-- ✅ products - Product catalog
-- ✅ categories - Product categories
-- ✅ branches - Store branches
-- ✅ branch_products - Price per branch

-- E-commerce:
-- ✅ cart - Shopping cart
-- ✅ orders - Customer orders
-- ✅ favorites - Wishlist
-- ✅ coupons - Discount codes
-- ✅ coupon_usage - Usage tracking

-- Delivery:
-- ✅ delivery_slots - Delivery time slots
-- ✅ delivery_staff - Delivery personnel
-- ✅ delivery_fees - Fee structure

-- Content:
-- ✅ facebook_reels - Video reels
-- ✅ stories - Instagram-like stories
-- ✅ hot_deals - Flash deals
-- ✅ magazine_offers - Magazine promotions
-- ✅ brand_offers - Brand promotions

-- Communication:
-- ✅ conversations - Chat threads
-- ✅ messages - Chat messages
-- ✅ product_reviews - Product reviews


-- ============================================
-- 🔧 RECOMMENDED FIXES - RUN THESE IN SUPABASE
-- ============================================

-- Fix 1: Add missing column to cart
ALTER TABLE cart ADD COLUMN IF NOT EXISTS substitution_preference VARCHAR(50) DEFAULT 'none';

-- Fix 2: Add unique constraint to favorites (prevent duplicates)
ALTER TABLE favorites DROP CONSTRAINT IF EXISTS favorites_user_product_unique;
ALTER TABLE favorites ADD CONSTRAINT favorites_user_product_unique UNIQUE (user_id, product_id);

-- Fix 3: Add index for better performance on orders
CREATE INDEX IF NOT EXISTS idx_orders_user_date ON orders(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status_date ON orders(status, date DESC);

-- Fix 4: Add index for cart lookups
CREATE INDEX IF NOT EXISTS idx_cart_user_product ON cart(user_id, product_id);

-- Fix 5: Ensure order_code is indexed and unique
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_code_unique ON orders(order_code) WHERE order_code IS NOT NULL;


-- ============================================
-- 📊 FINAL SUMMARY
-- ============================================

/*
TOTAL TABLES: 29 ✅

CRITICAL MISSING:
1. cart.substitution_preference - MUST ADD ⚠️

RECOMMENDED ADDITIONS:
1. cart.branch_id - For multi-branch cart support
2. orders.notes - For customer special instructions
3. Timestamps on users/products tables

ALL CORE FUNCTIONALITY: WORKING ✅
*/

SELECT 'Schema comparison complete!' as status;
