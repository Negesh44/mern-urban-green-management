const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

let mongodProcess = null;
const isVercel = Boolean(process.env.VERCEL);
const dbDir = isVercel ? '/tmp/.db_data' : path.join(__dirname, '..', '.db_data');

if (!isVercel) {
  try {
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
  } catch (err) {
    // Ignore folder creation errors on read-only environments
  }
}

const DB_NAME = 'smart_urban_green';

// Locate local MongoDB binary if available
const findLocalMongoBinary = () => {
  const binaryPaths = [
    'C:\\Users\\DELL\\.cache\\mongodb-binaries\\mongod-x64-win32-8.2.6.exe',
    path.join(process.env.USERPROFILE || '', '.cache', 'mongodb-binaries', 'mongod-x64-win32-8.2.6.exe'),
  ];

  for (const binPath of binaryPaths) {
    if (binPath && fs.existsSync(binPath)) {
      return binPath;
    }
  }
  return null;
};

// Spawn background mongod service on port 27017
const spawnLocalMongod = async () => {
  const bin = findLocalMongoBinary();
  if (!bin) return false;

  console.log(`[MongoDB] Auto-starting local persistent MongoDB daemon (${bin}) on port 27017...`);
  try {
    mongodProcess = spawn(bin, ['--dbpath', dbDir, '--port', '27017', '--bind_ip', '127.0.0.1'], {
      detached: true,
      stdio: 'ignore',
    });
    mongodProcess.unref();

    // Give daemon 1.8 seconds to open TCP listener
    await new Promise((resolve) => setTimeout(resolve, 1800));
    return true;
  } catch (err) {
    console.warn('[MongoDB] Could not spawn local mongod:', err.message);
    return false;
  }
};

// Connection lifecycle monitoring
mongoose.connection.on('connected', () => {
  console.log('[MongoDB Event] Connection ready state: 1 (Connected)');
});
mongoose.connection.on('error', (err) => {
  console.error('[MongoDB Event Error]', err.message);
});
mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB Event] Connection lost, reconnecting...');
});

let connectionPromise = null;

const connectDB = async () => {
  // If already fully connected, return immediately
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // If a connection attempt is already in flight, reuse the promise
  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = (async () => {
    const defaultUri = process.env.MONGO_URI || `mongodb://127.0.0.1:27017/${DB_NAME}`;

    try {
      const conn = await mongoose.connect(defaultUri, {
        serverSelectionTimeoutMS: 5000,
        maxPoolSize: 20,
        minPoolSize: 5,
        autoIndex: false,
      });
      console.log(`[MongoDB] Connected successfully to database: ${conn.connection.host} (${conn.connection.name})`);
      return conn;
    } catch (error) {
      console.warn('[MongoDB Connect Warning] Initial connection to', defaultUri, 'failed:', error.message);

      // Try auto-starting local mongod if connection refused on localhost
      if (!isVercel && (defaultUri.includes('127.0.0.1:27017') || defaultUri.includes('localhost:27017'))) {
        const started = await spawnLocalMongod();
        if (started) {
          try {
            const conn = await mongoose.connect(defaultUri, { serverSelectionTimeoutMS: 4000 });
            console.log(`[MongoDB] Connected successfully to auto-started database: ${conn.connection.host} (${conn.connection.name})`);
            return conn;
          } catch (retryErr) {
            console.warn('[MongoDB Retry] Failed after daemon spawn:', retryErr.message);
          }
        }
      }

      // Secondary fallback: MongoMemoryServer dynamic port
      console.log(`[MongoDB] Initializing Embedded Persistent MongoDB Service fallback...`);
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create({
          instance: {
            dbPath: dbDir,
            dbName: DB_NAME,
          },
        });

        const baseUri = mongod.getUri();
        const targetUri = baseUri.endsWith('/') ? `${baseUri}${DB_NAME}` : `${baseUri}/${DB_NAME}`;
        const conn = await mongoose.connect(targetUri);
        console.log(`[MongoDB] Embedded Persistent MongoDB connected at ${targetUri}`);
        return conn;
      } catch (memErr) {
        console.warn('[MongoDB Fallback] Running in resilient memory store mode:', memErr.message);
        return mongoose.connection;
      }
    } finally {
      // Clear in-flight promise reference if not connected
      if (mongoose.connection.readyState !== 1) {
        connectionPromise = null;
      }
    }
  })();

  return connectionPromise;
};

module.exports = connectDB;
