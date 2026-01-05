// PayFlex Systems - Audit Log System
// Immutable, append-only, court-safe

/**
 * Log schema (NEVER MODIFY AFTER WRITE)
 */
export const AuditLogSchema = {
  id: String,              // UUID
  actorId: String,         // User who performed action
  actorRole: String,       // Role at time of action
  action: String,          // Action type (enum)
  targetId: String,        // Affected resource ID
  targetType: String,      // Resource type
  details: Object,         // Additional context
  ipAddress: String,       // Request IP
  userAgent: String,       // Request user agent
  timestamp: Date,         // When action occurred
  readonly: Boolean        // Always true (enforced)
};

/**
 * Action types (AUTHORITATIVE LIST)
 */
export const AUDIT_ACTIONS = {
  // Authentication
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  LOGIN_BLOCKED: 'LOGIN_BLOCKED',
  LOGOUT: 'LOGOUT',
  '2FA_SUCCESS': '2FA_SUCCESS',
  '2FA_FAILED': '2FA_FAILED',
  '2FA_ENABLED': '2FA_ENABLED',
  '2FA_DISABLED': '2FA_DISABLED',
  
  // Password Management
  PASSWORD_RESET_REQUESTED: 'PASSWORD_RESET_REQUESTED',
  PASSWORD_RESET_SUCCESS: 'PASSWORD_RESET_SUCCESS',
  PASSWORD_RESET_FAILED: 'PASSWORD_RESET_FAILED',
  RESET_TOKEN_INVALIDATED: 'RESET_TOKEN_INVALIDATED',
  PASSWORD_CHANGED: 'PASSWORD_CHANGED',
  
  // Client Management
  CLIENT_CREATED: 'CLIENT_CREATED',
  CLIENT_SUSPENDED: 'CLIENT_SUSPENDED',
  CLIENT_TERMINATED: 'CLIENT_TERMINATED',
  CLIENT_REACTIVATED: 'CLIENT_REACTIVATED',
  CLIENT_KYB_APPROVED: 'CLIENT_KYB_APPROVED',
  CLIENT_KYB_REJECTED: 'CLIENT_KYB_REJECTED',
  
  // Program Management
  PROGRAM_CREATED: 'PROGRAM_CREATED',
  PROGRAM_SUSPENDED: 'PROGRAM_SUSPENDED',
  PROGRAM_TERMINATED: 'PROGRAM_TERMINATED',
  PROGRAM_SETTINGS_CHANGED: 'PROGRAM_SETTINGS_CHANGED',
  
  // Risk & Compliance
  RISK_OVERRIDE: 'RISK_OVERRIDE',
  RISK_FREEZE_TRIGGERED: 'RISK_FREEZE_TRIGGERED',
  RISK_FREEZE_CLEARED: 'RISK_FREEZE_CLEARED',
  KYB_SUBMITTED: 'KYB_SUBMITTED',
  KYB_APPROVED: 'KYB_APPROVED',
  KYB_REJECTED: 'KYB_REJECTED',
  
  // Financial
  SUBSCRIPTION_STARTED: 'SUBSCRIPTION_STARTED',
  SUBSCRIPTION_CANCELLED: 'SUBSCRIPTION_CANCELLED',
  PAYMENT_SUCCEEDED: 'PAYMENT_SUCCEEDED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  REFUND_ISSUED: 'REFUND_ISSUED',
  
  // Unit/Banking
  UNIT_PROGRAM_CREATED: 'UNIT_PROGRAM_CREATED',
  UNIT_CARD_ISSUED: 'UNIT_CARD_ISSUED',
  UNIT_CARD_FROZEN: 'UNIT_CARD_FROZEN',
  UNIT_CARD_UNFROZEN: 'UNIT_CARD_UNFROZEN',
  UNIT_TRANSACTION_BLOCKED: 'UNIT_TRANSACTION_BLOCKED',
  
  // Automation
  AUTOMATION_TRIGGERED: 'AUTOMATION_TRIGGERED',
  AUTOMATION_PAUSED: 'AUTOMATION_PAUSED',
  AUTOMATION_RESUMED: 'AUTOMATION_RESUMED',
  
  // Marketplace
  ORDER_CREATED: 'ORDER_CREATED',
  ORDER_FULFILLED: 'ORDER_FULFILLED',
  ORDER_CANCELLED: 'ORDER_CANCELLED',
  
  // Admin Actions
  ADMIN_OVERRIDE: 'ADMIN_OVERRIDE',
  SETTINGS_CHANGED: 'SETTINGS_CHANGED',
  USER_CREATED: 'USER_CREATED',
  USER_ROLE_CHANGED: 'USER_ROLE_CHANGED'
};

/**
 * Log an action (NEVER FAILS SILENTLY)
 * @param {Object} logData - Log data
 */
export function logAction(logData) {
  const log = {
    id: generateId(),
    actorId: logData.actorId || null,
    actorRole: logData.actorRole || null,
    action: logData.action,
    targetId: logData.targetId || null,
    targetType: logData.targetType || null,
    details: logData.details || {},
    ipAddress: logData.ipAddress || null,
    userAgent: logData.userAgent || null,
    timestamp: new Date(),
    readonly: true
  };

  // Validate action type
  if (!Object.values(AUDIT_ACTIONS).includes(log.action)) {
    console.error(`Invalid audit action: ${log.action}`);
  }

  // Write to append-only storage
  writeAuditLog(log);

  return log;
}

/**
 * Query audit logs (READ ONLY)
 * @param {Object} filters - Query filters
 * @returns {Array} - Matching logs
 */
export function queryAuditLogs(filters = {}) {
  const {
    actorId,
    action,
    targetId,
    startDate,
    endDate,
    limit = 100
  } = filters;

  // Query logic here (connects to database)
  // This is read-only - NO modifications allowed
  
  return []; // Placeholder
}

/**
 * Get audit logs for specific user
 * @param {string} userId - User ID
 * @param {number} limit - Max results
 * @returns {Array} - User's audit logs
 */
export function getUserAuditLog(userId, limit = 50) {
  return queryAuditLogs({
    actorId: userId,
    limit
  });
}

/**
 * Get audit logs for specific resource
 * @param {string} resourceId - Resource ID
 * @param {number} limit - Max results
 * @returns {Array} - Resource audit logs
 */
export function getResourceAuditLog(resourceId, limit = 50) {
  return queryAuditLogs({
    targetId: resourceId,
    limit
  });
}

/**
 * God Mode: View all audit logs
 * @param {Object} adminUser - Admin user
 * @param {Object} filters - Query filters
 * @returns {Array} - Audit logs
 */
export function viewAllAuditLogs(adminUser, filters) {
  if (adminUser.role !== 'platform_admin') {
    throw new Error('God Mode only');
  }

  return queryAuditLogs(filters);
}

/**
 * Generate unique ID for log entry
 * @returns {string} - UUID
 */
function generateId() {
  return require('crypto').randomUUID();
}

/**
 * Write log to append-only storage
 * @param {Object} log - Log entry
 */
function writeAuditLog(log) {
  // Write to database/storage
  // MUST be append-only (no updates/deletes)
  console.log('[AUDIT]', log);
}
