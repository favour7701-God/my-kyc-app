import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "my-kyc-app",
  description: "Shared KYC workflow tool for compliance teams",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
          </div>
        </nav>
        <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
      </body>
    </html>
  );
}
