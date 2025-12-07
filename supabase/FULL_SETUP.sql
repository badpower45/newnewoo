-- =============================================
-- ALLOSH MARKET - Complete Supabase Setup
-- =============================================
-- Run this entire file in Supabase SQL Editor
-- Order: Tables → Indexes → Triggers → Sample Data
-- =============================================

-- ============================================
-- PART 1: CREATE ALL TABLES
-- ============================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'customer',
    default_branch_id INTEGER,
    loyalty_points INTEGER DEFAULT 0,
    assigned_branch_id INTEGER,
    google_id VARCHAR(255),
    facebook_id VARCHAR(255),
    avatar VARCHAR(500),
    reset_token VARCHAR(255),
    reset_token_expiry TIMESTAMP,
    profile_picture TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Branches Table
CREATE TABLE IF NOT EXISTS branches (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    location_lat DECIMAL(10,6),
    location_lng DECIMAL(10,6),
    coverage_radius_km DECIMAL(5,2) DEFAULT 5.0,
    is_active BOOLEAN DEFAULT true,
    phone TEXT,
    phone2 TEXT,
    maps_link TEXT,
    address TEXT,
    minimum_order DECIMAL(10,2) DEFAULT 50.00
);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100),
    image TEXT,
    icon VARCHAR(10),
    bg_color VARCHAR(50) DEFAULT 'bg-orange-50',
    description TEXT,
    parent_id INTEGER REFERENCES categories(id),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Products Table
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    rating DECIMAL(3,2) DEFAULT 0,
    reviews INTEGER DEFAULT 0,
    image TEXT,
    is_organic BOOLEAN DEFAULT false,
    weight TEXT,
    is_new BOOLEAN DEFAULT false,
    barcode TEXT UNIQUE,
    subcategory TEXT,
    shelf_location VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Branch Products (Price per branch)
