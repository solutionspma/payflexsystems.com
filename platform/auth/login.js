// PayFlex Systems - Login System
// Secure authentication with 2FA enforcement

import { verifyPassword } from './password.js';
import { verify2FA, require2FA } from './2fa.js';
import { logAction } from '../audit/log.js';

/**
 * Authenticate user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {Object} user - User object from database
 * @param {string} ipAddress - Request IP
 * @param {string} userAgent - Request user agent
 * @returns {Object} - Session data
 */
export async function login(email, password, user, ipAddress, userAgent) {
  // Check if user exists and is active
  if (!user) {
    logAction({
      action: 'LOGIN_FAILED',
      details: { email, reason: 'user_not_found' },
      ipAddress,
      userAgent
    });
    throw new Error('Invalid credentials');
  }

  if (user.status !== 'active') {
    logAction({
      action: 'LOGIN_BLOCKED',
      actorId: user.id,
      actorRole: user.role,
      details: { reason: 'account_inactive', status: user.status },
      ipAddress,
      userAgent
    });
    throw new Error('Account is not active');
  }

  // Verify password
  const validPassword = await verifyPassword(password, user.passwordHash);
  
  if (!validPassword) {
    logAction({
      action: 'LOGIN_FAILED',
      actorId: user.id,
      details: { email, reason: 'invalid_password' },
      ipAddress,
      userAgent
    });
    throw new Error('Invalid credentials');
  }

  // Update last login
  user.updateLastLogin(ipAddress);

  logAction({
    action: 'LOGIN_SUCCESS',
    actorId: user.id,
    actorRole: user.role,
    ipAddress,
    userAgent
  });

  return {
    userId: user.id,
    email: user.email,
    role: user.role,
    requires2FA: user.requires2FA(),
    twoFactorVerified: false
  };
}

/**
 * Verify 2FA token during login
 * @param {Object} session - Session object
 * @param {string} token - 2FA token
 * @param {Object} user - User object
 * @param {string} ipAddress - Request IP
 * @param {string} userAgent - Request user agent
 * @returns {Object} - Updated session
 */
export function verify2FALogin(session, token, user, ipAddress, userAgent) {
  if (!user.twoFactorEnabled) {
    throw new Error('2FA not enabled for this user');
  }

  const isValid = verify2FA(token, user.twoFactorSecret);

  if (!isValid) {
    logAction({
      action: '2FA_FAILED',
      actorId: user.id,
      actorRole: user.role,
      ipAddress,
      userAgent
    });
    throw new Error('Invalid 2FA token');
  }

  user.twoFactorVerified = true;
  session.twoFactorVerified = true;

  logAction({
    action: '2FA_SUCCESS',
    actorId: user.id,
    actorRole: user.role,
    ipAddress,
    userAgent
  });

  return session;
}

/**
 * Logout user
 * @param {Object} user - User object
 * @param {string} ipAddress - Request IP
 * @param {string} userAgent - Request user agent
 */
export function logout(user, ipAddress, userAgent) {
  user.twoFactorVerified = false;

  logAction({
    action: 'LOGOUT',
    actorId: user.id,
    actorRole: user.role,
    ipAddress,
    userAgent
  });

  return { success: true };
}

/**
 * Enforce authentication for protected routes
 * @param {Object} user - User object from session
 * @throws {Error} - If not authenticated
 */
export function requireAuth(user) {
  if (!user || !user.id) {
    throw new Error('Authentication required');
  }

  if (user.status !== 'active') {
    throw new Error('Account is not active');
  }

  // Check 2FA requirement
  if (user.requires2FA() && !user.twoFactorVerified) {
    throw new Error('2FA verification required');
  }
}
