import express from 'express';
import { query } from '../database.js';
import { verifyToken } from '../middleware/auth.js';
import { validate, cartItemSchema, cartUpdateSchema } from '../middleware/validation.js';

const router = express.Router();

// Get cart items for a user
router.get('/', [verifyToken], async (req, res) => {
    const userId = req.userId; // من التوكن فقط للأمان
    const branchId = req.query.branchId || 1; // Default branch

    if (!userId) return res.status(400).json({ error: "User ID required" });

    try {
        // Step 1: Get all cart items for this user
        const { rows: cartRows } = await query(
            'SELECT id, product_id, quantity, substitution_preference FROM cart WHERE user_id = $1',
            [userId]
        );

        if (cartRows.length === 0) {
            return res.json({ message: "success", data: [] });
        }

        // Step 2: For each cart item, find product details
        const items = [];
        for (const cartItem of cartRows) {
            const pid = String(cartItem.product_id);
            let product = null;

            // Try products_unified first (match by id or product_id)
            try {
                const { rows: puRows } = await query(
                    `SELECT id, name, image, category, description, weight, barcode, price, discount_price, stock_quantity
                     FROM products_unified
                     WHERE (id::text = $1 OR product_id::text = $1) AND branch_id = $2
                     LIMIT 1`,
                    [pid, branchId]
                );
                if (puRows.length > 0) product = puRows[0];
            } catch (e) { /* products_unified may not exist */ }

            // Fallback to old products + branch_products
            if (!product) {
                try {
                    const { rows: pRows } = await query(
                        `SELECT p.id, p.name, p.image, p.category, p.description, p.weight, p.barcode,
                                COALESCE(bp.price, 0) as price, bp.discount_price, bp.stock_quantity
                         FROM products p
                         LEFT JOIN branch_products bp ON p.id::text = bp.product_id::text AND bp.branch_id = $2
                         WHERE p.id::text = $1
                         LIMIT 1`,
                        [pid, branchId]
                    );
                    if (pRows.length > 0) product = pRows[0];
                } catch (e) { /* ignore */ }
            }

            if (product) {
                items.push({
                    id: pid,
                    cartId: String(cartItem.id),
                    name: product.name,
                    image: product.image,
                    price: Number(product.price) || 0,
                    discountPrice: product.discount_price ? Number(product.discount_price) : null,
                    quantity: Number(cartItem.quantity) || 1,
                    substitutionPreference: cartItem.substitution_preference || 'none',
                    category: product.category,
                    description: product.description,
                    weight: product.weight,
                    barcode: product.barcode,
                    stockQuantity: product.stock_quantity
                });
            }
        }

        res.json({
            "message": "success",
            "data": items
        });
    } catch (err) {
        console.error('Error getting cart:', err);
        res.status(400).json({ "error": err.message });
    }
});

// Add to cart - with validation
router.post('/add', [verifyToken, validate(cartItemSchema)], async (req, res) => {
    const userId = req.userId; // من التوكن فقط
    const { productId, quantity, substitutionPreference } = req.body;

    try {
        // ✅ Security: Validate quantity is reasonable
        if (quantity > 100) {
            return res.status(400).json({ error: 'Maximum quantity is 100' });
        }
        
        // Check if item exists
        const checkSql = "SELECT * FROM cart WHERE user_id = $1 AND product_id = $2";
        const { rows } = await query(checkSql, [userId, productId]);
        const existing = rows[0];

        if (existing) {
            // Update quantity and substitution preference
            const newQuantity = existing.quantity + (quantity || 1);
            
            // ✅ Security: Prevent quantity overflow
            if (newQuantity > 100) {
                return res.status(400).json({ error: 'Maximum quantity is 100' });
            }
            
            const updateSql = "UPDATE cart SET quantity = $1, substitution_preference = $2 WHERE id = $3";
            await query(updateSql, [newQuantity, substitutionPreference || 'none', existing.id]);
            res.json({ message: "updated", data: { ...existing, quantity: newQuantity, substitution_preference: substitutionPreference || 'none' } });
        } else {
            // Insert new
            const insertSql = "INSERT INTO cart (user_id, product_id, quantity, substitution_preference) VALUES ($1, $2, $3, $4) RETURNING id";
            const { rows: newRows } = await query(insertSql, [userId, productId, quantity || 1, substitutionPreference || 'none']);
            res.json({ message: "added", id: newRows[0].id });
        }
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Remove from cart
router.delete('/remove/:productId', [verifyToken], async (req, res) => {
    const userId = req.userId; // من التوكن فقط
    const productId = req.params.productId;

    try {
        const result = await query("DELETE FROM cart WHERE user_id = $1 AND product_id = $2", [userId, productId]);
        res.json({ message: "deleted", rowCount: result.rowCount });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update quantity
router.post('/update', [verifyToken], async (req, res) => {
    const userId = req.userId; // من التوكن فقط
    const { productId, quantity, substitutionPreference } = req.body;
    try {
        if (substitutionPreference !== undefined) {
            await query("UPDATE cart SET quantity = $1, substitution_preference = $2 WHERE user_id = $3 AND product_id = $4", [quantity, substitutionPreference, userId, productId]);
        } else {
            await query("UPDATE cart SET quantity = $1 WHERE user_id = $2 AND product_id = $3", [quantity, userId, productId]);
        }
        res.json({ message: "updated" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Clear cart - مسح السلة بالكامل
router.delete('/clear', [verifyToken], async (req, res) => {
    const userId = req.userId; // من التوكن فقط

    if (!userId) {
        return res.status(400).json({ error: "User ID required" });
    }
    
    try {
        const result = await query("DELETE FROM cart WHERE user_id = $1", [userId]);
        res.json({ message: "cleared", rowCount: result.rowCount });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

export default router;
