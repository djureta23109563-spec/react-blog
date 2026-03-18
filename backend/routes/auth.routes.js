// backend/routes/auth.routes.js

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload');

// Helper function - generates a JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// ================ REGISTER ROUTE ================
// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  // Validate input
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  try {
    console.log('=== REGISTRATION ATTEMPT ===');
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Password length:', password.length);

    // Check MongoDB connection first
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB not connected!');
      return res.status(500).json({ message: 'Database connection error' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Create new user
    console.log('Creating new user...');
    
    const user = new User({
      name,
      email,
      password,
    });

    // Save user (this triggers the pre-save hook to hash password)
    await user.save();
    
    console.log('User saved successfully with ID:', user._id);

    // Generate token
    const token = generateToken(user._id, user.role);
    console.log('Token generated for user');

    // Send response
    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic || '',
        bio: user.bio || '',
      },
    });
    
    console.log('=== REGISTRATION SUCCESSFUL ===');
    
  } catch (err) {
    console.error('=== REGISTRATION ERROR DETAILS ===');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    
    // Check for specific MongoDB errors
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    if (err.name === 'MongoServerError') {
      return res.status(500).json({ message: 'Database error: ' + err.message });
    }
    
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// ================ LOGIN ROUTE ================
// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check if account is active
    if (user.status === 'inactive') {
      return res.status(403).json({ message: 'Your account is deactivated. Please contact admin.' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    // Send response
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic || '',
        bio: user.bio || '',
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// ================ GET CURRENT USER ================
// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ================ UPDATE PROFILE ================
// PUT /api/auth/profile
router.put('/profile', protect, upload.single('profilePic'), async (req, res) => {
  try {
    console.log('=== PROFILE UPDATE ATTEMPT ===');
    console.log('User ID:', req.user.id);
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update fields if provided
    if (req.body.name) {
      user.name = req.body.name;
      console.log('Updated name to:', req.body.name);
    }
    
    if (req.body.bio) {
      user.bio = req.body.bio;
      console.log('Updated bio to:', req.body.bio);
    }
    
    if (req.file) {
      user.profilePic = req.file.filename;
      console.log('Updated profile picture to:', req.file.filename);
    }
    
    await user.save();
    console.log('User saved successfully');
    
    const updatedUser = await User.findById(user._id).select('-password');
    console.log('Updated user:', updatedUser);
    
    res.json(updatedUser);
  } catch (err) {
    console.error('=== PROFILE UPDATE ERROR ===');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    res.status(500).json({ message: 'Error updating profile: ' + err.message });
  }
});

// ================ CHANGE PASSWORD ================
// PUT /api/auth/change-password
router.put('/change-password', protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  try {
    console.log('=== PASSWORD CHANGE ATTEMPT ===');
    console.log('User ID:', req.user.id);
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      console.log('Current password incorrect');
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    user.password = newPassword; // Will be hashed by pre-save hook
    await user.save();
    console.log('Password changed successfully');
    
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Password change error:', err);
    res.status(500).json({ message: 'Error changing password' });
  }
});

// ================ EXPORT ROUTER ================
module.exports = router;