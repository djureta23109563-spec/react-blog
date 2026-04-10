// In your login and get-me routes, include avatar
// Example: When returning user data, include both profilePic and avatar

// GET /api/auth/me - Get current user
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json({
            ...user.toJSON(),
            avatar: user.avatar || user.profilePic || '' // Include best available
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// In your profile update route, handle both old and new avatar systems
router.put('/profile', protect, upload.single('profilePic'), async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        
        if (req.body.name) user.name = req.body.name;
        if (req.body.bio !== undefined) user.bio = req.body.bio;
        
        // Handle local file upload (old system)
        if (req.file) {
            user.profilePic = req.file.filename;
        }
        
        await user.save();
        
        const userData = user.toJSON();
        userData.avatar = user.avatar || user.profilePic || '';
        
        res.json(userData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});