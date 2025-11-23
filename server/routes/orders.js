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

            res.status(200).send({ message: "Order created", orderId: this.lastID });
        });
});

// Get Orders
router.get('/', (req, res) => {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: "User ID required" });

    db.all("SELECT * FROM orders WHERE userId = ? ORDER BY date DESC", [userId], (err, rows) => {
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

export default router;
