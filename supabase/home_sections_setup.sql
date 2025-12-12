-- =============================================
-- HOME SECTIONS MANAGEMENT SYSTEM
-- =============================================
-- This allows admins to dynamically manage homepage sections
-- Each section has: Banner Image, Category, and Products

-- 1. Create home_sections table
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

-- 2. Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_home_sections_active ON home_sections(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_home_sections_category ON home_sections(category);

-- 3. Add trigger for updated_at
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

-- 4. Insert sample data
INSERT INTO home_sections (section_name, section_name_ar, banner_image, category, display_order, max_products) VALUES
('Fresh Fruits', 'الفواكه الطازجة', 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=1200&h=400&fit=crop', 'فواكه', 1, 8),
('Dairy Products', 'منتجات الألبان', 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=1200&h=400&fit=crop', 'ألبان', 2, 8),
('Vegetables', 'الخضروات', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1200&h=400&fit=crop', 'خضروات', 3, 8)
ON CONFLICT DO NOTHING;

-- =============================================
-- DONE! ✅
-- =============================================
SELECT 'Home sections table created successfully!' as status;
