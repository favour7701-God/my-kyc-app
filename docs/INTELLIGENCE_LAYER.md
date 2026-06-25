# Intelligence Layer — my-kyc-app

## Messy Inputs
- Free-text notes on client records
- Inconsistent document names entered by different team members
- Manual risk ratings with no audit trail

## v1 — Rule-Based (no AI)
**Completeness score formula:**
```
required_fields_present (0–60 pts)
+ kyc_documents all verified (0–20 pts)
+ kyc_checks all passed (0–20 pts)
= score 0–100
```
**Issue prompts triggered when:**
- Any required field is null
- Any required document_type is missing or in `pending` status >7 days
- Any kyc_check is `failed`

## Auto-Structure Schema (AI, later)
```json
{
  "client_id": "uuid",
  "risk_level": "high",
  "risk_level_source": "openai-gpt-4o",
  "risk_level_confidence": 0.82,
  "risk_level_review_status": "unreviewed",
  "issues_summary": "Missing proof of address; PEP match flagged.",
  "issues_summary_source": "openai-gpt-4o",
  "issues_summary_confidence": 0.91,
  "issues_summary_review_status": "unreviewed"
}
```

## Events to Track
- Client record created / stage changed
- Document status changed
- KYC check passed / failed
- Completeness score crossed threshold (50%, 100%)
- Reviewer assigned

## v1 vs Later
- **v1:** rule-based score + prompts, no AI calls
- **Next:** AI risk suggestion stored as `unreviewed`, shown with confidence badge
- **Later:** AI-drafted issue summaries, bulk scoring runs