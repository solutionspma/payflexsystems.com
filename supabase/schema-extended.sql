-- =====================================================
-- PAYFLEX SYSTEMS - MULTI-TENANT EXTENSION SCHEMA
-- ADD-ONLY: Does not modify existing provider tables
-- =====================================================

-- =====================================================
-- SECTION 0: USER ROLES & TENANCY
-- =====================================================

-- User roles table (admin access control)
create table if not exists user_roles (
  user_id uuid references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'provider', 'support')),
  created_at timestamp with time zone default now(),
  primary key (user_id)
);

-- Tenants (multi-vertical support: healthcare, legal, education, trade)
create table if not exists tenants (
  id uuid primary key default gen_random_uuid(),
  legal_name text not null,
  display_name text not null,
  vertical text not null check (vertical in ('healthcare', 'legal', 'education', 'trade')),
  subdomain text unique,
  status text default 'active' check (status in ('active', 'suspended', 'closed')),
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Tenant users (maps auth.users to tenants)
create table if not exists tenant_users (
  user_id uuid references auth.users(id) on delete cascade,
  tenant_id uuid references tenants(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'member')),
  created_at timestamp with time zone default now(),
  primary key (user_id, tenant_id)
);

-- Tenant settings (branding and feature flags)
create table if not exists tenant_settings (
  tenant_id uuid references tenants(id) on delete cascade primary key,
  branding jsonb default '{
    "primary_color": null,
    "accent_color": null,
    "logo_url": null,
    "custom_css": null
  }'::jsonb,
  feature_flags jsonb default '{
    "white_label": false,
    "custom_domain": false,
    "api_access": false
  }'::jsonb,
  payment_rules jsonb default '{
    "min_amount": 100,
    "max_amount": 50000,
    "payment_terms": [3, 6, 12]
  }'::jsonb,
  updated_at timestamp with time zone default now()
);

-- Audit logs (global activity tracking)
create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id),
  tenant_id uuid references tenants(id),
  action text not null,
  resource_type text,
  resource_id uuid,
  metadata jsonb default '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone default now()
);

-- Create indexes on audit logs for performance
create index if not exists idx_audit_logs_tenant on audit_logs(tenant_id, created_at desc);
create index if not exists idx_audit_logs_actor on audit_logs(actor_id, created_at desc);
create index if not exists idx_audit_logs_action on audit_logs(action, created_at desc);
create index if not exists idx_audit_logs_resource on audit_logs(resource_type, resource_id);

-- Public directory (searchable provider listing)
create table if not exists public_directory (
  tenant_id uuid references tenants(id) on delete cascade primary key,
  display_name text not null,
  vertical text not null,
  city text,
  state text,
  specialties text[],
  accepting_patients boolean default true,
  is_listed boolean default true,
  listing_data jsonb default '{
    "description": null,
    "phone": null,
    "website": null,
    "hours": null
  }'::jsonb,
  updated_at timestamp with time zone default now()
);

-- Create index for public search
create index if not exists idx_public_directory_search on public_directory(vertical, state, city) where is_listed = true;
create index if not exists idx_public_directory_specialties on public_directory using gin(specialties) where is_listed = true;

