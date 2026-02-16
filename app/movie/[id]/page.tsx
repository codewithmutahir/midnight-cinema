import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  fetchMovieDetails,
  fetchMovieCredits,
  fetchSimilarMovies,
  fetchMovieVideos,
  fetchMovieWatchProviders,
  fetchMovieExternalIds,
  fetchMovieReviews,
  TMDB_IMAGE_BASE,
} from "@/lib/tmdb";
import type { MovieDetails, CastMember } from "@/types/movie";
import { MovieDetailContent } from "./MovieDetailContent";

const DEFAULT_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://midnight-cinema.vercel.app";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getMovie(id: number) {
  try {
    return await fetchMovieDetails(id);
  } catch {
    return null;
  }
}

function getTrailerKey(
  results: Array<{ site: string; type: string; key: string }> | undefined
): string | null {
  if (!results?.length) return null;
  const trailer = results.find(
    (v) =>
      v.site === "YouTube" &&
      (v.type === "Trailer" || v.type === "Teaser")
  );
  return trailer?.key ?? null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const movieId = parseInt(id, 10);
  if (Number.isNaN(movieId)) return { title: "Movie not found" };

  const movie = await getMovie(movieId);
  if (!movie) return { title: "Movie not found" };

  const title = `${movie.title} (${movie.release_date ? new Date(movie.release_date).getFullYear() : ""})`;
  const description =
    movie.overview?.slice(0, 160) ?? `Discover ${movie.title} on Midnight Cinema.`;
  const ogImage = movie.poster_path
    ? `${TMDB_IMAGE_BASE}/w500${movie.poster_path}`
    : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ogImage ? [{ url: ogImage, width: 500, height: 750 }] : [],
      type: "website",
      url: `${DEFAULT_SITE_URL}/movie/${movie.id}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : [],
    },
    alternates: { canonical: `${DEFAULT_SITE_URL}/movie/${movie.id}` },
  };
}

function MovieJsonLd({ movie, cast }: { movie: MovieDetails; cast: CastMember[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Movie",
    name: movie.title,
    description: movie.overview ?? undefined,
    image: movie.poster_path ? `${TMDB_IMAGE_BASE}/w500${movie.poster_path}` : undefined,
    datePublished: movie.release_date || undefined,
    aggregateRating: movie.vote_count
      ? {
          "@type": "AggregateRating",
          ratingValue: movie.vote_average,
          bestRating: 10,
          worstRating: 0,
          ratingCount: movie.vote_count,
        }
      : undefined,
    genre: movie.genres?.map((g) => g.name) ?? [],
    duration: movie.runtime ? `PT${movie.runtime}M` : undefined,
    actor: cast.slice(0, 5).map((c) => ({
      "@type": "Person",
      name: c.name,
      characterName: c.character,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default async function MoviePage({ params }: PageProps) {
  const { id } = await params;
  const movieId = parseInt(id, 10);
  if (Number.isNaN(movieId)) notFound();

  const [movie, credits, similar, videos, watchProvidersRes, externalIds, reviewsRes] =
    await Promise.all([
      getMovie(movieId),
      fetchMovieCredits(movieId).catch(() => null),
      fetchSimilarMovies(movieId).catch(() => ({ results: [] })),
      fetchMovieVideos(movieId).catch(() => null),
      fetchMovieWatchProviders(movieId).catch(() => null),
      fetchMovieExternalIds(movieId).catch(() => null),
      fetchMovieReviews(movieId).catch(() => ({ results: [], total_results: 0 })),
    ]);

  if (!movie) notFound();

  const cast = credits?.cast ?? [];
  const trailerKey = getTrailerKey(videos?.results);
  const watchProviders = watchProvidersRes?.results?.US ?? null;
  const reviews = reviewsRes?.results ?? [];

  return (
    <>
      <MovieJsonLd movie={movie} cast={cast} />
      <MovieDetailContent
        movie={movie}
        cast={cast}
        similarMovies={similar.results}
        trailerKey={trailerKey}
        watchProviders={watchProviders}
        externalIds={externalIds ?? undefined}
        reviews={reviews}
        reviewsTotalCount={reviewsRes?.total_results ?? 0}
      />
    </>
  );
}
