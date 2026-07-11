import { updateNotesAction } from "@/app/clients/actions";

export function NotesEditor({ clientId, notes }: { clientId: string; notes: string | null }) {
  return (
    <form action={updateNotesAction} className="space-y-2">
      <input type="hidden" name="client_id" value={clientId} />
      <label className="block text-xs font-medium text-neutral-600">Notes</label>
      <textarea
        name="notes"
        defaultValue={notes ?? ""}
        rows={3}
        className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
      />
      <button type="submit" className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:bg-neutral-50">
        Save Notes
      </button>
    </form>
  );
}
