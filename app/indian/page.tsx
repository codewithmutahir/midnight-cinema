import type { Metadata } from "next";
import Link from "next/link";
import { MovieRow } from "@/components/MovieRow";
import { TVRow } from "@/components/TVRow";
import {
  fetchIndianMovies,
  fetchIndianTV,
} from "@/lib/tmdb";

const ROW_SIZE = 12;

/** Indian cinema genre rows (Bollywood & Indian — same TMDb genre IDs as movies). */
const INDIAN_GENRES = [
  { id: 35, name: "Comedy" },
  { id: 18, name: "Drama" },
  { id: 10749, name: "Romance" },
  { id: 28, name: "Action" },
  { id: 53, name: "Thriller" },
];

export const metadata: Metadata = {
  title: "Indian cinema",
  description:
    "Discover Bollywood and Indian movies and TV shows. A separate collection from international cinema.",
  openGraph: {
    title: "Indian cinema | Midnight Cinema",
    description: "Bollywood & Indian movies and TV — discover what to watch.",
  },
};

export const revalidate = 3600;

export default async function IndianPage() {
  const [
    popularMoviesRes,
    popularTVRes,
    comedyRes,
    dramaRes,
    romanceRes,
  ] = await Promise.all([
    fetchIndianMovies(1).catch(() => ({ results: [] as Awaited<ReturnType<typeof fetchIndianMovies>>["results"] })),
    fetchIndianTV(1).catch(() => ({ results: [] as Awaited<ReturnType<typeof fetchIndianTV>>["results"] })),
    fetchIndianMovies(1, 35).catch(() => ({ results: [] as Awaited<ReturnType<typeof fetchIndianMovies>>["results"] })),
    fetchIndianMovies(1, 18).catch(() => ({ results: [] as Awaited<ReturnType<typeof fetchIndianMovies>>["results"] })),
    fetchIndianMovies(1, 10749).catch(() => ({ results: [] as Awaited<ReturnType<typeof fetchIndianMovies>>["results"] })),
  ]);

  const popularMovies = popularMoviesRes.results.slice(0, ROW_SIZE);
  const popularTV = popularTVRes.results.slice(0, ROW_SIZE);
  const genreRows = [
    { title: "Indian comedy", results: comedyRes.results.slice(0, ROW_SIZE), id: 35 },
    { title: "Indian drama", results: dramaRes.results.slice(0, ROW_SIZE), id: 18 },
    { title: "Indian romance", results: romanceRes.results.slice(0, ROW_SIZE), id: 10749 },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10">
        <nav className="mb-4 text-sm">
          <Link
            href="/"
            className="text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]"
          >
            ← Home
          </Link>
        </nav>
        <h1 className="font-display text-3xl tracking-wide text-[var(--text-primary)] sm:text-4xl">
          Indian cinema
        </h1>
        <p className="mt-2 max-w-2xl text-[var(--text-muted)]">
          Bollywood and Indian movies &amp; TV — separate from international. Browse by genre below.
        </p>
      </header>

      <div className="space-y-10">
        {popularMovies.length > 0 && (
          <MovieRow
            title="Popular Indian movies"
            movies={popularMovies}
            ariaLabel="Popular Indian movies"
          />
        )}

        {popularTV.length > 0 && (
          <TVRow
            title="Popular Indian TV"
            shows={popularTV}
            ariaLabel="Popular Indian TV shows"
          />
        )}

        {genreRows.map((row) =>
          row.results.length > 0 ? (
            <MovieRow
              key={row.id}
              title={row.title}
              movies={row.results}
              seeAllHref={`/indian/genre/${row.id}`}
              ariaLabel={row.title}
            />
          ) : null
        )}
      </div>

      {popularMovies.length === 0 && popularTV.length === 0 && (
        <p className="py-12 text-center text-[var(--text-muted)]">
          No Indian titles loaded. Try again later or check your TMDb API key.
        </p>
      )}
    </div>
  );
}
