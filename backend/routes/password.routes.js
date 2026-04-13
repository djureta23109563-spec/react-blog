const express = require('express');
const router = express.Router();
const User = require('../models/User');
const crypto = require('crypto');

// Store verification codes temporarily
const verificationCodes = new Map();

// Configure email transporter
let transporter = null;
let emailConfigured = false;

try {
  const nodemailer = require('nodemailer');
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      timeout: 10000,
      connectionTimeout: 10000
    });
    emailConfigured = true;
    console.log('✅ Email transporter configured (Gmail)');
  } else {
    console.log('⚠️ Email not configured - codes will be shown in console');
  }
} catch (error) {
  console.log('⚠️ Nodemailer not available');
}

// Generate 6-digit code
const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send email
const sendEmail = async (to, code) => {
  if (!emailConfigured || !transporter) {
    console.log(`📧 [DEV MODE] Verification code for ${to}: ${code}`);
    return true;
  }

  try {
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #667eea;">Password Reset Verification</h1>
        <p>Your verification code is:</p>
        <h2 style="font-size: 32px; letter-spacing: 5px;">${code}</h2>
        <p>This code expires in 10 minutes.</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"DanceFolio" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: 'Password Reset Verification Code',
      html: emailHtml
    });
    console.log(`✅ Email sent to ${to} with code: ${code}`);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
};

// POST /api/password/send-code
router.post('/send-code', async (req, res) => {
  try {
    const { email } = req.body;
    console.log('Send code request for:', email);
    
    if (!email) {
      return res.status(400).json({ message: 'Please provide an email address' });
    }
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.json({ 
        success: true, 
        message: 'If an account exists with that email, you will receive a verification code.' 
      });
    }
    
    const code = generateCode();
    const expiresAt = Date.now() + 10 * 60 * 1000;
    
    verificationCodes.set(email, { code, expiresAt, attempts: 0 });
    
    setTimeout(() => {
      if (verificationCodes.has(email)) {
        const stored = verificationCodes.get(email);
        if (stored.expiresAt <= Date.now()) {
          verificationCodes.delete(email);
        }
      }
    }, 10 * 60 * 1000);
    
    const emailSent = await sendEmail(email, code);
    
    res.json({ 
      success: true, 
      message: emailSent ? 'Verification code sent!' : 'Unable to send email. Check logs for code.',
      devCode: !emailConfigured ? code : undefined
    });
    
  } catch (error) {
    console.error('Send code error:', error);
    res.status(500).json({ message: 'Error sending verification code.' });
  }
});

// POST /api/password/verify-code
router.post('/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({ message: 'Email and code are required' });
    }
    
    const stored = verificationCodes.get(email);
    
    if (!stored) {
      return res.status(400).json({ message: 'No code found. Request a new one.' });
    }
    
    if (stored.expiresAt < Date.now()) {
      verificationCodes.delete(email);
      return res.status(400).json({ message: 'Code expired. Request a new one.' });
    }
    
    if (stored.attempts >= 5) {
      verificationCodes.delete(email);
      return res.status(400).json({ message: 'Too many attempts. Request a new code.' });
    }
    
    if (stored.code !== code) {
      stored.attempts++;
      verificationCodes.set(email, stored);
      return res.status(400).json({ message: 'Invalid code. Please try again.' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = Date.now() + 15 * 60 * 1000;
    
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await user.save();
    
    verificationCodes.delete(email);
    
    res.json({ 
      success: true, 
      message: 'Code verified!',
      resetToken
    });
    
  } catch (error) {
    console.error('Verify code error:', error);
    res.status(500).json({ message: 'Error verifying code.' });
  }
});

// POST /api/password/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;
    
    if (!token || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    
    user.password = password;
    user.resetPasswordToken = '';
    user.resetPasswordExpires = null;
    await user.save();
    
    res.json({ 
      success: true, 
      message: 'Password reset successfully!' 
    });
    
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Error resetting password.' });
  }
});

// GET /api/password/verify-token/:token
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