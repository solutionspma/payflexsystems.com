# PayFlex Systems - Quick Reference

## 🔑 God Mode Access
**Email:** solutions@pitchmarketing.agency  
**Role:** Platform Admin  
**2FA:** Mandatory (TOTP)  
**Powers:** Suspend clients, approve KYB, override risk, view all

## 👤 Operator Access
**Email:** jason.harris@pitchmarketing.agency  
**Role:** Operator  
**2FA:** Optional  
**Powers:** View clients, create programs, view revenue

---

## 💰 Pricing (Live)

| Tier | Price | Cards | Use Case |
|------|-------|-------|----------|
| Starter | $499/mo | ❌ | Single program, pilot |
| Growth | $1,250/mo | ✅ | Multiple programs, active |
| Scale | $2,500+/mo | ✅ | High volume, custom |
| Law | $750/mo | ❌ | Legal retainers |

**Additional Fees:**
- Transaction: 0.75%–1.5% (automatic)
- Card issuance: $3–$7
- Active card: $1/mo
- Setup: $2,500 (waived strategically)

---

## 🚦 Hard Gates

```
No subscription → No transactions
No KYB → No funds move
Risk < 50 → Freeze program
Starter tier → No cards
God Mode → 2FA required
```

---

## 📞 Key Commands

```bash
# Install
npm install

# Seed God Mode (ONE TIME)
npm run seed:godmode

# Start platform
npm start

# Development mode
npm run dev
```

---

## 🌐 Domains

- **payflexsystems.com** → Parent
- **payflex.health** → Health vertical
- **payflex.law** → Law vertical
- **admin.payflexsystems.com** → God Mode

---

## 🔐 Environment Variables (Required)

```bash
# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Unit
UNIT_API_TOKEN=
UNIT_MASTER_ACCOUNT_ID=

# God Mode
GODMODE_EMAIL=solutions@pitchmarketing.agency
GODMODE_PASSWORD=
```

---

## 🎯 First 10 Clients

**Offer:** Growth tier, setup waived  
**Targets:** Healthcare clinics, specialty practices  
**Rule:** No custom pricing, ever

---

## ⚡ Emergency Actions

### Suspend Client
```javascript
// God Mode only
client.programStatus = 'suspended';
logAction('CLIENT_SUSPENDED', adminUser, client);
```

### Override Risk
```javascript
// God Mode only
client.riskScore = 75; // Manual override
client.adminApproved = true;
logAction('RISK_OVERRIDE', adminUser, client);
```

### Approve KYB
```javascript
// God Mode only
client.kybStatus = 'approved';
client.kybApprovedAt = new Date();
logAction('KYB_APPROVED', adminUser, client);
```

---

## 📊 Key Metrics

- **MRR** = Sum of active subscriptions
- **ARR** = MRR × 12
- **Churn** = Canceled / Total
- **LTV** = Avg client value over lifetime
- **CAC** = Cost to acquire (waived setup)

---

## 🛡️ Security Checklist

- [ ] `.env.local` never committed
- [ ] God Mode 2FA enabled
- [ ] Audit logs recording
- [ ] Password reset tested
- [ ] Clickwrap logging verified

---

## 📄 Legal Documents

- `/shared/legal/payflex-systems-tos.md`
- `/shared/legal/payflex-health-terms.md`
- `/shared/legal/payflex-law-terms.md`

**Key Clause:** 24-month non-circumvention

---

## 🚨 If Something Breaks

1. Check audit logs
2. Check Stripe webhook delivery
3. Check Unit API status
4. Check environment variables
5. God Mode can override anything

---

**© PayFlex Systems**

Powered by Pitch Market Strategies & Public Relations, LLC
