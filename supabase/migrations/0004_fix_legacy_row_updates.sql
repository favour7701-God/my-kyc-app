-- 0003's UPDATE policies allowed USING (user_id is null) so members could open
-- legacy/seed rows for editing, but WITH CHECK omitted that clause, so the
-- post-update row (still user_id IS NULL, since updates don't touch ownership)
-- failed the check and the whole update was rejected. Align WITH CHECK with USING.

drop policy if exists "clients_update_scoped" on clients;
create policy "clients_update_scoped" on clients for update
  using (auth.uid() is not null and (user_id = auth.uid() or user_id is null or is_admin()))
  with check (auth.uid() is not null and (user_id = auth.uid() or user_id is null or is_admin()));

drop policy if exists "kyc_documents_update_scoped" on kyc_documents;
create policy "kyc_documents_update_scoped" on kyc_documents for update
  using (auth.uid() is not null and (user_id = auth.uid() or user_id is null or is_admin()))
  with check (auth.uid() is not null and (user_id = auth.uid() or user_id is null or is_admin()));

drop policy if exists "kyc_checks_update_scoped" on kyc_checks;
create policy "kyc_checks_update_scoped" on kyc_checks for update
  using (auth.uid() is not null and (user_id = auth.uid() or user_id is null or is_admin()))
  with check (auth.uid() is not null and (user_id = auth.uid() or user_id is null or is_admin()));
