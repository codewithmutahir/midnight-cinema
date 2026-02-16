"use client";

import { Skeleton } from "./Skeleton";

/** Profile page skeleton: avatar + name + links block. */
export function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <Skeleton className="h-9 w-32" />
      <div className="mt-8 flex flex-col items-start gap-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 sm:flex-row sm:items-center">
        <Skeleton className="h-24 w-24 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <div className="mt-8 space-y-2">
        <Skeleton className="h-6 w-28" />
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] p-2 space-y-1">
          <Skeleton className="h-12 w-full rounded-md" />
          <Skeleton className="h-12 w-full rounded-md" />
        </div>
      </div>
    </div>
  );
}
