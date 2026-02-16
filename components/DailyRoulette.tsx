"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useDailyPick } from "@/hooks/useDailyPick";
import { getPosterUrl } from "@/lib/tmdb";
import type { MovieListItem } from "@/types/movie";

const GENRE_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All" },
  { value: "28", label: "Action" },
  { value: "35", label: "Comedy" },
  { value: "18", label: "Drama" },
  { value: "27", label: "Horror" },
  { value: "10749", label: "Romance" },
  { value: "878", label: "Sci-Fi" },
  { value: "53", label: "Thriller" },
];

export function DailyRoulette() {
  const { user } = useAuth();
  const { dailyMovieIds, theme, hasPickedToday, loading, saveSelection, today } = useDailyPick(user?.uid ?? null);
  const [movies, setMovies] = useState<MovieListItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [genreFilter, setGenreFilter] = useState<string>("");
  const [rouletteIds, setRouletteIds] = useState<number[]>([]);
  const [genreLoading, setGenreLoading] = useState(false);

  const idsToShow = genreFilter ? rouletteIds : dailyMovieIds;

  useEffect(() => {
    if (idsToShow.length === 0) return;
    fetch(`/api/movies?ids=${idsToShow.join(",")}`)
      .then((r) => r.json())
      .then((data) => setMovies(data.movies ?? []));
  }, [idsToShow.join(",")]);

  useEffect(() => {
    if (!genreFilter) {
      setRouletteIds([]);
      return;
    }
    setGenreLoading(true);
    fetch(`/api/movies/random?genre=${genreFilter}`)
      .then((r) => r.json())
      .then((data) => {
        setRouletteIds(data.movieIds ?? []);
        setRevealed(false);
        setSelectedId(null);
      })
      .finally(() => setGenreLoading(false));
  }, [genreFilter]);

  async function handlePick(movieId: number) {
    if (revealed || hasPickedToday) return;
    setSelectedId(movieId);
    setRevealed(true);
    if (user) await saveSelection(movieId);
  }

  if (loading || (movies.length === 0 && !genreLoading)) return null;
  if (hasPickedToday && !selectedId && user && !genreFilter) {
    const picked = dailyMovieIds[0];
    return (
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="font-display text-2xl tracking-wide text-[var(--text-primary)] sm:text-3xl">
          Today&apos;s pick
        </h2>
        <p className="mt-1 text-[var(--text-muted)]">You already picked for {today}. Come back tomorrow.</p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8" aria-label="Daily movie roulette">
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl tracking-wide text-[var(--text-primary)] sm:text-3xl">
            Daily roulette
          </h2>
          {theme && (
            <p className="mt-1 text-sm text-[var(--accent)]">{theme}</p>
          )}
        </div>
        <span className="text-xs text-[var(--text-muted)]">{today}</span>
      </div>
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <label htmlFor="roulette-genre" className="text-sm text-[var(--text-muted)]">
          Surprise me in:
        </label>
        <select
          id="roulette-genre"
          value={genreFilter}
          onChange={(e) => setGenreFilter(e.target.value)}
          disabled={genreLoading}
          className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
        >
          {GENRE_OPTIONS.map((opt) => (
            <option key={opt.value || "all"} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <p className="mb-6 text-[var(--text-muted)]">
        {revealed ? "Your pick for today:" : genreFilter ? "Pick one from this genre." : "Pick one — today's random selection."}
      </p>
      {genreLoading ? (
        <div className="flex justify-center gap-4 py-8">
          <div className="h-32 w-28 animate-pulse rounded-lg bg-[var(--bg-card)] sm:w-32" />
          <div className="h-32 w-28 animate-pulse rounded-lg bg-[var(--bg-card)] sm:w-32" />
          <div className="h-32 w-28 animate-pulse rounded-lg bg-[var(--bg-card)] sm:w-32" />
        </div>
      ) : (
      <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
        <AnimatePresence mode="wait">
          {revealed && selectedId ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-sm"
            >
              {(() => {
                const m = movies.find((x) => x.id === selectedId);
                if (!m) return null;
                return (
                  <Link
                    href={`/movie/${m.id}`}
                    className="block overflow-hidden rounded-xl border-2 border-[var(--accent)] bg-[var(--bg-card)] shadow-[0_0_30px_var(--accent-glow)]"
                  >
                    <div className="aspect-[2/3] relative overflow-hidden bg-[var(--bg-secondary)]">
                      <Image
                        src={getPosterUrl(m.poster_path, "w500")}
                        alt={m.title}
                        fill
                        className="object-cover"
                        sizes="400px"
                      />
                      <div className="absolute inset-x-0 bottom-0 h-1/2 gradient-overlay-bottom" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-display text-xl text-[var(--text-primary)]">{m.title}</h3>
                      <p className="mt-1 text-sm text-[var(--text-muted)]">View details →</p>
                    </div>
                  </Link>
                );
              })()}
            </motion.div>
          ) : (
            movies.slice(0, 5).map((movie, i) => (
              <motion.button
                key={movie.id}
                type="button"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => handlePick(movie.id)}
                className="group w-28 flex-shrink-0 overflow-hidden rounded-lg bg-[var(--bg-card)] text-left shadow-lg transition-transform hover:scale-105 hover:ring-2 hover:ring-[var(--accent)] sm:w-32"
              >
                <div className="aspect-[2/3] relative overflow-hidden bg-[var(--bg-secondary)]">
                  <Image
                    src={getPosterUrl(movie.poster_path, "w342")}
                    alt={movie.title}
                    fill
                    className="object-cover"
                    sizes="160px"
                  />
                  <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                </div>
                <p className="truncate p-2 text-xs font-medium text-[var(--text-primary)]">{movie.title}</p>
              </motion.button>
            ))
          )}
        </AnimatePresence>
      </div>
      )}
    </section>
  );
}
