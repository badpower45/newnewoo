-- =============================================
-- COMPLETE DATABASE SETUP - RUN THIS ONCE
-- =============================================
-- Copy and paste this entire file into Supabase SQL Editor and click RUN

-- =============================================
-- PART 1: USER PROFILE FIELDS
-- =============================================

-- Add phone column
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Add avatar column
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT;

-- Add index on phone for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- =============================================
-- PART 2: ADDRESSES TABLE
-- =============================================

-- Create addresses table for saved user addresses
CREATE TABLE IF NOT EXISTS addresses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label VARCHAR(50) NOT NULL, -- 'منزل', 'عمل', 'آخر'
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    governorate VARCHAR(50) NOT NULL,
    city VARCHAR(50) NOT NULL,
    area VARCHAR(100),
    street VARCHAR(200) NOT NULL,
    building VARCHAR(50),
    floor VARCHAR(20),
    apartment VARCHAR(20),
    landmark TEXT,
    notes TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_default ON addresses(user_id, is_default);

-- Ensure only one default address per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_addresses_unique_default 
ON addresses(user_id) 
WHERE is_default = true;

-- =============================================
-- PART 3: HOME SECTIONS TABLE
-- =============================================

-- Create home_sections table
CREATE TABLE IF NOT EXISTS home_sections (
    id SERIAL PRIMARY KEY,
    section_name VARCHAR(255) NOT NULL,
    section_name_ar VARCHAR(255) NOT NULL,
    banner_image TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    display_order INTEGER DEFAULT 0,
    max_products INTEGER DEFAULT 8,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_home_sections_active ON home_sections(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_home_sections_category ON home_sections(category);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_home_sections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_home_sections_updated_at ON home_sections;
CREATE TRIGGER trigger_home_sections_updated_at
    BEFORE UPDATE ON home_sections
    FOR EACH ROW
    EXECUTE FUNCTION update_home_sections_updated_at();

-- Insert sample data (only if table is empty)
INSERT INTO home_sections (section_name, section_name_ar, banner_image, category, display_order, max_products) 
SELECT * FROM (VALUES
    ('Fresh Fruits', 'الفواكه الطازجة', 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=1200&h=400&fit=crop', 'فواكه', 1, 8),
    ('Dairy Products', 'منتجات الألبان', 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=1200&h=400&fit=crop', 'ألبان', 2, 8),
    ('Vegetables', 'الخضروات', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1200&h=400&fit=crop', 'خضروات', 3, 8),
    ('Fresh Meat', 'اللحوم الطازجة', 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=1200&h=400&fit=crop', 'لحوم', 4, 8),
    ('Bakery', 'المخبوزات', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&h=400&fit=crop', 'مخبوزات', 5, 8),
    ('Beverages', 'المشروبات', 'https://images.unsplash.com/photo-1437418747212-8d9709afab22?w=1200&h=400&fit=crop', 'مشروبات', 6, 8)
) AS v(section_name, section_name_ar, banner_image, category, display_order, max_products)
WHERE NOT EXISTS (SELECT 1 FROM home_sections LIMIT 1);

-- =============================================
-- VERIFICATION
-- =============================================

-- Check that everything was created successfully
DO $$
DECLARE
    users_phone_exists BOOLEAN;
    users_avatar_exists BOOLEAN;
    addresses_exists BOOLEAN;
    home_sections_exists BOOLEAN;
    addresses_count INTEGER;
    home_sections_count INTEGER;
BEGIN
    -- Check if columns exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'phone'
    ) INTO users_phone_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'avatar'
    ) INTO users_avatar_exists;
    
    -- Check if tables exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'addresses'
    ) INTO addresses_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'home_sections'
    ) INTO home_sections_exists;
    
    -- Count rows
    IF addresses_exists THEN
        SELECT COUNT(*) FROM addresses INTO addresses_count;
    END IF;
    
    IF home_sections_exists THEN
        SELECT COUNT(*) FROM home_sections INTO home_sections_count;
    END IF;
    
    -- Print results
    RAISE NOTICE '========================================';
    RAISE NOTICE 'DATABASE SETUP VERIFICATION';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Users.phone column: %', CASE WHEN users_phone_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END;
    RAISE NOTICE 'Users.avatar column: %', CASE WHEN users_avatar_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END;
    RAISE NOTICE 'Addresses table: %', CASE WHEN addresses_exists THEN '✅ EXISTS (' || addresses_count || ' rows)' ELSE '❌ MISSING' END;
    RAISE NOTICE 'Home_sections table: %', CASE WHEN home_sections_exists THEN '✅ EXISTS (' || home_sections_count || ' rows)' ELSE '❌ MISSING' END;
    RAISE NOTICE '========================================';
    
    IF users_phone_exists AND users_avatar_exists AND addresses_exists AND home_sections_exists THEN
        RAISE NOTICE '🎉 ALL MIGRATIONS COMPLETED SUCCESSFULLY!';
    ELSE
        RAISE EXCEPTION '❌ Some migrations failed. Check the output above.';
    END IF;
END $$;

-- =============================================
-- DONE! 🎉
-- =============================================
SELECT 
    'Setup complete! Check the NOTICES above for verification.' as status,
    (SELECT COUNT(*) FROM home_sections) as home_sections_count,
    (SELECT COUNT(*) FROM addresses) as addresses_count;
