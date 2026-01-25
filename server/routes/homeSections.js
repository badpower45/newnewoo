import express from 'express';
import { query } from '../database.js';

const router = express.Router();
const clampNumber = (value, fallback, max) => {
    const parsed = parseInt(value, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
    return Math.min(parsed, max);
};

const normalizeCategoryValue = (value = '') =>
    value
        .toString()
        .trim()
        .toLowerCase()
        .replace(/أ|إ|آ/g, 'ا')
        .replace(/ة/g, 'ه')
        .replace(/ى/g, 'ي')
        .replace(/\s+/g, '')
        .replace(/[-_]/g, '');

// ============================================
// GET all active home sections with products
// ============================================
router.get('/', async (req, res) => {
    try {
        res.set('Cache-Control', 'public, max-age=60, s-maxage=120, stale-while-revalidate=600');
        const branchId = req.query.branchId;
        const all = req.query.all === 'true';
        const pageValue = clampNumber(req.query.page, 1, 1000);
        const limitValue = clampNumber(req.query.limit, 3, 10);
        const offsetValue = (pageValue - 1) * limitValue;
        const productLimit = clampNumber(req.query.productLimit, 8, 12);

        // Check if home_sections table exists and has data
        const totalResult = await query(
            `SELECT COUNT(*) AS total FROM home_sections WHERE is_active = true`,
            []
        );
        const total = parseInt(totalResult?.rows?.[0]?.total || '0', 10);

        const sectionsResult = await query(
            `SELECT id, section_name, section_name_ar, banner_image, category, display_order, max_products
             FROM home_sections
             WHERE is_active = true
             ORDER BY display_order ASC
             ${all ? '' : 'LIMIT $1 OFFSET $2'}`,
            all ? [] : [limitValue, offsetValue]
        );

        const sections = sectionsResult?.rows || [];
        
        // If no sections, return empty array
        if (sections.length === 0) {
            console.log('No active home sections found');
            return res.json({ data: [] });
        }

        // For each section, get products from that category
        const sectionsWithProducts = await Promise.all(
            sections.map(async (section) => {
                try {
                    const sectionMax = Math.min(section.max_products || productLimit, productLimit);
                    
                    const categoryCandidates = [
                        section.category,
                        section.section_name_ar,
                        section.section_name
                    ]
                        .filter(Boolean)
                        .map((value) => value.toString().trim())
                        .filter((value, index, self) => self.indexOf(value) === index);

                    const normalizedCandidates = categoryCandidates.map(normalizeCategoryValue).filter(Boolean);
                    const hasCandidates = normalizedCandidates.length > 0;

                    const categoryFilter = hasCandidates
                        ? normalizedCandidates
                            .map((_, idx) => `
                                normalize_arabic_text(p.category) = normalize_arabic_text($${idx + 1})
                                OR p.category = $${idx + 1}
                            `)
                            .join(' OR ')
                        : 'TRUE';

                    const categoryMatchFilter = hasCandidates
                        ? normalizedCandidates
                            .map((_, idx) => `
                                normalize_arabic_text(c.name) = normalize_arabic_text($${idx + 1})
                                OR normalize_arabic_text(c.name_ar) = normalize_arabic_text($${idx + 1})
                            `)
                            .join(' OR ')
                        : 'FALSE';

                    let productsQuery = `
                        WITH matched_category AS (
                            SELECT c.*
                            FROM categories c
                            WHERE ${categoryMatchFilter}
                            LIMIT 1
                        )
                        SELECT DISTINCT ON (p.id) 
                            p.id AS i,
                            p.name AS n,
                            p.name_ar AS na,
                            p.category AS c,
                            p.image AS im,
                            p.weight AS w,
                            p.frame_overlay_url AS fo,
                            p.frame_enabled AS fe,
                            bp.price AS p,
                            bp.discount_price AS dp,
                            p.brand_id AS bi,
                            b.name_ar AS bna,
                            b.name_en AS bne
                        FROM products p
                        LEFT JOIN brands b ON p.brand_id = b.id
                        LEFT JOIN branch_products bp ON p.id = bp.product_id
                        LEFT JOIN matched_category c ON TRUE
                        WHERE (
                            ${categoryFilter}
                            OR (
                                c.id IS NOT NULL
                                AND (
                                    normalize_arabic_text(p.category) = normalize_arabic_text(c.name)
                                    OR normalize_arabic_text(p.category) = normalize_arabic_text(c.name_ar)
                                )
                            )
                        )
                    `;

                    const params = hasCandidates ? categoryCandidates : [section.category];

                    if (branchId) {
                        productsQuery += ` AND bp.branch_id = $${params.length + 1} AND bp.is_available = true`;
                        params.push(branchId);
                    }

                    productsQuery += ` ORDER BY p.id ASC LIMIT $${params.length + 1}`;
                    params.push(sectionMax);
                    
                    const productsResult = await query(productsQuery, params);
                    
                    return {
                        ...section,
                        products: productsResult?.rows || []
                    };
                } catch (err) {
                    console.error(`❌ Error fetching products for section ${section.id}:`, err);
                    return {
                        ...section,
                        products: []
                    };
                }
            })
        );
        
        const currentCount = sectionsWithProducts.length;
        const hasMore = all ? false : offsetValue + currentCount < total;

        res.json({
            data: sectionsWithProducts,
            page: all ? 1 : pageValue,
            limit: all ? total : limitValue,
            total,
            hasMore
        });
    } catch (error) {
        console.error('Error fetching home sections:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ error: 'Failed to fetch home sections', message: error.message, data: [] });
    }
});

// ============================================
// GET single home section
// ============================================
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query(
            'SELECT * FROM home_sections WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Section not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching section:', error);
        res.status(500).json({ error: 'Failed to fetch section' });
    }
});

