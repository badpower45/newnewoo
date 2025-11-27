import express from 'express';
import { query } from '../database.js'; // Use the exported query helper
import { verifyToken, isAdmin } from '../middleware/auth.js';
import multer from 'multer';
import * as xlsx from 'xlsx';

const router = express.Router();

// Get all products (filtered by branch)
router.get('/', async (req, res) => {
    const { branchId, category, search } = req.query;

    if (!branchId) {
        // Enforce branch selection as per requirements
        return res.json({
            "message": "success",
            "data": []
        });
    }

    try {
        let sql = `
            SELECT p.*, bp.price, bp.discount_price, bp.stock_quantity, bp.is_available
            FROM products p
            JOIN branch_products bp ON p.id = bp.product_id
            WHERE bp.branch_id = $1 AND bp.is_available = TRUE
        `;
        const params = [branchId];
        let paramIndex = 2;

        if (category && category !== 'All') {
            sql += ` AND p.category = $${paramIndex}`;
            params.push(category);
            paramIndex++;
        }

        if (search) {
            sql += ` AND (p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        const { rows } = await query(sql, params);

        // Convert is_organic/is_new back to boolean if needed (Postgres returns boolean for BOOLEAN columns usually, but let's be safe)
        // Schema has is_organic BOOLEAN, is_new BOOLEAN. pg driver converts them to JS booleans automatically.
        // However, the previous code mapped them manually. I will keep it clean.

        res.json({
            "message": "success",
            "data": rows
        });
    } catch (err) {
        console.error("Error fetching products:", err);
        res.status(500).json({ "error": err.message });
    }
});

// Get single product
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const { branchId } = req.query;

    try {
        let sql, params;

        if (branchId) {
            sql = `
                SELECT p.*, bp.price, bp.discount_price, bp.stock_quantity, bp.is_available
                FROM products p
                LEFT JOIN branch_products bp ON p.id = bp.product_id AND bp.branch_id = $2
                WHERE p.id = $1
            `;
            params = [id, branchId];
        } else {
            sql = "SELECT * FROM products WHERE id = $1";
            params = [id];
        }

        const { rows } = await query(sql, params);
        const row = rows[0];

        res.json({
            "message": row ? "success" : "not found",
            "data": row
        });
    } catch (err) {
        console.error("Error fetching product:", err);
        res.status(500).json({ "error": err.message });
    }
});

// Get product by barcode
router.get('/barcode/:barcode', async (req, res) => {
    const { barcode } = req.params;
    const { branchId } = req.query;

    try {
        let sql, params;

        if (branchId) {
            sql = `
                SELECT p.*, bp.price, bp.discount_price, bp.stock_quantity, bp.is_available
                FROM products p
                LEFT JOIN branch_products bp ON p.id = bp.product_id AND bp.branch_id = $2
                WHERE p.barcode = $1
            `;
            params = [barcode, branchId];
        } else {
            sql = "SELECT * FROM products WHERE barcode = $1";
            params = [barcode];
        }

        const { rows } = await query(sql, params);
        const row = rows[0];

        res.json({
            "message": row ? "success" : "not found",
            "data": row
        });
    } catch (err) {
        console.error("Error fetching product by barcode:", err);
        res.status(500).json({ "error": err.message });
    }
});

// Create Product (Admin only)
// Note: This only creates the product definition. Pricing/Stock must be added to branches separately.
router.post('/', [verifyToken, isAdmin], async (req, res) => {
    const { name, category, image, weight, description, barcode, isOrganic, isNew } = req.body;
    // ID generation: keep using timestamp or UUID. Schema says TEXT.
    const id = Date.now().toString();

    const sql = `
        INSERT INTO products (id, name, category, image, weight, description, rating, reviews, is_organic, is_new, barcode)
        VALUES ($1, $2, $3, $4, $5, $6, 0, 0, $7, $8, $9)
        RETURNING *
    `;
    const params = [
        id,
        name,
        category,
        image,
        weight,
        description,
        isOrganic ? true : false,
        isNew ? true : false,
        barcode || null
    ];

    try {
        const { rows } = await query(sql, params);
        res.json({
            "message": "success",
            "data": rows[0]
        });
    } catch (err) {
        console.error("Error creating product:", err);
        res.status(400).json({ "error": err.message });
    }
});

// Delete Product
router.delete('/:id', [verifyToken, isAdmin], async (req, res) => {
    try {
        const result = await query("DELETE FROM products WHERE id = $1", [req.params.id]);
        res.json({ "message": "deleted", rowCount: result.rowCount });
    } catch (err) {
        console.error("Error deleting product:", err);
        res.status(400).json({ "error": err.message });
    }
});

const upload = multer({ storage: multer.memoryStorage() });

// Upload Excel
router.post('/upload', [verifyToken, isAdmin, upload.single('file')], async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    try {
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const products = xlsx.utils.sheet_to_json(sheet);

        let successCount = 0;
        let errorCount = 0;

        // Start transaction
        await query('BEGIN');

        for (const p of products) {
            try {
                if (!p.name) { // Price check removed as it's not in products table anymore
                    errorCount++;
                    continue;
                }

                const id = p.id ? p.id.toString() : Date.now().toString() + Math.random().toString(36).substr(2, 5);
                const isOrganic = p.isOrganic === 'true' || p.isOrganic === 1 || p.isOrganic === true;
                const isNew = p.isNew === 'true' || p.isNew === 1 || p.isNew === true;
                const barcode = p.barcode || null;

                const sql = `
                    INSERT INTO products (id, name, category, image, weight, rating, reviews, is_organic, is_new, barcode)
                    VALUES ($1, $2, $3, $4, $5, 0, 0, $6, $7, $8)
                    ON CONFLICT (id) DO UPDATE SET
                        name = EXCLUDED.name,
                        category = EXCLUDED.category,
                        image = EXCLUDED.image,
                        weight = EXCLUDED.weight,
                        is_organic = EXCLUDED.is_organic,
                        is_new = EXCLUDED.is_new,
                        barcode = EXCLUDED.barcode
                `;

                await query(sql, [
                    id,
                    p.name,
                    p.category || 'Uncategorized',
                    p.image || '',
                    p.weight || '',
                    isOrganic,
                    isNew,
                    barcode
                ]);

                successCount++;
            } catch (e) {
                console.error("Row error:", e);
                errorCount++;
            }
        }

        await query('COMMIT');

        res.json({
            message: "Upload processed",
            stats: {
                total: products.length,
                success: successCount,
                errors: errorCount
            }
        });

    } catch (err) {
        await query('ROLLBACK');
        console.error("Excel processing error", err);
        res.status(500).json({ error: "Failed to process Excel file" });
    }
});

export default router;
