import type { Metadata } from "next";
import { Suspense } from "react";
import { MovieGrid } from "@/components/MovieGrid";
import { Pagination } from "@/components/Pagination";
import { TVGrid } from "@/components/TVGrid";
import { searchMulti } from "@/lib/tmdb";
import type { MovieListItem } from "@/types/movie";
import type { TVListItem } from "@/types/tv";
import { SearchForm } from "./SearchForm";

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export const revalidate = 300;

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const title = q ? `Search: ${q}` : "Search";
  return {
    title,
    description: q
      ? `Search results for "${q}" — movies and TV shows on Midnight Cinema.`
      : "Search for movies and TV shows by title.",
    robots: q ? "index, follow" : "noindex, follow",
  };
}

function multiToMovies(results: Awaited<ReturnType<typeof searchMulti>>["results"]): MovieListItem[] {
  return results
    .filter((r): r is typeof r & { media_type: "movie" } => r.media_type === "movie")
    .map((r) => ({
      id: r.id,
      title: r.title ?? "",
      poster_path: r.poster_path,
      backdrop_path: r.backdrop_path,
      overview: r.overview,
      release_date: r.release_date ?? "",
      vote_average: r.vote_average,
      vote_count: r.vote_count,
      genre_ids: r.genre_ids,
    }));
}

function multiToTV(results: Awaited<ReturnType<typeof searchMulti>>["results"]): TVListItem[] {
  return results
    .filter((r): r is typeof r & { media_type: "tv" } => r.media_type === "tv")
    .map((r) => ({
      id: r.id,
      name: r.name ?? "",
      poster_path: r.poster_path,
      backdrop_path: r.backdrop_path,
      overview: r.overview,
      first_air_date: r.first_air_date ?? "",
      vote_average: r.vote_average,
      vote_count: r.vote_count,
      genre_ids: r.genre_ids,
    }));
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q, page: pageParam } = await searchParams;
  const query = (q ?? "").trim();
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));

  const hasQuery = query.length > 0;

  let movieResults: MovieListItem[] = [];
  let tvResults: TVListItem[] = [];
  let totalPages = 0;
  let totalResults = 0;

  if (hasQuery) {
    const data = await searchMulti(query, page);
    movieResults = multiToMovies(data.results);
    tvResults = multiToTV(data.results);
    totalPages = data.total_pages;
    totalResults = data.total_results;
  }

  const hasResults = movieResults.length > 0 || tvResults.length > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="font-display text-3xl tracking-wide text-[var(--text-primary)] sm:text-4xl">
          Search
        </h1>
        <p className="mt-1 text-[var(--text-muted)]">
          Find movies and TV shows by title.
        </p>
        <Suspense fallback={<div className="mt-4 h-12 w-72 animate-pulse rounded-lg bg-[var(--bg-elevated)]" />}>
          <SearchForm initialQuery={query} />
        </Suspense>
      </header>

      {!hasQuery && (
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-12 text-center">
          <p className="text-[var(--text-muted)]">
            Use the search bar above — try a title or browse recent and popular suggestions.
          </p>
        </div>
      )}

      {hasQuery && !hasResults && (
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-12 text-center">
          <p className="text-[var(--text-muted)]">
            No results for &quot;{query}&quot;. Try a different search.
          </p>
        </div>
      )}

      {hasQuery && hasResults && (
        <>
          <p className="mb-6 text-sm text-[var(--text-muted)]">
            {totalResults.toLocaleString()} result{totalResults !== 1 ? "s" : ""} for
            &quot;{query}&quot;
          </p>
          {movieResults.length > 0 && (
            <section className="mb-10">
              <h2 className="font-display text-xl text-[var(--text-primary)] mb-4">Movies</h2>
              <MovieGrid movies={movieResults} label="Movies" />
            </section>
          )}
          {tvResults.length > 0 && (
            <section className="mb-10">
              <h2 className="font-display text-xl text-[var(--text-primary)] mb-4">TV shows</h2>
              <TVGrid shows={tvResults} label="TV shows" />
            </section>
          )}

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            getPageHref={(p) =>
              p === 1
                ? `/search?q=${encodeURIComponent(query)}`
                : `/search?q=${encodeURIComponent(query)}&page=${p}`
            }
            ariaLabel="Search results pagination"
          />
        </>
      )}
    </div>
  );
}
