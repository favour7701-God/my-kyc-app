import { redirect } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";

export function actorNameFor(user: User): string {
  return (user.user_metadata?.full_name as string | undefined) || user.email || "Team Member";
}

/** Redirects unauthenticated users to /login; returns the signed-in user otherwise. */
export async function requireUser(supabase: SupabaseClient, redirectTo: string): Promise<User> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent(redirectTo)}`);
  }
  return user;
}
