import { GridSkeleton } from "@/components/skeletons";

export default function SearchLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="h-10 w-48 animate-pulse rounded bg-[var(--bg-elevated)]" aria-hidden />
        <div className="h-10 max-w-md flex-1 animate-pulse rounded bg-[var(--bg-elevated)] sm:max-w-sm" aria-hidden />
      </div>
      <GridSkeleton title={false} count={12} cols={4} />
    </div>
  );
}
