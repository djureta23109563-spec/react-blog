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

// POST /api/posts - Create new post (DEBUG VERSION)
router.post('/', protect, memberOrAdmin, async (req, res) => {
  try {
    console.log('=== CREATE POST (DEBUG) ===');
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Body:', req.body);
    
    const { title, body } = req.body;
    
    if (!title || !body) {
      return res.status(400).json({ message: 'Title and body are required' });
    }
    
    // Create post WITHOUT image for now
    const postData = {
      title: title.trim(),
      body: body.trim(),
      image: '',
      author: req.user._id,
      status: 'published'
    };
    
    console.log('Creating post:', postData);
    
    const post = await Post.create(postData);
    console.log('Post created:', post._id);
    
    await post.populate('author', 'name profilePic');
    
    res.status(201).json(post);
    
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/posts/:id - Update post
router.put('/:id', protect, memberOrAdmin, async (req, res) => {
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