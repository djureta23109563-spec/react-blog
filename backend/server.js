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
// CORS - Simplified to allow all origins
app.use(cors({
    origin: true,  // This allows all origins
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