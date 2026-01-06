-- ============================================
-- PAYFLEX SYSTEMS - SUPABASE SCHEMA
-- Bank-Level Provider Onboarding
-- ============================================

-- PROVIDERS TABLE
-- Primary table for provider applications and accounts
create table if not exists providers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,

  -- LEGAL ENTITY INFORMATION
  legal_business_name text not null,
  dba text,
  entity_type text not null check (entity_type in ('llc', 'pllc', 'c_corp', 's_corp', 'partnership', 'sole_proprietor')),
  date_formed date,
  state_of_incorporation text not null,
  ein text not null unique,
  sos_registration_number text,

  -- BUSINESS CONTACT
  business_email text not null,
  business_phone text not null,
  business_fax text,
  website text,

  -- PHYSICAL ADDRESS
  physical_address text not null,
  physical_city text not null,
  physical_state text not null,
  physical_zip text not null,
  physical_country text not null default 'United States',

  -- MAILING ADDRESS (if different)
  mailing_address text,
  mailing_city text,
  mailing_state text,
  mailing_zip text,
  mailing_country text,

  -- PROVIDER CREDENTIALS (Healthcare-specific)
  practice_type text not null,
  practice_type_other text,
  npi_individual text,
  npi_organization text,
  medical_license_number text,
  medical_license_state text,
  medical_license_expiration date,
  dea_number text,
  medicare_ptan text,
  medicaid_provider_number text,

  -- BANKING INFORMATION
  -- NOTE: Encrypt account_number and routing_number at application level
  bank_name text not null,
  bank_account_type text not null check (bank_account_type in ('checking', 'savings')),
  bank_routing_number text not null,
  bank_account_number text not null,
  bank_account_name text not null,

  -- PROGRAM PARTICIPATION
  services_copays boolean default false,
  services_coinsurance boolean default false,
  services_deductibles boolean default false,
  services_noncovered boolean default false,
  avg_oop_cost text,
  est_monthly_volume text,
  payout_schedule text check (payout_schedule in ('daily', 'weekly', 'biweekly', 'monthly')),

  -- APPLICATION STATUS
  status text not null default 'pending_review' check (status in ('pending_review', 'under_review', 'approved', 'rejected', 'suspended', 'active')),
  status_notes text,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamp,

  -- COMPLIANCE FLAGS
  hipaa_compliant boolean default false,
  pci_acknowledged boolean default false,

  -- TIMESTAMPS
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),

  -- INDEXES
  constraint ein_format check (ein ~ '^\d{2}-\d{7}$')
);

-- Enable Row Level Security
alter table providers enable row level security;

-- Providers can only see their own data
create policy "Providers can view own data"
  on providers for select
  using (auth.uid() = user_id);

create policy "Providers can update own data"
  on providers for update
  using (auth.uid() = user_id);

-- Admins can see all
create policy "Admins can view all providers"
  on providers for select
  using (
    exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
      and auth.users.role = 'admin'
    )
  );

-- ============================================
-- PROVIDER OWNERS TABLE
-- Beneficial ownership (≥10% threshold)
-- ============================================

