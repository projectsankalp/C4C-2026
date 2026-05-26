export default function FoundationLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-72 animate-pulse rounded-lg bg-slate-200" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
      <div className="h-6 w-48 animate-pulse rounded bg-slate-200" />
      <div className="grid gap-3 sm:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
    </div>
  );
}
