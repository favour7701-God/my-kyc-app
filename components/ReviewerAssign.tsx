import type { TeamMember } from "@/lib/kyc/types";
import { assignReviewerAction } from "@/app/clients/actions";

export function ReviewerAssign({
  clientId,
  assignedReviewerId,
  teamMembers,
}: {
  clientId: string;
  assignedReviewerId: string | null;
  teamMembers: TeamMember[];
}) {
  return (
    <form action={assignReviewerAction} className="flex items-center gap-2">
      <input type="hidden" name="client_id" value={clientId} />
      <label className="text-xs font-medium text-neutral-600">Reviewer</label>
      <select
        name="assigned_reviewer_id"
        defaultValue={assignedReviewerId ?? ""}
        className="rounded-md border border-neutral-300 px-2 py-1 text-sm bg-white"
      >
        <option value="">Unassigned</option>
        {teamMembers.map((member) => (
          <option key={member.id} value={member.id}>
            {member.full_name}
          </option>
        ))}
      </select>
      <button type="submit" className="rounded border border-neutral-300 px-2 py-1 text-xs font-medium hover:bg-neutral-50">
        Save
      </button>
    </form>
  );
}
