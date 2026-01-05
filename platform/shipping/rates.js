// PayFlex Shipping - Rate Calculation

/**
 * Calculate shipping cost
 * Phase 1: Flat-rate tiers
 * Phase 2: USPS/UPS/FedEx APIs
 */

/**
 * Shipping tiers (flat-rate)
 */
export const SHIPPING_TIERS = [
  { maxWeight: 16, rate: 800 },      // Under 1 lb: $8
  { maxWeight: 48, rate: 1200 },     // 1-3 lbs: $12
  { maxWeight: 96, rate: 1800 },     // 3-6 lbs: $18
  { maxWeight: 160, rate: 2500 },    // 6-10 lbs: $25
  { maxWeight: Infinity, rate: 3500 } // 10+ lbs: $35
];

/**
 * Calculate shipping for order
 * @param {number} weight - Total weight in ounces
 * @param {string} destinationZip - Destination ZIP code
 * @returns {Object} - Shipping details
 */
export function calculateShipping(weight, destinationZip) {
  const tier = SHIPPING_TIERS.find(t => weight <= t.maxWeight);

  return {
    weight,
    carrier: 'USPS',
    method: 'Ground',
    cost: tier.rate,
    estimatedDays: 5
  };
}

/**
 * Calculate order shipping
 * @param {Array} items - Order items
 * @param {string} destinationZip - Destination ZIP
 * @returns {Object} - Shipping details
 */
export function calculateOrderShipping(items, destinationZip) {
  const totalWeight = items.reduce((sum, item) => {
    return sum + (item.weight * item.quantity);
  }, 0);

  return calculateShipping(totalWeight, destinationZip);
}