-- Tenant referrals (invite loop)
create table if not exists tenant_referrals (
  id uuid primary key default gen_random_uuid(),
  referred_name text not null,
  referred_email text,
  referred_phone text,
  vertical text not null check (vertical in ('healthcare', 'legal', 'education', 'trade')),
  contact_info jsonb,
  referred_by_user_id uuid references auth.users(id),
  referred_by_tenant_id uuid references tenants(id),
  status text default 'pending' check (status in ('pending', 'contacted', 'onboarded', 'declined')),
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create index for referral tracking
create index if not exists idx_referrals_status on tenant_referrals(status, created_at desc);
create index if not exists idx_referrals_referrer on tenant_referrals(referred_by_tenant_id, created_at desc);

-- =====================================================
-- SECTION 1: EXTEND EXISTING TABLES (ADD COLUMNS ONLY)
-- =====================================================

-- Add tenant_id to providers table (if not exists)
alter table providers add column if not exists tenant_id uuid references tenants(id);
create index if not exists idx_providers_tenant on providers(tenant_id);

-- Add tenant_id to provider_agreements table (if not exists)
alter table provider_agreements add column if not exists tenant_id uuid references tenants(id);
create index if not exists idx_provider_agreements_tenant on provider_agreements(tenant_id);

-- Add PDF URL to provider_agreements (for signed PDFs)
alter table provider_agreements add column if not exists signed_pdf_url text;

-- Add status columns to providers if needed
alter table providers add column if not exists review_status text default 'pending_review' 
  check (review_status in ('pending_review', 'under_review', 'approved', 'rejected', 'requires_changes'));
alter table providers add column if not exists reviewed_by uuid references auth.users(id);
alter table providers add column if not exists reviewed_at timestamp with time zone;
alter table providers add column if not exists review_notes text;

-- =====================================================
-- SECTION 2: ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on new tables
alter table user_roles enable row level security;
alter table tenants enable row level security;
alter table tenant_users enable row level security;
alter table tenant_settings enable row level security;
alter table audit_logs enable row level security;
alter table public_directory enable row level security;
alter table tenant_referrals enable row level security;

-- User Roles Policies
create policy "Users can view their own role"
  on user_roles for select
  using (auth.uid() = user_id);

create policy "Admins can view all roles"
  on user_roles for select
  using (
    exists (
      select 1 from user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- Tenants Policies
create policy "Users can view their tenants"
  on tenants for select
  using (
    exists (
      select 1 from tenant_users
      where tenant_users.tenant_id = tenants.id
      and tenant_users.user_id = auth.uid()
    )
    or
    exists (
      select 1 from user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can manage all tenants"
  on tenants for all
  using (
    exists (
      select 1 from user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- Tenant Users Policies
create policy "Users can view their tenant memberships"
  on tenant_users for select
  using (
    auth.uid() = user_id
    or
    exists (
      select 1 from user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- Tenant Settings Policies
create policy "Tenant owners can view settings"
  on tenant_settings for select
  using (
    exists (
      select 1 from tenant_users
      where tenant_users.tenant_id = tenant_settings.tenant_id
      and tenant_users.user_id = auth.uid()
      and tenant_users.role in ('owner', 'admin')
    )
    or
    exists (
      select 1 from user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

create policy "Tenant owners can update settings"
  on tenant_settings for update
  using (
    exists (
      select 1 from tenant_users
      where tenant_users.tenant_id = tenant_settings.tenant_id
      and tenant_users.user_id = auth.uid()
      and tenant_users.role = 'owner'
    )
    or
    exists (
      select 1 from user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- Audit Logs Policies (read-only for most users)
create policy "Admins can view all audit logs"
  on audit_logs for select
  using (
    exists (
      select 1 from user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

create policy "Users can view their own audit logs"
  on audit_logs for select
  using (auth.uid() = actor_id);

create policy "Tenant owners can view tenant audit logs"
  on audit_logs for select
  using (
    exists (
      select 1 from tenant_users
      where tenant_users.tenant_id = audit_logs.tenant_id
      and tenant_users.user_id = auth.uid()
      and tenant_users.role in ('owner', 'admin')
    )
  );

create policy "Service role can insert audit logs"
  on audit_logs for insert
  with check (true);

-- Public Directory Policies (public read)
create policy "Anyone can view listed providers"
  on public_directory for select
  using (is_listed = true);

create policy "Tenant owners can manage their listing"
  on public_directory for all
  using (
    exists (
      select 1 from tenant_users
      where tenant_users.tenant_id = public_directory.tenant_id
      and tenant_users.user_id = auth.uid()
    )
    or
    exists (
      select 1 from user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- Tenant Referrals Policies
create policy "Users can view their own referrals"
  on tenant_referrals for select
  using (
    auth.uid() = referred_by_user_id
    or
    exists (
      select 1 from tenant_users
      where tenant_users.tenant_id = tenant_referrals.referred_by_tenant_id
      and tenant_users.user_id = auth.uid()
    )
    or
    exists (
      select 1 from user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

create policy "Authenticated users can create referrals"
  on tenant_referrals for insert
  with check (auth.uid() = referred_by_user_id);

create policy "Admins can manage all referrals"
  on tenant_referrals for all
  using (
    exists (
      select 1 from user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- =====================================================
-- SECTION 3: TRIGGERS & FUNCTIONS
-- =====================================================

-- Updated_at trigger function
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at triggers
create trigger update_tenants_updated_at before update on tenants
  for each row execute function update_updated_at_column();

create trigger update_tenant_settings_updated_at before update on tenant_settings
  for each row execute function update_updated_at_column();

create trigger update_public_directory_updated_at before update on public_directory
  for each row execute function update_updated_at_column();

create trigger update_tenant_referrals_updated_at before update on tenant_referrals
  for each row execute function update_updated_at_column();

-- Audit log trigger function
create or replace function log_provider_status_change()
returns trigger as $$
begin
  if (TG_OP = 'UPDATE' and old.review_status is distinct from new.review_status) then
    insert into audit_logs (
      actor_id,
      tenant_id,
      action,
      resource_type,
      resource_id,
      metadata
    ) values (
      auth.uid(),
      new.tenant_id,
      'PROVIDER_STATUS_CHANGED',
      'provider',
      new.id,
      jsonb_build_object(
        'old_status', old.review_status,
        'new_status', new.review_status,
        'legal_name', new.legal_business_name
      )
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Apply audit trigger to providers
create trigger audit_provider_status_change
  after update on providers
  for each row
  execute function log_provider_status_change();

-- =====================================================
-- SECTION 4: HELPER VIEWS
-- =====================================================

-- Admin dashboard view for provider review
create or replace view admin_provider_review as
select
  p.id,
  p.legal_business_name,
  p.practice_type,
  p.physical_state,
  p.review_status,
  p.created_at,
  p.reviewed_at,
  p.reviewed_by,
  t.display_name as tenant_name,
  t.vertical,
  (select count(*) from provider_owners where provider_id = p.id) as owner_count,
  (select count(*) from provider_documents where provider_id = p.id and verified = true) as verified_docs_count,
  (select count(*) from provider_agreements where provider_id = p.id) as agreement_count,
  exists(select 1 from provider_agreements where provider_id = p.id and signed_at is not null) as agreement_signed
from providers p
left join tenants t on t.id = p.tenant_id
order by p.created_at desc;

-- Public search view
create or replace view public_provider_search as
select
  pd.tenant_id,
  pd.display_name,
  pd.vertical,
  pd.city,
  pd.state,
  pd.specialties,
  pd.accepting_patients,
  pd.listing_data
from public_directory pd
where pd.is_listed = true;

-- =====================================================
-- SECTION 5: SEED DATA (OPTIONAL)
-- =====================================================

-- Insert system admin (uncomment and update with real user_id)
-- insert into user_roles (user_id, role)
-- values ('YOUR_USER_ID_HERE', 'admin')
-- on conflict (user_id) do nothing;

-- =====================================================
-- END OF SCHEMA
-- =====================================================
