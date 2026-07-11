import type { KycCheck } from "@/lib/kyc/types";
import { CheckStatusBadge } from "@/components/badges";
import { addCheckAction, updateCheckResultAction } from "@/app/clients/actions";

export function CheckSection({ clientId, checks }: { clientId: string; checks: KycCheck[] }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-6">
      <h2 className="font-semibold mb-4">KYC Checks</h2>

      {checks.length === 0 ? (
        <p className="text-sm text-neutral-500 mb-4">No checks yet.</p>
      ) : (
        <ul className="space-y-3 mb-6">
          {checks.map((check) => (
            <li key={check.id} className="flex items-center justify-between gap-4 text-sm border-b border-neutral-100 pb-3 last:border-0">
              <div>
                <div className="font-medium">{check.check_type}</div>
                {check.notes && <div className="text-neutral-500 text-xs">{check.notes}</div>}
              </div>
              <div className="flex items-center gap-2">
                <CheckStatusBadge status={check.status} />
                <form action={updateCheckResultAction} className="flex items-center gap-1">
                  <input type="hidden" name="client_id" value={clientId} />
                  <input type="hidden" name="check_id" value={check.id} />
                  <select name="status" defaultValue={check.status} className="rounded border border-neutral-300 text-xs px-1.5 py-1">
                    <option value="pending">Pending</option>
                    <option value="passed">Passed</option>
                    <option value="failed">Failed</option>
                  </select>
                  <button type="submit" className="rounded border border-neutral-300 px-2 py-1 text-xs font-medium hover:bg-neutral-50">
                    Update
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form action={addCheckAction} className="flex items-end gap-2 flex-wrap">
        <input type="hidden" name="client_id" value={clientId} />
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1">Check type</label>
          <input name="check_type" required className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm" placeholder="e.g. Sanctions Screening" />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1">Result</label>
          <select name="status" defaultValue="pending" className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm">
            <option value="pending">Pending</option>
            <option value="passed">Passed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <button type="submit" className="rounded-md bg-neutral-900 text-white px-3 py-1.5 text-sm font-medium hover:bg-neutral-800">
          Add Check
        </button>
      </form>
    </div>
  );
}
