// PayFlex CRM - Pipeline (FIXED, OPINIONATED)

/**
 * Pipeline stages (DO NOT CUSTOMIZE PER CLIENT)
 * Opinionated systems scale. Custom ones rot.
 */
export const PIPELINE_STAGES = [
  'Lead',
  'Qualified',
  'Active Client',
  'At Risk',
  'Paused',
  'Churned'
];

/**
 * Determine pipeline stage from company state
 * @param {Object} company - Company object
 * @returns {string} - Pipeline stage
 */
export function getPipelineStage(company) {
  if (!company.subscriptionActive && !company.programCreatedAt) {
    return 'Lead';
  }

  if (company.kybStatus === 'pending' || company.kybStatus === 'submitted') {
    return 'Qualified';
  }

  if (company.status === 'active') {
    return 'Active Client';
  }

  if (company.status === 'at_risk') {
    return 'At Risk';
  }

  if (company.status === 'paused') {
    return 'Paused';
  }

  if (company.status === 'churned') {
    return 'Churned';
  }

  return 'Lead';
}

/**
 * Get stage color for UI
 * @param {string} stage - Pipeline stage
 * @returns {string} - CSS color
 */
export function getStageColor(stage) {
  const colors = {
    'Lead': '#6c757d',
    'Qualified': '#0dcaf0',
    'Active Client': '#198754',
    'At Risk': '#ffc107',
    'Paused': '#fd7e14',
    'Churned': '#dc3545'
  };

  return colors[stage] || '#6c757d';
}
