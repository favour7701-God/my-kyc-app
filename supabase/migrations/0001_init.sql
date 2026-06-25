create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  full_name text not null,
  date_of_birth date,
  nationality text,
  email text,
  phone text,
  address_line1 text,
  address_city text,
  address_country text,
  entity_type text default 'individual',
  kyc_stage text not null default 'not_started',
  risk_level text default 'unknown',
  risk_level_source text,
  risk_level_confidence numeric,
  risk_level_review_status text default 'unreviewed',
  completeness_score numeric default 0,
  assigned_reviewer_id uuid,
  notes text,
  last_activity_at timestamptz
);

alter table clients enable row level security;
drop policy if exists "clients_v1_read" on clients;
create policy "clients_v1_read" on clients for select using (true);
drop policy if exists "clients_v1_write" on clients;
create policy "clients_v1_write" on clients for all using (true) with check (true);

create table if not exists kyc_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  client_id uuid not null references clients(id) on delete cascade,
  document_type text not null,
  status text not null default 'pending',
  file_url text,
  expiry_date date,
  rejection_reason text,
  verified_by uuid,
  verified_at timestamptz
);

alter table kyc_documents enable row level security;
drop policy if exists "kyc_documents_v1_read" on kyc_documents;
create policy "kyc_documents_v1_read" on kyc_documents for select using (true);
drop policy if exists "kyc_documents_v1_write" on kyc_documents;
create policy "kyc_documents_v1_write" on kyc_documents for all using (true) with check (true);

create table if not exists kyc_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  client_id uuid not null references clients(id) on delete cascade,
  check_type text not null,
  status text not null default 'pending',
  result text,
  result_source text,
  result_confidence numeric,
  result_review_status text default 'unreviewed',
  checked_by uuid,
  checked_at timestamptz,
  notes text
);

alter table kyc_checks enable row level security;
drop policy if exists "kyc_checks_v1_read" on kyc_checks;
create policy "kyc_checks_v1_read" on kyc_checks for select using (true);
drop policy if exists "kyc_checks_v1_write" on kyc_checks;
create policy "kyc_checks_v1_write" on kyc_checks for all using (true) with check (true);

create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  client_id uuid references clients(id) on delete set null,
  actor_name text,
  action text not null,
  object_type text,
  object_id uuid,
  detail text
);

alter table activities enable row level security;
drop policy if exists "activities_v1_read" on activities;
create policy "activities_v1_read" on activities for select using (true);
drop policy if exists "activities_v1_write" on activities;
create policy "activities_v1_write" on activities for all using (true) with check (true);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  actor_name text,
  action text not null,
  table_name text,
  object_id uuid,
  before_value jsonb,
  after_value jsonb,
  tool_name text,
  ip_address text
);

alter table audit_logs enable row level security;
drop policy if exists "audit_logs_v1_read" on audit_logs;
create policy "audit_logs_v1_read" on audit_logs for select using (true);
drop policy if exists "audit_logs_v1_write" on audit_logs;
create policy "audit_logs_v1_write" on audit_logs for all using (true) with check (true);

insert into clients (id, full_name, date_of_birth, nationality, email, phone, address_line1, address_city, address_country, entity_type, kyc_stage, risk_level, completeness_score, notes, last_activity_at) values
  ('a1000000-0000-0000-0000-000000000001', 'Maria Santos', '1985-03-12', 'Portuguese', 'maria.santos@example.com', '+351910000001', '12 Rua da Liberdade', 'Lisbon', 'Portugal', 'individual', 'in_review', 'low', 78, 'Pending address verification document.', now() - interval '1 day'),
  ('a1000000-0000-0000-0000-000000000002', 'James Okafor', '1979-07-24', 'Nigerian', 'j.okafor@example.com', '+2348100000002', '5 Marina Road', 'Lagos', 'Nigeria', 'individual', 'pending_docs', 'medium', 45, 'Missing proof of funds and second ID.', now() - interval '3 days'),
  ('a1000000-0000-0000-0000-000000000003', 'Bright Capital Ltd', null, 'British', 'compliance@brightcap.co.uk', '+441200000003', '88 Canary Wharf', 'London', 'United Kingdom', 'corporate', 'approved', 'low', 100, 'Full KYC passed. Annual review due Q4.', now() - interval '10 days'),
  ('a1000000-0000-0000-0000-000000000004', 'Chen Wei', '1991-11-05', 'Chinese', 'chen.wei@example.com', '+8613900000004', 'Tower 3, Lujiazui', 'Shanghai', 'China', 'individual', 'flagged', 'high', 30, 'PEP flag raised. Escalated to compliance officer.', now() - interval '2 days');

insert into kyc_documents (client_id, document_type, status, expiry_date) values
  ('a1000000-0000-0000-0000-000000000001', 'Passport', 'verified', '2030-01-01'),
  ('a1000000-0000-0000-0000-000000000001', 'Proof of Address', 'pending', null),
  ('a1000000-0000-0000-0000-000000000002', 'National ID', 'submitted', '2027-06-15'),
  ('a1000000-0000-0000-0000-000000000002', 'Proof of Funds', 'pending', null),
  ('a1000000-0000-0000-0000-000000000003', 'Certificate of Incorporation', 'verified', '2028-12-31'),
  ('a1000000-0000-0000-0000-000000000004', 'Passport', 'submitted', '2026-08-20');

insert into kyc_checks (client_id, check_type, status, result, notes) values
  ('a1000000-0000-0000-0000-000000000001', 'Sanctions Screening', 'passed', 'clear', 'No matches on OFAC, EU, UN lists.'),
  ('a1000000-0000-0000-0000-000000000001', 'PEP Check', 'passed', 'clear', null),
  ('a1000000-0000-0000-0000-000000000002', 'Sanctions Screening', 'pending', null, null),
  ('a1000000-0000-0000-0000-000000000003', 'Sanctions Screening', 'passed', 'clear', null),
  ('a1000000-0000-0000-0000-000000000003', 'PEP Check', 'passed', 'clear', null),
  ('a1000000-0000-0000-0000-000000000004', 'PEP Check', 'failed', 'match_found', 'Potential PEP match — manual review required.');

insert into activities (client_id, actor_name, action, object_type, detail) values
  ('a1000000-0000-0000-0000-000000000001', 'Admin', 'updated kyc_stage to in_review', 'client', 'Stage moved from pending_docs to in_review'),
  ('a1000000-0000-0000-0000-000000000002', 'Admin', 'added document Proof of Funds (pending)', 'kyc_document', null),
  ('a1000000-0000-0000-0000-000000000003', 'Admin', 'marked KYC approved', 'client', 'All checks passed, record approved'),
  ('a1000000-0000-0000-0000-000000000004', 'Admin', 'flagged client — PEP match', 'kyc_check', 'PEP Check result: match_found');