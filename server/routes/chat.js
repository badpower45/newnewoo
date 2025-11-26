import express from 'express';
import db from '../database.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Create new conversation (customer starts chat)
router.post('/conversations', (req, res) => {
    const { customerId, customerName } = req.body;
    const createdAt = new Date().toISOString();

    const sql = `INSERT INTO conversations (customerId, customerName, status, createdAt, lastMessageAt) VALUES (?, ?, 'active', ?, ?)`;

    db.run(sql, [customerId || null, customerName, createdAt, createdAt], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({
            message: 'Conversation created',
            conversationId: this.lastID
        });
    });
});

// Get all conversations (admin/CS only)
router.get('/conversations', [verifyToken, isAdmin], (req, res) => {
    const { status, agentId } = req.query;
    let sql = 'SELECT * FROM conversations';
    const params = [];

    if (status || agentId) {
        sql += ' WHERE';
        if (status) {
            sql += ' status = ?';
            params.push(status);
        }
        if (agentId) {
            sql += status ? ' AND' : '';
            sql += ' agentId = ?';
            params.push(agentId);
        }
    }

    sql += ' ORDER BY lastMessageAt DESC';

    db.all(sql, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ conversations: rows });
    });
});

// Get conversation with messages
router.get('/conversations/:id', (req, res) => {
    const conversationId = req.params.id;

    db.get('SELECT * FROM conversations WHERE id = ?', [conversationId], (err, conversation) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        db.all(
            'SELECT * FROM messages WHERE conversationId = ? ORDER BY timestamp ASC',
            [conversationId],
            (err, messages) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.json({
                    conversation,
                    messages: messages || []
                });
            }
        );
    });
});

// Assign conversation to agent
router.patch('/conversations/:id/assign', [verifyToken, isAdmin], (req, res) => {
    const conversationId = req.params.id;
    const { agentId } = req.body;

    db.run(
        'UPDATE conversations SET agentId = ? WHERE id = ?',
        [agentId, conversationId],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'Conversation assigned' });
        }
    );
});

// Close conversation
router.patch('/conversations/:id/close', [verifyToken, isAdmin], (req, res) => {
    const conversationId = req.params.id;

    db.run(
        "UPDATE conversations SET status = 'closed' WHERE id = ?",
        [conversationId],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'Conversation closed' });
        }
    );
});

// Send message (backup to Socket.io)
router.post('/messages', (req, res) => {
    const { conversationId, senderId, senderType, message } = req.body;
    const timestamp = new Date().toISOString();

    db.run(
        'INSERT INTO messages (conversationId, senderId, senderType, message, timestamp) VALUES (?, ?, ?, ?, ?)',
        [conversationId, senderId, senderType, message, timestamp],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // Update conversation
            db.run(
                'UPDATE conversations SET lastMessageAt = ? WHERE id = ?',
                [timestamp, conversationId]
            );

            res.json({
                message: 'Message sent',
                messageId: this.lastID
            });
        }
    );
});

// Mark messages as read
router.patch('/messages/read', (req, res) => {
    const { conversationId } = req.body;

    db.run(
        "UPDATE messages SET isRead = 1 WHERE conversationId = ? AND senderType = 'customer'",
        [conversationId],
        (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'Messages marked as read' });
        }
    );
});

export default router;
