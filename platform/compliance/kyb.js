// PayFlex Compliance - KYB System

/**
 * KYB status types
 */
export const KYB_STATUS = {
  PENDING: 'pending',
  SUBMITTED: 'submitted',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

/**
 * Submit KYB data
 * @param {Object} client - Client object
 * @param {Object} kybData - KYB data
 * @returns {Object} - Submission result
 */
export function submitKYB(client, kybData) {
  const required = ['business_name', 'ein', 'address', 'owner_name', 'email'];
  
  for (const field of required) {
    if (!kybData[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  client.kybStatus = KYB_STATUS.SUBMITTED;
  client.kybSubmittedAt = new Date();
  client.ein = kybData.ein;
  client.businessAddress = kybData.address;

  console.log(`[KYB] Submitted for ${client.name}`);

  return {
    status: 'submitted',
    submittedAt: client.kybSubmittedAt
  };
}

/**
 * Approve KYB (God Mode only)
 * @param {Object} adminUser - Admin user
 * @param {Object} client - Client object
 * @returns {Object} - Approval result
 */
export function approveKYB(adminUser, client) {
  if (adminUser.role !== 'platform_admin') {
    throw new Error('God Mode only');
  }

  client.kybStatus = KYB_STATUS.APPROVED;
  client.kybApprovedAt = new Date();

  // Trigger automation
  console.log(`[KYB] Approved for ${client.name}`);

  return {
    status: 'approved',
    approvedAt: client.kybApprovedAt
  };
}

/**
 * Reject KYB (God Mode only)
 * @param {Object} adminUser - Admin user
 * @param {Object} client - Client object
 * @param {string} reason - Rejection reason
 * @returns {Object} - Rejection result
 */
export function rejectKYB(adminUser, client, reason) {
  if (adminUser.role !== 'platform_admin') {
    throw new Error('God Mode only');
  }

  client.kybStatus = KYB_STATUS.REJECTED;
  client.kybRejectionReason = reason;

  console.log(`[KYB] Rejected for ${client.name}: ${reason}`);

  return {
    status: 'rejected',
    reason
  };
}

/**
 * Check if KYB is required before action
 * @param {Object} client - Client object
 * @throws {Error} - If KYB not approved
 */
export function requireKYB(client) {
  if (client.kybStatus !== KYB_STATUS.APPROVED) {
    throw new Error('KYB approval required');
  }
}
