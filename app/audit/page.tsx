import { createClient } from "@/lib/supabase/server";
import type { AuditLog, Client } from "@/lib/kyc/types";
import { timeAgo } from "@/lib/kyc/format";

export const dynamic = "force-dynamic";

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ client_id?: string; actor?: string; date?: string }>;
}) {
  const { client_id, actor, date } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAdmin = (user?.user_metadata?.role as string | undefined) === "admin";

  if (!user) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight mb-6">Audit Trail</h1>
        <div className="rounded-lg border border-dashed border-neutral-300 p-12 text-center text-neutral-500">
          Sign in as an admin to view the audit trail.
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight mb-6">Audit Trail</h1>
        <div className="rounded-lg border border-dashed border-neutral-300 p-12 text-center text-neutral-500">
          The audit trail is visible to admins only.
        </div>
      </div>
    );
  }

  const { data: clients } = await supabase
    .from("clients")
    .select("id, full_name")
    .order("full_name")
    .returns<Pick<Client, "id" | "full_name">[]>();

  let objectIds: string[] | null = null;
  if (client_id) {
    const [{ data: docs }, { data: checks }] = await Promise.all([
      supabase.from("kyc_documents").select("id").eq("client_id", client_id),
      supabase.from("kyc_checks").select("id").eq("client_id", client_id),
    ]);
    objectIds = [client_id, ...(docs ?? []).map((d) => d.id), ...(checks ?? []).map((c) => c.id)];
  }

  let query = supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(200);
  if (objectIds) query = query.in("object_id", objectIds);
  if (actor) query = query.eq("actor_name", actor);
  if (date) {
    const start = new Date(`${date}T00:00:00Z`);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);
    query = query.gte("created_at", start.toISOString()).lt("created_at", end.toISOString());
  }

  const { data: logs, error } = await query.returns<AuditLog[]>();
  if (error) throw new Error(error.message);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-6">Audit Trail</h1>

      <form method="get" className="flex items-end gap-3 flex-wrap mb-4 bg-white border border-neutral-200 rounded-lg p-4">
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1">Client</label>
          <select name="client_id" defaultValue={client_id ?? ""} className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm bg-white">
            <option value="">All clients</option>
            {(clients ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.full_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1">Actor</label>
          <select name="actor" defaultValue={actor ?? ""} className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm bg-white">
            <option value="">All actors</option>
            <option value="Team Member">Team Member</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1">Date</label>
          <input type="date" name="date" defaultValue={date ?? ""} className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm" />
        </div>
        <button type="submit" className="rounded-md bg-neutral-900 text-white px-3 py-1.5 text-sm font-medium hover:bg-neutral-800">
          Filter
        </button>
        <a href="/audit" className="text-sm text-neutral-500 hover:text-neutral-800 px-1 py-1.5">
          Clear
        </a>
      </form>

      {!logs || logs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 p-12 text-center text-neutral-500">
          No audit entries match these filters.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-neutral-500">
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium">Actor</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Table</th>
                <th className="px-4 py-3 font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-neutral-100 last:border-0 align-top">
                  <td className="px-4 py-3 text-neutral-500 whitespace-nowrap">{timeAgo(log.created_at)}</td>
                  <td className="px-4 py-3">{log.actor_name ?? "—"}</td>
                  <td className="px-4 py-3">{log.action}</td>
                  <td className="px-4 py-3 text-neutral-500">{log.table_name ?? "—"}</td>
                  <td className="px-4 py-3">
                    {log.before_value || log.after_value ? (
                      <details>
                        <summary className="cursor-pointer text-neutral-500 text-xs">View change</summary>
                        <pre className="mt-1 max-w-md overflow-x-auto text-xs bg-neutral-50 p-2 rounded">
                          {JSON.stringify({ before: log.before_value, after: log.after_value }, null, 2)}
                        </pre>
                      </details>
                    ) : (
                      <span className="text-neutral-400 text-xs">—</span>
                    )}
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