CREATE TABLE IF NOT EXISTS branch_products (
    id SERIAL PRIMARY KEY,
    branch_id INTEGER REFERENCES branches(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
    price DECIMAL(10,2) NOT NULL,
    discount_price DECIMAL(10,2),
    stock_quantity INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    reserved_quantity INTEGER DEFAULT 0,
    expiry_date DATE,
    UNIQUE(branch_id, product_id)
);

-- 6. Cart Table
CREATE TABLE IF NOT EXISTS cart (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    branch_id INTEGER REFERENCES branches(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id, branch_id)
);

-- 7. Favorites Table
CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- 8. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    branch_id INTEGER REFERENCES branches(id),
    total DECIMAL(10,2),
    items JSONB,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'pending',
    payment_method TEXT DEFAULT 'cod',
    shipping_info JSONB,
    coupon_id INTEGER,
    coupon_code VARCHAR(50),
    coupon_discount DECIMAL(10,2) DEFAULT 0,
    order_code VARCHAR(20) UNIQUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL, -- 'percentage' or 'fixed'
    discount_value DECIMAL(10,2) NOT NULL,
    min_order_value DECIMAL(10,2) DEFAULT 0,
    max_discount DECIMAL(10,2),
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    per_user_limit INTEGER DEFAULT 1,
    valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Coupon Usage Table
CREATE TABLE IF NOT EXISTS coupon_usage (
    id SERIAL PRIMARY KEY,
    coupon_id INTEGER REFERENCES coupons(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    discount_amount DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Delivery Slots Table
CREATE TABLE IF NOT EXISTS delivery_slots (
    id SERIAL PRIMARY KEY,
    branch_id INTEGER REFERENCES branches(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_orders INTEGER DEFAULT 20,
    current_orders INTEGER DEFAULT 0,
    delivery_fee DECIMAL(10,2) DEFAULT 15.00,
    is_active BOOLEAN DEFAULT true,
    estimated_delivery_minutes INTEGER DEFAULT 30
);

-- 12. Delivery Staff Table
CREATE TABLE IF NOT EXISTS delivery_staff (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    phone2 TEXT,
    is_available BOOLEAN DEFAULT true,
    current_orders INTEGER DEFAULT 0,
    max_orders INTEGER DEFAULT 5,
    total_deliveries INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    last_lat DECIMAL(10,6),
    last_lng DECIMAL(10,6),
    last_location_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. Delivery Staff Branches (Many-to-Many)
CREATE TABLE IF NOT EXISTS delivery_staff_branches (
    delivery_staff_id INTEGER REFERENCES delivery_staff(id) ON DELETE CASCADE,
    branch_id INTEGER REFERENCES branches(id) ON DELETE CASCADE,
    PRIMARY KEY (delivery_staff_id, branch_id)
);

-- 14. Order Assignments Table
CREATE TABLE IF NOT EXISTS order_assignments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    delivery_staff_id INTEGER REFERENCES delivery_staff(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    picked_up_at TIMESTAMP,
    delivered_at TIMESTAMP,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    delivery_rating DECIMAL(3,2),
    is_late BOOLEAN DEFAULT false
);

-- 15. Delivery Fees Table
CREATE TABLE IF NOT EXISTS delivery_fees (
    id SERIAL PRIMARY KEY,
    branch_id INTEGER REFERENCES branches(id) ON DELETE CASCADE,
    min_order DECIMAL(10,2) DEFAULT 0,
    base_fee DECIMAL(10,2) DEFAULT 20,
    free_delivery_threshold DECIMAL(10,2),
    per_km_fee DECIMAL(10,2) DEFAULT 0,
    max_distance_km DECIMAL(5,2) DEFAULT 10,
    is_active BOOLEAN DEFAULT true
);

-- 16. Facebook Reels Table
CREATE TABLE IF NOT EXISTS facebook_reels (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    video_url TEXT,
    facebook_url TEXT NOT NULL,
    views_count VARCHAR(50) DEFAULT '0',
    duration VARCHAR(20) DEFAULT '0:30',
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 17. Stories Table
CREATE TABLE IF NOT EXISTS stories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    media_url TEXT NOT NULL,
    media_type VARCHAR(20) DEFAULT 'image',
    duration INTEGER DEFAULT 5,
    link_url TEXT,
    link_text VARCHAR(100),
    views_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    branch_id INTEGER REFERENCES branches(id),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 18. Story Views Table
CREATE TABLE IF NOT EXISTS story_views (
    id SERIAL PRIMARY KEY,
    story_id INTEGER REFERENCES stories(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    viewer_ip VARCHAR(45),
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 19. Hot Deals Table
CREATE TABLE IF NOT EXISTS hot_deals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    price DECIMAL(10,2) NOT NULL,
    old_price DECIMAL(10,2) NOT NULL,
    discount_percentage INTEGER NOT NULL,
    image VARCHAR(500),
    sold_percentage INTEGER DEFAULT 0,
    total_quantity INTEGER DEFAULT 100,
    sold_quantity INTEGER DEFAULT 0,
    product_id TEXT REFERENCES products(id),
    branch_id INTEGER REFERENCES branches(id),
    start_time TIMESTAMP DEFAULT NOW(),
    end_time TIMESTAMP NOT NULL,
    is_flash_deal BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0
);

-- 20. Magazine Offers Table
CREATE TABLE IF NOT EXISTS magazine_offers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    price DECIMAL(10,2) NOT NULL,
    old_price DECIMAL(10,2),
    unit VARCHAR(50) DEFAULT 'كجم',
    discount_percentage INTEGER,
    image VARCHAR(500),
    category VARCHAR(100) DEFAULT 'جميع العروض',
    bg_color VARCHAR(100) DEFAULT 'from-orange-500 to-orange-600',
    product_id TEXT REFERENCES products(id),
    branch_id INTEGER REFERENCES branches(id),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0
);

-- 21. Brand Offers Table
CREATE TABLE IF NOT EXISTS brand_offers (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    title_ar TEXT NOT NULL,
    subtitle TEXT,
    subtitle_ar TEXT,
    discount_text TEXT,
    discount_text_ar TEXT,
    background_type VARCHAR(20) DEFAULT 'gradient',
    background_value TEXT DEFAULT 'linear-gradient(135deg, #8B4513 0%, #5D3A1A 50%, #3D2610 100%)',
    text_color VARCHAR(50) DEFAULT '#FEF3C7',
    image_url TEXT,
    brand_logo_url TEXT,
    linked_product_id INTEGER,
    linked_brand_id INTEGER,
    link_type VARCHAR(20) DEFAULT 'product',
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    starts_at TIMESTAMP,
    expires_at TIMESTAMP
);

-- 22. Product Reviews Table
CREATE TABLE IF NOT EXISTS product_reviews (
    id SERIAL PRIMARY KEY,
    product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    user_name VARCHAR(255),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_verified_purchase BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 23. Conversations Table (Customer Service)
CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES users(id),
    customer_name TEXT,
    agent_id INTEGER REFERENCES users(id),
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 24. Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id INTEGER REFERENCES users(id),
    sender_type TEXT, -- 'customer' or 'agent'
    message TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT false
);

-- 25. User Notifications Table
CREATE TABLE IF NOT EXISTS user_notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    order_id INTEGER REFERENCES orders(id),
    type VARCHAR(50) DEFAULT 'order_update',
    message TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 26. Driver Notifications Table
CREATE TABLE IF NOT EXISTS driver_notifications (
    id SERIAL PRIMARY KEY,
    delivery_staff_id INTEGER REFERENCES delivery_staff(id) ON DELETE CASCADE,
    order_id INTEGER REFERENCES orders(id),
    type VARCHAR(50) DEFAULT 'new_order',
    message TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 27. Order Notifications Table
CREATE TABLE IF NOT EXISTS order_notifications (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 28. Order Preparation Items Table
CREATE TABLE IF NOT EXISTS order_preparation_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    is_prepared BOOLEAN DEFAULT false,
    prepared_at TIMESTAMP,
    prepared_by INTEGER REFERENCES users(id),
    notes TEXT
);

-- 29. Driver Location History Table
CREATE TABLE IF NOT EXISTS driver_location_history (
    id SERIAL PRIMARY KEY,
    delivery_staff_id INTEGER REFERENCES delivery_staff(id) ON DELETE CASCADE,
    order_id INTEGER REFERENCES orders(id),
    lat DECIMAL(10,6) NOT NULL,
    lng DECIMAL(10,6) NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================
-- PART 2: CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_branch_products_branch ON branch_products(branch_id);
CREATE INDEX IF NOT EXISTS idx_branch_products_product ON branch_products(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_code ON orders(order_code);
CREATE INDEX IF NOT EXISTS idx_cart_user ON cart(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_facebook_reels_active ON facebook_reels(is_active);
CREATE INDEX IF NOT EXISTS idx_facebook_reels_order ON facebook_reels(display_order);
CREATE INDEX IF NOT EXISTS idx_stories_active ON stories(is_active);
CREATE INDEX IF NOT EXISTS idx_stories_expires ON stories(expires_at);
CREATE INDEX IF NOT EXISTS idx_hot_deals_active ON hot_deals(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);


-- ============================================
-- PART 3: CREATE TRIGGERS
-- ============================================

-- Updated At Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to tables with updated_at
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_facebook_reels_updated_at ON facebook_reels;
CREATE TRIGGER update_facebook_reels_updated_at BEFORE UPDATE ON facebook_reels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================
-- PART 4: SAMPLE DATA
-- ============================================

-- Insert Sample Branches
INSERT INTO branches (name, address, phone, is_active, minimum_order) VALUES
('فرع المعادي', 'شارع 9 المعادي، القاهرة', '01234567890', true, 50.00),
('فرع مدينة نصر', 'شارع مكرم عبيد، مدينة نصر', '01234567891', true, 50.00)
ON CONFLICT DO NOTHING;

-- Insert Sample Categories
INSERT INTO categories (name, name_ar, icon, bg_color, display_order) VALUES
('Fruits', 'فواكه', '🍎', 'bg-red-50', 1),
('Vegetables', 'خضروات', '🥕', 'bg-green-50', 2),
('Dairy', 'ألبان', '🥛', 'bg-blue-50', 3),
('Meat', 'لحوم', '🥩', 'bg-pink-50', 4),
('Beverages', 'مشروبات', '🧃', 'bg-yellow-50', 5),
('Bakery', 'مخبوزات', '🍞', 'bg-orange-50', 6),
('Snacks', 'سناكس', '🍪', 'bg-purple-50', 7),
('Cleaning', 'تنظيف', '🧹', 'bg-cyan-50', 8)
ON CONFLICT DO NOTHING;

-- Insert Sample Facebook Reels
INSERT INTO facebook_reels (title, thumbnail_url, facebook_url, views_count, duration, is_active, display_order) VALUES
('شوكولاتة فاخرة 🔥', 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400&h=700&fit=crop', 'https://www.facebook.com/alloshmarket', '12K', '0:30', true, 1),
('عروض حصرية 🔥', 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=700&fit=crop', 'https://www.facebook.com/alloshmarket', '8.5K', '0:25', true, 2),
('منتجات الألبان الطازجة 🥛', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=700&fit=crop', 'https://www.facebook.com/alloshmarket', '15K', '0:20', true, 3),
('فواكه وخضروات طازجة 🥕', 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=700&fit=crop', 'https://www.facebook.com/alloshmarket', '9.2K', '0:35', true, 4),
('مشروبات منعشة 🍹', 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=400&h=700&fit=crop', 'https://www.facebook.com/alloshmarket', '11K', '0:40', true, 5)
ON CONFLICT DO NOTHING;

-- Insert Sample Coupon
INSERT INTO coupons (code, description, discount_type, discount_value, min_order_value, is_active) VALUES
('WELCOME10', 'خصم 10% للطلب الأول', 'percentage', 10, 100, true),
('FREESHIP', 'توصيل مجاني', 'fixed', 20, 200, true)
ON CONFLICT DO NOTHING;


-- ============================================
-- PART 5: ROW LEVEL SECURITY (Optional)
-- ============================================

-- Uncomment these if you want to use Supabase Auth with RLS

-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE cart ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
-- CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
-- CREATE POLICY "Public read branches" ON branches FOR SELECT USING (true);
-- CREATE POLICY "Public read active reels" ON facebook_reels FOR SELECT USING (is_active = true);


-- ============================================
-- DONE! ✅
-- ============================================
SELECT 'Database setup complete!' as status;
