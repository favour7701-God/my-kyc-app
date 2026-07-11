import type { SupabaseClient } from "@supabase/supabase-js";
import { scoreCompleteness } from "./completeness";
import type { Client, KycCheck, KycDocument } from "./types";

/** Recomputes completeness_score and bumps last_activity_at for a client. */
export async function recalcAndTouchClient(supabase: SupabaseClient, clientId: string) {
  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .single<Client>();
  if (!client) return null;

  const { data: documents } = await supabase
    .from("kyc_documents")
    .select("*")
    .eq("client_id", clientId)
    .returns<KycDocument[]>();
  const { data: checks } = await supabase
    .from("kyc_checks")
    .select("*")
    .eq("client_id", clientId)
    .returns<KycCheck[]>();

  const score = scoreCompleteness(client, documents ?? [], checks ?? []);

  await supabase
    .from("clients")
    .update({ completeness_score: score, last_activity_at: new Date().toISOString() })
    .eq("id", clientId);

  return score;
}

export async function logActivity(
  supabase: SupabaseClient,
  params: {
    clientId: string | null;
    actorName: string;
    action: string;
    objectType?: string;
    objectId?: string;
    detail?: string;
  },
) {
  await supabase.from("activities").insert({
    client_id: params.clientId,
    actor_name: params.actorName,
    action: params.action,
    object_type: params.objectType ?? null,
    object_id: params.objectId ?? null,
    detail: params.detail ?? null,
  });
}
