"use client";

export default function AuditError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
      <p className="text-red-800 font-medium mb-1">Something went wrong loading the audit trail.</p>
      <p className="text-red-600 text-sm mb-4">{error.message}</p>
      <button
        onClick={() => reset()}
        className="rounded-md bg-red-600 text-white px-4 py-2 text-sm font-medium hover:bg-red-700"
      >
        Try again
      </button>
    </div>
  );
}
