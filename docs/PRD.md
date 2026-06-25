# PRD — my-kyc-app

## Problem
The compliance team tracks client KYC status across spreadsheets and chat. Data is stale, incomplete, and invisible to the full team. There is no shared view of what is done, what is missing, or who owns each case.

## Target User
Internal compliance / operations team members (2–10 people) who onboard and verify clients daily.

## Core Objects
- **Client** — the entity being verified (individual or corporate)
- **KYC Document** — a required document attached to a client (passport, proof of address, etc.)
- **KYC Check** — a compliance check step (sanctions screening, PEP check, etc.)
- **Activity** — a timestamped log entry for any change to a client record
- **Audit Log** — immutable record of every write action (actor, before, after)

## MVP Must-Haves
- [ ] Create, view, and edit client records with all KYC fields
- [ ] Document checklist per client with status per item (pending / submitted / verified / rejected)
- [ ] KYC check steps per client with pass / fail / pending result
- [ ] Completeness score per client (rule-based: required fields + checks passed)
- [ ] Missing-field prompt banner on incomplete records
- [ ] Shared operational dashboard: all clients, stage, score, last activity
- [ ] Team activity feed showing latest changes across all clients
- [ ] All actions persist to the database; UI reflects them immediately

## Non-Goals (v1)
- Client-facing portal or document upload link
- AI risk scoring (rule-based only in v1)
- Login wall or per-user isolation (added in lock-down sprint)
- Integration with external identity APIs
- Bulk operations or CSV import

## Success Criteria
A team member opens the app, finds James Okafor's record flagged as incomplete, uploads his missing Proof of Funds document, marks the check submitted, and sees the completeness score update and the activity feed reflect the change — all without a spreadsheet.