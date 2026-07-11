import Link from "next/link";
import { timeAgo } from "@/lib/kyc/format";

export interface ActivityFeedItem {
  id: string;
  created_at: string;
  client_id: string | null;
  actor_name: string | null;
  action: string;
  clients: { full_name: string } | null;
}

export function ActivityFeed({ activities }: { activities: ActivityFeedItem[] }) {
  if (activities.length === 0) {
    return <p className="text-sm text-neutral-500">No activity yet.</p>;
  }

  return (
    <ul className="divide-y divide-neutral-100">
      {activities.map((activity) => (
        <li key={activity.id} className="py-3 text-sm flex items-start justify-between gap-4">
          <div>
            <span className="font-medium">{activity.actor_name ?? "Someone"}</span>{" "}
            <span className="text-neutral-700">{activity.action}</span>
            {activity.clients && activity.client_id && (
              <>
                {" "}for{" "}
                <Link href={`/clients/${activity.client_id}`} className="text-neutral-900 underline">
                  {activity.clients.full_name}
                </Link>
              </>
            )}
          </div>
          <span className="text-neutral-400 whitespace-nowrap text-xs shrink-0">{timeAgo(activity.created_at)}</span>
        </li>
      ))}
    </ul>
  );
}
