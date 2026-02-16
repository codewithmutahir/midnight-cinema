"use client";

import { Skeleton } from "./Skeleton";

/** Watch Together page skeleton: title + two form-style cards. */
export function WatchTogetherSkeleton() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <Skeleton className="h-9 w-64 sm:h-10 sm:w-72" />
      <Skeleton className="mt-2 h-4 w-full max-w-md" />
      <div className="mt-10 space-y-10">
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 space-y-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-11 w-full rounded-lg" />
          <Skeleton className="h-11 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 space-y-4">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-11 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
        <Skeleton className="mx-auto h-4 w-56" />
      </div>
    </div>
  );
}
