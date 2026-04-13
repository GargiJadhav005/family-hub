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
    await mongoose.connect(mongoUri, {
      dbName,
    });

    console.log('✓ Connected to MongoDB');
  } catch (err) {
    console.error('✗ Failed to connect to MongoDB:', err);
    throw err;
  }
}

module.exports = { connectDB };
