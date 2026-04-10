const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function setDefaultAvatars() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const members = await User.find({ 
            role: 'member',
            $or: [
                { avatar: { $in: ['', null, undefined] } },
                { avatar: { $exists: false } }
            ]
        });
        
        console.log(`📸 Found ${members.length} members without avatar`);
        
        for (const member of members) {
            const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=0070f3&color=fff&size=300&rounded=true&bold=true&length=2`;
            member.avatar = defaultAvatar;
            await member.save();
            console.log(`   ✅ Avatar set for: ${member.name}`);
        }
        
        console.log(`\n✨ Successfully set avatars for ${members.length} members`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed:', error);
        process.exit(1);
    }
}

setDefaultAvatars();