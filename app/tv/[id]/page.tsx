import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  fetchTVDetails,
  fetchTVCredits,
  fetchSimilarTV,
  fetchTVVideos,
  fetchTVWatchProviders,
  fetchTVExternalIds,
  fetchTVReviews,
  TMDB_IMAGE_BASE,
} from "@/lib/tmdb";
import type { CastMember } from "@/types/movie";
import type { TVDetails } from "@/types/tv";
import { TVDetailContent } from "./TVDetailContent";

const DEFAULT_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://midnight-cinema.vercel.app";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getTV(id: number) {
  try {
    return await fetchTVDetails(id);
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
  const tvId = parseInt(id, 10);
  if (Number.isNaN(tvId)) return { title: "Show not found" };

  const tv = await getTV(tvId);
  if (!tv) return { title: "Show not found" };

  const title = `${tv.name} (${tv.first_air_date ? new Date(tv.first_air_date).getFullYear() : ""})`;
  const description =
    tv.overview?.slice(0, 160) ?? `Discover ${tv.name} on Midnight Cinema.`;
  const ogImage = tv.poster_path
    ? `${TMDB_IMAGE_BASE}/w500${tv.poster_path}`
    : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ogImage ? [{ url: ogImage, width: 500, height: 750 }] : [],
      type: "website",
      url: `${DEFAULT_SITE_URL}/tv/${tv.id}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : [],
    },
    alternates: { canonical: `${DEFAULT_SITE_URL}/tv/${tv.id}` },
  };
}

export default async function TVPage({ params }: PageProps) {
  const { id } = await params;
  const tvId = parseInt(id, 10);
  if (Number.isNaN(tvId)) notFound();

  const [tv, credits, similar, videos, watchProvidersRes, externalIds, reviewsRes] =
    await Promise.all([
      getTV(tvId),
      fetchTVCredits(tvId).catch(() => null),
      fetchSimilarTV(tvId).catch(() => ({ results: [] })),
      fetchTVVideos(tvId).catch(() => null),
      fetchTVWatchProviders(tvId).catch(() => null),
      fetchTVExternalIds(tvId).catch(() => null),
      fetchTVReviews(tvId).catch(() => ({ results: [], total_results: 0 })),
    ]);

  if (!tv) notFound();

  const cast = credits?.cast ?? [];
  const trailerKey = getTrailerKey(videos?.results);
  const watchProviders = watchProvidersRes?.results?.US ?? null;
  const reviews = reviewsRes?.results ?? [];

  return (
    <TVDetailContent
      show={tv}
      cast={cast}
      similarShows={similar.results}
      trailerKey={trailerKey}
      watchProviders={watchProviders}
      externalIds={externalIds ?? undefined}
      reviews={reviews}
      reviewsTotalCount={reviewsRes?.total_results ?? 0}
    />
  );
}
