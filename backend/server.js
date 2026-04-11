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

const messageRoutes = require('./routes/message.routes');
console.log('✅ messageRoutes loaded:', typeof messageRoutes);

const deletedPostRoutes = require('./routes/deletedPost.routes');
console.log('✅ deletedPostRoutes loaded:', typeof deletedPostRoutes);

const uploadRoutes = require('./routes/upload.routes');
console.log('✅ uploadRoutes loaded:', typeof uploadRoutes);

// Password routes - mount separately to avoid conflicts
const passwordRoutes = require('./routes/password.routes');
console.log('✅ passwordRoutes loaded:', typeof passwordRoutes);

const app = express();

connectDB();

// ── Middleware ─────────────────────────────────────────────────
app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ────────────────────────────────────────────────────
// Auth routes (includes login, register, profile, members, etc.)
app.use('/api/auth', authRoutes);

// Password reset routes (separate from auth routes)
app.use('/api/password', passwordRoutes);

// Other API routes
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/deleted-posts', deletedPostRoutes);
app.use('/api/uploads', uploadRoutes);

// ── Health Check ──────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Server is running',
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// ── Debug route to check available endpoints (remove in production) ──
app.get('/api/debug/routes', (req, res) => {
    const routes = [];
    
    // Function to extract routes from app
    const extractRoutes = (stack, basePath = '') => {
        stack.forEach(layer => {
            if (layer.route) {
                const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
                routes.push(`${methods} ${basePath}${layer.route.path}`);
            } else if (layer.name === 'router' && layer.handle.stack) {
                const routerPath = basePath + (layer.regexp.source.replace('\\/?(?=\\/|$)', '').replace(/\\\//g, '/'));
                extractRoutes(layer.handle.stack, routerPath);
            }
        });
    };
    
    extractRoutes(app._router.stack);
    res.json({ 
        totalRoutes: routes.length,
        routes: routes.sort() 
    });
});

// ── Error Handler ─────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ── 404 Handler for undefined routes ──────────────────────────
// FIXED: Removed the '*' wildcard for Express 5.x compatibility
app.use((req, res) => {
    res.status(404).json({ 
        message: `Cannot ${req.method} ${req.originalUrl} - Route not found`,
        availableEndpoints: '/api/health, /api/debug/routes'
    });
});

// ── Start Server ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📝 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔍 Debug routes: http://localhost:${PORT}/api/debug/routes`);
    console.log(`🔐 Auth endpoints available at /api/auth/*`);
});

module.exports = app;