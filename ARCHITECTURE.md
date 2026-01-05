# PayFlex Systems - Architecture Documentation

## System Overview

PayFlex Systems is a **verticalized payments infrastructure platform** that operates as the toll booth, not the highway. We own and control the payment rails while clients rent access to launch funded programs.

---

## Core Architecture Principles

### 1. Ownership Model
- **PayFlex owns:** Stripe account, Unit account, all infrastructure
- **Clients rent:** Platform access, program management, reporting
- **Clients never get:** Stripe dashboard, Unit dashboard, raw credentials

### 2. Funding Model
- Programs are funded by **patients, employers, or sponsors**
- PayFlex **never advances capital**
- No balance-sheet risk
- No lending or credit underwriting

### 3. Revenue Model
- **Monthly platform access** (MRR): $499–$2,500
- **Transaction platform fee** (bps): 0.75%–1.5%
- **Card program fees**: Issuance, active, reload
- **Setup fees**: Optional, strategic

### 4. Enforcement Model
- No subscription → No transactions
- No KYB → No funds move
- Risk score < 50 → Freeze program
- No exceptions, ever

---

## System Layers

```
┌─────────────────────────────────────────┐
│         CLIENT APPLICATIONS             │
│  (payflex.health, payflex.law, admin)   │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│          PLATFORM SERVICES              │
│  (Auth, CRM, Marketing, Marketplace)    │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         PAYMENT INFRASTRUCTURE          │
│        (Stripe, Unit, Audit)            │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│           EXTERNAL PARTNERS             │
│     (Banking, Card Networks, Email)     │
└─────────────────────────────────────────┘
```

---

## Module Breakdown

### `/platform/auth`
- User authentication
- God Mode + 2FA (mandatory)
- Password reset (time-boxed)
- Role-based permissions

**Key Principle:** God Mode cannot be disabled. 2FA non-negotiable.

### `/platform/billing` (Stripe)
- Subscription management
- Transaction + platform fee logic
- Webhook handlers
- Automatic fee deduction

**Key Principle:** Clients never pay manually. All fees are embedded.

### `/platform/banking` (Unit)
- Program provisioning
- Card issuance (tier-gated)
- Ledger management
- Freeze/unfreeze logic

**Key Principle:** Master account = PayFlex. Clients get programs, not accounts.

### `/platform/crm`
- Company/Contact management
- Pipeline (fixed, opinionated)
- Lifecycle state (derived from revenue)

**Key Principle:** CRM state driven by money, not manual updates.

### `/platform/marketing`
- Autonomous engine (trigger-based)
- Email/SMS automation
- Task creation
- Swag credit issuance

**Key Principle:** Marketing reacts to events, not campaigns.

### `/platform/marketplace`
- Swag product catalog
- Order management
- Stripe checkout integration

**Key Principle:** Physical brand reinforcement. Shipping charged to client.

### `/platform/shipping`
- Flat-rate calculation (Phase 1)
- Carrier API integration (Phase 2)

**Key Principle:** Clients pay shipping. No subsidies.

### `/platform/compliance`
- Risk scoring (0-100)
- KYB submission/approval
- Clickwrap logging
- Freeze enforcement

**Key Principle:** Compliance failures freeze programs automatically.

### `/platform/audit`
- Immutable activity logs
- Append-only storage
- Court-safe evidence

**Key Principle:** Every privileged action logged. No deletions.

### `/platform/admin`
- God Mode dashboard
- Client management
- Revenue analytics
- Override controls

**Key Principle:** Only platform admins see full system state.

---

## Data Flow Examples

### Onboarding
```
1. Client selects tier → Pricing page
2. Accepts terms → Clickwrap logged (IP, timestamp, hash)
3. Stripe Checkout → Subscription created
4. Webhook fires → Program provisioned (pending KYB)
5. Client submits KYB → Awaits admin approval
6. Admin approves → Program goes live
7. Automation triggers → Welcome email, task created
```

### Payment Failed
```
1. Stripe invoice fails → Webhook received
2. CRM updates → Lifecycle = "At Risk"
3. Marketing triggers → Email sent, admin alerted
4. If unpaid 7 days → Program suspended
5. If unpaid 30 days → Program terminated
```

### Risk Freeze
```
1. Risk score calculated → Falls below 50
2. Compliance module → Freezes program
3. Unit API called → Cards frozen
4. Audit log → Action recorded
5. Admin alerted → Manual review required
```

---

## Security Model

### Authentication Layers
1. **Login:** Email + password (bcrypt)
2. **2FA:** TOTP (God Mode mandatory)
3. **Session:** JWT with expiry
4. **Audit:** All actions logged

### Authorization Layers
1. **Role check:** Platform Admin, Operator, Client Owner, etc.
2. **Permission check:** Specific action allowed?
3. **Resource check:** Does user own this resource?
4. **Gate check:** Subscription active? KYB approved? Risk OK?

### Secrets Management
- All credentials in `.env.local` (never committed)
- Passwords bcrypt-hashed (12 rounds)
- 2FA secrets encrypted at rest
- Reset tokens SHA256-hashed, time-boxed (15 min)

---

## Vertical Expansion Model

### Adding New Vertical (e.g., PayFlex.Vet)

1. **Config:** Add to `/shared/config/verticals.json`
2. **Terms:** Create `payflex-vet-terms.md`
3. **Site:** Clone `payflex-health` structure
4. **Pricing:** Add tier to Stripe + config
5. **Rules:** Adjust compliance/risk rules if needed

**No code changes required** — infrastructure is vertical-agnostic.

---

## Scaling Strategy

### Phase 1: Prove (0-25 clients)
- Manual KYB approval
- Email-based support
- Flat-rate shipping

### Phase 2: Systemize (25-100 clients)
- Automated KYB (partner integration)
- In-app support chat
- Carrier API shipping

### Phase 3: Scale (100-500 clients)
- Multi-vertical live
- White-label options
- Enterprise tier

### Phase 4: Exit or IPO (500+ clients)
- Platform acquires or goes public
- Interchange revenue significant
- Multi-geography expansion

---

## Competitive Moat

1. **Contracts:** 24-month non-circumvention
2. **Infrastructure:** Clients can't replicate Stripe + Unit
3. **Compliance:** KYB, risk, audit built-in
4. **Data:** Transaction history, lifecycle insights
5. **Network effects:** More clients = better pricing leverage

---

## Exit Value Drivers

1. **Recurring revenue** (MRR × 12 = ARR)
2. **Gross margin** (85%+)
3. **Retention** (multi-year average)
4. **Vertical defensibility** (healthcare, legal = regulated)
5. **Infrastructure ownership** (Stripe Connect-like positioning)

---

**© PayFlex Systems. All rights reserved.**

Powered by PayFlex Systems and Pitch Market Strategies & Public Relations, LLC (pitchmarketing.agency)
