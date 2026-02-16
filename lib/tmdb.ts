/**
 * TMDb API client for server-side data fetching.
 * Uses fetch with Next.js revalidation; respects rate limits and handles errors.
 */

const BASE_URL = "https://api.themoviedb.org/3";

function getApiKey(): string {
  const key = process.env.TMDB_API_KEY;
  if (!key) {
    throw new Error("TMDB_API_KEY is not set in .env.local");
  }
  return key;
}

export interface TMDbFetchOptions {
  /** Revalidate in seconds (ISR). Default 3600 (1 hour). */
  revalidate?: number;
  /** Query params appended to the request. */
  params?: Record<string, string | number | undefined>;
}

/**
 * Server-side fetch wrapper for TMDb API.
 * Uses Next.js fetch cache and revalidation.
 */
async function tmdbFetch<T>(
  endpoint: string,
  options: TMDbFetchOptions = {}
): Promise<T> {
  const { revalidate = 3600, params = {} } = options;
  const apiKey = getApiKey();

  const searchParams = new URLSearchParams({ api_key: apiKey });
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") searchParams.set(k, String(v));
  });

  const url = `${BASE_URL}${endpoint}?${searchParams.toString()}`;

  const res = await fetch(url, {
    next: { revalidate },
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`TMDb API error ${res.status}: ${text.slice(0, 200)}`);
  }

  return res.json() as Promise<T>;
}

/** Image base URLs (secure). */
export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";
export const POSTER_SIZES = ["w92", "w154", "w185", "w342", "w500", "w780", "original"] as const;
export const BACKDROP_SIZES = ["w300", "w780", "w1280", "original"] as const;
export const PROFILE_SIZES = ["w45", "w185", "h632", "original"] as const;

