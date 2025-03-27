const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');

// Apply teacher auth middleware to all routes
router.use(authMiddleware('teacher'));

// Get assigned subjects
router.get('/subjects', (req, res) => {
    const teacherId = req.user.id;
    
    db.all(
        `SELECT s.id, s.name, s.code 
         FROM subjects s
         JOIN teacher_subjects ts ON s.id = ts.subject_id
         WHERE ts.teacher_id = ?`,
        [teacherId],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(rows);
        }
    );
});

// Get students for a subject
router.get('/students', (req, res) => {
    const subjectId = req.query.subjectId;
    const teacherId = req.user.id;

    // Verify teacher is assigned to this subject
    db.get(
        'SELECT 1 FROM teacher_subjects WHERE teacher_id = ? AND subject_id = ?',
        [teacherId, subjectId],
        (err, row) => {
            if (err || !row) {
                return res.status(403).json({ error: 'Not authorized for this subject' });
            }

            // Get students
            db.all(
                `SELECT u.id, u.name 
                 FROM users u
                 JOIN marks m ON u.id = m.student_id
                 WHERE m.subject_id = ? AND u.role = 'student'`,
                [subjectId],
                (err, rows) => {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    res.json(rows);
                }
            );
        }
    );
});

// Take attendance for a subject
router.post('/attendance', (req, res) => {
    const { subjectId, date, attendanceRecords } = req.body;
    const teacherId = req.user.id;

    // Verify teacher is assigned to this subject
    db.get(
        'SELECT 1 FROM teacher_subjects WHERE teacher_id = ? AND subject_id = ?',
        [teacherId, subjectId],
        (err, row) => {
            if (err || !row) {
                return res.status(403).json({ error: 'Not authorized for this subject' });
            }

            // Process attendance records
            const stmt = db.prepare(
                'INSERT OR REPLACE INTO attendance (student_id, subject_id, date, status) VALUES (?, ?, ?, ?)'
            );

            attendanceRecords.forEach(record => {
                stmt.run([record.studentId, subjectId, date, record.status]);
            });

            stmt.finalize(err => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.json({ success: true });
            });
        }
    );
});

// Enter marks for students
router.post('/marks', (req, res) => {
    const { subjectId, marks } = req.body;
    const teacherId = req.user.id;

    // Verify teacher is assigned to this subject
    db.get(
        'SELECT 1 FROM teacher_subjects WHERE teacher_id = ? AND subject_id = ?',
        [teacherId, subjectId],
        (err, row) => {
            if (err || !row) {
                return res.status(403).json({ error: 'Not authorized for this subject' });
            }

            // Process marks
            const stmt = db.prepare(
                `INSERT OR REPLACE INTO marks 
                 (student_id, subject_id, assignment1, assignment2, ut, behavior) 
                 VALUES (?, ?, ?, ?, ?, ?)`
            );

            marks.forEach(mark => {
                stmt.run([
                    mark.studentId, 
                    subjectId,
                    mark.assignment1,
                    mark.assignment2,
                    mark.ut,
                    mark.behavior
                ]);
            });

            stmt.finalize(err => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.json({ success: true });
            });
        }
    );
});

module.exports = router;