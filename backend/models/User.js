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
    },

    // NEW: Cloudinary avatar fields
    avatar: {
        type: String,
        default: ''
    },

    avatarPublicId: {
        type: String,
        default: ''
    },

    avatarUpdatedAt: {
        type: Date,
        default: null
    }
},
{
    timestamps: true
}
);

// Virtual: Get the best available profile image
userSchema.virtual('profileImage').get(function() {
    return this.avatar || this.profilePic || '';
});

// ── Pre-save hook: hash password before storing ────────────────
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
        throw error;
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

// Enable virtuals when converting to JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);