export function getPosterUrl(path: string | null, size: (typeof POSTER_SIZES)[number] = "w342"): string {
  if (!path) return "/placeholder-poster.svg";
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function getBackdropUrl(path: string | null, size: (typeof BACKDROP_SIZES)[number] = "w1280"): string {
  if (!path) return "";
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function getProfileUrl(path: string | null, size: (typeof PROFILE_SIZES)[number] = "w185"): string {
  if (!path) return "/placeholder-avatar.svg";
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

import type {
  MovieDetails,
  MovieListItem,
  TMDbCreditsResponse,
  TMDbGenreListResponse,
  TMDbPaginatedResponse,
  MovieWatchProvidersResponse,
  MovieExternalIds,
  MovieReviewsResponse,
} from "@/types/movie";
import type { TVDetails, TVListItem } from "@/types/tv";

/** Trending movies (day or week). */
export function fetchTrendingMovies(page = 1, timeWindow: "day" | "week" = "week") {
  return tmdbFetch<TMDbPaginatedResponse<MovieListItem>>(`/trending/movie/${timeWindow}`, {
    params: { page },
    revalidate: 3600,
  });
}

/** Movie details by ID. */
export function fetchMovieDetails(id: number) {
  return tmdbFetch<MovieDetails>(`/movie/${id}`, { revalidate: 86400 });
}

/** Movie credits (cast/crew). */
export function fetchMovieCredits(id: number) {
  return tmdbFetch<TMDbCreditsResponse>(`/movie/${id}/credits`, { revalidate: 86400 });
}

/** Movie watch providers (stream / rent / buy by country). Use watch_region for a specific country (e.g. US). */
export function fetchMovieWatchProviders(movieId: number, watchRegion = "US") {
  return tmdbFetch<MovieWatchProvidersResponse>(`/movie/${movieId}/watch/providers`, {
    params: { watch_region: watchRegion },
    revalidate: 86400,
  });
}

/** Provider logo URL (TMDb image base + path). */
export function getProviderLogoUrl(logoPath: string | null, size = "w92"): string {
  if (!logoPath) return "/placeholder-poster.svg";
  return `${TMDB_IMAGE_BASE}/${size}${logoPath}`;
}

/** Discover movies by genre with pagination. */
export function fetchMoviesByGenre(genreId: number, page = 1) {
  return tmdbFetch<TMDbPaginatedResponse<MovieListItem>>("/discover/movie", {
    params: { with_genres: genreId, page, sort_by: "popularity.desc" },
    revalidate: 3600,
  });
}

/** Search movies by query. */
export function searchMovies(query: string, page = 1) {
  return tmdbFetch<TMDbPaginatedResponse<MovieListItem>>("/search/movie", {
    params: { query, page },
    revalidate: 300,
  });
}

/** Genre list (for nav/SEO). */
export function fetchGenreList() {
  return tmdbFetch<TMDbGenreListResponse>("/genre/movie/list", { revalidate: 86400 });
}

/** Top rated movies (for discovery rows). */
export function fetchTopRatedMovies(page = 1) {
  return tmdbFetch<TMDbPaginatedResponse<MovieListItem>>("/movie/top_rated", {
    params: { page },
    revalidate: 3600,
  });
}

/** Similar movies for a given movie. */
export function fetchSimilarMovies(movieId: number, page = 1) {
  return tmdbFetch<TMDbPaginatedResponse<MovieListItem>>(`/movie/${movieId}/similar`, {
    params: { page },
    revalidate: 3600,
  });
}

export interface TMDbVideoResult {
  id: string;
  key: string;
  site: string;
  type: string;
  name: string;
}

export interface TMDbVideosResponse {
  id: number;
  results: TMDbVideoResult[];
}

/** Movie videos (trailers, teasers). */
export function fetchMovieVideos(movieId: number) {
  return tmdbFetch<TMDbVideosResponse>(`/movie/${movieId}/videos`, { revalidate: 86400 });
}

/** Movie external IDs (IMDb, social handles, etc.). */
export function fetchMovieExternalIds(movieId: number) {
  return tmdbFetch<MovieExternalIds>(`/movie/${movieId}/external_ids`, { revalidate: 86400 });
}

/** Movie reviews (from TMDb). */
export function fetchMovieReviews(movieId: number, page = 1) {
  return tmdbFetch<MovieReviewsResponse>(`/movie/${movieId}/reviews`, {
    params: { page },
    revalidate: 3600,
  });
}

/** Discover movies with optional filters (for themed collections, roulette by genre). */
export function fetchDiscoverMovies(params: {
  with_genres?: number;
  "with_runtime.lte"?: number;
  "with_runtime.gte"?: number;
  sort_by?: string;
  page?: number;
}) {
  return tmdbFetch<TMDbPaginatedResponse<MovieListItem>>("/discover/movie", {
    params: { sort_by: "popularity.desc", page: 1, ...params },
    revalidate: 3600,
  });
}

// ————— Indian / Bollywood (separate from international) —————

/** Discover Indian movies (Bollywood & Indian cinema). Uses with_origin_country=IN. */
export function fetchIndianMovies(page = 1, genreId?: number) {
  return tmdbFetch<TMDbPaginatedResponse<MovieListItem>>("/discover/movie", {
    params: {
      with_origin_country: "IN",
      sort_by: "popularity.desc",
      page,
      ...(genreId != null ? { with_genres: genreId } : {}),
    },
    revalidate: 3600,
  });
}

/** Discover Indian TV shows. Uses with_origin_country=IN. */
export function fetchIndianTV(page = 1, genreId?: number) {
  return tmdbFetch<TMDbPaginatedResponse<TVListItem>>("/discover/tv", {
    params: {
      with_origin_country: "IN",
      sort_by: "popularity.desc",
      page,
      ...(genreId != null ? { with_genres: genreId } : {}),
    },
    revalidate: 3600,
  });
}

// ————— TV —————

/** Trending TV (day or week). */
export function fetchTrendingTV(page = 1, timeWindow: "day" | "week" = "week") {
  return tmdbFetch<TMDbPaginatedResponse<TVListItem>>(`/trending/tv/${timeWindow}`, {
    params: { page },
    revalidate: 3600,
  });
}

/** Top rated TV shows. */
export function fetchTopRatedTV(page = 1) {
  return tmdbFetch<TMDbPaginatedResponse<TVListItem>>("/tv/top_rated", {
    params: { page },
    revalidate: 3600,
  });
}

/** TV details by ID. */
export function fetchTVDetails(id: number) {
  return tmdbFetch<TVDetails>(`/tv/${id}`, { revalidate: 86400 });
}

/** TV credits (cast/crew). */
export function fetchTVCredits(id: number) {
  return tmdbFetch<TMDbCreditsResponse>(`/tv/${id}/credits`, { revalidate: 86400 });
}

/** Discover TV by genre. */
export function fetchTVByGenre(genreId: number, page = 1) {
  return tmdbFetch<TMDbPaginatedResponse<TVListItem>>("/discover/tv", {
    params: { with_genres: genreId, page, sort_by: "popularity.desc" },
    revalidate: 3600,
  });
}

/** Search TV by query. */
export function searchTV(query: string, page = 1) {
  return tmdbFetch<TMDbPaginatedResponse<TVListItem>>("/search/tv", {
    params: { query, page },
    revalidate: 300,
  });
}

/** Similar TV shows. */
export function fetchSimilarTV(tvId: number, page = 1) {
  return tmdbFetch<TMDbPaginatedResponse<TVListItem>>(`/tv/${tvId}/similar`, {
    params: { page },
    revalidate: 3600,
  });
}

/** TV videos (trailers, etc.). */
export function fetchTVVideos(tvId: number) {
  return tmdbFetch<TMDbVideosResponse>(`/tv/${tvId}/videos`, { revalidate: 86400 });
}

/** TV watch providers (stream / rent / buy by country). */
export function fetchTVWatchProviders(tvId: number, watchRegion = "US") {
  return tmdbFetch<MovieWatchProvidersResponse>(`/tv/${tvId}/watch/providers`, {
    params: { watch_region: watchRegion },
    revalidate: 86400,
  });
}

/** TV external IDs (IMDb, social handles, etc.). */
export function fetchTVExternalIds(tvId: number) {
  return tmdbFetch<MovieExternalIds>(`/tv/${tvId}/external_ids`, { revalidate: 86400 });
}

/** TV reviews (from TMDb). */
export function fetchTVReviews(tvId: number, page = 1) {
  return tmdbFetch<MovieReviewsResponse>(`/tv/${tvId}/reviews`, {
    params: { page },
    revalidate: 3600,
  });
}

/** TV genre list (IDs differ from movie genres). */
export function fetchTVGenreList() {
  return tmdbFetch<TMDbGenreListResponse>("/genre/tv/list", { revalidate: 86400 });
}

/** Multi search: movies and TV in one request. Results include media_type. */
export interface MultiResult {
  media_type: "movie" | "tv" | "person";
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
}
export interface TMDbMultiSearchResponse {
  page: number;
  results: MultiResult[];
  total_pages: number;
  total_results: number;
}

export function searchMulti(query: string, page = 1) {
  return tmdbFetch<TMDbMultiSearchResponse>("/search/multi", {
    params: { query, page },
    revalidate: 300,
  });
}
