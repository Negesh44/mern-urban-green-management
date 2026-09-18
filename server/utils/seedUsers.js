const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const users = [
  {
    name: 'Urban Green Admin',
    email: 'admin@citygreen.gov',
    password: 'Admin@123',
    role: 'admin',
  },
  {
    name: 'Green Citizen',
    email: 'citizen@citygreen.gov',
    password: 'Citizen@123',
    role: 'citizen',
  },
];

const seedUsers = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart_urban_green';
    await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 4000 });
    console.log('[Seed] Connected to MongoDB for seeding users...');

    // Clear existing seeded test users
    await User.deleteMany({ email: { $in: users.map(u => u.email) } });
    console.log('[Seed] Cleared existing seed user records.');

    for (const u of users) {
      await User.create(u);
      console.log(`[Seed] Created user: ${u.email} [${u.role}] (Password: ${u.password})`);
    }

    console.log('[Seed] User seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error.message);
    process.exit(1);
  }
};

seedUsers();
