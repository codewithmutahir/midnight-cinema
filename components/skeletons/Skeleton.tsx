"use client";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/**
 * Base skeleton block. Use for any rectangular placeholder.
 * Uses theme-aware background and pulse animation.
 */
export function Skeleton({ className = "", ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-[var(--bg-elevated)] ${className}`.trim()}
      aria-hidden
      {...props}
    />
  );
}
