# Test Plan — my-kyc-app

## v1 Success Scenario (manual)
**Scenario:** Update James Okafor's record — add missing document, pass a check, confirm score rises.

1. Open `/clients` — confirm 4 seeded clients visible, no login prompt
2. Click James Okafor → confirm stage shows `pending_docs`, score shows ~45
3. Click **Add Document** → enter type "Proof of Funds", status "submitted" → save
4. Confirm new document appears in checklist immediately
5. Click **Add Check** → type "Sanctions Screening", result "passed" → save
6. Confirm completeness score increases on detail page
7. Open `/` dashboard → confirm activity feed shows James Okafor's two new entries
8. Confirm KPI counts updated (pending reviews decreased if applicable)

## Empty State Tests
- Navigate to `/clients` with no rows → confirm empty state message and "Add Client" CTA visible
- Open a client with no documents → confirm "No documents yet" placeholder, not a blank section
- Open a client with no checks → confirm "No checks yet" placeholder

## Error / Edge Case Tests
- Submit create-client form with `full_name` blank → confirm inline validation error, no DB write
- Set a document expiry date in the past → confirm expiry warning badge appears
- Simulate Supabase offline (disable network) → confirm error boundary message, no crash
- Create two clients with same email → confirm both save (no unique constraint in v1), note for later

## Permissions (post Sprint 4)
- Unauthenticated user clicks "Add Document" → redirected to login, not silently ignored
- `member` user tries to view another user's client → RLS blocks row, gets empty list
- `admin` user views `/audit` → all rows visible

## AI Layer (Sprint 5)
- Trigger `tag_risk_level` on Chen Wei → confirm suggestion stored as `unreviewed` with confidence score
- Click **Approve** → confirm `review_status` changes to `approved` and audit log row created
- Confirm API key does not appear in browser network tab