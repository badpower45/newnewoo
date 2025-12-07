-- =============================================
-- ALLOSH MARKET - Complete Database Schema
-- Generated: 2025-12-04T14:28:57.646Z
-- Database: Supabase PostgreSQL
-- =============================================

-- =============================================
-- Table: branch_products
-- =============================================
CREATE TABLE IF NOT EXISTS branch_products (
    branch_id INTEGER NOT NULL,
    product_id TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    discount_price DECIMAL(10,2),
    stock_quantity INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    reserved_quantity INTEGER DEFAULT 0,
    expiry_date DATE
);

-- =============================================
-- Table: branches
-- =============================================
CREATE TABLE IF NOT EXISTS branches (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    location_lat DECIMAL(10,2),
    location_lng DECIMAL(10,2),
    coverage_radius_km DECIMAL(10,2) DEFAULT 5.0,
    is_active BOOLEAN DEFAULT true,
    phone TEXT,
    phone2 TEXT,
    maps_link TEXT,
    address TEXT,
    minimum_order DECIMAL(10,2) DEFAULT 50.00
);

-- =============================================
-- Table: brand_offers
-- =============================================
CREATE TABLE IF NOT EXISTS brand_offers (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    title_ar TEXT NOT NULL,
    subtitle TEXT,
    subtitle_ar TEXT,
    discount_text TEXT,
    discount_text_ar TEXT,
    background_type VARCHAR(20) DEFAULT 'gradient'::character varying,
    background_value TEXT DEFAULT 'linear-gradient(135deg, #8B4513 0%, #5D3A1A 50%, #3D2610 100%)'::text,
    text_color VARCHAR(50) DEFAULT '#FEF3C7'::character varying,
    badge_color VARCHAR(50) DEFAULT '#EF4444'::character varying,
    badge_text_color VARCHAR(50) DEFAULT '#FFFFFF'::character varying,
    image_url TEXT,
    brand_logo_url TEXT,
    linked_product_id INTEGER,
    linked_brand_id INTEGER,
    link_type VARCHAR(20) DEFAULT 'product'::character varying,
    custom_link TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    starts_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- Table: cart
-- =============================================
CREATE TABLE IF NOT EXISTS cart (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    product_id TEXT,
    quantity INTEGER DEFAULT 1
);

-- =============================================
-- Table: categories
-- =============================================
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100),
    image TEXT,
    icon VARCHAR(10),
    bg_color VARCHAR(50) DEFAULT 'bg-orange-50'::character varying,
    description TEXT,
    parent_id INTEGER,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- Table: conversations
-- =============================================
CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER,
    customer_name TEXT,
    agent_id INTEGER,
    status TEXT DEFAULT 'active'::text,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- Table: coupon_usage
