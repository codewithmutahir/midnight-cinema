"use client";

import Link from "next/link";
import type { WatchHistoryItem } from "@/hooks/useWatchHistory";
import { HistoryCard } from "./HistoryCard";
import { ScrollRowArrows } from "./ScrollRowArrows";

interface HistoryRowProps {
  title: string;
  items: WatchHistoryItem[];
  seeAllHref?: string;
  ariaLabel?: string;
}

export function HistoryRow({ title, items, seeAllHref, ariaLabel }: HistoryRowProps) {
  if (items.length === 0) return null;

  return (
    <section className="w-full" aria-label={ariaLabel ?? title}>
      <div className="flex items-end justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <h2 className="font-display text-2xl tracking-wide text-[var(--text-primary)] sm:text-3xl">
          {title}
        </h2>
        {seeAllHref && (
          <Link
            href={seeAllHref}
            className="text-sm font-medium text-[var(--accent)] transition-colors hover:text-[var(--accent-hover)]"
          >
            See all
          </Link>
        )}
      </div>
      <ScrollRowArrows className="mt-3" ariaLabel={ariaLabel ?? title}>
        {items.map((item) => (
          <div key={item.id} className="w-36 shrink-0 sm:w-40 md:w-44">
            <HistoryCard item={item} />
          </div>
        ))}
      </ScrollRowArrows>
    </section>
  );
}
