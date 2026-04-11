const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload');

// ========== ADD THESE MISSING ROUTES ==========

// POST /api/auth/register - Register new user
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role = 'member' } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }
        
        // Create new user
        const user = await User.create({
            name,
            email,
            password,
            role
        });
        
        // Generate token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );
        
        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar || user.profilePic || ''
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: error.message });
    }
});

// POST /api/auth/login - Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        
        // Check password
        const isPasswordMatch = await user.matchPassword(password);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        
        // Check if user is active
        if (user.status === 'inactive') {
            return res.status(401).json({ message: 'Account is deactivated' });
        }
        
        // Generate token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );
        
        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                bio: user.bio || '',
                avatar: user.avatar || user.profilePic || ''
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: error.message });
    }
});

// ========== EXISTING ROUTES (keep these) ==========

// GET /api/auth/me - Get current user
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json({
            ...user.toJSON(),
            avatar: user.avatar || user.profilePic || ''
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /api/auth/profile - Update user profile
router.put('/profile', protect, upload.single('profilePic'), async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        if (req.body.name) user.name = req.body.name;
        if (req.body.bio !== undefined) user.bio = req.body.bio;
        
        if (req.file) {
            user.profilePic = req.file.filename;
        }
        
        await user.save();
        
        const userData = user.toJSON();
        userData.avatar = user.avatar || user.profilePic || '';
        
        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: userData
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: error.message });
    }
});

// PUT /api/auth/change-password - Change password
router.put('/change-password', protect, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Please provide current and new password' });
        }
        
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters' });
        }
        
        const user = await User.findById(req.user._id);
        
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }
        
        user.password = newPassword;
        await user.save();
        
        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ message: error.message });
    }
});

// GET /api/auth/members - Get all members
router.get('/members', async (req, res) => {
    try {
        const members = await User.find(
            { role: 'member', status: 'active' },
            'name email role bio avatar profilePic createdAt'
        ).sort({ createdAt: -1 });
        
        const membersWithAvatar = members.map(member => ({
            ...member.toJSON(),
            avatar: member.avatar || member.profilePic || ''
        }));
        
        res.json({
            success: true,
            count: membersWithAvatar.length,
            members: membersWithAvatar
        });
    } catch (error) {
        console.error('Get members error:', error);
        res.status(500).json({ message: error.message });
    }
});

// GET /api/auth/user/:id - Get user by ID
router.get('/user/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('name email role bio avatar profilePic createdAt');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json({
            success: true,
            user: {
                ...user.toJSON(),
                avatar: user.avatar || user.profilePic || ''
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;