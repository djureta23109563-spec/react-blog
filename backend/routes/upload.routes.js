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

        // Convert buffer to base64 for Cloudinary
        const fileStr = req.file.buffer.toString('base64');
        const fileData = `data:${req.file.mimetype};base64,${fileStr}`;
        
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(fileData, {
            folder: `user-avatars/${req.user._id}`,
            transformation: [
                { width: 300, height: 300, crop: 'fill', gravity: 'face' }
            ]
        });

        // Delete old Cloudinary avatar if exists
        const user = await User.findById(req.user._id);
        if (user.avatarPublicId) {
            try {
                await cloudinary.uploader.destroy(user.avatarPublicId);
            } catch (err) {
                console.log('Old avatar deletion failed:', err);
            }
        }

        // Update user with Cloudinary URL
        user.avatar = result.secure_url;
        user.avatarPublicId = result.public_id;
        user.avatarUpdatedAt = new Date();
        
        // Also keep profilePic for backward compatibility
        if (!user.profilePic) {
            // Extract filename from URL if needed, or just keep existing
        }
        
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
                profilePic: user.profilePic,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed: ' + error.message });
    }
});

// Remove avatar
router.delete('/avatar', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Delete from Cloudinary if exists
        if (user.avatarPublicId) {
            try {
                await cloudinary.uploader.destroy(user.avatarPublicId);
            } catch (err) {
                console.log('Cloudinary deletion failed:', err);
            }
        }

        // Clear avatar fields
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

// Get user avatar (public)
router.get('/avatar/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('avatar profilePic name');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const avatarUrl = user.avatar || user.profilePic || '';
        
        res.json({ 
            url: avatarUrl,
            name: user.name,
            hasCloudinaryAvatar: !!user.avatar
        });
    } catch (error) {
        console.error('Error fetching avatar:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;