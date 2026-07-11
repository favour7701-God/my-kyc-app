import type { KycStage, RiskLevel, DocumentStatus, CheckStatus } from "@/lib/kyc/types";

const STAGE_STYLES: Record<KycStage, string> = {
  not_started: "bg-neutral-100 text-neutral-700",
  pending_docs: "bg-amber-100 text-amber-800",
  in_review: "bg-blue-100 text-blue-800",
  approved: "bg-green-100 text-green-800",
  flagged: "bg-red-100 text-red-800",
};

const STAGE_LABELS: Record<KycStage, string> = {
  not_started: "Not started",
  pending_docs: "Pending docs",
  in_review: "In review",
  approved: "Approved",
  flagged: "Flagged",
};

export function StageBadge({ stage }: { stage: KycStage }) {
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STAGE_STYLES[stage] ?? STAGE_STYLES.not_started}`}>
      {STAGE_LABELS[stage] ?? stage}
    </span>
  );
}

const RISK_STYLES: Record<RiskLevel, string> = {
  unknown: "bg-neutral-100 text-neutral-600",
  low: "bg-green-100 text-green-800",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-red-100 text-red-800",
};

export function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${RISK_STYLES[level] ?? RISK_STYLES.unknown}`}>
      {level}
    </span>
  );
}

const DOC_STATUS_STYLES: Record<DocumentStatus, string> = {
  pending: "bg-neutral-100 text-neutral-700",
  submitted: "bg-blue-100 text-blue-800",
  verified: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${DOC_STATUS_STYLES[status] ?? DOC_STATUS_STYLES.pending}`}>
      {status}
    </span>
  );
}

const CHECK_STATUS_STYLES: Record<CheckStatus, string> = {
  pending: "bg-neutral-100 text-neutral-700",
  passed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

export function CheckStatusBadge({ status }: { status: CheckStatus }) {
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${CHECK_STATUS_STYLES[status] ?? CHECK_STATUS_STYLES.pending}`}>
      {status}
    </span>
  );
}

export function OverdueBadge() {
  return (
    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
      Overdue
    </span>
  );
}
