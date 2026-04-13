const express = require('express');
const router = express.Router();
const User = require('../models/User');
const crypto = require('crypto');

// Try to configure email transporter, but don't fail if not configured
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
      }
    });
    emailConfigured = true;
    console.log('✅ Email transporter configured');
  } else {
    console.log('⚠️ Email not configured - reset links will be shown in console');
  }
} catch (error) {
  console.log('⚠️ Nodemailer not available - reset links will be shown in console');
}

// @route   POST /api/password/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        
        console.log('Forgot password request for:', email);
        
        if (!email) {
            return res.status(400).json({ message: 'Please provide an email address' });
        }
        
        const user = await User.findOne({ email });
        
        // For security, don't reveal if email exists or not
        if (!user) {
            console.log('User not found:', email);
            return res.json({ 
                success: true, 
                message: 'If an account exists with that email, you will receive a password reset link.' 
            });
        }
        
        console.log('User found:', user.email);
        
        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpires = Date.now() + 3600000; // 1 hour from now
        
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetExpires;
        await user.save();
        
        console.log('Reset token generated for user:', user.email);
        
        // Create reset URL
        const frontendUrl = process.env.FRONTEND_URL || 'https://react-blog-git-main-djureta23109563-spec.vercel.app';
        const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
        
        console.log('Reset URL:', resetUrl);
        
        // If email is configured, send email
        if (emailConfigured && transporter) {
            try {
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
                
                await transporter.sendMail({
                    from: `"DanceFolio" <${process.env.EMAIL_USER}>`,
                    to: email,
                    subject: 'Password Reset Request',
                    html: emailHtml
                });
                console.log('Reset email sent to:', email);
            } catch (emailError) {
                console.error('Failed to send email:', emailError);
                // Don't fail the request - show the link in console instead
            }
        }
        
        // Always return success, but include the reset link in response for development
        res.json({ 
            success: true, 
            message: emailConfigured 
                ? 'If an account exists with that email, you will receive a password reset link.' 
                : `Password reset link (email not configured): ${resetUrl}`,
            ...(!emailConfigured && { resetUrl }) // Include URL in response for testing
        });
        
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Error processing request. Please try again.' });
    }
});

// @route   POST /api/password/reset-password/:token
// @desc    Reset password with token
// @access  Public
router.post('/reset-password/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { password, confirmPassword } = req.body;
        
        console.log('Reset password attempt for token:', token.substring(0, 10) + '...');
        
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
            console.log('Invalid or expired token');
            return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
        }
        
        console.log('User found, resetting password for:', user.email);
        
        // Update password
        user.password = password;
        user.resetPasswordToken = '';
        user.resetPasswordExpires = null;
        await user.save();
        
        console.log('Password reset successfully for:', user.email);
        
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
        
        console.log('Verifying token:', token.substring(0, 10) + '...');
        
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        
        if (!user) {
            console.log('Token invalid or expired');
            return res.status(400).json({ valid: false, message: 'Invalid or expired token' });
        }
        
        console.log('Token valid for user:', user.email);
        res.json({ valid: true, email: user.email });
        
    } catch (error) {
        console.error('Verify token error:', error);
        res.status(500).json({ valid: false, message: 'Error verifying token' });
    }
});

module.exports = router;