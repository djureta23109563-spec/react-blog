// backend/routes/message.routes.js

const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/role.middleware');

// ================ PUBLIC ROUTES ================

// POST /api/messages - Send a message (public)
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate input
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Create new message
    const newMessage = new Message({
      name,
      email,
      subject,
      message,
      user: req.user ? req.user._id : null // If user is logged in, associate with their account
    });

    await newMessage.save();

    console.log('New message received:', newMessage._id);

    res.status(201).json({ 
      message: 'Message sent successfully! The admin will respond soon.',
      messageId: newMessage._id
    });
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ message: 'Failed to send message. Please try again.' });
  }
});

// ================ ADMIN ROUTES ================

// GET /api/messages/admin - Get all messages (admin only)
router.get('/admin', protect, adminOnly, async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

// GET /api/messages/admin/:id - Get single message (admin only)
router.get('/admin/:id', protect, adminOnly, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json(message);
  } catch (err) {
    console.error('Error fetching message:', err);
    res.status(500).json({ message: 'Failed to fetch message' });
  }
});

// PUT /api/messages/admin/:id/status - Update message status (admin only)
router.put('/admin/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    message.status = status;
    await message.save();

    res.json({ message: 'Message status updated', status: message.status });
  } catch (err) {
    console.error('Error updating message status:', err);
    res.status(500).json({ message: 'Failed to update message status' });
  }
});

// PUT /api/messages/admin/:id/reply - Reply to message (admin only)
router.put('/admin/:id/reply', protect, adminOnly, async (req, res) => {
  try {
    const { replyMessage } = req.body;
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    message.replyMessage = replyMessage;
    message.status = 'replied';
    message.repliedAt = new Date();
    await message.save();

    // Here you would also send an email notification to the user
    // For now, we'll just update the database

    res.json({ message: 'Reply sent successfully' });
  } catch (err) {
    console.error('Error sending reply:', err);
    res.status(500).json({ message: 'Failed to send reply' });
  }
});

// DELETE /api/messages/admin/:id - Delete message (admin only)
router.delete('/admin/:id', protect, adminOnly, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    await message.deleteOne();
    res.json({ message: 'Message deleted successfully' });
  } catch (err) {
    console.error('Error deleting message:', err);
    res.status(500).json({ message: 'Failed to delete message' });
  }
});

module.exports = router;