"use client";

import { Skeleton } from "./Skeleton";
import { CardSkeleton } from "./CardSkeleton";

interface GridSkeletonProps {
  /** Page title + subtitle then grid */
  title?: boolean;
  /** Number of cards in grid. Default 10. */
  count?: number;
  /** Grid cols: 2,3,4,5. Default matches watchlist/history. */
  cols?: 2 | 3 | 4 | 5;
}

/**
 * Page-level skeleton: optional title block + grid of card skeletons.
 * Use for watchlist, history, search results.
 */
export function GridSkeleton({ title = true, count = 10, cols = 5 }: GridSkeletonProps) {
  const gridClass =
    cols === 2
      ? "grid-cols-2"
      : cols === 3
        ? "grid-cols-2 sm:grid-cols-3"
        : cols === 4
          ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
          : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {title && (
        <div className="space-y-2">
          <Skeleton className="h-9 w-64 sm:h-10 sm:w-72" />
          <Skeleton className="h-4 w-48" />
        </div>
      )}
      <div className={`mt-8 grid gap-4 ${gridClass}`}>
        {Array.from({ length: count }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
