const express = require('express');
const router = express.Router();
const User = require('../models/User');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Configure email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // or use 'hotmail', 'yahoo', etc.
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ message: 'Please provide an email address' });
        }
        
        const user = await User.findOne({ email });
        
        // For security, don't reveal if email exists or not
        if (!user) {
            return res.json({ 
                success: true, 
                message: 'If an account exists with that email, you will receive a password reset link.' 
            });
        }
        
        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpires = Date.now() + 3600000; // 1 hour from now
        
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetExpires;
        await user.save();
        
        // Create reset URL
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        
        // Email HTML
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <div style="background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h1 style="color: #333; text-align: center; margin-bottom: 20px;">Reset Your Password</h1>
                    <p style="color: #666; font-size: 16px; line-height: 1.5;">Hello ${user.name},</p>
                    <p style="color: #666; font-size: 16px; line-height: 1.5;">We received a request to reset your password. Click the button below to create a new password:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="background-color: #0070f3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; display: inline-block;">Reset Password</a>
                    </div>
                    <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email. The link will expire in 1 hour.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #999; font-size: 12px; text-align: center;">DanceFolio - Your Dance Community</p>
                </div>
            </div>
        `;
        
        // Send email
        await transporter.sendMail({
            from: `"DanceFolio" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Password Reset Request',
            html: emailHtml
        });
        
        res.json({ 
            success: true, 
            message: 'If an account exists with that email, you will receive a password reset link.' 
        });
        
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Error sending reset email. Please try again.' });
    }
});

// @route   POST /api/auth/reset-password/:token
// @desc    Reset password with token
// @access  Public
router.post('/reset-password/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { password, confirmPassword } = req.body;
        
        if (!password || !confirmPassword) {
            return res.status(400).json({ message: 'Please provide both password fields' });
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
            return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
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

// @route   GET /api/auth/verify-token/:token
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