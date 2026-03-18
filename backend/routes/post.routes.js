// backend/routes/post.routes.js

const express = require('express');
const Post = require('../models/Post');
const { protect } = require('../middleware/auth.middleware');
const { memberOrAdmin } = require('../middleware/role.middleware');
const upload = require('../middleware/upload');
const router = express.Router();

// GET /api/posts - Public: all published posts (newest first)
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find({ status: 'published' })
      .populate('author', 'name profilePic')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/posts/:id - Public: single post by ID
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'name profilePic');
    if (!post || post.status === 'removed') {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (err) {
    console.error('Error fetching post:', err);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/posts - Member or Admin: create new post
router.post('/', protect, memberOrAdmin, (req, res, next) => {
  // Handle multer upload with error handling
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ message: 'Image upload error: ' + err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    console.log('=== CREATE POST ATTEMPT ===');
    console.log('User ID:', req.user?._id);
    console.log('User role:', req.user?.role);
    console.log('Title:', req.body.title);
    console.log('Body length:', req.body.body?.length);
    console.log('File:', req.file ? req.file.filename : 'No file uploaded');
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Request file:', req.file);
    
    const { title, body } = req.body;
    
    // Validate required fields
    if (!title || !body) {
      console.log('Missing title or body');
      return res.status(400).json({ message: 'Title and body are required' });
    }
    
    if (!title.trim() || !body.trim()) {
      return res.status(400).json({ message: 'Title and body cannot be empty' });
    }
    
    // Handle image - req.file comes from multer
    const image = req.file ? req.file.filename : '';
    console.log('Image filename:', image);
    
    // Create post
    const postData = {
      title: title.trim(),
      body: body.trim(),
      image,
      author: req.user._id,
      status: 'published'
    };
    console.log('Post data:', postData);
    
    const post = await Post.create(postData);
    console.log('Post created with ID:', post._id);
    
    // Populate author info
    await post.populate('author', 'name profilePic');
    
    console.log('=== POST CREATED SUCCESSFULLY ===');
    res.status(201).json(post);
  } catch (err) {
    console.error('=== ERROR CREATING POST ===');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    
    // Check for validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// PUT /api/posts/:id - Edit: only post owner OR admin
router.put('/:id', protect, memberOrAdmin, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: 'Image upload error: ' + err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check authorization
    const isOwner = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update fields
    if (req.body.title) post.title = req.body.title;
    if (req.body.body) post.body = req.body.body;
    if (req.file) post.image = req.file.filename;
    
    await post.save();
    res.json(post);
  } catch (err) {
    console.error('Error updating post:', err);
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/posts/:id - Delete: only post owner OR admin
router.delete('/:id', protect, memberOrAdmin, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const isOwner = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;