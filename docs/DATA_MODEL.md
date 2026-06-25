# Data Model — my-kyc-app

## clients
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid (nullable) | owner, set at lock-down |
| full_name | text | |
| date_of_birth | date | |
| nationality | text | |
| email | text | |
| phone | text | |
| address_line1 / city / country | text | |
| entity_type | text | individual \| corporate |
| kyc_stage | text | not_started \| pending_docs \| in_review \| approved \| flagged |
| risk_level | text | **AI field** — see below |
| risk_level_source | text | e.g. "rule_engine" \| "openai" |
| risk_level_confidence | numeric | 0.0–1.0 |
| risk_level_review_status | text | unreviewed \| approved \| overridden |
| completeness_score | numeric | 0–100, computed |
| assigned_reviewer_id | uuid (nullable) | |
| notes | text | |
| last_activity_at | timestamptz | |

## kyc_documents
`id, user_id, client_id (FK→clients), document_type, status (pending/submitted/verified/rejected), file_url, expiry_date, rejection_reason, verified_by, verified_at, created_at`

## kyc_checks
`id, user_id, client_id (FK→clients), check_type, status (pending/passed/failed), result` **(AI field: result + result_source + result_confidence + result_review_status)**, `checked_by, checked_at, notes, created_at`

## activities
`id, user_id, client_id (FK→clients), actor_name, action, object_type, object_id, detail, created_at`

## audit_logs
`id, user_id, actor_name, action, table_name, object_id, before_value (jsonb), after_value (jsonb), tool_name, ip_address, created_at`

## RLS
- All tables: open permissive read + write policies in v1
- Lock-down sprint replaces with `auth.uid() = user_id` owner-scoped policies