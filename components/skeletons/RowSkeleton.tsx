"use client";

import { Skeleton } from "./Skeleton";
import { CardSkeleton } from "./CardSkeleton";

/** Horizontal row of card skeletons with section title. Matches MovieRow/TVRow. */
export function RowSkeleton({ cardCount = 6 }: { cardCount?: number }) {
  return (
    <section className="w-full" aria-hidden>
      <div className="flex items-end justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-48 sm:h-9 sm:w-56" />
      </div>
      <div className="mt-3 flex gap-4 overflow-hidden px-4 pb-2 pt-1 sm:px-6 lg:px-8">
        <div className="min-w-[16px] shrink-0 sm:min-w-[24px]" />
        {Array.from({ length: cardCount }).map((_, i) => (
          <div key={i} className="w-36 shrink-0 sm:w-40 md:w-44">
            <CardSkeleton />
          </div>
        ))}
        <div className="min-w-[16px] shrink-0 sm:min-w-[24px]" />
      </div>
    </section>
  );
}
