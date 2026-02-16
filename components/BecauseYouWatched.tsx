"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useWatchHistory } from "@/hooks/useWatchHistory";
import { MovieRow } from "@/components/MovieRow";
import { TVRow } from "@/components/TVRow";
import { RowSkeleton } from "@/components/skeletons";
import type { MovieListItem } from "@/types/movie";
import type { TVListItem } from "@/types/tv";

export function BecauseYouWatched() {
  const { user } = useAuth();
  const { history, loading } = useWatchHistory(user?.uid ?? null);
  const [similarMovies, setSimilarMovies] = useState<MovieListItem[]>([]);
  const [similarShows, setSimilarShows] = useState<TVListItem[]>([]);
  const [lastWatchedTitle, setLastWatchedTitle] = useState<string>("");
  const [fetchLoading, setFetchLoading] = useState(false);

  const lastWatched = history[0];
  const type = lastWatched?.type ?? "movie";
  const itemId = lastWatched?.itemId ?? lastWatched?.movieId;

  useEffect(() => {
    if (!itemId || !lastWatched?.title) {
      setSimilarMovies([]);
      setSimilarShows([]);
      return;
    }
    setLastWatchedTitle(lastWatched.title);
    setFetchLoading(true);
    if (type === "tv") {
      fetch(`/api/tv/similar?tvId=${itemId}`)
        .then((r) => r.json())
        .then((data) => setSimilarShows(data.shows ?? []))
        .finally(() => setFetchLoading(false));
      setSimilarMovies([]);
    } else {
      fetch(`/api/movies/similar?movieId=${itemId}`)
        .then((r) => r.json())
        .then((data) => setSimilarMovies(data.movies ?? []))
        .finally(() => setFetchLoading(false));
      setSimilarShows([]);
    }
  }, [itemId, type, lastWatched?.title]);

  if (!user) return null;
  if (loading || fetchLoading) return <RowSkeleton cardCount={6} />;
  if (!lastWatched) return null;
  if (type === "tv" && similarShows.length === 0) return null;
  if (type === "movie" && similarMovies.length === 0) return null;

  return type === "tv" ? (
    <TVRow
      title={`Because you watched ${lastWatchedTitle}`}
      shows={similarShows}
      ariaLabel={`Recommendations because you watched ${lastWatchedTitle}`}
    />
  ) : (
    <MovieRow
      title={`Because you watched ${lastWatchedTitle}`}
      movies={similarMovies}
      ariaLabel={`Recommendations because you watched ${lastWatchedTitle}`}
    />
  );
}
