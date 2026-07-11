import Link from "next/link";
import { signUpAction } from "@/app/auth/actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-2xl font-semibold tracking-tight mb-6">Create account</h1>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3 mb-4">
          {error}
        </div>
      )}

      <form action={signUpAction} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Full name</label>
          <input name="full_name" className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
          <input type="email" name="email" required className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Password</label>
          <input type="password" name="password" required minLength={6} className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Role</label>
          <select name="role" defaultValue="member" className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm bg-white">
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit" className="w-full rounded-md bg-neutral-900 text-white px-4 py-2 text-sm font-medium hover:bg-neutral-800">
          Sign up
        </button>
      </form>

      <p className="text-sm text-neutral-500 mt-4">
        Already have an account?{" "}
        <Link href="/login" className="underline text-neutral-800">
          Sign in
        </Link>
      </p>
    </div>
  );
}
