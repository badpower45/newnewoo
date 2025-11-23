import express from 'express';
import db from '../database.js';

const router = express.Router();

// Get cart items for a user (assuming userId is passed in query or header for now, later from token)
router.get('/', (req, res) => {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: "User ID required" });

    const sql = `
    SELECT cart.id, cart.quantity, products.* 
    FROM cart 
    JOIN products ON cart.productId = products.id 
    WHERE cart.userId = ?
  `;
    db.all(sql, [userId], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        const items = rows.map(row => ({
            id: row.productId, // Frontend expects product id as key often, or we adjust frontend
            cartId: row.id,
            name: row.name,
            price: row.price,
            image: row.image,
            quantity: row.quantity
        }));
        res.json({
            "message": "success",
            "data": items
        });
    });
});

// Add to cart
router.post('/add', (req, res) => {
    const { userId, productId, quantity } = req.body;

    // Check if item exists
    db.get("SELECT * FROM cart WHERE userId = ? AND productId = ?", [userId, productId], (err, row) => {
        if (row) {
            // Update quantity
            const newQuantity = row.quantity + (quantity || 1);
            db.run("UPDATE cart SET quantity = ? WHERE id = ?", [newQuantity, row.id], function (err) {
                if (err) return res.status(400).json({ error: err.message });
                res.json({ message: "updated", data: { ...row, quantity: newQuantity } });
            });
        } else {
            // Insert new
            db.run("INSERT INTO cart (userId, productId, quantity) VALUES (?, ?, ?)", [userId, productId, quantity || 1], function (err) {
                if (err) return res.status(400).json({ error: err.message });
                res.json({ message: "added", id: this.lastID });
            });
        }
    });
});

// Remove from cart
router.delete('/remove/:productId', (req, res) => {
    const { userId } = req.body; // Or query
    const productId = req.params.productId;

    db.run("DELETE FROM cart WHERE userId = ? AND productId = ?", [userId, productId], function (err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "deleted", changes: this.changes });
    });
});

// Update quantity
router.post('/update', (req, res) => {
    const { userId, productId, quantity } = req.body;
    db.run("UPDATE cart SET quantity = ? WHERE userId = ? AND productId = ?", [quantity, userId, productId], function (err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "updated" });
    });
});

export default router;
