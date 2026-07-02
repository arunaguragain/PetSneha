const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/petsneha';

const User = require('./src/models/user.model.js');

const ADMIN_SEED_EMAIL = process.env.ADMIN_SEED_EMAIL || 'admin@petsneha.com';
const ADMIN_SEED_PASSWORD = process.env.ADMIN_SEED_PASSWORD || 'Admin@12345';

async function seed() {
  try {
    console.log('Connecting to database:', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB!');

    const existingAdmin = await User.findOne({ email: ADMIN_SEED_EMAIL });

    if (existingAdmin) {
      console.log(`Admin user ${ADMIN_SEED_EMAIL} already exists!`);
    } else {
      console.log(`Creating admin user: ${ADMIN_SEED_EMAIL}...`);
      const hashedPassword = await bcrypt.hash(ADMIN_SEED_PASSWORD, 12);
      
      const adminDoc = new User({
        name: 'Admin',
        email: ADMIN_SEED_EMAIL,
        password: hashedPassword,
        role: 'admin',
        isActive: true,
      });
      await adminDoc.save();
      
      console.log('Successfully created admin user!');
      console.log(`Email: ${ADMIN_SEED_EMAIL}`);
      console.log(`Password: ${ADMIN_SEED_PASSWORD}`);
    }

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

seed();
