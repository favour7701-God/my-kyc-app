create table if not exists team_members (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  email text,
  role text not null default 'member'
);

alter table team_members enable row level security;
drop policy if exists "team_members_v1_read" on team_members;
create policy "team_members_v1_read" on team_members for select using (true);
drop policy if exists "team_members_v1_write" on team_members;
create policy "team_members_v1_write" on team_members for all using (true) with check (true);

insert into team_members (id, full_name, email, role)
values
  ('b1000000-0000-0000-0000-000000000001', 'Amara Nwosu', 'amara.nwosu@example.com', 'admin'),
  ('b1000000-0000-0000-0000-000000000002', 'Daniel Reyes', 'daniel.reyes@example.com', 'member'),
  ('b1000000-0000-0000-0000-000000000003', 'Priya Shah', 'priya.shah@example.com', 'member')
on conflict (id) do nothing;

alter table clients
  drop constraint if exists clients_assigned_reviewer_fkey;
alter table clients
  add constraint clients_assigned_reviewer_fkey
  foreign key (assigned_reviewer_id) references team_members(id) on delete set null;
