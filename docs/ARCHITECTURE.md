# Architecture — my-kyc-app

## Stack
- **Frontend:** Next.js 14 (App Router) on Vercel
- **Database + Auth:** Supabase (Postgres, RLS, Storage for doc files later)
- **Styling:** Tailwind CSS + shadcn/ui

## What to Build Now vs Later
**Now:** client CRUD, document checklist, KYC checks, completeness score, activity feed, dashboard
**Next:** reviewer assignment, audit log UI, overdue flags, login + RLS lock-down
**Later:** AI risk suggestions, auto-draft issue summaries, external API integrations

## Key User Action — End-to-End Flow
1. Team member opens `/clients`, sees live table of all clients and stages
2. Clicks into a client → detail page loads all fields, document checklist, check results
3. Adds or updates a KYC document → form POSTs to Supabase `kyc_documents`
4. App recalculates `completeness_score` on the `clients` row
5. Missing-field banner re-evaluates and clears if all required items are present
6. An `activities` row is inserted (actor, action, timestamp)
7. Dashboard and activity feed refresh — every team member sees the updated state

## Layer Plan
1. **Data first** — tables, seed rows, RLS open policies (Sprint 1)
2. **App logic** — CRUD forms, completeness rules, status transitions (Sprints 1–2)
3. **Smart features** — AI scoring, auto-draft summaries, approval workflow (Sprint 5)

## Why Core Runs Without AI
Completeness score and issue prompts are pure rule-based logic (required field count + check statuses). AI layer is additive only — its suggestions are flagged `unreviewed` until a human approves.