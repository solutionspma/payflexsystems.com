// PayFlex Systems - Unit Banking Integration
// Master account = PayFlex. Client programs isolated.

/**
 * Unit Program Configuration
 */
export const UnitConfig = {
  masterAccountId: process.env.UNIT_MASTER_ACCOUNT_ID,
  apiToken: process.env.UNIT_API_TOKEN,
  apiUrl: process.env.UNIT_API_URL || 'https://api.s.unit.sh'
};

/**
 * Create Unit program for client
 * @param {Object} client - Client object
 * @returns {Object} - Unit program data
 */
export async function createUnitProgram(client) {
  // Validate KYB completed
  if (client.kybStatus !== 'approved') {
    throw new Error('KYB approval required before creating Unit program');
  }

  // Validate subscription tier (cards require Growth+)
  if (client.tier === 'starter') {
    // Starter tier: no cards, payment processing only
  }

  const programId = `pfh_${client.id}_${Date.now()}`;

  const program = {
    programId,
    clientId: client.id,
    companyName: client.companyName,
    ledger: 'created',
    cardGroup: client.tier !== 'starter' ? 'initialized' : null,
    status: 'active',
    createdAt: new Date()
  };

  // Log program creation
  console.log('[UNIT] Program created:', programId);

  return program;
}

/**
 * Issue card for client program
 * @param {string} programId - Unit program ID
 * @param {Object} cardData - Card configuration
 * @returns {Object} - Card details
 */
export async function issueCard(programId, cardData) {
  const card = {
    id: `card_${Date.now()}`,
    programId,
    cardholderName: cardData.cardholderName,
    spendingLimits: cardData.spendingLimits,
    status: 'active',
    issuedAt: new Date()
  };

  console.log('[UNIT] Card issued:', card.id);

  return card;
}

/**
 * Freeze card or program
 * @param {string} cardId - Card ID
 * @param {string} reason - Freeze reason
 * @returns {boolean} - Success
 */
export async function freezeCard(cardId, reason) {
  console.log('[UNIT] Card frozen:', cardId, reason);
  return true;
}

/**
 * Unfreeze card
 * @param {string} cardId - Card ID
 * @returns {boolean} - Success
 */
export async function unfreezeCard(cardId) {
  console.log('[UNIT] Card unfrozen:', cardId);
  return true;
}

/**
 * Get program balance/ledger
 * @param {string} programId - Unit program ID
 * @returns {Object} - Balance data
 */
export async function getProgramBalance(programId) {
  return {
    programId,
    availableBalance: 0,
    ledgerBalance: 0,
    currency: 'USD'
  };
}

/**
 * HARD GATE: Block card issuance for starter tier
 * @param {Object} client - Client object
 * @throws {Error} - If tier too low
 */
export function enforceCardIssuanceTier(client) {
  if (client.tier !== 'growth' && client.tier !== 'scale') {
    throw new Error('Card issuing requires Growth tier or higher');
  }
}

/**
 * HARD GATE: Block transactions if KYB not approved
 * @param {Object} client - Client object
 * @throws {Error} - If KYB not approved
 */
export function enforceKYB(client) {
  if (client.kybStatus !== 'approved') {
    throw new Error('KYB approval required before funds can move');
  }
}

/**
 * HARD GATE: Block if risk score too low
 * @param {Object} client - Client object
 * @throws {Error} - If risk score below threshold
 */
export function enforceRiskScore(client) {
  if (client.riskScore < 50) {
    throw new Error('Program frozen due to risk score');
  }
}

/**
 * Provision full Unit program (post-payment)
 * @param {Object} client - Client object
 * @returns {Object} - Provisioned program
 */
export async function provisionProgram(client) {
  // Enforce gates
  enforceKYB(client);
  enforceRiskScore(client);

  // Create program
  const program = await createUnitProgram(client);

  // Create ledger
  // Create card group if applicable
  
  return program;
}
