# PayFlex Systems

**Payment orchestration platform for healthcare affordability.**

## Overview

PayFlex Systems is a payment orchestration platform focused on healthcare affordability. We do not originate loans, underwrite credit, or operate as an institutional lender. We design and operate vertical-specific payment platforms that allow businesses to launch funded programs without carrying financial risk.

## Verticals

- **PayFlex.Health** — Healthcare payments & benefit cards
- **PayFlex.Law** — Legal retainers & fee management (coming soon)

## Architecture

```
/apps               - Front-end applications
  /payflex-systems  - Parent company site
  /payflex-health   - Health vertical platform
  /payflex-law      - Law vertical platform

/platform           - Core infrastructure
  /auth             - Authentication & authorization
  /billing          - Stripe integration
  /banking          - Unit integration
  /crm              - Client relationship management
  /marketing        - Autonomous marketing engine
  /marketplace      - Swag & physical brand assets
  /shipping         - Fulfillment & logistics
  /analytics        - Revenue & operations analytics
  /admin            - God Mode controls
  /audit            - Immutable activity logs
  /compliance       - KYB, risk scoring, contracts

/shared             - Shared resources
  /legal            - Terms of service, contracts
  /config           - Platform configuration
  /investor         - Investment materials
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
# Fill in your Stripe, Unit, and other credentials
```

### 3. Seed God Mode User (ONE TIME)

```bash
npm run seed:godmode
```

⚠️ **Delete `.env.local` after running seed script**

### 4. Start Platform

```bash
npm start
```

## Core Principles

1. **PayFlex owns the rails** — Clients rent access
2. **No balance-sheet risk** — Programs are client-funded
3. **Automated revenue** — Fees deducted automatically
4. **Non-circumventable** — 24-month contract lock
5. **Vertical-specific** — Health → Law → Others

## Revenue Model

- Monthly platform access fees (MRR)
- Transaction platform fees (0.75%–1.5%)
- Card program fees (issuance, active, reload)
- Setup fees (strategic)

## Security

- God Mode requires 2FA (mandatory)
- All admin actions logged (immutable)
- Clickwrap contract acceptance tracked
- Password reset tokens time-boxed (15 min)
- Risk-based program freezes automated

## Compliance

- KYB required before funds move
- Risk scoring (0-100 scale)
- Automated freeze at score < 50
- No fiduciary duty
- No money transmission

## Deployment

- **payflexsystems.com** — Parent platform
- **payflex.health** — Health vertical
- **payflex.law** — Law vertical
- **admin.payflexsystems.com** — God Mode dashboard

---

**© PayFlex Systems. All rights reserved.**

Powered by PayFlex Systems and Pitch Market Strategies & Public Relations, LLC (pitchmarketing.agency)
