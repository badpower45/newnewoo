import express from 'express';
import { query } from '../database.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import { responseCache, CacheTTL } from '../services/responseCache.js';

const router = express.Router();

// ==========================================
// PUBLIC ROUTES
// ==========================================

// Get all brands (public)
router.get('/', async (req, res) => {
    try {
        res.set('Cache-Control', 'public, max-age=60, s-maxage=120, stale-while-revalidate=600');
        const cacheKey = 'brands:all';
        const cached = responseCache.get(cacheKey);
        if (cached) return res.json(cached);

        const { rows } = await query(`
            SELECT b.*, 
                   COALESCE(pc.count, 0)::int AS products_count
            FROM brands b
            LEFT JOIN (
                SELECT brand_id, COUNT(*)::int AS count 
                FROM products 
                WHERE brand_id IS NOT NULL
                GROUP BY brand_id
            ) pc ON pc.brand_id = b.id::text OR pc.brand_id = b.id::varchar
            ORDER BY b.is_featured DESC, b.name_ar ASC
        `);

        const result = { success: true, data: rows };
        responseCache.set(cacheKey, result, CacheTTL.MEDIUM);
        res.json(result);
    } catch (error) {
        console.error('❌ Error fetching brands:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch brands' });
    }
});

// Get featured brands (public)
router.get('/featured', async (req, res) => {
    try {
        res.set('Cache-Control', 'public, max-age=60, s-maxage=120');
        const cacheKey = 'brands:featured';
        const cached = responseCache.get(cacheKey);
        if (cached) return res.json(cached);

        const { rows } = await query(`
            SELECT b.*, 
                   COALESCE(pc.count, 0)::int AS products_count
            FROM brands b
            LEFT JOIN (
                SELECT brand_id, COUNT(*)::int AS count 
                FROM products 
                WHERE brand_id IS NOT NULL
                GROUP BY brand_id
            ) pc ON pc.brand_id = b.id::text OR pc.brand_id = b.id::varchar
            WHERE b.is_featured = true
            ORDER BY b.name_ar ASC
        `);

        const result = { success: true, data: rows };
        responseCache.set(cacheKey, result, CacheTTL.MEDIUM);
        res.json(result);
    } catch (error) {
        console.error('❌ Error fetching featured brands:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch featured brands' });
    }
});

// ==========================================
// ADMIN ROUTES
// ==========================================

// Get brands list for admin (with pagination)
router.get('/admin/list', [verifyToken, isAdmin], async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const offset = (page - 1) * limit;

        const [brandsResult, countResult] = await Promise.all([
            query(`
                SELECT b.*, 
                       COALESCE(pc.count, 0)::int AS products_count
                FROM brands b
                LEFT JOIN (
                    SELECT brand_id, COUNT(*)::int AS count 
                    FROM products 
                    WHERE brand_id IS NOT NULL
                    GROUP BY brand_id
                ) pc ON pc.brand_id = b.id::text OR pc.brand_id = b.id::varchar
                ORDER BY b.created_at DESC
                LIMIT $1 OFFSET $2
            `, [limit, offset]),
            query('SELECT COUNT(*)::int AS total FROM brands')
        ]);

        res.json({
            success: true,
            data: brandsResult.rows,
            total: countResult.rows[0]?.total || 0,
            page,
            limit
        });
    } catch (error) {
        console.error('❌ Error fetching admin brands list:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch brands' });
    }
});

// Get brand by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await query(`
            SELECT b.*, 
                   COALESCE(pc.count, 0)::int AS products_count
            FROM brands b
            LEFT JOIN (
                SELECT brand_id, COUNT(*)::int AS count 
                FROM products 
                WHERE brand_id IS NOT NULL
                GROUP BY brand_id
            ) pc ON pc.brand_id = b.id::text OR pc.brand_id = b.id::varchar
            WHERE b.id = $1
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Brand not found' });
        }

        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('❌ Error fetching brand:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch brand' });
    }
});

