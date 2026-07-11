import type { KycDocument } from "@/lib/kyc/types";
import { DocumentStatusBadge } from "@/components/badges";
import { addDocumentAction, updateDocumentStatusAction } from "@/app/clients/actions";

export function DocumentSection({ clientId, documents }: { clientId: string; documents: KycDocument[] }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-6">
      <h2 className="font-semibold mb-4">Documents</h2>

      {documents.length === 0 ? (
        <p className="text-sm text-neutral-500 mb-4">No documents yet.</p>
      ) : (
        <ul className="space-y-3 mb-6">
          {documents.map((doc) => (
            <li key={doc.id} className="flex items-center justify-between gap-4 text-sm border-b border-neutral-100 pb-3 last:border-0">
              <div>
                <div className="font-medium">{doc.document_type}</div>
                <div className="text-neutral-500 text-xs">
                  {doc.expiry_date ? `Expires ${doc.expiry_date}` : "No expiry set"}
                  {doc.status === "rejected" && doc.rejection_reason ? ` — ${doc.rejection_reason}` : ""}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {doc.expiry_date && new Date(doc.expiry_date) < new Date() && (
                  <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Expired
                  </span>
                )}
                <DocumentStatusBadge status={doc.status} />
                <form action={updateDocumentStatusAction} className="flex items-center gap-1">
                  <input type="hidden" name="client_id" value={clientId} />
                  <input type="hidden" name="document_id" value={doc.id} />
                  <select name="status" defaultValue={doc.status} className="rounded border border-neutral-300 text-xs px-1.5 py-1">
                    <option value="pending">Pending</option>
                    <option value="submitted">Submitted</option>
                    <option value="verified">Verified</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <input
                    name="rejection_reason"
                    defaultValue={doc.rejection_reason ?? ""}
                    placeholder="Reason if rejected"
                    className="w-32 rounded border border-neutral-300 text-xs px-1.5 py-1"
                  />
                  <button type="submit" className="rounded border border-neutral-300 px-2 py-1 text-xs font-medium hover:bg-neutral-50">
                    Update
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form action={addDocumentAction} className="flex items-end gap-2 flex-wrap">
        <input type="hidden" name="client_id" value={clientId} />
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1">Document type</label>
          <input name="document_type" required className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm" placeholder="e.g. Proof of Funds" />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1">Status</label>
          <select name="status" defaultValue="submitted" className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm">
            <option value="pending">Pending</option>
            <option value="submitted">Submitted</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1">Expiry date</label>
          <input type="date" name="expiry_date" className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm" />
        </div>
        <button type="submit" className="rounded-md bg-neutral-900 text-white px-3 py-1.5 text-sm font-medium hover:bg-neutral-800">
          Add Document
        </button>
      </form>
    </div>
  );
}
