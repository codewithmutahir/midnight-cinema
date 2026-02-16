import Link from "next/link";
import type { TVListItem } from "@/types/tv";
import { TVCard } from "./TVCard";
import { ScrollRowArrows } from "./ScrollRowArrows";

interface TVRowProps {
  title: string;
  shows: TVListItem[];
  seeAllHref?: string;
  ariaLabel?: string;
}

export function TVRow({ title, shows, seeAllHref, ariaLabel }: TVRowProps) {
  if (shows.length === 0) return null;

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
        {shows.map((show) => (
          <div key={show.id} className="w-36 shrink-0 sm:w-40 md:w-44">
            <TVCard show={show} />
          </div>
        ))}
      </ScrollRowArrows>
    </section>
  );
}
