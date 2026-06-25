# Agentic Layer — my-kyc-app

## Risk Levels & Actions

### Low — Auto-execute
- `tag_risk_level` — suggest risk rating from client data (stored as `unreviewed`)
- `score_completeness` — recalculate completeness score on any record change
- `draft_issues_summary` — generate plain-text summary of missing items

### Medium — Light approval (team member confirms)
- `update_kyc_stage` — move client to next stage (e.g. `in_review` → `approved`)
- `assign_reviewer` — assign a team member to own the record
- `flag_client` — mark record as flagged with reason

### High — Always requires explicit approval
- `send_notification` — alert reviewer or manager of a flagged record
- `request_external_check` — trigger third-party identity/sanctions API call

### Critical — Human only, no agent
- `delete_client_record` — permanent removal
- `approve_ai_risk_level` — promote AI suggestion to official status
- `override_approved_kyc` — reverse an approved KYC decision

## Named Tools (v1)
- `score_completeness` — reads fields + doc/check statuses, returns 0–100
- `draft_issues_summary` — reads nulls + failed checks, returns text
- `tag_risk_level` — rule-based in v1; AI call in later sprint

## Audit Log Fields
`actor_name, action, table_name, object_id, before_value, after_value, tool_name, ip_address, created_at`

## v1 vs Later
- **v1:** `score_completeness` + `draft_issues_summary` run on every save (auto, low-risk)
- **Next:** `update_kyc_stage` as a one-click approval action
- **Later:** `send_notification` and external API calls with approval gate