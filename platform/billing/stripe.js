// PayFlex Systems - Stripe Integration (PRODUCTION)
// All fees automatic. No exceptions.

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Stripe Product/Price IDs (MUST EXIST IN STRIPE DASHBOARD)
 */
export const STRIPE_PRICES = {
  // Platform Access (Subscriptions)
  STARTER: process.env.STRIPE_PRICE_STARTER || 'price_starter_499',
  GROWTH: process.env.STRIPE_PRICE_GROWTH || 'price_growth_1250',
  SCALE: process.env.STRIPE_PRICE_SCALE || 'price_scale_2500',
  LAW: process.env.STRIPE_PRICE_LAW || 'price_law_750',
  
  // Setup Fees (One-time)
  SETUP_STANDARD: process.env.STRIPE_PRICE_SETUP || 'price_setup_2500'
};

/**
 * Platform fee percentage (stacked on Stripe processing)
 */
export const PLATFORM_FEE_PERCENTAGE = 0.0125; // 1.25%

/**
 * Create Stripe Checkout session for subscription
 * @param {string} priceId - Stripe price ID
 * @param {string} customerId - Stripe customer ID
 * @param {Object} metadata - Additional metadata
 * @returns {Object} - Checkout session
 */
export async function createCheckoutSession(priceId, customerId, metadata = {}) {
  return await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.SITE_URL}/onboarding/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.SITE_URL}/onboarding/canceled`,
    allow_promotion_codes: false,
    metadata: {
      platform: 'payflex',
      ...metadata
    }
  });
}

/**
 * Create Stripe customer
 * @param {string} email - Customer email
 * @param {Object} metadata - Customer metadata
 * @returns {Object} - Stripe customer
 */
export async function createCustomer(email, metadata = {}) {
  return await stripe.customers.create({
    email,
    metadata: {
      platform: 'payflex',
      ...metadata
    }
  });
}

/**
 * Create payment with platform fee
 * @param {number} amount - Amount in cents
 * @param {string} customerId - Stripe customer ID
 * @param {Object} metadata - Transaction metadata
 * @returns {Object} - Payment intent
 */
export async function createPaymentWithFee(amount, customerId, metadata = {}) {
  const platformFee = Math.round(amount * PLATFORM_FEE_PERCENTAGE);

  return await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    customer: customerId,
    application_fee_amount: platformFee,
    metadata: {
      platform: 'payflex',
      platform_fee: platformFee,
      ...metadata
    }
  });
}

/**
 * Create one-time invoice item (e.g., setup fee)
 * @param {string} customerId - Stripe customer ID
 * @param {number} amount - Amount in cents
 * @param {string} description - Item description
 * @returns {Object} - Invoice item
 */
export async function createInvoiceItem(customerId, amount, description) {
  return await stripe.invoiceItems.create({
    customer: customerId,
    amount,
    currency: 'usd',
    description
  });
}

/**
 * Create and send invoice
 * @param {string} customerId - Stripe customer ID
 * @returns {Object} - Invoice
 */
export async function createInvoice(customerId) {
  const invoice = await stripe.invoices.create({
    customer: customerId,
    auto_advance: true // Automatically finalize and attempt payment
  });

  return await stripe.invoices.finalizeInvoice(invoice.id);
}

/**
 * Check if subscription is active
 * @param {string} subscriptionId - Stripe subscription ID
 * @returns {boolean} - True if active
 */
export async function isSubscriptionActive(subscriptionId) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  return ['active', 'trialing'].includes(subscription.status);
}

/**
 * Cancel subscription
 * @param {string} subscriptionId - Stripe subscription ID
 * @param {boolean} immediate - Cancel immediately vs. at period end
 * @returns {Object} - Updated subscription
 */
export async function cancelSubscription(subscriptionId, immediate = false) {
  if (immediate) {
    return await stripe.subscriptions.cancel(subscriptionId);
  } else {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });
  }
}

/**
 * Create Stripe checkout for swag orders
 * @param {Array} lineItems - Stripe line items
 * @param {string} customerId - Stripe customer ID
 * @param {Object} metadata - Order metadata
 * @returns {Object} - Checkout session
 */
export async function createSwagCheckout(lineItems, customerId, metadata = {}) {
  return await stripe.checkout.sessions.create({
    mode: 'payment',
    customer: customerId,
    line_items: lineItems,
    success_url: `${process.env.SITE_URL}/marketplace/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.SITE_URL}/marketplace/cart`,
    shipping_address_collection: {
      allowed_countries: ['US']
    },
    metadata: {
      platform: 'payflex',
      module: 'marketplace',
      ...metadata
    }
  });
}

/**
 * HARD GATE: Block transaction if subscription inactive
 * @param {Object} client - Client object
 * @throws {Error} - If subscription inactive
 */
export async function enforceSubscription(client) {
  if (!client.stripeSubscriptionId) {
    throw new Error('No active PayFlex subscription');
  }

  const active = await isSubscriptionActive(client.stripeSubscriptionId);
  
  if (!active) {
    throw new Error('Active PayFlex subscription required');
  }
}

/**
 * Handle Stripe webhook events
 * @param {Object} event - Stripe webhook event
 * @returns {Object} - Event handling result
 */
export async function handleWebhookEvent(event) {
  switch (event.type) {
    case 'checkout.session.completed':
      return handleCheckoutComplete(event.data.object);
    
    case 'invoice.payment_succeeded':
      return handlePaymentSuccess(event.data.object);
    
    case 'invoice.payment_failed':
      return handlePaymentFailed(event.data.object);
    
    case 'customer.subscription.deleted':
      return handleSubscriptionCanceled(event.data.object);
    
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}

function handleCheckoutComplete(session) {
  // Provision program, trigger onboarding
  console.log('Checkout complete:', session.id);
}

function handlePaymentSuccess(invoice) {
  // Update client status, trigger automation
  console.log('Payment succeeded:', invoice.id);
}

function handlePaymentFailed(invoice) {
  // Mark at risk, trigger notifications
  console.log('Payment failed:', invoice.id);
}

function handleSubscriptionCanceled(subscription) {
  // Pause program, update lifecycle
  console.log('Subscription canceled:', subscription.id);
}
