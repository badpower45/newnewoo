-- =============================================
-- Facebook Reels Table for Supabase
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Create the facebook_reels table (if not exists)
CREATE TABLE IF NOT EXISTS facebook_reels (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    thumbnail_url TEXT NOT NULL,
    video_url TEXT,
    facebook_url TEXT NOT NULL,
    views_count VARCHAR(50) DEFAULT '0',
    duration VARCHAR(20) DEFAULT '0:30',
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_facebook_reels_active ON facebook_reels(is_active);
CREATE INDEX IF NOT EXISTS idx_facebook_reels_order ON facebook_reels(display_order);

-- 3. Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_facebook_reels_updated_at ON facebook_reels;
CREATE TRIGGER update_facebook_reels_updated_at
    BEFORE UPDATE ON facebook_reels
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE facebook_reels ENABLE ROW LEVEL SECURITY;

-- 5. Create policies for public read access
DROP POLICY IF EXISTS "Allow public read access" ON facebook_reels;
CREATE POLICY "Allow public read access" ON facebook_reels
    FOR SELECT USING (is_active = true);

-- 6. Create policy for authenticated users to manage reels (admin)
DROP POLICY IF EXISTS "Allow authenticated users full access" ON facebook_reels;
CREATE POLICY "Allow authenticated users full access" ON facebook_reels
    FOR ALL USING (auth.role() = 'authenticated');

-- =============================================
-- INSERT SAMPLE DATA
-- =============================================

-- Clear existing data (optional - remove if you want to keep existing data)
-- DELETE FROM facebook_reels;

-- Insert sample reels
INSERT INTO facebook_reels (title, thumbnail_url, video_url, facebook_url, views_count, duration, is_active, display_order) VALUES
(
    'شوكولاتة فاخرة 🔥',
    'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400&h=700&fit=crop',
    NULL,
    'https://www.facebook.com/alloshmarket',
    '12K',
    '0:30',
    true,
    1
),
(
    'عروض حصرية 🔥',
    'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=700&fit=crop',
    NULL,
    'https://www.facebook.com/alloshmarket',
    '8.5K',
    '0:25',
    true,
    2
),
(
    'منتجات الألبان الطازجة 🥛',
    'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=700&fit=crop',
    NULL,
    'https://www.facebook.com/alloshmarket',
    '15K',
    '0:20',
    true,
    3
),
(
    'فواكه وخضروات طازجة 🥕',
    'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=700&fit=crop',
    NULL,
    'https://www.facebook.com/alloshmarket',
    '9.2K',
    '0:35',
    true,
    4
),
(
    'مشروبات منعشة 🍹',
    'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=400&h=700&fit=crop',
    NULL,
    'https://www.facebook.com/alloshmarket',
    '11K',
    '0:40',
    true,
    5
),
(
    'عرض الزبدة الشرقية بيور 🏃🏻🔥',
    'https://i.postimg.cc/0jBT3TWK/البان.jpg',
    'https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1931454150918912',
    'https://www.facebook.com/reel/1931454150918912',
    '20',
    '0:15',
    true,
    6
)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- VERIFY DATA
-- =============================================
SELECT id, title, views_count, is_active, display_order FROM facebook_reels ORDER BY display_order;
