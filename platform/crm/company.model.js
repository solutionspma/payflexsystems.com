// PayFlex CRM - Company Model
// CRM state driven by revenue, not vibes

export const CompanySchema = {
  id: String,
  name: String,
  vertical: String,              // 'health' | 'law'
  status: String,                // 'prospect' | 'active' | 'at_risk' | 'paused' | 'churned'
  tier: String,                  // 'starter' | 'growth' | 'scale'
  
  // Financial
  stripeCustomerId: String,
  stripeSubscriptionId: String,
  subscriptionActive: Boolean,
  lifetimeValue: Number,
  monthlyRecurring: Number,
  
  // Compliance
  kybStatus: String,             // 'pending' | 'submitted' | 'approved' | 'rejected'
  kybSubmittedAt: Date,
  kybApprovedAt: Date,
  ein: String,
  businessAddress: Object,
  
  // Risk
  riskScore: Number,             // 0-100
  chargebacks: Number,
  chargebackRate: Number,
  volumeSpike: Boolean,
  lastRiskCheck: Date,
  
  // Program
  unitProgramId: String,
  programStatus: String,         // 'pending' | 'active' | 'suspended' | 'terminated'
  programCreatedAt: Date,
  
  // Metadata
  createdAt: Date,
  updatedAt: Date,
  ownerId: String,               // Primary contact user ID
  tags: Array
};

export class Company {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.vertical = data.vertical;
    this.status = data.status || 'prospect';
    this.tier = data.tier;
    
    this.stripeCustomerId = data.stripeCustomerId;
    this.stripeSubscriptionId = data.stripeSubscriptionId;
    this.subscriptionActive = data.subscriptionActive || false;
    this.lifetimeValue = data.lifetimeValue || 0;
    this.monthlyRecurring = data.monthlyRecurring || 0;
    
    this.kybStatus = data.kybStatus || 'pending';
    this.kybSubmittedAt = data.kybSubmittedAt || null;
    this.kybApprovedAt = data.kybApprovedAt || null;
    this.ein = data.ein || null;
    this.businessAddress = data.businessAddress || null;
    
    this.riskScore = data.riskScore || 50;
    this.chargebacks = data.chargebacks || 0;
    this.chargebackRate = data.chargebackRate || 0;
    this.volumeSpike = data.volumeSpike || false;
    this.lastRiskCheck = data.lastRiskCheck || null;
    
    this.unitProgramId = data.unitProgramId || null;
    this.programStatus = data.programStatus || 'pending';
    this.programCreatedAt = data.programCreatedAt || null;
    
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.ownerId = data.ownerId;
    this.tags = data.tags || [];
  }

  // Lifecycle state derived from revenue events
  updateLifecycleFromEvents() {
    if (!this.subscriptionActive) {
      this.status = 'paused';
      return;
    }

    if (this.riskScore < 50) {
      this.status = 'at_risk';
      return;
    }

    if (this.chargebackRate > 0.009) {
      this.status = 'at_risk';
      return;
    }

    if (this.subscriptionActive && this.programStatus === 'active') {
      this.status = 'active';
      return;
    }

    if (this.programStatus === 'terminated') {
      this.status = 'churned';
      return;
    }
  }

  isActive() {
    return this.status === 'active' && this.subscriptionActive;
  }

  canTransact() {
    return this.isActive() && this.kybStatus === 'approved' && this.riskScore >= 50;
  }

  canIssueCards() {
    return this.canTransact() && (this.tier === 'growth' || this.tier === 'scale');
  }

  calculateMRR() {
    const tierPricing = {
      starter: 499,
      growth: 1250,
      scale: 2500,
      law: 750
    };

    return tierPricing[this.tier] || 0;
  }
}
