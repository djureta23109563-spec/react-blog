const mongoose = require('mongoose');
const cloudinary = require('../config/cloudinary');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function migrateImagesToCloudinary() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find all users with profilePic but no avatar
        const users = await User.find({ 
            profilePic: { $ne: '', $exists: true },
            avatar: { $in: ['', null, undefined] }
        });
        
        console.log(`📸 Found ${users.length} users with local images to migrate`);

        let migrated = 0;
        let failed = 0;

        for (const user of users) {
            console.log(`\n🔄 Processing: ${user.name} (${user.email})`);
            console.log(`   Local image: ${user.profilePic}`);
            
            const localImagePath = path.join(__dirname, '../uploads', user.profilePic);
            
            // Check if local file exists
            if (!fs.existsSync(localImagePath)) {
                console.log(`   ⚠️  Local file not found: ${localImagePath}`);
                failed++;
                continue;
            }

            try {
                // Upload to Cloudinary
                const result = await cloudinary.uploader.upload(localImagePath, {
                    folder: 'member-avatars',
                    public_id: `${user._id}_${Date.now()}`,
                    transformation: [
                        { width: 300, height: 300, crop: 'fill', gravity: 'face' }
                    ]
                });

                // Update user in database
                user.avatar = result.secure_url;
                user.avatarPublicId = result.public_id;
                user.avatarUpdatedAt = new Date();
                await user.save();

                console.log(`   ✅ Migrated to: ${result.secure_url}`);
                migrated++;
                
                // Optional: Delete local file after successful upload
                // fs.unlinkSync(localImagePath);
                
            } catch (uploadError) {
                console.error(`   ❌ Upload failed:`, uploadError.message);
                failed++;
            }
        }

        console.log('\n📊 Migration Summary:');
        console.log(`   ✅ Successfully migrated: ${migrated}`);
        console.log(`   ❌ Failed: ${failed}`);
        console.log(`   📊 Total processed: ${users.length}`);

        // Also check for users with avatar field already set
        const usersWithAvatar = await User.find({ 
            avatar: { $ne: '', $exists: true }
        });
        console.log(`\n👥 Users with Cloudinary avatar: ${usersWithAvatar.length}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

// Run migration
migrateImagesToCloudinary();