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

// Get product by barcode
router.get('/barcode/:barcode', (req, res) => {
    const sql = "SELECT * FROM products WHERE barcode = ?";
    const params = [req.params.barcode];
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
            "message": row ? "success" : "not found",
            "data": row
        });
    });
});

import { verifyToken, isAdmin } from '../middleware/auth.js';

// Create Product
router.post('/', [verifyToken, isAdmin], (req, res) => {
    const { name, price, category, image, weight, description, barcode } = req.body;
    const id = Date.now().toString(); // Simple ID generation
    const sql = `INSERT INTO products (id, name, price, category, image, weight, rating, reviews, isOrganic, isNew, barcode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [id, name, price, category, image, weight, 0, 0, 0, 1, barcode || null];

    db.run(sql, params, function (err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": { id, name, price, category, image, weight, barcode }
        });
    });
});

// Delete Product
router.delete('/:id', [verifyToken, isAdmin], (req, res) => {
    db.run("DELETE FROM products WHERE id = ?", req.params.id, function (err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "message": "deleted", changes: this.changes });
    });
});

import multer from 'multer';
import * as xlsx from 'xlsx';

const upload = multer({ storage: multer.memoryStorage() });

// Upload Excel
router.post('/upload', [verifyToken, isAdmin, upload.single('file')], (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    try {
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const products = xlsx.utils.sheet_to_json(sheet);

        const stmt = db.prepare(`INSERT INTO products (id, name, price, category, image, weight, rating, reviews, isOrganic, isNew, barcode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

        let successCount = 0;
        let errorCount = 0;

        db.serialize(() => {
            db.run("BEGIN TRANSACTION");

            products.forEach((p) => {
                try {
                    // Basic validation
                    if (!p.name || !p.price) {
                        errorCount++;
                        return;
                    }

                    const id = p.id ? p.id.toString() : Date.now().toString() + Math.random().toString(36).substr(2, 5);
                    const isOrganic = p.isOrganic === 'true' || p.isOrganic === 1 ? 1 : 0;
                    const isNew = p.isNew === 'true' || p.isNew === 1 ? 1 : 0;
                    const barcode = p.barcode || null;

                    stmt.run(id, p.name, p.price, p.category || 'Uncategorized', p.image || '', p.weight || '', 0, 0, isOrganic, isNew, barcode);
                    successCount++;
                } catch (e) {
                    errorCount++;
                }
            });

            db.run("COMMIT", (err) => {
                if (err) {
                    console.error("Transaction commit error", err);
                    res.status(500).json({ error: "Failed to commit transaction" });
                } else {
                    stmt.finalize();
                    res.json({
                        message: "Upload processed",
                        stats: {
                            total: products.length,
                            success: successCount,
                            errors: errorCount
                        }
                    });
                }
            });
        });

    } catch (err) {
        console.error("Excel processing error", err);
        res.status(500).json({ error: "Failed to process Excel file" });
    }
});

export default router;
