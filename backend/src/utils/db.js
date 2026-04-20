require('dotenv').config();
const mongoose = require('mongoose');
const {
  User,
  Student,
  Homework,
  HomeworkStatus,
  Attendance,
  Score,
  Quiz,
  Meeting,
} = require('../models');

async function connectDB() {
  const mongoUri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || 'family_hub';

  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  try {
    // Mask sensitive info (password) in URI for logging
    const maskedUri = mongoUri.replace(/\/\/(.*):(.*)@/, "//***:***@");
    console.log(`📡 Attempting to connect to MongoDB: ${maskedUri}`);

    await mongoose.connect(mongoUri, {
      dbName,
    });

    console.log('✓ Connected to MongoDB');
  } catch (err) {
    console.error('✗ Failed to connect to MongoDB:', err);
    
    // Help the user identify local vs remote connection issues
    if (mongoUri.includes('localhost') || mongoUri.includes('127.0.0.1')) {
      console.error('⚠️  CRITICAL: You are trying to connect to a LOCAL database from Render.');
      console.error('ℹ️  ACTION REQUIRED: Set your MONGODB_URI in the Render Dashboard to your MongoDB Atlas connection string.');
    }
    
    throw err;
  }
}

module.exports = { connectDB };
