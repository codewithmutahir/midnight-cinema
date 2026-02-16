import type { MovieListItem } from "@/types/movie";
import { MovieCard } from "./MovieCard";

interface MovieGridProps {
  movies: MovieListItem[];
  /** Optional aria-label for the grid. */
  label?: string;
}

export function MovieGrid({ movies, label = "Movies" }: MovieGridProps) {
  if (movies.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--muted)] bg-[var(--bg-card)] p-12 text-center">
        <p className="text-[var(--text-muted)]">No movies found.</p>
      </div>
    );
  }

  return (
    <ul
      className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
      aria-label={label}
    >
      {movies.map((movie) => (
        <li key={movie.id}>
          <MovieCard movie={movie} />
        </li>
      ))}
    </ul>
  );
}
