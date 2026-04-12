const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const User = require('../models/User');
const { protect } = require('../middleware/auth.middleware');
const fs = require('fs');
const path = require('path');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('Created uploads directory:', uploadDir);
}

// Helper function to generate unique filename
const generateFilename = (originalname) => {
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    const extension = path.extname(originalname);
    return `avatar-${timestamp}-${random}${extension}`;
};

// Upload avatar locally
router.post('/avatar', protect, upload.single('avatar'), async (req, res) => {
    try {
        console.log('=== AVATAR UPLOAD (LOCAL) ===');
        console.log('User ID:', req.user._id);
        
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        console.log('File received:', {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        });

        let imageFilename = '';
        
        // Generate unique filename and save locally
        if (req.file.buffer) {
            // Memory storage (production on Render)
            const originalName = req.file.originalname || 'avatar.png';
            imageFilename = generateFilename(originalName);
            const filePath = path.join(uploadDir, imageFilename);
            fs.writeFileSync(filePath, req.file.buffer);
            console.log('File saved from buffer to:', filePath);
        } else if (req.file.path) {
            // Disk storage (local development)
            imageFilename = req.file.filename;
            console.log('File already saved to:', req.file.path);
        } else {
            return res.status(400).json({ error: 'Invalid file upload' });
        }

        // Get the full URL for the image
        const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
        const imageUrl = `${backendUrl}/uploads/${imageFilename}`;

        // Get user and delete old profile picture if exists
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Delete old profile picture file if it exists and is local
        if (user.profilePic && !user.profilePic.startsWith('http')) {
            const oldPath = path.join(uploadDir, user.profilePic);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
                console.log('Deleted old profile picture:', oldPath);
            }
        }

        // Update user with new profile picture
        user.profilePic = imageFilename;
        user.avatar = imageFilename; // Also update avatar field for compatibility
        await user.save();

        console.log('User updated successfully. Profile pic:', user.profilePic);

        res.json({
            success: true,
            message: 'Profile picture uploaded successfully',
            avatarUrl: imageUrl,
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

// Get user avatar (public)
router.get('/avatar/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('avatar profilePic name');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        let avatarUrl = '';
        const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
        
        if (user.avatar && user.avatar.startsWith('http')) {
            avatarUrl = user.avatar;
        } else if (user.profilePic) {
            if (user.profilePic.startsWith('http')) {
                avatarUrl = user.profilePic;
            } else {
                avatarUrl = `${backendUrl}/uploads/${user.profilePic}`;
            }
        }
        
        res.json({ 
            url: avatarUrl,
            name: user.name,
            hasAvatar: !!user.profilePic
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

        // Delete profile picture file
        if (user.profilePic && !user.profilePic.startsWith('http')) {
            const imagePath = path.join(uploadDir, user.profilePic);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
                console.log('Deleted profile picture:', imagePath);
            }
        }

        user.avatar = '';
        user.profilePic = '';
        await user.save();

        res.json({
            success: true,
            message: 'Profile picture removed successfully',
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
        res.status(500).json({ error: 'Failed to remove profile picture' });
    }
});

// Get current user's avatar
router.get('/my-avatar', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('avatar profilePic name email role');
        const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
        
        let avatarUrl = '';
        
        if (user.avatar && user.avatar.startsWith('http')) {
            avatarUrl = user.avatar;
        } else if (user.profilePic) {
            if (user.profilePic.startsWith('http')) {
                avatarUrl = user.profilePic;
            } else {
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