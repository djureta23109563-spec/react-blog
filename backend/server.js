// backend/server.js

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth.routes');
console.log('✅ authRoutes loaded:', typeof authRoutes);

const postRoutes = require('./routes/post.routes');
console.log('✅ postRoutes loaded:', typeof postRoutes);

const commentRoutes = require('./routes/comment.routes');
console.log('✅ commentRoutes loaded:', typeof commentRoutes);

const adminRoutes = require('./routes/admin.routes');
console.log('✅ adminRoutes loaded:', typeof adminRoutes);

const app = express();

connectDB();

// ── Middleware ─────────────────────────────────────────────────
app.use(cors({
    origin: function(origin, callback) {
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:5175',
            'http://localhost:5176',
            'http://localhost:5177',
            'http://localhost:5178',
            'localhost:5179',
            'http://localhost:5180',
            'http://localhost:5181/',
            'http://localhost:5182/'
        ];
        
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://localhost:')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/admin', adminRoutes);

// ── Health Check ──────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Server is running',
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// ── 404 Handler - REMOVED app.all('*') ────────────────────────
// Instead of catching all routes, we'll let Express handle 404s naturally
// This means if a route doesn't exist, it will just return 404 with no message

// ── Error Handler ─────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ 
        message: 'Internal server error'
    });
});

// ── Start Server ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📝 Health check: http://localhost:${PORT}/api/health`);
});