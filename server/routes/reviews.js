import express from 'express';
import { query } from '../database.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get reviews for a product
router.get('/', async (req, res) => {
    try {
        const { productId } = req.query;

        if (!productId) {
            return res.status(400).json({ error: 'Product ID is required' });
        }

        const { rows } = await query(
            `SELECT r.*, u.name as user_name, u.phone
             FROM reviews r
             LEFT JOIN users u ON r.user_id = u.id
             WHERE r.product_id = $1
             ORDER BY r.created_at DESC`,
            [productId]
        );

        res.json({ data: rows });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

// Create a review
router.post('/', [verifyToken], async (req, res) => {
    try {
        const { product_id, rating, comment } = req.body;
        const userId = req.userId;

        if (!product_id || !rating) {
            return res.status(400).json({ error: 'Product ID and rating are required' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        await query('BEGIN');

        // Check if user already reviewed this product
        const { rows: existingReviews } = await query(
            'SELECT id FROM reviews WHERE user_id = $1 AND product_id = $2',
            [userId, product_id]
        );

        if (existingReviews.length > 0) {
            await query('ROLLBACK');
            return res.status(400).json({ error: 'لقد قمت بتقييم هذا المنتج من قبل' });
        }

        // Insert review
        const { rows } = await query(
            `INSERT INTO reviews (user_id, product_id, rating, comment)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [userId, product_id, rating, comment || null]
        );

        // Update product rating and review count
        await updateProductRating(product_id);

        await query('COMMIT');

        res.json({ 
            success: true, 
            message: 'تم إضافة التقييم بنجاح',
            data: rows[0] 
        });
    } catch (error) {
        await query('ROLLBACK');
        console.error('Error creating review:', error);
        res.status(500).json({ error: 'Failed to create review' });
    }
});

// Delete a review (user can delete their own review, admin can delete any)
router.delete('/:id', [verifyToken], async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const userRole = req.userRole;

        // Get review to check ownership
        const { rows: reviewRows } = await query(
            'SELECT * FROM reviews WHERE id = $1',
            [id]
        );

        if (reviewRows.length === 0) {
            return res.status(404).json({ error: 'Review not found' });
        }

        const review = reviewRows[0];

        // Check authorization
        if (review.user_id !== userId && !['admin', 'manager'].includes(userRole)) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await query('BEGIN');

        // Delete review
        await query('DELETE FROM reviews WHERE id = $1', [id]);

        // Update product rating
        await updateProductRating(review.product_id);

        await query('COMMIT');

        res.json({ success: true, message: 'تم حذف التقييم بنجاح' });
    } catch (error) {
        await query('ROLLBACK');
        console.error('Error deleting review:', error);
        res.status(500).json({ error: 'Failed to delete review' });
    }
});

// Helper function to update product rating
async function updateProductRating(productId: string) {
    const { rows } = await query(
        `SELECT 
            COALESCE(AVG(rating), 0) as avg_rating,
            COUNT(*) as review_count
         FROM reviews
         WHERE product_id = $1`,
        [productId]
    );

    const avgRating = parseFloat(rows[0].avg_rating) || 0;
    const reviewCount = parseInt(rows[0].review_count) || 0;

    await query(
        `UPDATE products 
         SET rating = $1, reviews = $2
         WHERE id = $3`,
        [avgRating, reviewCount, productId]
    );
}

export default router;
