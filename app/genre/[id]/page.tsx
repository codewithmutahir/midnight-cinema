import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MovieGrid } from "@/components/MovieGrid";
import { Pagination } from "@/components/Pagination";
import { fetchMoviesByGenre, fetchGenreList } from "@/lib/tmdb";

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
  if (Number.isNaN(genreId)) return { title: "Genre" };

  const name = await getGenreName(genreId);
  const title = name ? `${name} Movies` : "Genre";
  const description = name
    ? `Discover popular ${name.toLowerCase()} movies. Browse and find your next watch.`
    : "Browse movies by genre.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://midnight-cinema.vercel.app"}/genre/${genreId}`,
    },
  };
}

export default async function GenrePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { page: pageParam } = await searchParams;
  const genreId = parseInt(id, 10);
  if (Number.isNaN(genreId)) notFound();

  const genreName = await getGenreName(genreId);
  if (!genreName) notFound();

  const page = Math.max(1, parseInt(pageParam ?? "1", 10));
  const { results, total_pages, total_results } = await fetchMoviesByGenre(
    genreId,
    page
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="font-display text-3xl tracking-wide text-[var(--text-primary)] sm:text-4xl">
          {genreName} movies
        </h1>
        <p className="mt-1 text-[var(--text-muted)]">
          {total_results.toLocaleString()} movies
        </p>
      </header>

      <MovieGrid movies={results} label={`${genreName} movies`} />

      <Pagination
        currentPage={page}
        totalPages={total_pages}
        getPageHref={(p) => (p === 1 ? `/genre/${genreId}` : `/genre/${genreId}?page=${p}`)}
        ariaLabel="Genre movies pagination"
      />
    </div>
  );
}
