import Link from "next/link";
import type { TeamMember } from "@/lib/kyc/types";

export function ClientFilterBar({
  teamMembers,
  currentStage,
  currentReviewer,
  currentRisk,
}: {
  teamMembers: TeamMember[];
  currentStage?: string;
  currentReviewer?: string;
  currentRisk?: string;
}) {
  return (
    <form method="get" className="flex items-end gap-3 flex-wrap mb-4 bg-white border border-neutral-200 rounded-lg p-4">
      <div>
        <label className="block text-xs font-medium text-neutral-600 mb-1">Stage</label>
        <select name="stage" defaultValue={currentStage ?? ""} className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm bg-white">
          <option value="">All stages</option>
          <option value="not_started">Not started</option>
          <option value="pending_docs">Pending docs</option>
          <option value="in_review">In review</option>
          <option value="approved">Approved</option>
          <option value="flagged">Flagged</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-neutral-600 mb-1">Reviewer</label>
        <select name="reviewer" defaultValue={currentReviewer ?? ""} className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm bg-white">
          <option value="">All reviewers</option>
          <option value="unassigned">Unassigned</option>
          {teamMembers.map((member) => (
            <option key={member.id} value={member.id}>
              {member.full_name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-neutral-600 mb-1">Risk</label>
        <select name="risk" defaultValue={currentRisk ?? ""} className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm bg-white">
          <option value="">All risk levels</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="unknown">Unknown</option>
        </select>
      </div>
      <button type="submit" className="rounded-md bg-neutral-900 text-white px-3 py-1.5 text-sm font-medium hover:bg-neutral-800">
        Filter
      </button>
      <Link href="/clients" className="text-sm text-neutral-500 hover:text-neutral-800 px-1 py-1.5">
        Clear
      </Link>
    </form>
  );
}
