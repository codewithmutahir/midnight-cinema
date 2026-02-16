import Link from "next/link";
import type { MovieListItem } from "@/types/movie";
import { MovieCard } from "./MovieCard";
import { ScrollRowArrows } from "./ScrollRowArrows";

interface MovieRowProps {
  title: string;
  movies: MovieListItem[];
  /** Link for "See all" (e.g. /genre/28). Omit to hide. */
  seeAllHref?: string;
  /** Optional aria-label for the row. */
  ariaLabel?: string;
}

export function MovieRow({
  title,
  movies,
  seeAllHref,
  ariaLabel,
}: MovieRowProps) {
  if (movies.length === 0) return null;

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
        {movies.map((movie) => (
          <div
            key={movie.id}
            className="w-36 shrink-0 sm:w-40 md:w-44"
          >
            <MovieCard movie={movie} />
          </div>
        ))}
      </ScrollRowArrows>
    </section>
  );
}