// Get brand products
router.get('/:id/products', async (req, res) => {
    try {
        const { id } = req.params;
        const branchId = req.query.branchId;

        let productsQuery;
        let params;

        if (branchId) {
            productsQuery = `
                SELECT p.*, bp.stock_quantity, bp.price as branch_price
                FROM products p
                LEFT JOIN branch_products bp ON bp.product_id = p.id AND bp.branch_id = $2
                WHERE p.brand_id = $1
                ORDER BY p.name_ar ASC
            `;
            params = [id, branchId];
        } else {
            productsQuery = `
                SELECT p.*
                FROM products p
                WHERE p.brand_id = $1
                ORDER BY p.name_ar ASC
            `;
            params = [id];
        }

        const { rows } = await query(productsQuery, params);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('❌ Error fetching brand products:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch brand products' });
    }
});

// Create brand (admin)
router.post('/', [verifyToken, isAdmin], async (req, res) => {
    try {
        const {
            name_ar, name_en, slogan_ar, slogan_en,
            logo_url, banner_url, primary_color, secondary_color,
            description_ar, description_en, is_featured
        } = req.body;

        if (!name_ar || !name_en) {
            return res.status(400).json({ success: false, error: 'name_ar and name_en are required' });
        }

        const { rows } = await query(`
            INSERT INTO brands (name_ar, name_en, slogan_ar, slogan_en, logo_url, banner_url, 
                                primary_color, secondary_color, description_ar, description_en, is_featured)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *
        `, [
            name_ar, name_en, 
            slogan_ar || null, slogan_en || null,
            logo_url || null, banner_url || null,
            primary_color || '#F97316', secondary_color || '#EA580C',
            description_ar || null, description_en || null,
            is_featured || false
        ]);

        // Clear cache
        responseCache.delete('brands:all');
        responseCache.delete('brands:featured');

        res.status(201).json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('❌ Error creating brand:', error);
        res.status(500).json({ success: false, error: 'Failed to create brand' });
    }
});

// Update brand (admin)
router.put('/:id', [verifyToken, isAdmin], async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name_ar, name_en, slogan_ar, slogan_en,
            logo_url, banner_url, primary_color, secondary_color,
            description_ar, description_en, is_featured
        } = req.body;

        const { rows } = await query(`
            UPDATE brands SET
                name_ar = COALESCE($2, name_ar),
                name_en = COALESCE($3, name_en),
                slogan_ar = $4,
                slogan_en = $5,
                logo_url = $6,
                banner_url = $7,
                primary_color = COALESCE($8, primary_color),
                secondary_color = COALESCE($9, secondary_color),
                description_ar = $10,
                description_en = $11,
                is_featured = COALESCE($12, is_featured)
            WHERE id = $1
            RETURNING *
        `, [
            id, name_ar, name_en,
            slogan_ar ?? null, slogan_en ?? null,
            logo_url ?? null, banner_url ?? null,
            primary_color, secondary_color,
            description_ar ?? null, description_en ?? null,
            is_featured
        ]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Brand not found' });
        }

        // Clear cache
        responseCache.delete('brands:all');
        responseCache.delete('brands:featured');

        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('❌ Error updating brand:', error);
        res.status(500).json({ success: false, error: 'Failed to update brand' });
    }
});

// Delete brand (admin)
router.delete('/:id', [verifyToken, isAdmin], async (req, res) => {
    try {
        const { id } = req.params;

        const { rowCount } = await query('DELETE FROM brands WHERE id = $1', [id]);

        if (rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Brand not found' });
        }

        // Clear cache
        responseCache.delete('brands:all');
        responseCache.delete('brands:featured');

        res.json({ success: true, message: 'Brand deleted successfully' });
    } catch (error) {
        console.error('❌ Error deleting brand:', error);
        res.status(500).json({ success: false, error: 'Failed to delete brand' });
    }
});

export default router;
