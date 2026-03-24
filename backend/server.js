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

// Import message routes
const messageRoutes = require('./routes/message.routes');
console.log('✅ messageRoutes loaded:', typeof messageRoutes);

// Import deleted post routes
const deletedPostRoutes = require('./routes/deletedPost.routes');
console.log('✅ deletedPostRoutes loaded:', typeof deletedPostRoutes);

const app = express();

connectDB();

// ── Middleware ─────────────────────────────────────────────────
app.use(cors({
    origin: function(origin, callback) {
        // Define allowed origins
        const allowedOrigins = [
            // Local development ports
            'http://localhost:3000',
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:5175',
            'http://localhost:5176',
            'http://localhost:5177',
            'http://localhost:5178',
            'http://localhost:5179',
            'http://localhost:5180',
            'http://localhost:5181/',
            'http://localhost:5182/',
            
            // 🔴 AFTER VERCEL DEPLOYMENT - ADD YOUR LIVE URL HERE 🔴
            // Example: 'https://dancefolio.vercel.app'
            // You will add this after deploying to Vercel
        ];
        
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Check if origin is allowed
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
app.use('/api/messages', messageRoutes);
app.use('/api/deleted-posts', deletedPostRoutes);

// ── Health Check ──────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Server is running',
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

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