// PayFlex Systems - 2FA Authentication (TOTP)
// MANDATORY for God Mode

import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

/**
 * Generate 2FA secret for user
 * @param {string} userEmail - User's email address
 * @returns {Object} - Secret and QR code data URL
 */
export async function generate2FASecret(userEmail) {
  const secret = speakeasy.generateSecret({
    name: `PayFlex Systems (${userEmail})`,
    issuer: 'PayFlex Systems',
    length: 20
  });

  // Generate QR code for easy scanning
  const qrCodeDataURL = await QRCode.toDataURL(secret.otpauth_url);

  return {
    secret: secret.base32,
    qrCode: qrCodeDataURL,
    manualEntry: secret.base32
  };
}

/**
 * Verify 2FA token
 * @param {string} token - 6-digit token from authenticator app
 * @param {string} secret - User's 2FA secret
 * @returns {boolean} - True if token is valid
 */
export function verify2FA(token, secret) {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 1 // Allow 1 time step variance (30 seconds)
  });
}

/**
 * Require 2FA for God Mode users
 * @param {Object} user - User object
 * @throws {Error} - If 2FA not verified for God Mode
 */
export function require2FA(user) {
  if (user.role === 'platform_admin' && !user.twoFactorVerified) {
    throw new Error('2FA verification required for platform admin access');
  }
}

/**
 * Enable 2FA for user
 * @param {Object} user - User object
 * @param {string} secret - 2FA secret
 * @param {string} verificationToken - Token to verify setup
 * @returns {boolean} - True if enabled successfully
 */
export function enable2FA(user, secret, verificationToken) {
  const isValid = verify2FA(verificationToken, secret);
  
  if (!isValid) {
    throw new Error('Invalid verification token. Cannot enable 2FA.');
  }

  user.twoFactorEnabled = true;
  user.twoFactorSecret = secret; // Should be encrypted at rest
  
  return true;
}

/**
 * Disable 2FA for user (God Mode cannot disable)
 * @param {Object} user - User object
 * @throws {Error} - If attempting to disable for God Mode
 */
export function disable2FA(user) {
  if (user.role === 'platform_admin') {
    throw new Error('2FA cannot be disabled for platform admins');
  }

  user.twoFactorEnabled = false;
  user.twoFactorSecret = null;
  user.twoFactorVerified = false;
  
  return true;
}

/**
 * Generate backup codes for 2FA recovery
 * @returns {Array<string>} - Array of 8 backup codes
 */
export function generateBackupCodes() {
  const crypto = require('crypto');
  const codes = [];
  
  for (let i = 0; i < 8; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(code);
  }
  
  return codes;
}
