import type { SupabaseClient } from "@supabase/supabase-js";

export async function logAuditEntry(
  supabase: SupabaseClient,
  params: {
    action: string;
    tableName: string;
    objectId: string;
    beforeValue?: unknown;
    afterValue?: unknown;
    toolName?: string;
  },
) {
  await supabase.from("audit_logs").insert({
    actor_name: "Team Member",
    action: params.action,
    table_name: params.tableName,
    object_id: params.objectId,
    before_value: params.beforeValue ?? null,
    after_value: params.afterValue ?? null,
    tool_name: params.toolName ?? null,
  });
}
