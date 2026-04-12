// backend/routes/post.routes.js

const express = require('express');
const Post = require('../models/Post');
const { protect } = require('../middleware/auth.middleware');
const { memberOrAdmin } = require('../middleware/role.middleware');
const upload = require('../middleware/upload');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Created uploads directory:', uploadDir);
}

// GET /api/posts - Public: all published posts
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

// GET /api/posts/:id - Public: single post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'name profilePic');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    console.error('Error fetching post:', err);
    res.status(500).json({ message: err.message });
  }
});

// Helper function to generate unique filename
const generateFilename = (originalname) => {
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1e9);
  const extension = path.extname(originalname);
  return `${timestamp}-${random}${extension}`;
};

// POST /api/posts - Create new post
router.post('/', protect, memberOrAdmin, upload.single('image'), async (req, res) => {
  try {
    console.log('=== CREATE POST ===');
    console.log('Title:', req.body.title);
    console.log('Has file:', !!req.file);
    
    const { title, body } = req.body;
    
    if (!title || !body) {
      return res.status(400).json({ message: 'Title and body are required' });
    }
    
    let imageFilename = '';
    
    // If file was uploaded
    if (req.file) {
      // Generate a unique filename
      const originalName = req.file.originalname || 'image.png';
      imageFilename = generateFilename(originalName);
      console.log('Generated filename:', imageFilename);
      console.log('File buffer size:', req.file.buffer?.length);
      
      // Save the file to disk
      const filePath = path.join(uploadDir, imageFilename);
      fs.writeFileSync(filePath, req.file.buffer);
      console.log('File saved to:', filePath);
    }
    
    const post = await Post.create({
      title: title.trim(),
      body: body.trim(),
      image: imageFilename,
      author: req.user._id,
      status: 'published'
    });
    
    await post.populate('author', 'name profilePic');
    console.log('Post created successfully, ID:', post._id);
    console.log('Image saved in DB:', post.image);
    
    res.status(201).json(post);
    
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/posts/:id - Update post
router.put('/:id', protect, memberOrAdmin, upload.single('image'), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    const isOwner = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (req.body.title) post.title = req.body.title;
    if (req.body.body) post.body = req.body.body;
    
    if (req.file) {
      // Delete old image if exists
      if (post.image) {
        const oldPath = path.join(uploadDir, post.image);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
          console.log('Deleted old image:', oldPath);
        }
      }
      
      // Save new image
      const originalName = req.file.originalname || 'image.png';
      const newFilename = generateFilename(originalName);
      const filePath = path.join(uploadDir, newFilename);
      fs.writeFileSync(filePath, req.file.buffer);
      post.image = newFilename;
      console.log('Updated image saved:', newFilename);
    }
    
    await post.save();
    res.json(post);
  } catch (err) {
    console.error('Error updating post:', err);
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/posts/:id/remove - Soft delete
router.put('/:id/remove', protect, memberOrAdmin, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const isOwner = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    post.status = 'removed';
    await post.save();
    res.json({ message: 'Post removed successfully' });
  } catch (err) {
    console.error('Error removing post:', err);
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/posts/:id - Permanently delete
router.delete('/:id', protect, memberOrAdmin, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admins only' });
    }

    // Delete image file if exists
    if (post.image) {
      const imagePath = path.join(uploadDir, post.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log('Deleted image:', imagePath);
      }
    }

    await post.deleteOne();
    res.json({ message: 'Post permanently deleted' });
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ message: err.message });
  }
});

// DO NOT add app.use here - static serving is already in server.js

module.exports = router;