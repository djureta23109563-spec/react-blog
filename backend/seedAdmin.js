// backend/seedAdmin.js
require('dotenv').config();

const connectDB = require('./config/db');
const User = require('./models/User');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@thefolio.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@1234';
const ADMIN_NAME = process.env.ADMIN_NAME || 'TheFolio Admin';
const FORCE_SEED =
  process.argv.includes('--force') || process.argv.includes('-f');

async function seedAdmin() {
  try {
    await connectDB();

    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });

    if (existingAdmin && !FORCE_SEED) {
      console.log(
        `Admin account already exists for ${ADMIN_EMAIL}. Use --force to recreate.`
      );
      process.exit(0);
    }

    if (existingAdmin && FORCE_SEED) {
      await User.deleteOne({ email: ADMIN_EMAIL });
      console.log(
        `Existing admin account removed for ${ADMIN_EMAIL}.`
      );
    }

    await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'admin',
      status: 'active',
    });

    console.log('Admin account created successfully!');
    console.log(`Email: ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin account:', error);
    process.exit(1);
  }
}

seedAdmin();