import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../database.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get All Users (Admin only)
router.get('/', [verifyToken, isAdmin], (req, res) => {
    db.all("SELECT id, name, email, role, loyaltyPoints FROM users", (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

// Create User (Admin only - for adding employees)
router.post('/', [verifyToken, isAdmin], (req, res) => {
    const { name, email, password, role } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);

    db.run(`INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
        [name, email, hashedPassword, role || 'employee'],
        function (err) {
            if (err) {
                return res.status(500).send("There was a problem registering the user.");
            }
            res.status(200).send({ message: "User created successfully", userId: this.lastID });
        });
});

// Delete User
router.delete('/:id', [verifyToken, isAdmin], (req, res) => {
    db.run("DELETE FROM users WHERE id = ?", req.params.id, function (err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "message": "deleted", changes: this.changes });
    });
});

export default router;
