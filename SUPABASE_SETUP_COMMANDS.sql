-- =====================================================
-- PAYFLEX SYSTEMS - SUPABASE SETUP SCRIPT
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Step 1: Run the extended schema
-- Copy and paste the contents of payflexsystems.com/supabase/schema-extended.sql

-- Step 2: Insert yourself as admin (replace with your actual user ID from auth.users)
-- Get your user ID by running: SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Then insert your admin role:
INSERT INTO user_roles (user_id, role)
VALUES ('YOUR_USER_ID_HERE', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- Step 3: Verify the setup
SELECT 
  'user_roles' as table_name, 
  COUNT(*) as count 
FROM user_roles
UNION ALL
SELECT 'tenants', COUNT(*) FROM tenants
UNION ALL
SELECT 'providers', COUNT(*) FROM providers
UNION ALL
SELECT 'audit_logs', COUNT(*) FROM audit_logs;

-- Step 4: Test RLS policies
-- This should only show your role if logged in
SELECT * FROM user_roles;

-- This should show all providers if you're admin
SELECT * FROM admin_provider_review;

-- =====================================================
-- STORAGE BUCKET SETUP (Run in Supabase Dashboard > Storage)
-- =====================================================

-- 1. Create bucket named: provider-agreements
-- 2. Set to Public: NO (private bucket)
-- 3. Add these policies:

-- Policy 1: Authenticated users can upload
CREATE POLICY "Authenticated users can upload agreements"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'provider-agreements');

-- Policy 2: Admins can read all
CREATE POLICY "Admins can read all agreements"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'provider-agreements' 
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Policy 3: Providers can read their own
CREATE POLICY "Providers can read own agreements"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'provider-agreements'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

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

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
  'providers', 'user_roles', 'tenants', 
  'audit_logs', 'public_directory'
);

-- Check indexes
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('audit_logs', 'public_directory', 'providers')
ORDER BY tablename, indexname;

-- =====================================================
-- DONE! Your Supabase is ready for PayFlex Systems
-- =====================================================
