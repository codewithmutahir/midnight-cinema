import type { TVListItem } from "@/types/tv";
import { TVCard } from "./TVCard";

interface TVGridProps {
  shows: TVListItem[];
  label?: string;
}

export function TVGrid({ shows, label = "TV shows" }: TVGridProps) {
  if (shows.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--muted)] bg-[var(--bg-card)] p-12 text-center">
        <p className="text-[var(--text-muted)]">No TV shows found.</p>
      </div>
    );
  }

  return (
    <ul
      className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
      aria-label={label}
    >
      {shows.map((show) => (
        <li key={show.id}>
          <TVCard show={show} />
        </li>
      ))}
    </ul>
  );
}
