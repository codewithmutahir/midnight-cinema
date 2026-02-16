"use client";

import { Skeleton } from "./Skeleton";

/**
 * Full-page detail skeleton: hero (backdrop + poster + title block) and content area.
 * Matches movie/tv detail layout.
 */
export function DetailHeroSkeleton() {
  return (
    <div className="bg-[var(--black)]">
      {/* Hero */}
      <section className="relative flex min-h-[85vh] min-h-[600px] flex-col justify-end pb-16 pt-20">
        <div className="absolute inset-0 overflow-hidden">
          <Skeleton className="h-full w-full rounded-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" aria-hidden />
        </div>
        <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-8">
          <div className="flex justify-center lg:col-span-3 lg:justify-end">
            <Skeleton className="aspect-[2/3] w-full max-w-[300px] rounded-lg lg:max-w-none" />
          </div>
          <div className="lg:col-span-9 lg:flex lg:flex-col lg:justify-end">
            <div className="max-w-2xl space-y-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-3/4 sm:h-12" />
              <Skeleton className="h-5 w-1/2" />
              <div className="flex flex-wrap gap-3">
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-8 w-32 rounded-full" />
                <Skeleton className="h-8 w-28 rounded-full" />
              </div>
              <div className="flex gap-4 pt-4">
                <Skeleton className="h-12 w-36 rounded-lg" />
                <Skeleton className="h-12 w-40 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Content area */}
      <div className="bg-black py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <Skeleton className="mb-4 h-8 w-40" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-4/5" />
              </div>
            </div>
            <aside>
              <Skeleton className="h-64 w-full rounded-lg" />
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