-- =============================================
CREATE TABLE IF NOT EXISTS coupon_usage (
    id SERIAL PRIMARY KEY,
    coupon_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    order_id INTEGER NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- Table: coupons
-- =============================================
CREATE TABLE IF NOT EXISTS coupons (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    min_order_value DECIMAL(10,2) DEFAULT 0,
    max_discount DECIMAL(10,2),
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    per_user_limit INTEGER DEFAULT 1,
    valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- Table: delivery_fees
-- =============================================
CREATE TABLE IF NOT EXISTS delivery_fees (
    id SERIAL PRIMARY KEY,
    branch_id INTEGER,
    min_order DECIMAL(10,2) DEFAULT 0,
    base_fee DECIMAL(10,2) DEFAULT 20,
    free_delivery_threshold DECIMAL(10,2),
    per_km_fee DECIMAL(10,2) DEFAULT 0,
    max_distance_km DECIMAL(10,2) DEFAULT 10,
    peak_hours_multiplier DECIMAL(10,2) DEFAULT 1.0,
    peak_hours_start TIME WITHOUT TIME ZONE,
    peak_hours_end TIME WITHOUT TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- Table: delivery_slots
-- =============================================
CREATE TABLE IF NOT EXISTS delivery_slots (
    id SERIAL PRIMARY KEY,
    branch_id INTEGER NOT NULL,
    date DATE NOT NULL,
    start_time TIME WITHOUT TIME ZONE NOT NULL,
    end_time TIME WITHOUT TIME ZONE NOT NULL,
    max_orders INTEGER DEFAULT 20,
    current_orders INTEGER DEFAULT 0,
    delivery_fee DECIMAL(10,2) DEFAULT 15.00,
    is_active BOOLEAN DEFAULT true,
    estimated_delivery_minutes INTEGER DEFAULT 30
);

-- =============================================
-- Table: delivery_staff
-- =============================================
CREATE TABLE IF NOT EXISTS delivery_staff (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    phone2 TEXT,
    is_available BOOLEAN DEFAULT true,
    current_orders INTEGER DEFAULT 0,
    max_orders INTEGER DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_deliveries INTEGER DEFAULT 0,
    total_rating_sum DECIMAL(10,2) DEFAULT 0,
    total_ratings_count INTEGER DEFAULT 0,
    average_rating DECIMAL(10,2) DEFAULT 0,
    average_delivery_time INTEGER DEFAULT 0,
    on_time_deliveries INTEGER DEFAULT 0,
    late_deliveries INTEGER DEFAULT 0,
    rejected_orders INTEGER DEFAULT 0,
    expired_orders INTEGER DEFAULT 0,
    last_lat DECIMAL(10,2),
    last_lng DECIMAL(10,2),
    last_location_at TIMESTAMP
);

-- =============================================
-- Table: delivery_staff_branches
-- =============================================
CREATE TABLE IF NOT EXISTS delivery_staff_branches (
    delivery_staff_id INTEGER NOT NULL,
    branch_id INTEGER NOT NULL
);

-- =============================================
-- Table: driver_location_history
-- =============================================
CREATE TABLE IF NOT EXISTS driver_location_history (
    id SERIAL PRIMARY KEY,
    delivery_staff_id INTEGER NOT NULL,
    order_id INTEGER,
    lat DECIMAL(10,2) NOT NULL,
    lng DECIMAL(10,2) NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- Table: driver_notifications
-- =============================================
CREATE TABLE IF NOT EXISTS driver_notifications (
    id SERIAL PRIMARY KEY,
    delivery_staff_id INTEGER,
    order_id INTEGER,
    type VARCHAR(50) DEFAULT 'new_order'::character varying NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT now()
);

-- =============================================
-- Table: facebook_reels
-- =============================================
CREATE TABLE IF NOT EXISTS facebook_reels (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    video_url TEXT,
    facebook_url TEXT NOT NULL,
    views_count VARCHAR(50) DEFAULT '0'::character varying,
    duration VARCHAR(20) DEFAULT '0:30'::character varying,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- Table: favorites
-- =============================================
CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    product_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- Table: hot_deals
-- =============================================
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
    product_id TEXT,
    branch_id INTEGER,
    start_time TIMESTAMP DEFAULT now(),
    end_time TIMESTAMP NOT NULL,
    is_flash_deal BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- =============================================
-- Table: magazine_offers
-- =============================================
CREATE TABLE IF NOT EXISTS magazine_offers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    price DECIMAL(10,2) NOT NULL,
    old_price DECIMAL(10,2),
    unit VARCHAR(50) DEFAULT 'كجم'::character varying,
    discount_percentage INTEGER,
    image VARCHAR(500),
    category VARCHAR(100) DEFAULT 'جميع العروض'::character varying,
    bg_color VARCHAR(100) DEFAULT 'from-orange-500 to-orange-600'::character varying,
    product_id TEXT,
    branch_id INTEGER,
    start_date TIMESTAMP DEFAULT now(),
    end_date TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- =============================================
-- Table: messages
-- =============================================
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER,
    sender_id INTEGER,
    sender_type TEXT,
    message TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT false
);

-- =============================================
-- Table: order_assignments
-- =============================================
CREATE TABLE IF NOT EXISTS order_assignments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    delivery_staff_id INTEGER,
    distributor_id INTEGER,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    picked_up_at TIMESTAMP,
    delivered_at TIMESTAMP,
    status TEXT DEFAULT 'pending'::text,
    notes TEXT,
    arriving_at TIMESTAMP,
    rejected_at TIMESTAMP,
    rejection_reason TEXT,
    accept_deadline TIMESTAMP,
    accepted_at TIMESTAMP,
    branch_arrived_at TIMESTAMP,
    customer_arrived_at TIMESTAMP,
    time_to_branch INTEGER,
    time_to_customer INTEGER,
    total_delivery_time INTEGER,
    delivery_rating DECIMAL(10,2),
    order_rating DECIMAL(10,2),
    speed_rating DECIMAL(10,2),
    rating_notes TEXT,
    rated_at TIMESTAMP,
    expected_delivery_time INTEGER,
    is_late BOOLEAN DEFAULT false,
    late_minutes INTEGER DEFAULT 0
);

-- =============================================
-- Table: order_notifications
-- =============================================
CREATE TABLE IF NOT EXISTS order_notifications (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    user_id INTEGER,
    type VARCHAR(50) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- Table: order_preparation_items
-- =============================================
CREATE TABLE IF NOT EXISTS order_preparation_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    is_prepared BOOLEAN DEFAULT false,
    prepared_at TIMESTAMP,
    prepared_by INTEGER,
    notes TEXT
);

-- =============================================
-- Table: orders
-- =============================================
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    branch_id INTEGER,
    total DECIMAL(10,2),
    items JSONB,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'pending'::text,
    payment_method TEXT DEFAULT 'cod'::text,
    shipping_info JSONB,
    coupon_id INTEGER,
    coupon_code VARCHAR(50),
    coupon_discount DECIMAL(10,2) DEFAULT 0,
    order_code VARCHAR(20)
);

-- =============================================
-- Table: product_reviews
-- =============================================
CREATE TABLE IF NOT EXISTS product_reviews (
    id SERIAL PRIMARY KEY,
    product_id TEXT NOT NULL,
    user_id INTEGER,
    user_name VARCHAR(255),
    rating INTEGER NOT NULL,
    comment TEXT,
    is_verified_purchase BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- =============================================
-- Table: products
-- =============================================
CREATE TABLE IF NOT EXISTS products (
    id TEXT NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    rating DECIMAL(10,2) DEFAULT 0,
    reviews INTEGER DEFAULT 0,
    image TEXT,
    is_organic BOOLEAN DEFAULT false,
    weight TEXT,
    is_new BOOLEAN DEFAULT false,
    barcode TEXT,
    subcategory TEXT,
    shelf_location VARCHAR(100)
);

-- =============================================
-- Table: stories
-- =============================================
CREATE TABLE IF NOT EXISTS stories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    title VARCHAR(255) NOT NULL,
    media_url TEXT NOT NULL,
    media_type VARCHAR(20) DEFAULT 'image'::character varying,
    duration INTEGER DEFAULT 5,
    link_url TEXT,
    link_text VARCHAR(100),
    views_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    branch_id INTEGER,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- Table: story_views
-- =============================================
CREATE TABLE IF NOT EXISTS story_views (
    id SERIAL PRIMARY KEY,
    story_id INTEGER NOT NULL,
    user_id INTEGER,
    viewer_ip VARCHAR(45),
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- Table: user_notifications
-- =============================================
CREATE TABLE IF NOT EXISTS user_notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    order_id INTEGER,
    type VARCHAR(50) DEFAULT 'order_update'::character varying NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT now()
);

-- =============================================
-- Table: users
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT,
    email TEXT,
    password TEXT,
    role TEXT DEFAULT 'customer'::text,
    default_branch_id INTEGER,
    loyalty_points INTEGER DEFAULT 0,
    assigned_branch_id INTEGER,
    google_id VARCHAR(255),
    facebook_id VARCHAR(255),
    avatar VARCHAR(500),
    reset_token VARCHAR(255),
    reset_token_expiry TIMESTAMP,
    reset_token_expires TIMESTAMP,
    profile_picture TEXT
);


-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

-- Orders policy
CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Cart policy
CREATE POLICY "Users can manage own cart" ON cart
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Favorites policy
CREATE POLICY "Users can manage own favorites" ON favorites
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Public read access for products, categories, branches
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read branches" ON branches FOR SELECT USING (true);
CREATE POLICY "Public read facebook_reels" ON facebook_reels FOR SELECT USING (is_active = true);
