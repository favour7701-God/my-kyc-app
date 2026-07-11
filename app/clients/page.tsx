import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Client } from "@/lib/kyc/types";
import { StageBadge, RiskBadge } from "@/components/badges";
import { timeAgo } from "@/lib/kyc/format";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const supabase = await createClient();
  const { data: clients, error } = await supabase
    .from("clients")
    .select("*")
    .order("last_activity_at", { ascending: false, nullsFirst: false })
    .returns<Client[]>();

  if (error) {
    throw new Error(error.message);
  }

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

      {!clients || clients.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 p-12 text-center">
          <p className="text-neutral-500 mb-4">No clients yet.</p>
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
                  <td className="px-4 py-3 text-neutral-500">{timeAgo(client.last_activity_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
