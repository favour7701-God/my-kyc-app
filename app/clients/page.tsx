import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Client, TeamMember } from "@/lib/kyc/types";
import { StageBadge, RiskBadge, OverdueBadge } from "@/components/badges";
import { ClientFilterBar } from "@/components/ClientFilterBar";
import { timeAgo, isOverdue } from "@/lib/kyc/format";

export const dynamic = "force-dynamic";

type ClientRow = Client & { team_members: { full_name: string } | null };

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string; reviewer?: string; risk?: string }>;
}) {
  const { stage, reviewer, risk } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("clients")
    .select("*, team_members(full_name)")
    .order("last_activity_at", { ascending: false, nullsFirst: false });

  if (stage) query = query.eq("kyc_stage", stage);
  if (risk) query = query.eq("risk_level", risk);
  if (reviewer === "unassigned") query = query.is("assigned_reviewer_id", null);
  else if (reviewer) query = query.eq("assigned_reviewer_id", reviewer);

  const [{ data: clients, error }, { data: teamMembers }] = await Promise.all([
    query.returns<ClientRow[]>(),
    supabase.from("team_members").select("*").order("full_name").returns<TeamMember[]>(),
  ]);

  if (error) {
    throw new Error(error.message);
  }

  const hasFilters = Boolean(stage || reviewer || risk);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
        <Link
          href="/clients/new"
          className="rounded-md bg-neutral-900 text-white px-4 py-2 text-sm font-medium hover:bg-neutral-800"
        >
          Add Client
        </Link>
      </div>

      <ClientFilterBar teamMembers={teamMembers ?? []} currentStage={stage} currentReviewer={reviewer} currentRisk={risk} />

      {!clients || clients.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 p-12 text-center">
          <p className="text-neutral-500 mb-4">{hasFilters ? "No clients match these filters." : "No clients yet."}</p>
          <Link
            href="/clients/new"
            className="rounded-md bg-neutral-900 text-white px-4 py-2 text-sm font-medium hover:bg-neutral-800"
          >
            Add Client
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-neutral-500">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Stage</th>
                <th className="px-4 py-3 font-medium">Risk</th>
                <th className="px-4 py-3 font-medium">Score</th>
                <th className="px-4 py-3 font-medium">Reviewer</th>
                <th className="px-4 py-3 font-medium">Last activity</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <Link href={`/clients/${client.id}`} className="font-medium text-neutral-900 hover:underline">
                      {client.full_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <StageBadge stage={client.kyc_stage} />
                  </td>
                  <td className="px-4 py-3">
                    <RiskBadge level={client.risk_level} />
                  </td>
                  <td className="px-4 py-3 tabular-nums">{Math.round(client.completeness_score)}%</td>
                  <td className="px-4 py-3 text-neutral-500">{client.team_members?.full_name ?? "Unassigned"}</td>
                  <td className="px-4 py-3 text-neutral-500">
                    <div className="flex items-center gap-2">
                      {timeAgo(client.last_activity_at)}
                      {isOverdue(client.last_activity_at) && <OverdueBadge />}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
