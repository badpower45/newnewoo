import express from 'express';
import db from '../database.js';

const router = express.Router();

// Get all products
router.get('/', (req, res) => {
    db.all("SELECT * FROM products", (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        // Convert isOrganic/isNew back to boolean
        const products = rows.map(p => ({
            ...p,
            isOrganic: !!p.isOrganic,
            isNew: !!p.isNew
        }));
        res.json({
            "message": "success",
            "data": products
        });
    });
});

// Get single product
router.get('/:id', (req, res) => {
    const sql = "SELECT * FROM products WHERE id = ?";
    const params = [req.params.id];
    db.get(sql, params, (err, row) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        if (row) {
            row.isOrganic = !!row.isOrganic;
            row.isNew = !!row.isNew;
        }
        res.json({
            "message": "success",
            "data": row
        });
    });
});

export default router;
