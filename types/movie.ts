/**
 * TMDb API response types for Movie Discovery.
 * Kept in sync with TMDb API v3 responses.
 */

export interface Genre {
  id: number;
  name: string;
}

export interface MovieListItem {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  adult?: boolean;
  original_language?: string;
  original_title?: string;
  popularity?: number;
  video?: boolean;
}

export interface MovieDetails extends MovieListItem {
  genres: Genre[];
  runtime: number | null;
  tagline: string | null;
  status?: string;
  imdb_id?: string | null;
  homepage?: string | null;
  budget?: number;
  revenue?: number;
  production_companies?: Array<{ id: number; name: string; logo_path: string | null }>;
  production_countries?: Array<{ iso_3166_1: string; name: string }>;
  spoken_languages?: Array<{ iso_639_1: string; name: string }>;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface TMDbPaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TMDbSearchResponse extends TMDbPaginatedResponse<MovieListItem> {
  // search-specific if any
}

export interface TMDbCreditsResponse {
  id: number;
  cast: CastMember[];
  crew: Array<{
    id: number;
    name: string;
    job: string;
    department: string;
    profile_path: string | null;
  }>;
}

export interface TMDbGenreListResponse {
  genres: Genre[];
}

/** Watch provider from TMDb (JustWatch data). */
export interface WatchProviderInfo {
  logo_path: string | null;
  provider_id: number;
  provider_name: string;
  display_priority?: number;
}

/** Per-country watch options. */
export interface WatchProvidersByCountry {
  link?: string;
  flatrate?: WatchProviderInfo[];
  rent?: WatchProviderInfo[];
  buy?: WatchProviderInfo[];
}

/** Response of GET /movie/{id}/watch/providers. */
export interface MovieWatchProvidersResponse {
  id: number;
  results: Record<string, WatchProvidersByCountry>;
}

/** External IDs from GET /movie/{id}/external_ids (social + IMDb, etc.). */
export interface MovieExternalIds {
  id: number;
  imdb_id?: string | null;
  wikidata_id?: string | null;
  facebook_id?: string | null;
  instagram_id?: string | null;
  twitter_id?: string | null;
}

/** Single review from GET /movie/{id}/reviews. */
export interface MovieReviewResult {
  id: string;
  author: string;
  author_details?: {
    name?: string;
    username?: string;
    avatar_path?: string | null;
    rating?: number | null;
  };
  content: string;
  created_at: string;
  updated_at?: string;
  url: string;
}

/** Response of GET /movie/{id}/reviews. */
export interface MovieReviewsResponse {
  id: number;
  page: number;
  results: MovieReviewResult[];
  total_pages: number;
  total_results: number;
}
