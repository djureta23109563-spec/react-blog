// backend/models/Message.js

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    subject: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['unread', 'read', 'replied'],
      default: 'unread'
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    repliedAt: {
      type: Date
    },
    replyMessage: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Message', messageSchema);