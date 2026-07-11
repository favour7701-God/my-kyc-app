import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/app/auth/actions";
import "./globals.css";

export const metadata: Metadata = {
  title: "my-kyc-app",
  description: "Shared KYC workflow tool for compliance teams",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-neutral-50 text-neutral-900">
        <nav className="border-b border-neutral-200 bg-white">
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-6">
            <Link href="/" className="font-semibold tracking-tight">
              my-kyc-app
            </Link>
            <Link href="/" className="text-sm text-neutral-600 hover:text-neutral-900">
              Dashboard
            </Link>
            <Link href="/clients" className="text-sm text-neutral-600 hover:text-neutral-900">
              Clients
            </Link>
            <Link href="/audit" className="text-sm text-neutral-600 hover:text-neutral-900">
              Audit
            </Link>
            <div className="ml-auto flex items-center gap-3">
              {user ? (
                <>
                  <span className="text-sm text-neutral-500">
                    {(user.user_metadata?.full_name as string | undefined) ?? user.email}
                  </span>
                  <form action={signOutAction}>
                    <button type="submit" className="text-sm text-neutral-600 hover:text-neutral-900 underline">
                      Sign out
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-sm text-neutral-600 hover:text-neutral-900">
                    Sign in
                  </Link>
                  <Link href="/signup" className="text-sm text-neutral-600 hover:text-neutral-900">
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
        <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
      </body>
    </html>
  );
}
