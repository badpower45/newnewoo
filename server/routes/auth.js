import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../database.js';

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

// Register
router.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);

    db.run(`INSERT INTO users (name, email, password) VALUES (?, ?, ?)`, [name, email, hashedPassword], function (err) {
        if (err) {
            return res.status(500).send("There was a problem registering the user.");
        }
        const token = jwt.sign({ id: this.lastID }, SECRET_KEY, { expiresIn: 86400 });
        res.status(200).send({ auth: true, token: token, user: { id: this.lastID, name, email } });
    });
});

// Login
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
        if (err) return res.status(500).send('Error on the server.');
        if (!user) return res.status(404).send('No user found.');

        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });

        const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: 86400 });
        res.status(200).send({ auth: true, token: token, user: { id: user.id, name: user.name, email: user.email } });
    });
});

export default router;
