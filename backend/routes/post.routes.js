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
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    console.error('Error fetching post:', err);
    res.status(500).json({ message: err.message });
  }
});

// Helper function to upload to Cloudinary from buffer
const uploadToCloudinary = (buffer, originalname) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'blog-posts',
        public_id: `${Date.now()}-${originalname.split('.')[0]}`,
        transformation: [
          { width: 1200, height: 630, crop: 'fill' }
        ]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    
    // Convert buffer to stream and pipe to Cloudinary
    const Readable = require('stream').Readable;
    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
};

// POST /api/posts - Create new post with Cloudinary image upload
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
    
    // Upload to Cloudinary if file exists
    if (req.file && req.file.buffer) {
      try {
        console.log('Uploading image to Cloudinary...');
        console.log('File size:', req.file.buffer.length);
        console.log('File mimetype:', req.file.mimetype);
        
        const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);
        imageUrl = result.secure_url;
        console.log('Cloudinary upload successful:', imageUrl);
      } catch (cloudinaryError) {
        console.error('Cloudinary upload error:', cloudinaryError);
        return res.status(500).json({ message: 'Image upload failed: ' + cloudinaryError.message });
      }
    } else {
      console.log('No image file to upload');
    }
    
    const postData = {
      title: title.trim(),
      body: body.trim(),
      image: imageUrl,
      author: req.user._id,
      status: 'published'
    };
    
    console.log('Creating post with image URL:', imageUrl || 'no image');
    
    const post = await Post.create(postData);
    console.log('Post created successfully, ID:', post._id);
    
    await post.populate('author', 'name profilePic');
    
    res.status(201).json(post);
    
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/posts/:id - Update post with Cloudinary image upload
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
    
    // Upload new image to Cloudinary if provided
    if (req.file && req.file.buffer) {
      try {
        console.log('Uploading updated image to Cloudinary...');
        const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);
        post.image = result.secure_url;
        console.log('Cloudinary upload successful:', post.image);
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

    await post.deleteOne();
    res.json({ message: 'Post permanently deleted' });
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;