// backend/routes/password.routes.js

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const crypto = require('crypto');
const { Resend } = require('resend');

// Initialize Resend with your API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

// Store verification codes temporarily (in production, use a database)
const verificationCodes = new Map();

// Generate 6-digit verification code
const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send email using Resend
const sendEmail = async (to, code) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'DanceFolio <onboarding@resend.dev>',
      to: [to],
      subject: 'Password Reset Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">DanceFolio</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Password Reset Verification</p>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <p style="color: #333; font-size: 16px;">Hello,</p>
            <p style="color: #555; font-size: 16px;">You requested to reset your password. Use the verification code below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #667eea; background: #f0f0f0; padding: 15px; border-radius: 8px; display: inline-block;">
                ${code}
              </div>
            </div>
            <p style="color: #555; font-size: 14px;">This code will expire in <strong>10 minutes</strong>.</p>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">If you didn't request this, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">DanceFolio - Your Dance Community</p>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('Resend error:', error);
      return false;
    }
    
    console.log(`✅ Email sent to ${to} with code: ${code}`);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
};

// @route   POST /api/password/send-code
// @desc    Send verification code to email
// @access  Public
router.post('/send-code', async (req, res) => {
  try {
    const { email } = req.body;
    console.log('Send code request for:', email);
    
    if (!email) {
      return res.status(400).json({ message: 'Please provide an email address' });
    }
    
    // Check if user exists (but don't reveal for security)
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.json({ 
        success: true, 
        message: 'If an account exists with that email, you will receive a verification code.' 
      });
    }
    
    // Generate and store verification code
    const code = generateCode();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    verificationCodes.set(email, { 
      code, 
      expiresAt, 
      attempts: 0 
    });
    
    // Auto-cleanup after 10 minutes
    setTimeout(() => {
      if (verificationCodes.has(email)) {
        const stored = verificationCodes.get(email);
        if (stored.expiresAt <= Date.now()) {
          verificationCodes.delete(email);
        }
      }
    }, 10 * 60 * 1000);
    
    // Send email
    const emailSent = await sendEmail(email, code);
    
    res.json({ 
      success: true, 
      message: emailSent 
        ? 'Verification code sent to your email!' 
        : 'Unable to send email. Please try again.',
    });
    
  } catch (error) {
    console.error('Send code error:', error);
    res.status(500).json({ message: 'Error sending verification code. Please try again.' });
  }
});

// @route   POST /api/password/verify-code
// @desc    Verify the 6-digit code
// @access  Public
router.post('/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }
    
    const stored = verificationCodes.get(email);
    
    if (!stored) {
      return res.status(400).json({ message: 'No verification code found. Please request a new one.' });
    }
    
    if (stored.expiresAt < Date.now()) {
      verificationCodes.delete(email);
      return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
    }
    
    if (stored.attempts >= 5) {
      verificationCodes.delete(email);
      return res.status(400).json({ message: 'Too many failed attempts. Please request a new code.' });
    }
    
    if (stored.code !== code) {
      stored.attempts++;
      verificationCodes.set(email, stored);
      return res.status(400).json({ message: 'Invalid verification code. Please try again.' });
    }
    
    // Code is valid - generate a temporary reset token
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    
    // Generate temporary reset token (valid for 15 minutes)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = Date.now() + 15 * 60 * 1000;
    
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await user.save();
    
    // Clean up verification code
    verificationCodes.delete(email);
    
    res.json({ 
      success: true, 
      message: 'Code verified successfully.',
      resetToken
    });
    
  } catch (error) {
    console.error('Verify code error:', error);
    res.status(500).json({ message: 'Error verifying code. Please try again.' });
  }
});

// @route   POST /api/password/reset-password
// @desc    Reset password using token
// @access  Public
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;
    
    if (!token || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    
    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Reset token is invalid or has expired.' });
    }
    
    // Update password
    user.password = password;
    user.resetPasswordToken = '';
    user.resetPasswordExpires = null;
    await user.save();
    
    res.json({ 
      success: true, 
      message: 'Password has been reset successfully. You can now login with your new password.' 
    });
    
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Error resetting password. Please try again.' });
  }
});

// @route   GET /api/password/verify-token/:token
// @desc    Verify if reset token is valid
// @access  Public
router.get('/verify-token/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ valid: false, message: 'Invalid or expired token' });
    }
    
    res.json({ valid: true, email: user.email });
    
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({ valid: false, message: 'Error verifying token' });
  }
});

module.exports = router;