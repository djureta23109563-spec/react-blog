const express = require('express');
const router = express.Router();
const cloudinary = require('../config/cloudinary');
const upload = require('../middleware/upload');
const User = require('../models/User');
const { protect } = require('../middleware/auth.middleware');

// Upload avatar to Cloudinary
router.post('/avatar', protect, upload.single('avatar'), async (req, res) => {
    try {
        console.log('=== AVATAR UPLOAD START ===');
        console.log('User ID:', req.user._id);
        
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        console.log('File received:', {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            hasBuffer: !!req.file.buffer
        });

        // Handle both buffer (memory storage) and path (disk storage)
        let result;
        
        if (req.file.buffer) {
            // Memory storage (production on Render)
            console.log('Uploading from buffer to Cloudinary...');
            const fileStr = req.file.buffer.toString('base64');
            const fileData = `data:${req.file.mimetype};base64,${fileStr}`;
            
            result = await cloudinary.uploader.upload(fileData, {
                folder: 'member-avatars',
                transformation: [
                    { width: 300, height: 300, crop: 'fill', gravity: 'face' }
                ]
            });
            console.log('Cloudinary upload successful from buffer');
        } else if (req.file.path) {
            // Disk storage (local development)
            console.log('Uploading from path to Cloudinary...');
            result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'member-avatars',
                transformation: [
                    { width: 300, height: 300, crop: 'fill', gravity: 'face' }
                ]
            });
            console.log('Cloudinary upload successful from path');
            
            // Clean up local file after upload
            const fs = require('fs');
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
        } else {
            return res.status(400).json({ error: 'Invalid file upload' });
        }

        console.log('Cloudinary result:', {
            secure_url: result.secure_url,
            public_id: result.public_id
        });

        // Delete old Cloudinary avatar if exists
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        if (user.avatarPublicId) {
            try {
                console.log('Deleting old avatar:', user.avatarPublicId);
                await cloudinary.uploader.destroy(user.avatarPublicId);
            } catch (err) {
                console.log('Old avatar deletion failed:', err);
            }
        }

        // Update user with BOTH avatar and profilePic fields
        user.avatar = result.secure_url;
        user.avatarPublicId = result.public_id;
        user.avatarUpdatedAt = new Date();
        user.profilePic = result.secure_url; // CRITICAL: Also update profilePic for frontend compatibility
        await user.save();

        console.log('User updated successfully. Avatar URL:', user.avatar);
        console.log('ProfilePic URL:', user.profilePic);

        res.json({
            success: true,
            message: 'Avatar uploaded successfully',
            avatarUrl: result.secure_url,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                profilePic: user.profilePic, // Include profilePic in response
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
                console.log('Cloudinary deletion successful');
            } catch (err) {
                console.log('Cloudinary deletion failed:', err);
            }
        }

        user.avatar = '';
        user.avatarPublicId = '';
        user.avatarUpdatedAt = null;
        user.profilePic = ''; // Also clear profilePic
        await user.save();

        res.json({
            success: true,
            message: 'Avatar removed successfully',
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