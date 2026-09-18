const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

let mongod = null;
const dbDir = path.join(__dirname, '..', '.db_data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const DB_NAME = 'smart_urban_green';

const connectDB = async () => {
  const defaultUri = process.env.MONGO_URI || `mongodb://127.0.0.1:27017/${DB_NAME}`;

  try {
    const conn = await mongoose.connect(defaultUri, {
      serverSelectionTimeoutMS: 1500,
    });
    console.log(`[MongoDB] Connected to database: ${conn.connection.host} (${conn.connection.name})`);
    return conn;
  } catch (error) {
    console.log(`[MongoDB] Database unreachable at ${defaultUri}. Initializing Embedded Persistent MongoDB Service...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create({
        instance: {
          port: 27017,
          dbPath: dbDir,
          storageEngine: 'wiredTiger',
          dbName: DB_NAME,
        },
      });

      const baseUri = mongod.getUri();
      const targetUri = baseUri.endsWith('/') ? `${baseUri}${DB_NAME}` : `${baseUri}/${DB_NAME}`;
      const conn = await mongoose.connect(targetUri);
      console.log(`[MongoDB] Embedded Persistent MongoDB running and connected at ${targetUri}`);

      // Auto-seed default test users
      const User = require('../models/User');
      const count = await User.countDocuments();
      if (count === 0) {
        await User.create([
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
        ]);
        console.log('[MongoDB] Auto-seeded default Admin & Citizen accounts in database.');
      }
      return conn;
    } catch (memErr) {
      console.error('[MongoDB Error] Failed to initialize Embedded MongoDB:', memErr.message);
    }
  }
};

module.exports = connectDB;
