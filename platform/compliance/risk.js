// PayFlex Compliance - Risk Scoring Engine

/**
 * Calculate risk score (0-100)
 * Higher = better
 */
export function calculateRisk(client) {
  let score = 0;

  // Positive signals
  if (client.kybApproved) score += 30;
  if (client.subscriptionActive) score += 20;
  if (client.adminApproved) score += 25;
  if (client.daysActive > 90) score += 10;

  // Negative signals
  if (client.chargebacks > 0) score -= 25;
  if (client.chargebackRate > 0.009) score -= 30;
  if (client.volumeSpike) score -= 15;
  if (client.paymentFailures > 2) score -= 20;

  // Clamp to 0-100
  return Math.max(0, Math.min(score, 100));
}

/**
 * Enforce risk-based freezes
 * @param {Object} client - Client object
 * @throws {Error} - If risk too high
 */
export function enforceRisk(client) {
  if (client.riskScore < 50) {
    throw new Error('Program frozen due to risk score');
  }
}

/**
 * Update risk score and trigger freeze if needed
 * @param {Object} client - Client object
 * @returns {Object} - Updated risk data
 */
export function updateRiskScore(client) {
  const previousScore = client.riskScore;
  const newScore = calculateRisk(client);

  client.riskScore = newScore;
  client.lastRiskCheck = new Date();

  if (newScore < 50 && previousScore >= 50) {
    freezeProgram(client, 'risk_score_below_threshold');
  }

  if (newScore >= 50 && previousScore < 50) {
    console.log(`[RISK] Score recovered for ${client.name}: ${newScore}`);
  }

  return {
    previousScore,
    newScore,
    frozen: newScore < 50
  };
}

/**
 * Freeze program due to risk
 * @param {Object} client - Client object
 * @param {string} reason - Freeze reason
 */
function freezeProgram(client, reason) {
  client.programStatus = 'suspended';
  console.log(`[RISK] Program frozen: ${client.name} - ${reason}`);
  
  // Trigger automation
  // Freeze Unit cards/transactions
  // Notify admin
}
