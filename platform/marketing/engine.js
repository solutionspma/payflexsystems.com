// PayFlex Marketing - Autonomous Engine
// Trigger-based, not campaign-based

/**
 * Marketing triggers (LIVE)
 */
export const TRIGGERS = {
  SUBSCRIPTION_STARTED: 'SUBSCRIPTION_STARTED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PROGRAM_LAUNCHED: 'PROGRAM_LAUNCHED',
  ORDER_DELIVERED: 'ORDER_DELIVERED',
  NO_ACTIVITY_30_DAYS: 'NO_ACTIVITY_30_DAYS',
  RISK_SCORE_DROP: 'RISK_SCORE_DROP',
  KYB_APPROVED: 'KYB_APPROVED',
  CARD_ISSUED: 'CARD_ISSUED'
};

/**
 * Marketing actions (AVAILABLE)
 */
export const ACTIONS = {
  SEND_EMAIL: 'SEND_EMAIL',
  SEND_SMS: 'SEND_SMS',
  CREATE_TASK: 'CREATE_TASK',
  ISSUE_SWAG_CREDIT: 'ISSUE_SWAG_CREDIT',
  GENERATE_DISCOUNT: 'GENERATE_DISCOUNT',
  NOTIFY_ADMIN: 'NOTIFY_ADMIN',
  PAUSE_PROGRAM: 'PAUSE_PROGRAM'
};

/**
 * Automation rules (ACTIVE)
 */
export const RULES = {
  // Welcome sequence
  [TRIGGERS.SUBSCRIPTION_STARTED]: [
    { action: ACTIONS.SEND_EMAIL, template: 'welcome', delay: 0 },
    { action: ACTIONS.CREATE_TASK, data: { title: 'Onboarding Call', due: 2 } },
    { action: ACTIONS.ISSUE_SWAG_CREDIT, data: { amount: 150 } }
  ],

  // KYB approved
  [TRIGGERS.KYB_APPROVED]: [
    { action: ACTIONS.SEND_EMAIL, template: 'kyb_approved', delay: 0 },
    { action: ACTIONS.CREATE_TASK, data: { title: 'Program Setup', due: 1 } }
  ],

  // Program launched
  [TRIGGERS.PROGRAM_LAUNCHED]: [
    { action: ACTIONS.SEND_EMAIL, template: 'program_live', delay: 0 },
    { action: ACTIONS.CREATE_TASK, data: { title: 'Check-in 14 days', due: 14 } }
  ],

  // Payment failed
  [TRIGGERS.PAYMENT_FAILED]: [
    { action: ACTIONS.SEND_EMAIL, template: 'payment_failed', delay: 0 },
    { action: ACTIONS.NOTIFY_ADMIN, data: { priority: 'high' } },
    { action: ACTIONS.CREATE_TASK, data: { title: 'Follow up on payment', due: 1 } }
  ],

  // Risk score drop
  [TRIGGERS.RISK_SCORE_DROP]: [
    { action: ACTIONS.NOTIFY_ADMIN, data: { priority: 'urgent' } },
    { action: ACTIONS.CREATE_TASK, data: { title: 'Review risk factors', due: 0 } }
  ],

  // No activity
  [TRIGGERS.NO_ACTIVITY_30_DAYS]: [
    { action: ACTIONS.SEND_EMAIL, template: 'check_in', delay: 0 },
    { action: ACTIONS.CREATE_TASK, data: { title: 'Re-engagement call', due: 3 } }
  ],

  // Order delivered
  [TRIGGERS.ORDER_DELIVERED]: [
    { action: ACTIONS.SEND_EMAIL, template: 'order_delivered', delay: 0 }
  ]
};

/**
 * Trigger automation
 * @param {string} trigger - Trigger type
 * @param {Object} context - Event context (company, user, data)
 */
export async function triggerAutomation(trigger, context) {
  const rules = RULES[trigger];

  if (!rules) {
    console.log(`No automation rules for trigger: ${trigger}`);
    return;
  }

  console.log(`[AUTOMATION] Triggered: ${trigger}`, context);

  for (const rule of rules) {
    await executeAction(rule, context);
  }
}

/**
 * Execute automation action
 * @param {Object} rule - Automation rule
 * @param {Object} context - Event context
 */
async function executeAction(rule, context) {
  const { action, template, data, delay = 0 } = rule;

  // Apply delay if specified
  if (delay > 0) {
    setTimeout(() => performAction(action, template, data, context), delay * 1000);
  } else {
    await performAction(action, template, data, context);
  }
}

/**
 * Perform specific action
 * @param {string} action - Action type
 * @param {string} template - Email template (if applicable)
 * @param {Object} data - Action data
 * @param {Object} context - Event context
 */
async function performAction(action, template, data, context) {
  switch (action) {
    case ACTIONS.SEND_EMAIL:
      console.log(`[EMAIL] Sending ${template} to ${context.company.name}`);
      // Send email via provider
      break;

    case ACTIONS.SEND_SMS:
      console.log(`[SMS] Sending to ${context.contact.phone}`);
      // Send SMS via Telnyx/Twilio
      break;

    case ACTIONS.CREATE_TASK:
      console.log(`[TASK] Creating: ${data.title}`);
      // Create internal task
      break;

    case ACTIONS.ISSUE_SWAG_CREDIT:
      console.log(`[SWAG] Issuing $${data.amount} credit`);
      // Issue swag store credit
      break;

    case ACTIONS.NOTIFY_ADMIN:
      console.log(`[ADMIN] Alert: ${data.priority}`);
      // Notify platform admin
      break;

    case ACTIONS.PAUSE_PROGRAM:
      console.log(`[PROGRAM] Pausing for ${context.company.name}`);
      // Pause program
      break;

    default:
      console.log(`Unknown action: ${action}`);
  }
}
