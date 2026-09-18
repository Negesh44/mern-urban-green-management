const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// In-memory user cache / fallback for zero-dependency offline mode
const memoryUsers = [];

// Seed memory users
const initMemoryUsers = async () => {
  if (memoryUsers.length === 0) {
    const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
    const citizenPasswordHash = await bcrypt.hash('Citizen@123', 10);

    memoryUsers.push(
      {
        _id: '660e1f72e3a1234567890001',
        name: 'Urban Green Admin',
        email: 'admin@citygreen.gov',
        password: adminPasswordHash,
        role: 'admin',
        createdAt: new Date().toISOString(),
      },
      {
        _id: '660e1f72e3a1234567890002',
        name: 'Green Citizen',
        email: 'citizen@citygreen.gov',
        password: citizenPasswordHash,
        role: 'citizen',
        createdAt: new Date().toISOString(),
      }
    );
  }
};
initMemoryUsers();

const findUserByEmail = async (email, includePassword = false) => {
  const cleanEmail = email.toLowerCase().trim();
  if (mongoose.connection.readyState === 1) {
    const query = User.findOne({ email: cleanEmail });
    if (includePassword) query.select('+password');
    return await query.exec();
  } else {
    await initMemoryUsers();
    const user = memoryUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) return null;
    return {
      ...user,
      comparePassword: async (pass) => bcrypt.compare(pass, user.password),
    };
  }
};

const findUserById = async (id) => {
  if (mongoose.connection.readyState === 1) {
    return await User.findById(id).select('-password');
  } else {
    await initMemoryUsers();
    const user = memoryUsers.find((u) => u._id.toString() === id.toString());
    if (!user) return null;
    const { password, ...userWithoutPass } = user;
    return userWithoutPass;
  }
};

const createUser = async ({ name, email, password, role }) => {
  const cleanEmail = email.toLowerCase().trim();
  if (mongoose.connection.readyState === 1) {
    return await User.create({ name, email: cleanEmail, password, role });
  } else {
    await initMemoryUsers();
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      _id: new mongoose.Types.ObjectId().toString(),
      name,
      email: cleanEmail,
      password: hashedPassword,
      role: role || 'citizen',
      createdAt: new Date().toISOString(),
    };
    memoryUsers.push(newUser);
    return {
      ...newUser,
      comparePassword: async (pass) => bcrypt.compare(pass, newUser.password),
    };
  }
};

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
};
