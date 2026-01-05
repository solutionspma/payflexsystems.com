// PayFlex Analytics - Revenue Dashboard

/**
 * Calculate total revenue metrics
 * @param {Array} clients - Array of client objects
 * @returns {Object} - Revenue metrics
 */
export function calculateRevenue(clients) {
  let mrr = 0;
  let transactionFees = 0;
  let cardFees = 0;
  let swagRevenue = 0;

  for (const client of clients) {
    if (client.subscriptionActive) {
      mrr += client.monthlyRecurring || 0;
    }
    
    transactionFees += client.transactionFeesThisMonth || 0;
    cardFees += client.cardFeesThisMonth || 0;
    swagRevenue += client.swagRevenueThisMonth || 0;
  }

  const totalRevenue = mrr + transactionFees + cardFees + swagRevenue;

  return {
    mrr,
    arr: mrr * 12,
    transactionFees,
    cardFees,
    swagRevenue,
    totalRevenue,
    breakdown: {
      platformAccess: mrr,
      transactionFees,
      cardFees,
      marketplace: swagRevenue
    }
  };
}

/**
 * Calculate per-client profitability
 * @param {Object} client - Client object
 * @returns {Object} - Profitability metrics
 */
export function calculateClientProfitability(client) {
  const revenue = 
    (client.monthlyRecurring || 0) +
    (client.transactionFeesThisMonth || 0) +
    (client.cardFeesThisMonth || 0) +
    (client.swagRevenueThisMonth || 0);

  const costs = 
    (client.stripeCostsThisMonth || 0) +
    (client.unitCostsThisMonth || 0) +
    (client.supportCostsThisMonth || 0);

  const margin = revenue - costs;
  const marginPercent = revenue > 0 ? (margin / revenue) * 100 : 0;

  return {
    revenue,
    costs,
    margin,
    marginPercent,
    lifetimeValue: client.lifetimeValue || 0
  };
}

/**
 * Calculate vertical performance
 * @param {Array} clients - Array of client objects
 * @returns {Object} - Performance by vertical
 */
export function calculateVerticalPerformance(clients) {
  const verticals = {};

  for (const client of clients) {
    if (!verticals[client.vertical]) {
      verticals[client.vertical] = {
        clients: 0,
        mrr: 0,
        totalRevenue: 0,
        avgClientValue: 0
      };
    }

    const v = verticals[client.vertical];
    v.clients += 1;
    
    if (client.subscriptionActive) {
      v.mrr += client.monthlyRecurring || 0;
    }
    
    v.totalRevenue += client.lifetimeValue || 0;
  }

  // Calculate averages
  for (const vertical in verticals) {
    const v = verticals[vertical];
    v.avgClientValue = v.clients > 0 ? v.totalRevenue / v.clients : 0;
  }

  return verticals;
}

/**
 * Calculate cohort retention
 * @param {Array} clients - Array of client objects
 * @returns {Object} - Retention metrics
 */
export function calculateRetention(clients) {
  const now = new Date();
  
  let total = 0;
  let active = 0;
  let churned = 0;
  let avgDaysActive = 0;

  for (const client of clients) {
    total += 1;
    
    if (client.status === 'active') {
      active += 1;
      
      const daysActive = Math.floor(
        (now - new Date(client.createdAt)) / (1000 * 60 * 60 * 24)
      );
      avgDaysActive += daysActive;
    } else if (client.status === 'churned') {
      churned += 1;
    }
  }

  avgDaysActive = active > 0 ? avgDaysActive / active : 0;

  return {
    total,
    active,
    churned,
    retentionRate: total > 0 ? (active / total) * 100 : 0,
    churnRate: total > 0 ? (churned / total) * 100 : 0,
    avgDaysActive
  };
}

/**
 * Get revenue forecast
 * @param {Array} clients - Array of client objects
 * @param {number} months - Months to forecast
 * @returns {Object} - Forecast data
 */
export function forecastRevenue(clients, months = 12) {
  const currentMRR = calculateRevenue(clients).mrr;
  const forecast = [];

  // Simple linear growth model (conservative)
  const monthlyGrowthRate = 0.15; // 15% monthly growth

  for (let i = 1; i <= months; i++) {
    const projectedMRR = currentMRR * Math.pow(1 + monthlyGrowthRate, i);
    forecast.push({
      month: i,
      mrr: Math.round(projectedMRR),
      arr: Math.round(projectedMRR * 12)
    });
  }

  return forecast;
}
