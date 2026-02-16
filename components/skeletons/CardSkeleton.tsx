"use client";

import { Skeleton } from "./Skeleton";

/**
 * Poster card skeleton (aspect 2/3 + title line). Matches MovieCard/TVCard/HistoryCard.
 */
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Skeleton className="aspect-[2/3] w-full rounded-lg" />
      <div className="mt-3 space-y-2 px-0.5">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}
