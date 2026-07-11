import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Client, KycCheck, KycDocument, TeamMember } from "@/lib/kyc/types";
import { StageBadge, RiskBadge, OverdueBadge } from "@/components/badges";
import { timeAgo, isOverdue } from "@/lib/kyc/format";
import { draftIssuesSummary } from "@/lib/kyc/completeness";
import { MissingFieldBanner } from "@/components/MissingFieldBanner";
import { DocumentSection } from "@/components/DocumentSection";
import { CheckSection } from "@/components/CheckSection";
import { ReviewerAssign } from "@/components/ReviewerAssign";
import { NotesEditor } from "@/components/NotesEditor";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: client, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .maybeSingle<Client>();

  if (error) throw new Error(error.message);
  if (!client) notFound();

  const [
    { data: documents, error: docsError },
    { data: checks, error: checksError },
    { data: teamMembers },
  ] = await Promise.all([
    supabase.from("kyc_documents").select("*").eq("client_id", id).order("created_at").returns<KycDocument[]>(),
    supabase.from("kyc_checks").select("*").eq("client_id", id).order("created_at").returns<KycCheck[]>(),
    supabase.from("team_members").select("*").order("full_name").returns<TeamMember[]>(),
  ]);

  if (docsError) throw new Error(docsError.message);
  if (checksError) throw new Error(checksError.message);

  const issues = draftIssuesSummary(client, documents ?? [], checks ?? []);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{client.full_name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <StageBadge stage={client.kyc_stage} />
            <RiskBadge level={client.risk_level} />
            <span className="text-sm text-neutral-500">Score {Math.round(client.completeness_score)}%</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/audit"
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50"
          >
            Audit trail
          </Link>
          <Link
            href={`/clients/${client.id}/edit`}
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50"
          >
            Edit
          </Link>
        </div>
      </div>

      <MissingFieldBanner issues={issues} />

      <div className="rounded-lg border border-neutral-200 bg-white p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <Detail label="Entity type" value={client.entity_type} />
          <Detail label="Date of birth" value={client.date_of_birth} />
          <Detail label="Nationality" value={client.nationality} />
          <Detail label="Email" value={client.email} />
          <Detail label="Phone" value={client.phone} />
          <Detail
            label="Address"
            value={[client.address_line1, client.address_city, client.address_country].filter(Boolean).join(", ")}
          />
          <div>
            <div className="text-neutral-500">Last activity</div>
            <div className="text-neutral-900 flex items-center gap-2">
              {timeAgo(client.last_activity_at)}
              {isOverdue(client.last_activity_at) && <OverdueBadge />}
            </div>
          </div>
        </div>

        <ReviewerAssign clientId={client.id} assignedReviewerId={client.assigned_reviewer_id} teamMembers={teamMembers ?? []} />

        <NotesEditor clientId={client.id} notes={client.notes} />
      </div>

      <DocumentSection clientId={client.id} documents={documents ?? []} />
      <CheckSection clientId={client.id} checks={checks ?? []} />
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <div className="text-neutral-500">{label}</div>
      <div className="text-neutral-900">{value || "—"}</div>
    </div>
  );
}
