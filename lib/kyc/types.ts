export type EntityType = "individual" | "corporate";

export type KycStage =
  | "not_started"
  | "pending_docs"
  | "in_review"
  | "approved"
  | "flagged";

export type RiskLevel = "unknown" | "low" | "medium" | "high";

export type ReviewStatus = "unreviewed" | "approved" | "overridden";

export type DocumentStatus = "pending" | "submitted" | "verified" | "rejected";

export type CheckStatus = "pending" | "passed" | "failed";

export interface Client {
  id: string;
  user_id: string | null;
  created_at: string;
  full_name: string;
  date_of_birth: string | null;
  nationality: string | null;
  email: string | null;
  phone: string | null;
  address_line1: string | null;
  address_city: string | null;
  address_country: string | null;
  entity_type: EntityType;
  kyc_stage: KycStage;
  risk_level: RiskLevel;
  risk_level_source: string | null;
  risk_level_confidence: number | null;
  risk_level_review_status: ReviewStatus;
  completeness_score: number;
  assigned_reviewer_id: string | null;
  notes: string | null;
  last_activity_at: string | null;
}

export interface KycDocument {
  id: string;
  user_id: string | null;
  created_at: string;
  client_id: string;
  document_type: string;
  status: DocumentStatus;
  file_url: string | null;
  expiry_date: string | null;
  rejection_reason: string | null;
  verified_by: string | null;
  verified_at: string | null;
}

export interface KycCheck {
  id: string;
  user_id: string | null;
  created_at: string;
  client_id: string;
  check_type: string;
  status: CheckStatus;
  result: string | null;
  result_source: string | null;
  result_confidence: number | null;
  result_review_status: ReviewStatus;
  checked_by: string | null;
  checked_at: string | null;
  notes: string | null;
}

export interface Activity {
  id: string;
  user_id: string | null;
  created_at: string;
  client_id: string | null;
  actor_name: string | null;
  action: string;
  object_type: string | null;
  object_id: string | null;
  detail: string | null;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  created_at: string;
  actor_name: string | null;
  action: string;
  table_name: string | null;
  object_id: string | null;
  before_value: unknown;
  after_value: unknown;
  tool_name: string | null;
  ip_address: string | null;
}
