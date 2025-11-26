import express from 'express';
import db from '../database.js';

const router = express.Router();

// Create Order
router.post('/', (req, res) => {
    const { userId, total, items } = req.body;
    const date = new Date().toISOString();
    const status = 'pending';

    db.run(`INSERT INTO orders (userId, total, items, date, status) VALUES (?, ?, ?, ?, ?)`,
        [userId, total, JSON.stringify(items), date, status],
        function (err) {
            if (err) {
                return res.status(500).send("Problem creating order.");
            }
            // Clear cart
            db.run("DELETE FROM cart WHERE userId = ?", [userId]);

            // Award Loyalty Points (1 point per 1 EGP)
            const points = Math.floor(total);
            db.run("UPDATE users SET loyaltyPoints = loyaltyPoints + ? WHERE id = ?", [points, userId]);

            res.status(200).send({ message: "Order created", orderId: this.lastID, pointsEarned: points });
        });
});

import { verifyToken, isAdmin } from '../middleware/auth.js';

// Get Orders (User or Admin)
router.get('/', [verifyToken], (req, res) => {
    const userId = req.query.userId;
    const userRole = req.userRole;
    const requesterId = req.userId;

    let sql = "SELECT * FROM orders";
    let params = [];

    // If admin/employee, can see all orders or filter by userId
    if (userRole === 'owner' || userRole === 'manager' || userRole === 'employee') {
        if (userId) {
            sql += " WHERE userId = ?";
            params.push(userId);
        }
    } else {
        // Regular user can only see their own orders
        sql += " WHERE userId = ?";
        params.push(requesterId);
    }

    sql += " ORDER BY date DESC";

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        const orders = rows.map(o => ({
            ...o,
            items: JSON.parse(o.items)
        }));
        res.json({
            "message": "success",
            "data": orders
        });
    });
});

// Update Order Status
router.put('/:id/status', [verifyToken, isAdmin], (req, res) => {
    const { status } = req.body;
    db.run("UPDATE orders SET status = ? WHERE id = ?", [status, req.params.id], function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "message": "success", changes: this.changes });
    });
});

export default router;
