// PayFlex Systems - Password Security (bcrypt)
// NEVER store plain passwords

import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12; // Industry standard for security/performance balance

/**
 * Hash a plain password
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
export async function hashPassword(password) {
  if (!password || password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }
  
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify password against hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} - True if password matches
 */
export async function verifyPassword(password, hash) {
  if (!password || !hash) {
    return false;
  }
  
  return await bcrypt.compare(password, hash);
}

/**
 * Validate password strength
 * @param {string} password - Plain text password
 * @returns {boolean} - True if password meets requirements
 */
export function validatePasswordStrength(password) {
  if (!password || password.length < 8) return false;
  
  // Require at least one number
  const hasNumber = /\d/.test(password);
  
  // Require at least one letter
  const hasLetter = /[a-zA-Z]/.test(password);
  
  return hasNumber && hasLetter;
}

/**
 * Generate secure random password
 * @param {number} length - Password length (default 16)
 * @returns {string} - Random password
 */
export function generateSecurePassword(length = 16) {
  const crypto = require('crypto');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  
  let password = '';
  const randomBytes = crypto.randomBytes(length);
  
  for (let i = 0; i < length; i++) {
    password += chars[randomBytes[i] % chars.length];
  }
  
  return password;
}
