const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');
const { hashPassword } = require('../utils/passwordUtils');

// Apply admin auth middleware to all routes
router.use(authMiddleware('admin'));

// Create new user (admin, teacher, or student)
router.post('/users', async (req, res) => {
    const { email, password, role, name } = req.body;
    
    try {
        const hashedPassword = await hashPassword(password);
        
        db.run(
            'INSERT INTO users (email, password, role, name) VALUES (?, ?, ?, ?)',
            [email, hashedPassword, role, name],
            function(err) {
                if (err) {
                    return res.status(400).json({ error: err.message });
                }
                res.status(201).json({ id: this.lastID });
            }
        );
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all users
router.get('/users', (req, res) => {
    db.all('SELECT id, email, role, name FROM users', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Assign subject to teacher
router.post('/assign-subject', (req, res) => {
    const { teacherId, subjectId } = req.body;
    
    db.run(
        'INSERT INTO teacher_subjects (teacher_id, subject_id) VALUES (?, ?)',
        [teacherId, subjectId],
        function(err) {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            res.status(201).json({ success: true });
        }
    );
});

// Delete user
router.delete('/users/:id', (req, res) => {
    const userId = req.params.id;
    
    db.run(
        'DELETE FROM users WHERE id = ?',
        [userId],
        function(err) {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json({ success: true });
        }
    );
});

module.exports = router;