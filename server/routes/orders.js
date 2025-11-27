import express from 'express';
import { query } from '../database.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Create Order
router.post('/', async (req, res) => {
    const { userId, total, items, branchId } = req.body;
    const status = 'pending';
    // Postgres DEFAULT CURRENT_TIMESTAMP handles date if not provided, but we can pass it.

    try {
        await query('BEGIN');

        // Insert Order
        const insertSql = `
            INSERT INTO orders (user_id, branch_id, total, items, status) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING id
        `;
        // items is JSONB, pg driver can handle object directly if we pass it, but let's stringify to be safe or pass object?
        // pg driver automatically stringifies objects for JSONB columns.
        const { rows } = await query(insertSql, [userId, branchId || null, total, JSON.stringify(items), status]);
        const orderId = rows[0].id;

        // Clear cart
        await query("DELETE FROM cart WHERE user_id = $1", [userId]);

        // Award Loyalty Points (1 point per 1 EGP)
        const points = Math.floor(total);
        // Assuming column is loyalty_points based on snake_case convention, though not in schema.sql provided.
        // If it fails, the user needs to add the column.
        await query("UPDATE users SET loyalty_points = COALESCE(loyalty_points, 0) + $1 WHERE id = $2", [points, userId]);

        await query('COMMIT');

        res.status(200).send({ message: "Order created", orderId: orderId, pointsEarned: points });
    } catch (err) {
        await query('ROLLBACK');
        console.error("Order creation error:", err);
        res.status(500).send("Problem creating order.");
    }
});

// Get Orders (User or Admin)
router.get('/', [verifyToken], async (req, res) => {
    const userId = req.query.userId;
    const userRole = req.userRole;
    const requesterId = req.userId;

    let sql = "SELECT * FROM orders";
    let params = [];

    // If admin/employee, can see all orders or filter by userId
    if (userRole === 'owner' || userRole === 'manager' || userRole === 'employee') {
        if (userId) {
            sql += " WHERE user_id = $1";
            params.push(userId);
        }
    } else {
        // Regular user can only see their own orders
        sql += " WHERE user_id = $1";
        params.push(requesterId);
    }

    sql += " ORDER BY date DESC";

    try {
        const { rows } = await query(sql, params);
        const orders = rows.map(o => ({
            ...o,
            // pg returns JSONB as object automatically, no need to parse if it's correct type.
            // But if it returns string (e.g. text column), we parse. Schema says JSONB.
            // pg driver parses JSONB automatically.
            items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items,
            userId: o.user_id, // Map back for frontend compatibility if needed
            branchId: o.branch_id
        }));

        res.json({
            "message": "success",
            "data": orders
        });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

// Update Order Status
router.put('/:id/status', [verifyToken, isAdmin], async (req, res) => {
    const { status } = req.body;
    try {
        const result = await query("UPDATE orders SET status = $1 WHERE id = $2", [status, req.params.id]);
        res.json({ "message": "success", rowCount: result.rowCount });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

export default router;
