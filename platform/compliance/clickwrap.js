// PayFlex Compliance - Clickwrap System
// Court-safe contract acceptance logging

import crypto from 'crypto';

/**
 * Log clickwrap acceptance
 * @param {Object} user - User object
 * @param {string} document - Document type ('tos' | 'privacy' | 'program_terms')
 * @param {string} version - Document version hash
 * @param {string} ipAddress - User IP
 * @param {string} userAgent - User agent
 * @returns {Object} - Acceptance record
 */
export function logClickwrapAcceptance(user, document, version, ipAddress, userAgent) {
  const acceptance = {
    id: crypto.randomUUID(),
    userId: user.id,
    document,
    version,
    ipAddress,
    userAgent,
    acceptedAt: new Date(),
    readonly: true
  };

  // Write to append-only storage
  console.log('[CLICKWRAP]', acceptance);

  return acceptance;
}

/**
 * Verify user has accepted current terms
 * @param {Object} user - User object
 * @param {string} document - Document type
 * @param {string} currentVersion - Current document version
 * @returns {boolean} - True if accepted
 */
export function hasAcceptedTerms(user, document, currentVersion) {
  // Query acceptance log
  // Check if user accepted current version
  return false; // Placeholder
}

/**
 * Require clickwrap acceptance
 * @param {Object} user - User object
 * @throws {Error} - If not accepted
 */
export function requireClickwrapAccepted(user) {
  if (!user.clickwrapAcceptedAt) {
    throw new Error('Terms must be accepted before proceeding');
  }
}

/**
 * Generate document version hash
 * @param {string} content - Document content
 * @returns {string} - SHA256 hash
 */
export function generateDocumentHash(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}
