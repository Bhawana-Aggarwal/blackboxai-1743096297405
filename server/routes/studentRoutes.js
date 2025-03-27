const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');

// Apply student auth middleware to all routes
router.use(authMiddleware('student'));

// Get enrolled subjects
router.get('/subjects', (req, res) => {
    const studentId = req.user.id;
    
    db.all(
        `SELECT s.id, s.name, s.code 
         FROM subjects s
         JOIN marks m ON s.id = m.subject_id
         WHERE m.student_id = ?`,
        [studentId],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(rows);
        }
    );
});

// Get attendance records
router.get('/attendance', (req, res) => {
    const studentId = req.user.id;
    const subjectId = req.query.subjectId;
    
    let query = `SELECT a.date, a.status, s.name as subject_name 
                 FROM attendance a
                 JOIN subjects s ON a.subject_id = s.id
                 WHERE a.student_id = ?`;
    const params = [studentId];
    
    if (subjectId) {
        query += ' AND a.subject_id = ?';
        params.push(subjectId);
    }
    
    query += ' ORDER BY a.date DESC';
    
    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Get marks
router.get('/marks', (req, res) => {
    const studentId = req.user.id;
    
    db.all(
        `SELECT s.name as subject_name, 
                m.assignment1, m.assignment2, m.ut, m.behavior
         FROM marks m
         JOIN subjects s ON m.subject_id = s.id
         WHERE m.student_id = ?`,
        [studentId],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(rows);
        }
    );
});

module.exports = router;