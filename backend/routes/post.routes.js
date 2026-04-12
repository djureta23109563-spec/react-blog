// backend/routes/post.routes.js

const express = require('express');
const Post = require('../models/Post');
const { protect } = require('../middleware/auth.middleware');
const { memberOrAdmin } = require('../middleware/role.middleware');
const upload = require('../middleware/upload');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// GET /api/posts - Public: all published posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find({ status: 'published' })
      .populate('author', 'name profilePic')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
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
    res.status(500).json({ message: err.message });
  }
});

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
    
    let imageUrl = '';
    if (req.file) {
      // Log full file details for debugging
      console.log('File details:', {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        hasBuffer: !!req.file.buffer,
        hasPath: !!req.file.path
      });
      
      imageUrl = req.file.filename;
      console.log('Image filename saved:', imageUrl);
      
      // Check if file was actually saved to disk
      if (req.file.path && fs.existsSync(req.file.path)) {
        console.log('File exists at:', req.file.path);
        console.log('File size:', fs.statSync(req.file.path).size);
      } else if (req.file.buffer) {
        console.log('File is in memory buffer, size:', req.file.buffer.length);
        
        // For Render (memory storage), we need to save the file to a temporary location
        const uploadDir = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        const filePath = path.join(uploadDir, req.file.filename);
        fs.writeFileSync(filePath, req.file.buffer);
        console.log('File saved from buffer to:', filePath);
      }
    } else {
      console.log('No image file uploaded');
    }
    
    const postData = {
      title: title.trim(),
      body: body.trim(),
      image: imageUrl,
      author: req.user._id,
      status: 'published'
    };
    
    console.log('Post data to save:', { ...postData, image: postData.image || '(no image)' });
    
    const post = await Post.create(postData);
    console.log('Post created with ID:', post._id);
    console.log('Saved image value in DB:', post.image);
    
    await post.populate('author', 'name profilePic');
    
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
      console.log('Updating image:', req.file.filename);
      post.image = req.file.filename;
      
      // Save file from buffer if needed
      if (req.file.buffer && !req.file.path) {
        const uploadDir = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const filePath = path.join(uploadDir, req.file.filename);
        fs.writeFileSync(filePath, req.file.buffer);
        console.log('Updated image saved from buffer to:', filePath);
      }
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

    // Optionally delete the image file
    if (post.image) {
      const imagePath = path.join(__dirname, '..', 'uploads', post.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log('Deleted image file:', imagePath);
      }
    }

    await post.deleteOne();
    res.json({ message: 'Post permanently deleted' });
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;