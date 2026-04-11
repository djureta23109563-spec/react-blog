// backend/routes/post.routes.js

const express = require('express');
const Post = require('../models/Post');
const { protect } = require('../middleware/auth.middleware');
const { memberOrAdmin } = require('../middleware/role.middleware');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');
const router = express.Router();

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
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (err) {
    console.error('Error fetching post:', err);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/posts - Create new post
router.post('/', protect, memberOrAdmin, upload.single('image'), async (req, res) => {
  try {
    console.log('=== CREATE POST ===');
    console.log('Has file:', !!req.file);
    console.log('Title:', req.body.title);
    
    const { title, body } = req.body;
    
    if (!title || !body) {
      return res.status(400).json({ message: 'Title and body are required' });
    }
    
    let imageUrl = '';
    
    // Upload to Cloudinary if file exists
    if (req.file) {
      try {
        // Handle both buffer (production) and path (local)
        let uploadResult;
        
        if (req.file.buffer) {
          // Production on Render - use buffer
          const base64 = req.file.buffer.toString('base64');
          const dataURI = `data:${req.file.mimetype};base64,${base64}`;
          uploadResult = await cloudinary.uploader.upload(dataURI, {
            folder: 'blog-posts'
          });
        } else if (req.file.path) {
          // Local development - use file path
          uploadResult = await cloudinary.uploader.upload(req.file.path, {
            folder: 'blog-posts'
          });
        }
        
        if (uploadResult) {
          imageUrl = uploadResult.secure_url;
          console.log('Uploaded to Cloudinary:', imageUrl);
        }
      } catch (cloudinaryError) {
        console.error('Cloudinary error:', cloudinaryError);
        return res.status(500).json({ message: 'Image upload to Cloudinary failed: ' + cloudinaryError.message });
      }
    }
    
    const post = await Post.create({
      title: title.trim(),
      body: body.trim(),
      image: imageUrl,
      author: req.user._id,
      status: 'published'
    });
    
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
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const isOwner = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (req.body.title) post.title = req.body.title;
    if (req.body.body) post.body = req.body.body;
    
    if (req.file) {
      // Delete old image if exists
      if (post.image && post.image.includes('cloudinary')) {
        try {
          const publicId = post.image.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`blog-posts/${publicId}`);
        } catch (e) { console.log('Delete old image failed:', e); }
      }
      
      // Upload new image
      let uploadResult;
      if (req.file.buffer) {
        const base64 = req.file.buffer.toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${base64}`;
        uploadResult = await cloudinary.uploader.upload(dataURI, { folder: 'blog-posts' });
      } else if (req.file.path) {
        uploadResult = await cloudinary.uploader.upload(req.file.path, { folder: 'blog-posts' });
      }
      
      if (uploadResult) {
        post.image = uploadResult.secure_url;
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
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admins only' });
    }

    // Delete image from Cloudinary
    if (post.image && post.image.includes('cloudinary')) {
      try {
        const publicId = post.image.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`blog-posts/${publicId}`);
      } catch (e) { console.log('Delete image failed:', e); }
    }

    await post.deleteOne();
    res.json({ message: 'Post permanently deleted' });
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;