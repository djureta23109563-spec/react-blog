const express = require('express');
const router = express.Router();
const cloudinary = require('../config/cloudinary');
const upload = require('../middleware/upload');
const User = require('../models/User');
const { protect } = require('../middleware/auth.middleware');

// Upload avatar to Cloudinary
router.post('/avatar', protect, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Handle both buffer (memory storage) and path (disk storage)
        let result;
        
        if (req.file.buffer) {
            // Memory storage (production on Render)
            const fileStr = req.file.buffer.toString('base64');
            const fileData = `data:${req.file.mimetype};base64,${fileStr}`;
            
            result = await cloudinary.uploader.upload(fileData, {
                folder: 'member-avatars',
                transformation: [
                    { width: 300, height: 300, crop: 'fill', gravity: 'face' }
                ]
            });
        } else if (req.file.path) {
            // Disk storage (local development)
            result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'member-avatars',
                transformation: [
                    { width: 300, height: 300, crop: 'fill', gravity: 'face' }
                ]
            });
            
            // Clean up local file after upload
            const fs = require('fs');
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
        } else {
            return res.status(400).json({ error: 'Invalid file upload' });
        }

        // Delete old Cloudinary avatar if exists
        const user = await User.findById(req.user._id);
        if (user.avatarPublicId) {
            try {
                await cloudinary.uploader.destroy(user.avatarPublicId);
            } catch (err) {
                console.log('Old avatar deletion failed:', err);
            }
        }

        // Update user
        user.avatar = result.secure_url;
        user.avatarPublicId = result.public_id;
        user.avatarUpdatedAt = new Date();
        await user.save();

        res.json({
            success: true,
            message: 'Avatar uploaded successfully',
            avatarUrl: result.secure_url,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed: ' + error.message });
    }
});

// Get user avatar (public)
router.get('/avatar/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('avatar profilePic name');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        let avatarUrl = '';
        
        if (user.avatar) {
            avatarUrl = user.avatar;
        } else if (user.profilePic) {
            if (user.profilePic.startsWith('http')) {
                avatarUrl = user.profilePic;
            } else {
                const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
                avatarUrl = `${backendUrl}/uploads/${user.profilePic}`;
            }
        }
        
        res.json({ 
            url: avatarUrl,
            name: user.name,
            hasAvatar: !!user.avatar
        });
    } catch (error) {
        console.error('Error fetching avatar:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Remove avatar
router.delete('/avatar', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.avatarPublicId) {
            try {
                await cloudinary.uploader.destroy(user.avatarPublicId);
            } catch (err) {
                console.log('Cloudinary deletion failed:', err);
            }
        }

        user.avatar = '';
        user.avatarPublicId = '';
        user.avatarUpdatedAt = null;
        await user.save();

        res.json({
            success: true,
            message: 'Avatar removed successfully'
        });
    } catch (error) {
        console.error('Error removing avatar:', error);
        res.status(500).json({ error: 'Failed to remove avatar' });
    }
});

// Get current user's avatar
router.get('/my-avatar', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('avatar profilePic name email role');
        
        let avatarUrl = user.avatar;
        if (!avatarUrl && user.profilePic) {
            if (user.profilePic.startsWith('http')) {
                avatarUrl = user.profilePic;
            } else {
                const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
                avatarUrl = `${backendUrl}/uploads/${user.profilePic}`;
            }
        }
        
        res.json({
            success: true,
            avatar: avatarUrl,
            name: user.name,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;