import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Client } from "@/lib/kyc/types";
import { KpiCards } from "@/components/KpiCards";
import { ActivityFeed, type ActivityFeedItem } from "@/components/ActivityFeed";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();

  const [{ data: clients, error: clientsError }, { data: activities, error: activitiesError }] = await Promise.all([
    supabase.from("clients").select("*").returns<Client[]>(),
    supabase
      .from("activities")
      .select("id, created_at, client_id, actor_name, action, clients(full_name)")
      .order("created_at", { ascending: false })
      .limit(20)
      .returns<ActivityFeedItem[]>(),
  ]);

  if (clientsError) throw new Error(clientsError.message);
  if (activitiesError) throw new Error(activitiesError.message);

  const total = clients?.length ?? 0;
  const fullyVerified = clients?.filter((c) => c.completeness_score >= 100).length ?? 0;
  const pendingReviews = clients?.filter((c) => c.kyc_stage === "pending_docs" || c.kyc_stage === "in_review").length ?? 0;
  const flagged = clients?.filter((c) => c.kyc_stage === "flagged").length ?? 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <Link
          href="/clients"
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50"
        >
          View all clients
        </Link>
      </div>

      <KpiCards
        total={total}
        fullyVerifiedPct={total === 0 ? 0 : Math.round((fullyVerified / total) * 100)}
        pendingReviews={pendingReviews}
        flagged={flagged}
      />

      <div className="rounded-lg border border-neutral-200 bg-white p-6">
        <h2 className="font-semibold mb-2">Team activity</h2>
        <ActivityFeed activities={activities ?? []} />
      </div>
    </div>
  );
}
