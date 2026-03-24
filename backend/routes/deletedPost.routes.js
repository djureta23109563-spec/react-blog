// backend/routes/deletedPost.routes.js

const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/role.middleware');

// GET /api/deleted-posts/:id - View a deleted post (admin only)
router.get('/:id', protect, adminOnly, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name profilePic email');
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Return the post even if it's removed
    res.json({
      ...post.toObject(),
      isDeleted: post.status === 'removed',
      viewedByAdmin: true
    });
  } catch (err) {
    console.error('Error fetching deleted post:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/deleted-posts - Get all deleted posts (admin only)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const deletedPosts = await Post.find({ status: 'removed' })
      .populate('author', 'name profilePic email')
      .sort({ updatedAt: -1 });
    
    res.json(deletedPosts);
  } catch (err) {
    console.error('Error fetching deleted posts:', err);
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/deleted-posts/:id/restore - Restore a deleted post (admin only)
router.put('/:id/restore', protect, adminOnly, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.status = 'published';
    await post.save();
    
    res.json({ message: 'Post restored successfully', post });
  } catch (err) {
    console.error('Error restoring post:', err);
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/deleted-posts/:id - Permanently delete a post (admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await post.deleteOne();
    res.json({ message: 'Post permanently deleted' });
  } catch (err) {
    console.error('Error permanently deleting post:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;