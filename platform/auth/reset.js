// PayFlex Systems - Password Reset System
// Secure, time-boxed, auditable

import crypto from 'crypto';
import { hashPassword } from './password.js';
import { logAction } from '../audit/log.js';

const RESET_TOKEN_EXPIRY = 15 * 60 * 1000; // 15 minutes

/**
 * Generate password reset token
 * @returns {string} - Secure random token
 */
export function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash reset token for storage
 * @param {string} token - Plain token
 * @returns {string} - Hashed token
 */
export function hashResetToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Request password reset
 * @param {Object} user - User object
 * @param {string} ipAddress - Request IP
 * @param {string} userAgent - Request user agent
 * @returns {Object} - Reset token data
 */
export function requestPasswordReset(user, ipAddress, userAgent) {
  const token = generateResetToken();
  const tokenHash = hashResetToken(token);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY);

  user.passwordResetToken = tokenHash;
  user.passwordResetExpires = expiresAt;

  logAction({
    action: 'PASSWORD_RESET_REQUESTED',
    actorId: user.id,
    actorRole: user.role,
    ipAddress,
    userAgent
  });

  // Return plain token for email (only time it's exposed)
  return {
    token,
    expiresAt
  };
}

/**
 * Verify reset token
 * @param {Object} user - User object
 * @param {string} token - Plain token from email
 * @returns {boolean} - True if valid
 */
export function verifyResetToken(user, token) {
  if (!user.passwordResetToken || !user.passwordResetExpires) {
    return false;
  }

  const tokenHash = hashResetToken(token);
  const tokenExpired = new Date() > user.passwordResetExpires;

  if (tokenExpired) {
    return false;
  }

  return user.passwordResetToken === tokenHash;
}

/**
 * Reset password with token
 * @param {Object} user - User object
 * @param {string} token - Reset token
 * @param {string} newPassword - New password
 * @param {string} ipAddress - Request IP
 * @param {string} userAgent - Request user agent
 * @returns {boolean} - True if successful
 */
export async function resetPassword(user, token, newPassword, ipAddress, userAgent) {
  if (!verifyResetToken(user, token)) {
    logAction({
      action: 'PASSWORD_RESET_FAILED',
      actorId: user.id,
      details: { reason: 'invalid_or_expired_token' },
      ipAddress,
      userAgent
    });
    throw new Error('Invalid or expired reset token');
  }

  // Hash new password
  user.passwordHash = await hashPassword(newPassword);
  
  // Clear reset token
  user.passwordResetToken = null;
  user.passwordResetExpires = null;

  // Force 2FA reverification
  user.twoFactorVerified = false;

  logAction({
    action: 'PASSWORD_RESET_SUCCESS',
    actorId: user.id,
    actorRole: user.role,
    ipAddress,
    userAgent
  });

  return true;
}

/**
 * God Mode: Invalidate any user's reset tokens
 * @param {Object} adminUser - Admin user
 * @param {Object} targetUser - Target user
 * @param {string} ipAddress - Request IP
 * @param {string} userAgent - Request user agent
 */
export function invalidateResetToken(adminUser, targetUser, ipAddress, userAgent) {
  if (adminUser.role !== 'platform_admin') {
    throw new Error('God Mode only');
  }

  targetUser.passwordResetToken = null;
  targetUser.passwordResetExpires = null;

  logAction({
    action: 'RESET_TOKEN_INVALIDATED',
    actorId: adminUser.id,
    actorRole: adminUser.role,
    targetId: targetUser.id,
    details: { targetEmail: targetUser.email },
    ipAddress,
    userAgent
  });

  return true;
}
