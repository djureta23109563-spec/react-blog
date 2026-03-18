// backend/models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },

    password: {
        type: String,
        required: true,
        minlength: 6
    },

    role: {
        type: String,
        enum: ['member', 'admin'],
        default: 'member'
    },

    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },

    bio: {
        type: String,
        default: ''
    },

    profilePic: {
        type: String,
        default: ''
    }

},
{
    timestamps: true
}
);

// ── Pre-save hook: hash password before storing ────────────────
// FIXED: Removed the 'next' parameter and just return
userSchema.pre('save', async function() {
    try {
        if (!this.isModified('password')) {
            return;
        }

        console.log('Hashing password for user:', this.email);
        
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        
        console.log('Password hashed successfully');
    } catch (error) {
        console.error('Error in password hashing:', error);
        throw error; // Throw error instead of passing to next
    }
});

// ── Instance method: compare entered password with stored hash ─
userSchema.methods.matchPassword = async function (enteredPassword) {
    try {
        return await bcrypt.compare(enteredPassword, this.password);
    } catch (error) {
        console.error('Error comparing passwords:', error);
        return false;
    }
};

module.exports = mongoose.model('User', userSchema);