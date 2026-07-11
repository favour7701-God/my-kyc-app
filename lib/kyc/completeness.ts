import type { Client, KycCheck, KycDocument } from "./types";

export const REQUIRED_CLIENT_FIELDS: { key: keyof Client; label: string; individualOnly?: boolean }[] = [
  { key: "full_name", label: "Full name" },
  { key: "date_of_birth", label: "Date of birth", individualOnly: true },
  { key: "nationality", label: "Nationality" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "address_line1", label: "Address" },
  { key: "address_city", label: "City" },
  { key: "address_country", label: "Country" },
];

const PENDING_DOCUMENT_STALE_DAYS = 7;

function requiredFieldsFor(client: Client) {
  return REQUIRED_CLIENT_FIELDS.filter((f) => !(f.individualOnly && client.entity_type === "corporate"));
}

function daysSince(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24);
}

/**
 * score_completeness — rule-based, no AI (docs/INTELLIGENCE_LAYER.md).
 * required_fields_present (0-60) + documents all verified (0-20) + checks all passed (0-20)
 */
export function scoreCompleteness(
  client: Client,
  documents: KycDocument[],
  checks: KycCheck[],
): number {
  const requiredFields = requiredFieldsFor(client);
  const presentFields = requiredFields.filter(
    (f) => client[f.key] !== null && client[f.key] !== "",
  ).length;
  const fieldsScore = (presentFields / requiredFields.length) * 60;

  const docsScore =
    documents.length === 0
      ? 0
      : (documents.filter((d) => d.status === "verified").length / documents.length) * 20;

  const checksScore =
    checks.length === 0
      ? 0
      : (checks.filter((c) => c.status === "passed").length / checks.length) * 20;

  return Math.round(fieldsScore + docsScore + checksScore);
}

/**
 * draft_issues_summary — plain-text list of what's blocking completeness.
 */
export function draftIssuesSummary(
  client: Client,
  documents: KycDocument[],
  checks: KycCheck[],
): string[] {
  const issues: string[] = [];

  for (const field of requiredFieldsFor(client)) {
    const value = client[field.key];
    if (value === null || value === "") {
      issues.push(`Missing ${field.label.toLowerCase()}`);
    }
  }

  if (documents.length === 0) {
    issues.push("No documents submitted yet");
  } else {
    for (const doc of documents) {
      if (doc.status === "pending" && daysSince(doc.created_at) > PENDING_DOCUMENT_STALE_DAYS) {
        issues.push(`${doc.document_type} has been pending for over 7 days`);
      }
      if (doc.status === "rejected") {
        issues.push(`${doc.document_type} was rejected${doc.rejection_reason ? `: ${doc.rejection_reason}` : ""}`);
      }
    }
  }

  for (const check of checks) {
    if (check.status === "failed") {
      issues.push(`${check.check_type} failed${check.notes ? `: ${check.notes}` : ""}`);
    }
  }

  return issues;
}
