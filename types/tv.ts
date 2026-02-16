/**
 * TMDb API response types for TV shows.
 * Mirrors movie types; TV uses "name" and "first_air_date".
 */

import type { Genre } from "./movie";

export interface TVListItem {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  original_name?: string;
  original_language?: string;
  popularity?: number;
  origin_country?: string[];
}

export interface TVDetails extends TVListItem {
  genres: Genre[];
  number_of_seasons: number;
  number_of_episodes: number;
  status?: string;
  tagline?: string | null;
  homepage?: string | null;
  in_production?: boolean;
  last_air_date?: string;
  production_companies?: Array<{ id: number; name: string; logo_path: string | null }>;
  production_countries?: Array<{ iso_3166_1: string; name: string }>;
  spoken_languages?: Array<{ iso_639_1: string; name: string }>;
}

/** Unified "watchable" item for lists that can show both movies and TV. */
export type MediaType = "movie" | "tv";

export interface WatchableListItem {
  type: MediaType;
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string | null;
  date: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
}
