import Image from "next/image";
import Link from "next/link";
import type { MovieListItem } from "@/types/movie";
import { getBackdropUrl, getPosterUrl } from "@/lib/tmdb";

interface HeroProps {
  movie: MovieListItem;
}

export function Hero({ movie }: HeroProps) {
  const backdropUrl = getBackdropUrl(movie.backdrop_path, "w1280");
  const posterUrl = getPosterUrl(movie.poster_path, "w500");

  return (
    <section className="relative h-[min(75vh,640px)] w-full overflow-hidden">
      <div className="absolute inset-0 bg-[var(--bg-secondary)]">
        {backdropUrl ? (
          <Image
            src={backdropUrl}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-card)] to-[var(--bg-primary)]" />
        )}
        <div className="absolute inset-0 gradient-hero-left" />
        <div className="absolute inset-0 gradient-hero-bottom" />
        <div className="grain absolute inset-0" />
      </div>

      <div className="relative z-10 flex h-full items-end px-4 pb-12 pt-20 sm:px-6 sm:pb-16 lg:px-8 lg:pb-20">
        <div className="mx-auto w-full max-w-7xl">
          <div className="flex max-w-2xl flex-col gap-4 sm:gap-5">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
              Trending now
            </span>
            <h1 className="font-display text-4xl leading-[1.1] tracking-wide text-[var(--text-primary)] sm:text-5xl md:text-6xl lg:text-7xl">
              <Link
                href={`/movie/${movie.id}`}
                className="hover:opacity-90 transition-opacity"
              >
                {movie.title}
              </Link>
            </h1>
            {movie.overview && (
              <p className="line-clamp-3 max-w-xl text-sm text-[var(--text-muted)] sm:text-base">
                {movie.overview}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--text-muted)]">
              {movie.release_date && (
                <span>{new Date(movie.release_date).getFullYear()}</span>
              )}
              <span className="flex items-center gap-1.5">
                <span className="text-[var(--accent)]" aria-hidden>★</span>
                <span>{movie.vote_average.toFixed(1)}</span>
              </span>
            </div>
            <Link
              href={`/movie/${movie.id}`}
              className="mt-1 inline-flex w-fit items-center rounded-md bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-[var(--accent-hover)] hover:shadow-[0_0_20px_var(--accent-glow)]"
            >
              View details
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
