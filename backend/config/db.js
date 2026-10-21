const mongoose = require('mongoose');

let mongoMemoryServer = null;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (mongoUri && mongoUri.trim() !== '') {
      console.log(`Connecting to specified MongoDB URI: ${mongoUri.replace(/:([^:@]+)@/, ':****@')}`);
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return conn;
    }

    console.log('⚡ No external MONGODB_URI provided. Initializing embedded MongoMemoryServer...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongoMemoryServer = await MongoMemoryServer.create();
    const uri = mongoMemoryServer.getUri();
    const conn = await mongoose.connect(uri);
    console.log(`✅ In-Memory MongoDB Connected at: ${uri}`);
    return conn;
  } catch (error) {
    console.warn(`⚠️ Primary MongoDB connection attempt failed: ${error.message}`);
    console.log('⚡ Falling back to embedded MongoMemoryServer...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const uri = mongoMemoryServer.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`✅ Fallback In-Memory MongoDB Connected at: ${uri}`);
      return conn;
    } catch (memError) {
      console.error(`❌ Critical error connecting to MongoDB: ${memError.message}`);
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };
