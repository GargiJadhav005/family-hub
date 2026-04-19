const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');

function signToken(userId, role) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  const payload = {
    sub: userId,
    role,
  };

  return jwt.sign(payload, secret, { expiresIn });
}

function verifyToken(token) {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET is not configured');
      return null;
    }
    const decoded = jwt.verify(token, secret);
    return decoded;
  } catch {
    return null;
  }
}

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function comparePasswords(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

function toClientUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    meta: user.meta || {},
  };
}

/**
 * Safely get a value from user meta, handling both Map and Record formats
 */
function getMetaValue(meta, key) {
  if (!meta) return undefined;
  // Handle Map format
  if (typeof meta.get === 'function') {
    return meta.get(key);
  }
  // Handle Record format
  return meta[key];
}

/**
 * Generate a unique username from a user's name
 * @param {string} name - Full name of the user
 * @returns {Promise<string>} - Generated unique username
 */
async function generateUsername(name) {
  const { Student } = require('../models');
  const parts = name.toLowerCase().trim().split(/\s+/);
  
  // Create base username: firstname.lastname or just firstname
  let baseUsername = parts.length >= 2 
    ? `${parts[0]}.${parts[parts.length - 1]}`
    : parts[0];
  
  // Remove special characters, keep only alphanumeric and dots
  baseUsername = baseUsername.replace(/[^a-z0-9.]/g, '');
  
  // Ensure we have something valid
  if (!baseUsername) baseUsername = 'user';
  
  // Check if username exists in BOTH User and Student collections
  let username = baseUsername;
  let counter = 1;
  
  while (
    (await User.findOne({ username })) ||
    (await Student.findOne({ username }))
  ) {
    username = `${baseUsername}${counter}`;
    counter++;
  }
  
  return username;
}

module.exports = {
  signToken,
  verifyToken,
  hashPassword,
  comparePasswords,
  toClientUser,
  getMetaValue,
  generateUsername,
};
