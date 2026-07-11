export function MissingFieldBanner({ issues }: { issues: string[] }) {
  if (issues.length === 0) return null;

  return (
    <div className="rounded-md bg-amber-50 border border-amber-200 px-4 py-3 mb-6">
      <p className="text-sm font-medium text-amber-900 mb-1">This record is incomplete:</p>
      <ul className="text-sm text-amber-800 list-disc list-inside space-y-0.5">
        {issues.map((issue) => (
          <li key={issue}>{issue}</li>
        ))}
      </ul>
    </div>
  );
}
