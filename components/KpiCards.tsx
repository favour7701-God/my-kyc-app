export function KpiCards({
  total,
  fullyVerifiedPct,
  pendingReviews,
  flagged,
}: {
  total: number;
  fullyVerifiedPct: number;
  pendingReviews: number;
  flagged: number;
}) {
  const items = [
    { label: "Total clients", value: total },
    { label: "Fully verified", value: `${fullyVerifiedPct}%` },
    { label: "Pending reviews", value: pendingReviews },
    { label: "Flagged", value: flagged },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border border-neutral-200 bg-white p-4">
          <div className="text-2xl font-semibold tabular-nums">{item.value}</div>
          <div className="text-xs text-neutral-500 mt-1">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
