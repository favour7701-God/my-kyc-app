# Security — my-kyc-app

## Secret Handling
- Supabase service role key: server-side only (Next.js API routes / server actions); never in client bundle
- All client-side calls use the anon key with RLS as the security boundary
- No secrets in `.env.local` committed to repo; documented in `.env.example` only

## Permission Model (v1 → lock-down)
- **v1:** open RLS policies — all reads and writes allowed (demo mode, internal only, no sensitive real data)
- **Lock-down sprint:** replace with `auth.uid() = user_id` policies; all writes require authenticated session
- **Roles:** `member` (create/edit own records) and `admin` (edit all records, view audit log)
- Agent actions inherit the session user's role — no elevated permissions

## Approved Tools Rule
- Only named, scoped functions (`score_completeness`, `draft_issues_summary`, `tag_risk_level`) may be called by the agent
- No `run_any`, `exec_sql`, or `send_any` tools permitted
- Every tool call is logged in `audit_logs` with `tool_name` and the acting `user_id`

## Audit Principle
- Every meaningful write (create, update, stage change, check result, AI suggestion applied) writes a row to `audit_logs` with before/after values
- `audit_logs` is append-only; no update or delete policies on that table
- Audit log is visible to `admin` role only after lock-down