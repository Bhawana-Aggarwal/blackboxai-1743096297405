const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = 'your_jwt_secret_key'; // In production, use environment variable

const authMiddleware = (requiredRole) => {
    return (req, res, next) => {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;

            // Verify user role if required
            if (requiredRole && decoded.role !== requiredRole) {
                return res.status(403).json({ error: 'Insufficient permissions' });
            }

            // Verify user exists in database
            db.get('SELECT id FROM users WHERE id = ?', [decoded.id], (err, row) => {
                if (err || !row) {
                    return res.status(401).json({ error: 'Invalid user' });
                }
                next();
            });
        } catch (err) {
            res.status(401).json({ error: 'Invalid token' });
        }
    };
};

module.exports = authMiddleware;