// ============================================
// CREATE new home section (Admin only)
// ============================================
router.post('/', async (req, res) => {
    try {
        const {
            section_name,
            section_name_ar,
            banner_image,
            category,
            display_order,
            max_products,
            is_active
        } = req.body;

        // Validation
        if (!section_name || !section_name_ar || !banner_image || !category) {
            return res.status(400).json({
                error: 'Missing required fields'
            });
        }

        const result = await query(
            `INSERT INTO home_sections 
             (section_name, section_name_ar, banner_image, category, display_order, max_products, is_active)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [
                section_name,
                section_name_ar,
                banner_image,
                category,
                display_order || 0,
                max_products || 8,
                is_active !== false
            ]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating section:', error);
        res.status(500).json({ error: 'Failed to create section' });
    }
});

// ============================================
// UPDATE home section (Admin only)
// ============================================
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            section_name,
            section_name_ar,
            banner_image,
            category,
            display_order,
            max_products,
            is_active
        } = req.body;

        const result = await query(
            `UPDATE home_sections 
             SET section_name = COALESCE($1, section_name),
                 section_name_ar = COALESCE($2, section_name_ar),
                 banner_image = COALESCE($3, banner_image),
                 category = COALESCE($4, category),
                 display_order = COALESCE($5, display_order),
                 max_products = COALESCE($6, max_products),
                 is_active = COALESCE($7, is_active)
             WHERE id = $8
             RETURNING *`,
            [
                section_name,
                section_name_ar,
                banner_image,
                category,
                display_order,
                max_products,
                is_active,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Section not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating section:', error);
        res.status(500).json({ error: 'Failed to update section' });
    }
});

// ============================================
// DELETE home section (Admin only)
// ============================================
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query(
            'DELETE FROM home_sections WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Section not found' });
        }

        res.json({ message: 'Section deleted successfully' });
    } catch (error) {
        console.error('Error deleting section:', error);
        res.status(500).json({ error: 'Failed to delete section' });
    }
});

// ============================================
// REORDER sections (Admin only)
// ============================================
router.post('/reorder', async (req, res) => {
    try {
        const { sections } = req.body; // Array of {id, display_order}

        if (!Array.isArray(sections)) {
            return res.status(400).json({ error: 'Invalid data format' });
        }

        await query('BEGIN');

        for (const section of sections) {
            await query(
                'UPDATE home_sections SET display_order = $1 WHERE id = $2',
                [section.display_order, section.id]
            );
        }

        await query('COMMIT');

        res.json({ message: 'Sections reordered successfully' });
    } catch (error) {
        await query('ROLLBACK');
        console.error('Error reordering sections:', error);
        res.status(500).json({ error: 'Failed to reorder sections' });
    }
});

export default router;
