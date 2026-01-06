# PayFlex Systems - Netlify Deployment Checklist

## Current Status: ✅ All Sites Deployed

All three PayFlex domains are live and auto-deploying from GitHub:

### 1. PayFlex Systems (Core Platform)
- **Domain**: https://payflexsystems.com
- **Repository**: github.com/solutionspma/payflexsystems.com
- **Branch**: main
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Status**: ✅ Deployed

### 2. PayFlex Health
- **Domain**: https://payflex.health
- **Repository**: github.com/solutionspma/payflex.health
- **Branch**: main
- **Build Command**: None (static HTML)
- **Publish Directory**: `/`
- **Status**: ✅ Deployed

### 3. PayFlex Law
- **Domain**: https://payflex.law
- **Repository**: github.com/solutionspma/payflex.law
- **Branch**: main
- **Build Command**: None (static HTML)
- **Publish Directory**: `/`
- **Status**: ✅ Deployed

---

## Environment Variables Needed in Netlify

Go to Netlify Dashboard → Site Settings → Environment Variables → Add variables:

### For PayFlexSystems.com (Core Platform)

```
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SENDGRID_API_KEY=your_sendgrid_api_key_optional
ENVIRONMENT=production
SYSTEMS_URL=https://payflexsystems.com
HEALTH_URL=https://payflex.health
LAW_URL=https://payflex.law
```

### For PayFlex.health and PayFlex.law

No environment variables needed (static HTML sites).

---

## Post-Deployment Tasks

### Immediate (Required for Admin Access)
- [ ] Run `schema-extended.sql` in Supabase SQL Editor
- [ ] Get your user ID from auth.users table
- [ ] Insert admin role: `INSERT INTO user_roles (user_id, role) VALUES ('YOUR_ID', 'admin')`
- [ ] Create `provider-agreements` storage bucket in Supabase
- [ ] Add storage bucket policies (see SUPABASE_SETUP_COMMANDS.sql)
- [ ] Add environment variables to Netlify for payflexsystems.com
- [ ] Test admin dashboard at https://payflexsystems.com/apps/payflex-systems/admin/providers.html

### Soon (Required for Live Operations)
- [ ] Connect email service (SendGrid/Postmark/SES)
- [ ] Test full provider application workflow (all 6 steps)
- [ ] Test patient agreement signing at https://payflex.health/patient-agreement.html
- [ ] Test public provider search at https://payflex.health/search.html
- [ ] Verify audit logs are recording all actions

### Later (White-Label Setup)
- [ ] Create tenant record for Dr. Parris (ParPay)
- [ ] Configure subdomain: parpay.payflex.health (optional)
- [ ] Link Dr. Parris provider record to tenant
- [ ] Test tenant isolation and RLS policies

---

## Testing URLs

### Admin Dashboard (Requires Auth)
https://payflexsystems.com/apps/payflex-systems/admin/providers.html

### Provider Application (Public)
https://payflexsystems.com/apps/payflex-systems/apply/index.html

### Patient Agreement (Public)
https://payflex.health/patient-agreement.html

### Provider Search (Public)
https://payflex.health/search.html

### PayFlex Law Homepage
https://payflex.law

---

## Verification Commands

Run these in Supabase SQL Editor after setup:

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'providers', 'provider_owners', 'provider_documents', 
  'provider_agreements', 'user_roles', 'tenants', 
  'tenant_users', 'tenant_settings', 'audit_logs',
  'public_directory', 'tenant_referrals'
)
ORDER BY table_name;

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;

-- Check your admin access
SELECT * FROM user_roles WHERE user_id = auth.uid();

-- Test admin view (should show provider queue)
SELECT * FROM admin_provider_review;
```

---

## Git Workflow (Already Configured)

All three sites auto-deploy from GitHub:

```bash
# Make changes locally
git add .
git commit -m "Your commit message"
git push origin main

# Netlify auto-deploys within 2-3 minutes
```

---

## Architecture Notes

- **No localhost**: All URLs point to production domains
- **Multi-tenant**: Tenants table supports white-label instances
- **Bank-level security**: RLS on all tables, audit logs on all actions
- **PDF generation**: jsPDF creates signed agreements
- **Email flows**: 4 templates ready (agreement signed, approved, rejected, Dr. Parris live)
- **Compliance**: E-SIGN compliant, TCPA safe language, non-lending structure

---

## Next Steps

1. **Supabase Setup**: Run SQL commands from SUPABASE_SETUP_COMMANDS.sql
2. **Admin Access**: Insert your user_id in user_roles table
3. **Storage Bucket**: Create provider-agreements with policies
4. **Environment Variables**: Add to Netlify for payflexsystems.com
5. **Test Workflow**: Complete provider application as test user
6. **Dr. Parris Onboarding**: Create ParPay tenant and start live operations

**All code is deployed and ready. Database setup is the only blocker.**