create table if not exists provider_owners (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references providers(id) on delete cascade,

  -- PERSONAL INFORMATION
  full_name text not null,
  title text not null,
  ownership_percentage numeric(5,2) not null check (ownership_percentage >= 10 and ownership_percentage <= 100),
  date_of_birth date not null,
  
  -- IDENTITY VERIFICATION
  -- NOTE: Never store full SSN - only last 4 digits
  -- Full SSN verification happens through third-party KYC
  ssn_last4 text check (ssn_last4 ~ '^\d{4}$'),
  
  -- CONTACT
  email text not null,
  phone text not null,
  
  -- HOME ADDRESS
  home_address text not null,
  home_city text not null,
  home_state text not null,
  home_zip text not null,

  -- DOCUMENT UPLOADS
  government_id_url text,
  government_id_verified boolean default false,

  -- TIMESTAMPS
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table provider_owners enable row level security;

create policy "Owners linked to provider"
  on provider_owners for all
  using (
    provider_id in (
      select id from providers where user_id = auth.uid()
    )
  );

-- ============================================
-- PROVIDER DOCUMENTS TABLE
-- Document uploads and verification tracking
-- ============================================

create table if not exists provider_documents (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references providers(id) on delete cascade,

  -- DOCUMENT METADATA
  document_type text not null check (document_type in (
    'w9',
    'articles_of_incorporation',
    'operating_agreement',
    'corporate_bylaws',
    'insurance_coi',
    'void_check',
    'bank_letter',
    'government_id',
    'medical_license',
    'other'
  )),
  document_name text not null,
  file_url text not null,
  file_size bigint,
  mime_type text,

  -- VERIFICATION
  verified boolean default false,
  verified_by uuid references auth.users(id),
  verified_at timestamp with time zone,
  verification_notes text,

  -- TIMESTAMPS
  uploaded_at timestamp with time zone default now()
);

alter table provider_documents enable row level security;

create policy "Documents linked to provider"
  on provider_documents for all
  using (
    provider_id in (
      select id from providers where user_id = auth.uid()
    )
  );

-- ============================================
-- PROVIDER AGREEMENTS TABLE
-- Legal agreement signatures and versioning
-- ============================================

create table if not exists provider_agreements (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references providers(id) on delete cascade,

  -- AGREEMENT VERSION
  agreement_version text not null default 'v1.0',
  agreement_type text not null default 'provider_program' check (agreement_type in (
    'provider_program',
    'terms_of_service',
    'ach_authorization',
    'data_sharing',
    'arbitration'
  )),

  -- SIGNATURE INFORMATION
  signed_name text not null,
  signed_title text not null,
  ip_address inet not null,
  user_agent text,

  -- LEGAL ACKNOWLEDGMENTS
  terms_accepted boolean default true,
  ach_authorized boolean default true,
  kyc_consent boolean default true,
  antifraud_cert boolean default true,
  arbitration_agreed boolean default true,
  esignature_consent boolean default true,

  -- TIMESTAMPS
  signed_at timestamp with time zone default now()
);

alter table provider_agreements enable row level security;

create policy "Agreements linked to provider"
  on provider_agreements for all
  using (
    provider_id in (
      select id from providers where user_id = auth.uid()
    )
  );

-- ============================================
-- PROVIDER AUDIT LOG
-- Track all status changes and actions
-- ============================================

create table if not exists provider_audit_log (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references providers(id) on delete cascade,
  
  action text not null,
  actor_id uuid references auth.users(id),
  actor_role text,
  
  old_status text,
  new_status text,
  
  notes text,
  metadata jsonb,
  
  created_at timestamp with time zone default now()
);

alter table provider_audit_log enable row level security;

-- Only admins can view audit logs
create policy "Admins can view audit logs"
  on provider_audit_log for select
  using (
    exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
      and auth.users.role = 'admin'
    )
  );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Update updated_at timestamp automatically
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply to providers table
create trigger update_providers_updated_at
  before update on providers
  for each row
  execute function update_updated_at_column();

-- Apply to provider_owners table
create trigger update_provider_owners_updated_at
  before update on provider_owners
  for each row
  execute function update_updated_at_column();

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

create index if not exists idx_providers_user_id on providers(user_id);
create index if not exists idx_providers_status on providers(status);
create index if not exists idx_providers_ein on providers(ein);
create index if not exists idx_provider_owners_provider_id on provider_owners(provider_id);
create index if not exists idx_provider_documents_provider_id on provider_documents(provider_id);
create index if not exists idx_provider_agreements_provider_id on provider_agreements(provider_id);
create index if not exists idx_provider_audit_log_provider_id on provider_audit_log(provider_id);

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

comment on table providers is 'Healthcare providers enrolled in PayFlex payment access platform';
comment on table provider_owners is 'Beneficial owners (≥10%) for KYC/AML compliance';
comment on table provider_documents is 'Document uploads for provider verification and compliance';
comment on table provider_agreements is 'Signed legal agreements with version tracking';
comment on table provider_audit_log is 'Audit trail for all provider account changes';

-- ============================================
-- INITIAL DATA / SEED (Optional)
-- ============================================

-- Insert agreement version
insert into public.provider_agreements (
  provider_id,
  agreement_version,
  signed_name,
  signed_title,
  ip_address
) values (
  '00000000-0000-0000-0000-000000000000'::uuid, -- Placeholder
  'v1.0',
  'System',
  'Admin',
  '127.0.0.1'::inet
) on conflict do nothing;
