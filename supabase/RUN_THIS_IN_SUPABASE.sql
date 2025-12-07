-- =========================================
-- Pickup / Branch Fulfillment Enhancements
-- Run in Supabase SQL editor
-- =========================================

-- Ensure PostGIS is enabled (needed for geography)
create extension if not exists postgis;

-- 1) Branch metadata: geo + pickup capability
alter table if exists branches
    add column if not exists latitude numeric(10,6),
    add column if not exists longitude numeric(10,6),
    add column if not exists coverage_radius_km numeric(6,2),
    add column if not exists governorate text,
    add column if not exists city text,
    add column if not exists address text,
    add column if not exists pickup_enabled boolean default true;

-- 2) Optional precise coverage polygons per branch
create table if not exists branch_service_areas (
    id bigserial primary key,
    branch_id bigint references branches(id) on delete cascade,
    name text,
    governorate text,
    city text,
    coverage public.geography(MultiPolygon, 4326),
    created_at timestamptz default now()
);

create index if not exists idx_branch_service_areas_branch on branch_service_areas(branch_id);
create index if not exists idx_branch_service_areas_geo on branch_service_areas using gist(coverage);

-- 3) Orders: fulfillment type + pickup branch
alter table if exists orders
    add column if not exists fulfillment_type text default 'delivery' check (fulfillment_type in ('delivery','pickup')),
    add column if not exists pickup_branch_id bigint references branches(id);

-- Keep data consistent: if pickup, branch must be set
create or replace function orders_fulfillment_check() returns trigger as $$
begin
  if new.fulfillment_type = 'pickup' and new.pickup_branch_id is null then
    raise exception 'pickup_branch_id required when fulfillment_type=pickup';
  end if;
  return new;
end;$$ language plpgsql;

drop trigger if exists trg_orders_fulfillment_check on orders;
create trigger trg_orders_fulfillment_check before insert or update on orders
for each row execute function orders_fulfillment_check();

-- 4) Helper views/functions for nearest branch selection
-- Uses point-radius if coverage polygons are not provided; prefers polygons when available

-- Function: get branches that cover a point (using polygons)
create or replace function public.branches_covering_point(lat double precision, lng double precision)
returns table(
    branch_id bigint,
    name text,
    governorate text,
    city text,
    distance_km numeric
)
language sql stable as $$
    select bsa.branch_id,
           b.name,
           b.governorate,
           b.city,
                     round(
                         (st_distance(
                             st_setsrid(st_makepoint(lng, lat), 4326)::geography,
                             st_centroid(bsa.coverage)
                         ) / 1000)::numeric,
                         2
                     ) as distance_km
    from branch_service_areas bsa
    join branches b on b.id = bsa.branch_id
    where bsa.coverage is not null
      and st_intersects(
            bsa.coverage,
            st_setsrid(st_makepoint(lng, lat), 4326)::geography
          );
$$;

-- Function: nearest branch by radius fallback
create or replace function public.nearest_branch_by_radius(lat double precision, lng double precision)
returns table(
    branch_id bigint,
    name text,
    governorate text,
    city text,
    distance_km numeric
) language sql stable as $$
    select b.id,
           b.name,
           b.governorate,
           b.city,
              round(
                 (st_distance(
                     st_setsrid(st_makepoint(lng, lat), 4326)::geography,
                     st_setsrid(st_makepoint(b.longitude, b.latitude), 4326)::geography
                 ) / 1000)::numeric,
                 2
              ) as distance_km
    from branches b
    where b.latitude is not null and b.longitude is not null
      and (b.coverage_radius_km is null or st_distance(
                    st_setsrid(st_makepoint(lng, lat), 4326)::geography,
                    st_setsrid(st_makepoint(b.longitude, b.latitude), 4326)::geography
                 ) <= (b.coverage_radius_km * 1000))
    order by distance_km asc
    limit 1;
$$;

-- Function: smart selection (prefer polygons, else radius)
create or replace function public.select_branch_for_location(lat double precision, lng double precision)
returns table(
    branch_id bigint,
    name text,
    governorate text,
    city text,
    distance_km numeric,
    source text
) language plpgsql stable as $$
declare
    poly_rec record;
    radius_rec record;
begin
    for poly_rec in
        select * from branches_covering_point(lat, lng) limit 1
    loop
        return query select poly_rec.branch_id, poly_rec.name, poly_rec.governorate, poly_rec.city, poly_rec.distance_km, 'polygon';
        return;
    end loop;

    for radius_rec in
        select * from nearest_branch_by_radius(lat, lng) limit 1
    loop
        return query select radius_rec.branch_id, radius_rec.name, radius_rec.governorate, radius_rec.city, radius_rec.distance_km, 'radius';
        return;
    end loop;

    return;
