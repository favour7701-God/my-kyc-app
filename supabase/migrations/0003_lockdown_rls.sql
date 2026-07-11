create or replace function public.is_admin() returns boolean
language sql stable
as $$
  select coalesce((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin', false);
$$;

-- clients: reads stay open; writes require an authenticated owner (or admin), legacy
-- (user_id is null) rows remain editable by any signed-in team member.
drop policy if exists "clients_v1_write" on clients;
create policy "clients_insert_scoped" on clients for insert
  with check (auth.uid() is not null and (user_id = auth.uid() or is_admin()));
create policy "clients_update_scoped" on clients for update
  using (auth.uid() is not null and (user_id = auth.uid() or user_id is null or is_admin()))
  with check (auth.uid() is not null and (user_id = auth.uid() or is_admin()));
create policy "clients_delete_scoped" on clients for delete
  using (auth.uid() is not null and (user_id = auth.uid() or user_id is null or is_admin()));

-- kyc_documents: same ownership pattern as clients
drop policy if exists "kyc_documents_v1_write" on kyc_documents;
create policy "kyc_documents_insert_scoped" on kyc_documents for insert
  with check (auth.uid() is not null and (user_id = auth.uid() or is_admin()));
create policy "kyc_documents_update_scoped" on kyc_documents for update
  using (auth.uid() is not null and (user_id = auth.uid() or user_id is null or is_admin()))
  with check (auth.uid() is not null and (user_id = auth.uid() or is_admin()));
create policy "kyc_documents_delete_scoped" on kyc_documents for delete
  using (auth.uid() is not null and (user_id = auth.uid() or user_id is null or is_admin()));

-- kyc_checks: same ownership pattern
drop policy if exists "kyc_checks_v1_write" on kyc_checks;
create policy "kyc_checks_insert_scoped" on kyc_checks for insert
  with check (auth.uid() is not null and (user_id = auth.uid() or is_admin()));
create policy "kyc_checks_update_scoped" on kyc_checks for update
  using (auth.uid() is not null and (user_id = auth.uid() or user_id is null or is_admin()))
  with check (auth.uid() is not null and (user_id = auth.uid() or is_admin()));
create policy "kyc_checks_delete_scoped" on kyc_checks for delete
  using (auth.uid() is not null and (user_id = auth.uid() or user_id is null or is_admin()));

-- activities: any signed-in user may append; reads stay open (dashboard feed)
drop policy if exists "activities_v1_write" on activities;
create policy "activities_insert_authenticated" on activities for insert
  with check (auth.uid() is not null);

-- audit_logs: append-only. Any signed-in user may write an entry (the action they
-- performed); only admins may read the trail (SECURITY.md: "visible to admin only").
drop policy if exists "audit_logs_v1_write" on audit_logs;
drop policy if exists "audit_logs_v1_read" on audit_logs;
create policy "audit_logs_insert_authenticated" on audit_logs for insert
  with check (auth.uid() is not null);
create policy "audit_logs_select_admin" on audit_logs for select
  using (is_admin());

-- team_members: reads stay open (needed for reviewer dropdowns); roster
-- management is an admin-only action.
drop policy if exists "team_members_v1_write" on team_members;
create policy "team_members_write_admin" on team_members for all
  using (is_admin()) with check (is_admin());
