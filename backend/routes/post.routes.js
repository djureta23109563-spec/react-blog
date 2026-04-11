// backend/routes/post.routes.js

const express = require('express');
const Post = require('../models/Post');
const { protect } = require('../middleware/auth.middleware');
const { memberOrAdmin } = require('../middleware/role.middleware');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');
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
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (err) {
    console.error('Error fetching post:', err);
    res.status(500).json({ message: err.message });
  }
});

// Helper function to upload image to Cloudinary
const uploadToCloudinary = async (fileBuffer, mimetype) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'blog-posts',
        transformation: [
          { width: 1200, height: 630, crop: 'fill' }
        ]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    
    // Convert buffer to stream
    const buffer = Buffer.from(fileBuffer);
    uploadStream.end(buffer);
  });
};

// POST /api/posts - Member or Admin: create new post
router.post('/', protect, memberOrAdmin, upload.single('image'), async (req, res) => {
  try {
    console.log('=== CREATE POST ATTEMPT ===');
    console.log('User ID:', req.user?._id);
    console.log('Title:', req.body.title);
    console.log('Has file:', !!req.file);
    
    const { title, body } = req.body;
    
    // Validate required fields
    if (!title || !body) {
      return res.status(400).json({ message: 'Title and body are required' });
    }
    
    if (!title.trim() || !body.trim()) {
      return res.status(400).json({ message: 'Title and body cannot be empty' });
    }
    
    let imageUrl = '';
    
    // Upload image to Cloudinary if present
    if (req.file && req.file.buffer) {
      try {
        console.log('Uploading to Cloudinary...');
        const result = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
        imageUrl = result.secure_url;
        console.log('Cloudinary upload successful:', imageUrl);
      } catch (cloudinaryError) {
        console.error('Cloudinary upload error:', cloudinaryError);
        return res.status(500).json({ message: 'Image upload failed. Please try again.' });
      }
    }
    
    // Create post with Cloudinary URL
    const postData = {
      title: title.trim(),
      body: body.trim(),
      image: imageUrl,  // Save Cloudinary URL, not filename
      author: req.user._id,
      status: 'published'
    };
    
    console.log('Post data:', { ...postData, image: imageUrl ? 'URL present' : 'No image' });
    
    const post = await Post.create(postData);
    console.log('Post created with ID:', post._id);
    
    // Populate author info
    await post.populate('author', 'name profilePic');
    
    console.log('=== POST CREATED SUCCESSFULLY ===');
    res.status(201).json(post);
    
  } catch (err) {
    console.error('=== ERROR CREATING POST ===');
    console.error('Error:', err.message);
    
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// PUT /api/posts/:id - Edit: only post owner OR admin
router.put('/:id', protect, memberOrAdmin, upload.single('image'), async (req, res) => {
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
    
    // Upload new image to Cloudinary if provided
    if (req.file && req.file.buffer) {
      try {
        // Delete old image from Cloudinary if exists
        if (post.image && post.image.includes('cloudinary')) {
          const publicId = post.image.split('/').slice(-2).join('/').split('.')[0];
          await cloudinary.uploader.destroy(publicId);
        }
        
        const result = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
        post.image = result.secure_url;
      } catch (cloudinaryError) {
        console.error('Cloudinary upload error:', cloudinaryError);
        return res.status(500).json({ message: 'Image upload failed' });
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
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const isOwner = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    post.status = 'removed';
    await post.save();
    
    res.json({ message: 'Post removed successfully', post });
  } catch (err) {
    console.error('Error removing post:', err);
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/posts/:id - Permanently delete (admin only)
router.delete('/:id', protect, memberOrAdmin, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can permanently delete posts' });
    }

    // Delete image from Cloudinary if exists
    if (post.image && post.image.includes('cloudinary')) {
      try {
        const publicId = post.image.split('/').slice(-2).join('/').split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.log('Failed to delete image from Cloudinary:', err);
      }
    }

    await post.deleteOne();
    res.json({ message: 'Post permanently deleted' });
  } catch (err) {
    console.error('Error permanently deleting post:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;