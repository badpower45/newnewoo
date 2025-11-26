import jwt from 'jsonwebtoken';
import db from '../database.js';

const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

export const verifyToken = (req, res, next) => {
    const tokenHeader = req.headers['authorization'];
    if (!tokenHeader) return res.status(403).send({ auth: false, message: 'No token provided.' });

    const token = tokenHeader.split(' ')[1]; // Bearer <token>

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });

        // Save to request for use in other routes
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    });
};

export const isAdmin = (req, res, next) => {
    if (req.userRole !== 'owner' && req.userRole !== 'manager') {
        return res.status(403).send({ message: "Require Admin Role!" });
    }
    next();
};

export const isEmployee = (req, res, next) => {
    if (req.userRole !== 'owner' && req.userRole !== 'manager' && req.userRole !== 'employee') {
        return res.status(403).send({ message: "Require Employee Role!" });
    }
    next();
};