end;
$$;

-- 5) Convenience view for branch products (ensures numeric price)
create or replace view public.branch_products_view as
select bp.branch_id,
       bp.product_id,
        coalesce(bp.price, p.price) as price,
       bp.stock_quantity,
       bp.is_available,
       p.name,
       p.category,
       p.subcategory,
       p.image_url
from branch_products bp
join products p on p.id = bp.product_id;

-- 6) Optional seed example for a branch with pickup and radius (edit values as needed)
-- insert into branches (name, latitude, longitude, coverage_radius_km, governorate, city, address, pickup_enabled)
-- values ('فرع المعادي', 29.9625, 31.2769, 8, 'القاهرة', 'المعادي', 'شارع النصر', true);

-- 7) Optional: example service area polygon (replace coordinates with your area)
-- insert into branch_service_areas (branch_id, name, governorate, city, coverage)
-- values (1, 'معادي بوليجون', 'القاهرة', 'المعادي',
--   st_geogfromtext('POLYGON((31.24 29.95, 31.30 29.95, 31.30 29.99, 31.24 29.99, 31.24 29.95))')
-- );

-- Done
-- =============================================
-- 🔧 SUPABASE FIXES - RUN THIS IN SQL EDITOR
-- Allosh Market Database
-- =============================================
-- Copy and paste this entire file into Supabase SQL Editor
-- Then click "Run" to execute all fixes
-- =============================================


-- ============================================
-- 1️⃣ ADD MISSING COLUMN TO CART TABLE (CRITICAL)
-- ============================================
ALTER TABLE cart ADD COLUMN IF NOT EXISTS substitution_preference VARCHAR(50) DEFAULT 'none';


-- ============================================
-- 2️⃣ ADD MISSING TIMESTAMPS
-- ============================================

-- Users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Products table  
ALTER TABLE products ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT;


-- ============================================
-- 3️⃣ ADD INDEXES FOR BETTER PERFORMANCE
-- ============================================

-- Cart indexes
CREATE INDEX IF NOT EXISTS idx_cart_user ON cart(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_user_product ON cart(user_id, product_id);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(date DESC);
CREATE INDEX IF NOT EXISTS idx_orders_code ON orders(order_code);

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);

-- Branch products indexes
CREATE INDEX IF NOT EXISTS idx_branch_products_branch ON branch_products(branch_id);
CREATE INDEX IF NOT EXISTS idx_branch_products_product ON branch_products(product_id);

-- Favorites indexes
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);

-- Facebook reels indexes
CREATE INDEX IF NOT EXISTS idx_reels_active ON facebook_reels(is_active, display_order);

-- Stories indexes
CREATE INDEX IF NOT EXISTS idx_stories_active ON stories(is_active, expires_at);

-- Hot deals indexes
CREATE INDEX IF NOT EXISTS idx_hot_deals_active ON hot_deals(is_active, end_time);


-- ============================================
-- 4️⃣ ADD UNIQUE CONSTRAINTS
-- ============================================

-- Prevent duplicate favorites
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'favorites_user_product_unique') THEN
        ALTER TABLE favorites ADD CONSTRAINT favorites_user_product_unique UNIQUE (user_id, product_id);
    END IF;
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;

-- Ensure order_code is unique
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_orders_code_unique') THEN
        CREATE UNIQUE INDEX idx_orders_code_unique ON orders(order_code) WHERE order_code IS NOT NULL;
    END IF;
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;


-- ============================================
-- 5️⃣ CREATE UPDATED_AT TRIGGER
-- ============================================

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to orders table
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Apply to facebook_reels table
DROP TRIGGER IF EXISTS update_facebook_reels_updated_at ON facebook_reels;
CREATE TRIGGER update_facebook_reels_updated_at 
    BEFORE UPDATE ON facebook_reels
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Apply to categories table
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON categories
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();


-- ============================================
-- 6️⃣ VERIFY CHANGES
-- ============================================

-- Check cart table has substitution_preference
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'cart' AND column_name = 'substitution_preference';

-- Check all indexes created
SELECT indexname FROM pg_indexes WHERE schemaname = 'public' ORDER BY indexname;


-- ============================================
-- ✅ DONE!
-- ============================================
SELECT '✅ All fixes applied successfully!' as status;
