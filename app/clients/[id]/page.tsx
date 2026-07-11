import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Client } from "@/lib/kyc/types";
import { StageBadge, RiskBadge } from "@/components/badges";
import { timeAgo } from "@/lib/kyc/format";

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

  return (
    <div className="max-w-3xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{client.full_name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <StageBadge stage={client.kyc_stage} />
            <RiskBadge level={client.risk_level} />
            <span className="text-sm text-neutral-500">Score {Math.round(client.completeness_score)}%</span>
          </div>
        </div>
        <Link
          href={`/clients/${client.id}/edit`}
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50"
        >
          Edit
        </Link>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-6 grid grid-cols-2 gap-4 text-sm">
        <Detail label="Entity type" value={client.entity_type} />
        <Detail label="Date of birth" value={client.date_of_birth} />
        <Detail label="Nationality" value={client.nationality} />
        <Detail label="Email" value={client.email} />
        <Detail label="Phone" value={client.phone} />
        <Detail
          label="Address"
          value={[client.address_line1, client.address_city, client.address_country].filter(Boolean).join(", ")}
        />
        <Detail label="Last activity" value={timeAgo(client.last_activity_at)} />
        {client.notes && (
          <div className="col-span-2">
            <div className="text-neutral-500 mb-1">Notes</div>
            <div className="whitespace-pre-wrap">{client.notes}</div>
          </div>
        )}
      </div>
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
