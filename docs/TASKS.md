# Tasks — my-kyc-app

## Gantt Overview
```
Sprint 1  |████████| DB + client CRUD + list/detail pages (demo-viewable)
Sprint 2  |████████| Document checklist + KYC checks + completeness engine  ← v1 functional ✓
Sprint 3  |████████| Reviewer assignment + audit log UI + overdue flags
Sprint 4  |████████| Lock it down (auth + RLS)
Sprint 5  |████████| AI risk suggestions + issue drafts
```

---

## Sprint 1 — DB, seed data, client CRUD
**Goal:** App renders with real data, no login required. Client records can be created and edited.

- [ ] Apply migration SQL to Supabase (all tables + seed rows)
- [ ] `/clients` page: table with name, stage, risk, score, last activity
- [ ] Stage badge component (colour-coded)
- [ ] `/clients/new` — create client form, persists to DB
- [ ] `/clients/[id]` — detail page with all fields displayed
- [ ] `/clients/[id]/edit` — edit form, updates DB
- [ ] Loading skeleton, empty state, error boundary on all routes
- [ ] No login wall — pages render for anonymous visitors

**DoD:** Seeded clients visible at `/clients`; create + edit forms write to DB and reflect immediately.

---

## Sprint 2 — Document checklist, KYC checks, completeness engine ✅ v1 functional
**Goal:** The one core workflow works end-to-end: a team member updates a client's docs and checks, sees the score change, and the feed updates.

- [ ] Document checklist on `/clients/[id]`: list, add, change status (pending/submitted/verified/rejected)
- [ ] KYC checks section: list, add, update result (pending/passed/failed)
- [ ] `score_completeness` function: required fields + doc statuses + check statuses → 0–100
- [ ] Score displayed on detail page and client list
- [ ] Missing-field prompt banner (lists what is absent)
- [ ] Activity feed component (latest 20 rows from `activities` across all clients)
- [ ] Dashboard `/` — KPIs: total clients, % fully verified, pending reviews, flagged count
- [ ] Every form action inserts a row into `activities`

**DoD:** James Okafor scenario from PRD works completely; no dead buttons; score updates live.

---

## Sprint 3 — Reviewer assignment, audit log, overdue flags
**Goal:** Team accountability — every record has an owner; every change has a paper trail.

- [ ] Reviewer dropdown on client detail (selects from `team_members` seed list)
- [ ] Assigned reviewer shown on list and detail pages
- [ ] Overdue badge: clients with `last_activity_at` > 7 days ago
- [ ] `/audit` page: table of `audit_logs` rows, filterable by client / actor / date
- [ ] Inline notes field on client detail (persists to DB)
- [ ] Filter bar on `/clients`: by stage, reviewer, risk level

**DoD:** Reviewer can be assigned; overdue clients are visually flagged; audit log page loads.

---

## Sprint 4 — Lock it down
**Goal:** Real data can go in safely. Auth gates all writes; RLS isolates team data.

- [ ] Supabase Auth: email/password signup + login pages
- [ ] `user_id` populated on all new rows from `auth.uid()`
- [ ] Replace open RLS policies with owner-scoped policies per table
- [ ] `admin` vs `member` role enforcement (admin sees all; member sees assigned)
- [ ] Redirect unauthenticated users on write actions only (reads still open for dashboard)
- [ ] Session-aware navbar: show logged-in user name + sign-out

**DoD:** Unauthenticated users cannot create/edit records; existing seed data still visible.

---

## Sprint 5 — AI intelligence layer
**Goal:** AI suggestions reduce manual triage without replacing human judgment.

- [ ] `tag_risk_level` tool: GPT-4o call on client data → stores value + source + confidence + `unreviewed`
- [ ] `draft_issues_summary` tool: generates plain-text prompt for incomplete records
- [ ] AI suggestion banner on client detail with confidence badge
- [ ] One-click "Approve" or "Override" promotes suggestion to official status
- [ ] Approval action writes to `audit_logs` with `tool_name`
- [ ] All AI calls server-side only; API key never in client bundle

**DoD:** AI risk suggestion appears as `unreviewed`; human approval changes `review_status`; audit log records the event.