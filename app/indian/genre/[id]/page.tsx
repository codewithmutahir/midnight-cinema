import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MovieGrid } from "@/components/MovieGrid";
import { Pagination } from "@/components/Pagination";
import { fetchIndianMovies, fetchGenreList } from "@/lib/tmdb";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}

export const revalidate = 3600;

async function getGenreName(id: number): Promise<string | null> {
  const { genres } = await fetchGenreList();
  return genres.find((g) => g.id === id)?.name ?? null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const genreId = parseInt(id, 10);
  if (Number.isNaN(genreId)) return { title: "Indian genre" };

  const name = await getGenreName(genreId);
  const title = name ? `Indian ${name} movies` : "Indian cinema — genre";
  const description = name
    ? `Bollywood & Indian ${name.toLowerCase()} movies. Separate from international.`
    : "Indian cinema by genre.";

  return {
    title,
    description,
    openGraph: { title, description },
  };
}

export default async function IndianGenrePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { page: pageParam } = await searchParams;
  const genreId = parseInt(id, 10);
  if (Number.isNaN(genreId)) notFound();

  const genreName = await getGenreName(genreId);
  if (!genreName) notFound();

  const page = Math.max(1, parseInt(pageParam ?? "1", 10));
  const { results, total_pages, total_results } = await fetchIndianMovies(
    page,
    genreId
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-4 text-sm">
        <Link
          href="/indian"
          className="text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]"
        >
          ← Indian cinema
        </Link>
      </nav>
      <header className="mb-8">
        <h1 className="font-display text-3xl tracking-wide text-[var(--text-primary)] sm:text-4xl">
          Indian {genreName.toLowerCase()} movies
        </h1>
        <p className="mt-1 text-[var(--text-muted)]">
          {total_results.toLocaleString()} Indian movies · Bollywood &amp; Indian only
        </p>
      </header>

      <MovieGrid movies={results} label={`Indian ${genreName} movies`} />

      <Pagination
        currentPage={page}
        totalPages={total_pages}
        getPageHref={(p) =>
          p === 1 ? `/indian/genre/${genreId}` : `/indian/genre/${genreId}?page=${p}`
        }
        ariaLabel="Indian genre pagination"
      />
    </div>
  );
}
