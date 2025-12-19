import express from 'express';
import db from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get loyalty transactions for a user
router.get('/transactions', authenticateToken, async (req, res) => {
    try {
        const userId = req.query.userId || req.userId || req.user?.id;
        const result = await db.query(
            `SELECT * FROM loyalty_points_history 
            WHERE user_id = $1 
            ORDER BY created_at DESC 
            LIMIT 100`,
            [userId]
        );
        res.json({ data: result.rows });
    } catch (error) {
        console.error('Error fetching loyalty transactions:', error);
        res.status(500).json({ error: 'Failed to fetch loyalty transactions' });
    }
});

// Get user's current loyalty points
router.get('/balance', authenticateToken, async (req, res) => {
    try {
        const userId = req.query.userId || req.userId || req.user?.id;
        const result = await db.query(
            'SELECT loyalty_points FROM users WHERE id = $1',
            [userId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ points: result.rows[0].loyalty_points || 0 });
    } catch (error) {
        console.error('Error fetching loyalty balance:', error);
        res.status(500).json({ error: 'Failed to fetch loyalty balance' });
    }
});

// Redeem loyalty points for coupon (1000 points = 35 EGP)
router.post('/redeem', authenticateToken, async (req, res) => {
    try {
        const userId = req.userId || req.user?.id;
        const { pointsToRedeem } = req.body;

        // Validation
        if (!pointsToRedeem || pointsToRedeem < 1000 || pointsToRedeem % 1000 !== 0) {
            return res.status(400).json({ 
                error: 'يجب استبدال 1000 نقطة أو مضاعفاتها' 
            });
        }

        await db.query('BEGIN');

        // Get user's current points
        const userResult = await db.query(
            'SELECT loyalty_points, name, phone FROM users WHERE id = $1 FOR UPDATE',
            [userId]
        );

        if (userResult.rows.length === 0) {
            await db.query('ROLLBACK');
            return res.status(404).json({ error: 'المستخدم غير موجود' });
        }

        const user = userResult.rows[0];
        const currentPoints = user.loyalty_points || 0;

        if (currentPoints < pointsToRedeem) {
            await db.query('ROLLBACK');
            return res.status(400).json({ 
                error: `رصيدك الحالي ${currentPoints} نقطة غير كافٍ` 
            });
        }

        // Calculate coupon value (35 EGP per 1000 points)
        const numberOfCoupons = pointsToRedeem / 1000;
        const couponValue = numberOfCoupons * 35;

        // Generate unique coupon code
        const couponCode = `LOYALTY-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

        // Create coupon
        const couponResult = await db.query(
            `INSERT INTO coupons (
                code, discount_type, discount_value, 
                min_order_value, valid_from, valid_until,
                usage_limit, per_user_limit, is_active,
                description
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id, code`,
            [
                couponCode,
                'fixed',
                couponValue,
                0, // No minimum order
                new Date(),
                new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // Valid for 90 days
                1, // Single use
                1, // Single use per user
                true,
                `كوبون نقاط الولاء - ${numberOfCoupons} كوبون بقيمة ${couponValue} جنيه`
            ]
        );

        const newCoupon = couponResult.rows[0];

        // Deduct points from user
        await db.query(
            'UPDATE users SET loyalty_points = loyalty_points - $1 WHERE id = $2',
            [pointsToRedeem, userId]
        );

        // Record transaction in loyalty history
        await db.query(
            `INSERT INTO loyalty_points_history (
                user_id, points, type, description
            ) VALUES ($1, $2, $3, $4)`,
            [
                userId,
                -pointsToRedeem,
                'redeemed',
                `استبدال ${pointsToRedeem} نقطة بكوبون ${couponCode} بقيمة ${couponValue} جنيه`
            ]
        );

        await db.query('COMMIT');

        res.json({
            success: true,
            message: `تم إنشاء كوبون بقيمة ${couponValue} جنيه بنجاح!`,
            coupon: {
                code: newCoupon.code,
                value: couponValue,
                pointsRedeemed: pointsToRedeem,
                validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                remainingPoints: currentPoints - pointsToRedeem
            }
        });

    } catch (error) {
        await db.query('ROLLBACK');
        console.error('Error redeeming loyalty points:', error);
        res.status(500).json({ error: 'فشل استبدال النقاط' });
    }
});

export default router;
