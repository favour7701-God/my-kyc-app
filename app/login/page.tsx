import Link from "next/link";
import { signInAction } from "@/app/auth/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; redirect?: string }>;
}) {
  const { error, message, redirect: redirectTo } = await searchParams;

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-2xl font-semibold tracking-tight mb-6">Sign in</h1>

      {message && (
        <div className="rounded-md bg-blue-50 border border-blue-200 text-blue-800 text-sm px-4 py-3 mb-4">
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3 mb-4">
          {error}
        </div>
      )}

      <form action={signInAction} className="space-y-4">
        <input type="hidden" name="redirect_to" value={redirectTo ?? "/clients"} />
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
          <input type="email" name="email" required className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Password</label>
          <input type="password" name="password" required className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm" />
        </div>
        <button type="submit" className="w-full rounded-md bg-neutral-900 text-white px-4 py-2 text-sm font-medium hover:bg-neutral-800">
          Sign in
        </button>
      </form>

      <p className="text-sm text-neutral-500 mt-4">
        No account?{" "}
        <Link href="/signup" className="underline text-neutral-800">
          Sign up
        </Link>
      </p>
    </div>
  );
}
