export default function BlogLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="h-9 w-48 animate-pulse rounded bg-[var(--bg-elevated)]" />
      <div className="mt-2 h-5 w-96 max-w-full animate-pulse rounded bg-[var(--bg-elevated)]" />
      <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)]">
            <div className="aspect-[16/10] animate-pulse bg-[var(--bg-elevated)]" />
            <div className="p-4 space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-[var(--bg-elevated)]" />
              <div className="h-5 w-full animate-pulse rounded bg-[var(--bg-elevated)]" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-[var(--bg-elevated)]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
