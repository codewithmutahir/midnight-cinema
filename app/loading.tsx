import { RowSkeleton } from "@/components/skeletons";

export default function RootLoading() {
  return (
    <div className="flex flex-col">
      <div className="h-[min(75vh,640px)] w-full animate-pulse bg-[var(--bg-secondary)]" />
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <RowSkeleton cardCount={6} />
      </div>
    </div>
  );
}
