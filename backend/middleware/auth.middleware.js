// backend/middleware/auth.middleware.js

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    // Look for 'Authorization: Bearer <token>' in request headers
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            message: 'Not authorized — please log in first'
        });
    }

    try {
        // Verify the token using your JWT_SECRET
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach the full user object to req.user (minus the password)
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user || req.user.status === 'inactive') {
            return res.status(401).json({
                message: 'Account not found or deactivated'
            });
        }

        next(); // Pass to the next handler
    } catch (err) {
        return res.status(401).json({
            message: 'Token is invalid or has expired'
        });
    }
};

module.exports = { protect };