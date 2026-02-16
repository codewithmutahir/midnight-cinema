"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  getPosterUrl,
  getBackdropUrl,
  getProfileUrl,
  getProviderLogoUrl,
} from "@/lib/tmdb";
import type {
  MovieDetails,
  MovieListItem,
  CastMember,
  WatchProvidersByCountry,
  WatchProviderInfo,
  MovieExternalIds,
  MovieReviewResult,
} from "@/types/movie";
import { useAuth } from "@/contexts/AuthContext";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useWatchHistory } from "@/hooks/useWatchHistory";
import { useMovieStats } from "@/hooks/useMovieStats";
import { AuthModal } from "@/components/AuthModal";
import { MovieRow } from "@/components/MovieRow";

interface MovieDetailContentProps {
  movie: MovieDetails;
  cast: CastMember[];
  similarMovies: MovieListItem[];
  trailerKey: string | null;
  /** Watch providers (stream/rent/buy) for a region, e.g. US. */
  watchProviders?: WatchProvidersByCountry | null;
  /** External links (IMDb, social). */
  externalIds?: MovieExternalIds | null;
  /** TMDb reviews (first page). */
  reviews?: MovieReviewResult[];
  /** Total number of reviews (for "View all N reviews"). */
  reviewsTotalCount?: number;
}

function formatRuntime(minutes: number | null): string {
  if (minutes == null || minutes <= 0) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

function formatCurrency(value: number | undefined): string {
  if (value == null || value <= 0) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatStatus(status: string | undefined): string {
  if (!status) return "—";
  return status.replace(/_/g, " ");
}

/** Optional content notes per movie (expandable via CMS or community later). */
function getContentNotes(movieId: number): string[] | null {
  const notes: Record<number, string[]> = {
    // Example entries — can be moved to Firestore or static JSON later
    424: ["Violence", "Strong language"], // Schindler's List
    155: ["Violence", "Flashing lights"], // The Dark Knight
  };
  return notes[movieId] ?? null;
}

function ProviderRow({
  label,
  providers,
}: {
  label: string;
  providers: WatchProviderInfo[];
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
        {label}
      </p>
      <div className="flex flex-wrap gap-3">
        {providers.map((p) => (
          <div
            key={p.provider_id}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--bg-elevated)] p-1.5 shadow-sm ring-1 ring-[var(--border-subtle)]"
            title={p.provider_name}
          >
            <Image
              src={getProviderLogoUrl(p.logo_path)}
              alt={p.provider_name}
              width={36}
              height={36}
              className="object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

const REVIEW_PREVIEW_LENGTH = 400;

function ReviewCard({ review }: { review: MovieReviewResult }) {
  const [expanded, setExpanded] = useState(false);
  const needsTruncation = review.content.length > REVIEW_PREVIEW_LENGTH;
  const displayContent = needsTruncation && !expanded
    ? review.content.slice(0, REVIEW_PREVIEW_LENGTH).trim() + "…"
    : review.content;
  const dateStr = review.created_at
    ? new Date(review.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <li className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5">
      <div className="flex items-start gap-4">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[var(--bg-elevated)]">
          <Image
            src={getProfileUrl(review.author_details?.avatar_path ?? null)}
            alt=""
            width={48}
            height={48}
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-white">{review.author}</span>
            {review.author_details?.rating != null && (
              <span className="rounded bg-[var(--accent)]/20 px-2 py-0.5 text-sm text-[var(--accent)]">
                ★ {review.author_details.rating}/10
              </span>
            )}
            {dateStr && (
              <span className="text-sm text-[var(--text-muted)]">{dateStr}</span>
            )}
          </div>
          <div className="mt-2 whitespace-pre-wrap text-[var(--text-primary)] leading-relaxed">
            {displayContent}
          </div>
          {needsTruncation && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="mt-2 text-sm font-medium text-[var(--accent)] hover:underline"
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          )}
          {review.url && (
            <a
              href={review.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block text-xs text-[var(--text-muted)] hover:text-[var(--accent)]"
            >
              View on TMDb →
            </a>
          )}
        </div>
      </div>
    </li>
  );
}

export function MovieDetailContent({
  movie,
  cast,
  similarMovies,
  trailerKey,
  watchProviders,
  externalIds,
  reviews = [],
  reviewsTotalCount = 0,
}: MovieDetailContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist(
    user?.uid ?? null
  );
  const { addToHistory } = useWatchHistory(user?.uid ?? null);
  const { watchlistCount } = useMovieStats(movie.id);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [trailerModalOpen, setTrailerModalOpen] = useState(false);
  const [shareDone, setShareDone] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const backdropY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const backdropOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.5, 0]);

  const inWatchlist = isInWatchlist("movie", movie.id);
  const posterUrl = getPosterUrl(movie.poster_path, "w500");
  const backdropUrl = getBackdropUrl(movie.backdrop_path, "original");
  const year = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : "";

  function handleWatchlistClick() {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (inWatchlist) {
      removeFromWatchlist("movie", movie.id);
    } else {
      addToWatchlist(
        {
          id: movie.id,
          title: movie.title,
        poster_path: movie.poster_path,
        backdrop_path: movie.backdrop_path,
        overview: movie.overview,
        release_date: movie.release_date ?? "",
        vote_average: movie.vote_average,
        vote_count: movie.vote_count,
        genre_ids: movie.genres?.map((g) => g.id),
      }, "movie");
    }
  }

  function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      navigator
        .share({
          title: movie.title,
          text: movie.overview ?? undefined,
          url,
        })
        .then(() => setShareDone(true))
        .catch(() => {});
    } else {
      navigator.clipboard?.writeText(url).then(() => setShareDone(true));
    }
  }

  const trailerEmbedUrl = trailerKey
    ? `https://www.youtube.com/embed/${trailerKey}?autoplay=1`
    : null;

  const closeTrailerModal = useCallback(() => setTrailerModalOpen(false), []);

  // Add to watch history when user views this movie (signed-in only)
  useEffect(() => {
    if (!user) return;
    addToHistory({
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
    });
  }, [user?.uid, movie.id, movie.title, movie.poster_path, addToHistory]);

  useEffect(() => {
    if (!trailerModalOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeTrailerModal();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [trailerModalOpen, closeTrailerModal]);

  // Theater mode: lock scroll and dim when trailer is open
  useEffect(() => {
    if (trailerModalOpen) {
      document.body.classList.add("theater-mode");
    } else {
      document.body.classList.remove("theater-mode");
    }
    return () => document.body.classList.remove("theater-mode");
  }, [trailerModalOpen]);

  return (
    <>
      <div ref={containerRef} className="bg-[var(--black)]">
        {/* Hero — 85vh min, parallax backdrop, multi-layer gradients, grain */}
        <section
          className="relative flex min-h-[min(70vh,480px)] flex-col justify-end pb-12 pt-16 sm:min-h-[80vh] sm:pb-16 sm:pt-20 lg:min-h-[85vh]"
          aria-label="Movie hero"
        >
          {/* Parallax backdrop */}
          <div className="absolute inset-0 overflow-hidden">
            {backdropUrl ? (
              <motion.div
                className="absolute inset-0 will-change-transform"
                style={{ y: backdropY, opacity: backdropOpacity }}
              >
                <Image
                  src={backdropUrl}
                  alt=""
                  fill
                  className="object-cover object-center"
                  sizes="100vw"
                  priority
                />
              </motion.div>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-primary)]" />
            )}
            {/* Layer 1: bottom fade */}
            <div
              className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"
              aria-hidden
            />
            {/* Layer 2: left/right */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black/50"
              aria-hidden
            />
            {/* Layer 3: top */}
            <div
              className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black"
              aria-hidden
            />
            {/* Film grain */}
            <div className="grain absolute inset-0" aria-hidden />
          </div>

          {/* Content grid: poster + text + actions */}
          <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-8">
            {/* Poster — 3 cols on lg */}
            <div className="flex justify-center lg:col-span-3 lg:justify-end">
              <div className="relative aspect-[2/3] w-full max-w-[300px] overflow-hidden rounded-lg border-2 border-white/10 shadow-2xl lg:max-w-none">
                {movie.poster_path ? (
                  <Image
                    src={posterUrl}
                    alt={`${movie.title} poster`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 300px, 320px"
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[var(--bg-card)] text-6xl">
                    🎬
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-9 lg:flex lg:flex-col lg:justify-end">
              <div className="max-w-2xl">
              {/* Title */}
              <h1 className="font-display text-3xl font-bold leading-tight tracking-wide text-white sm:text-4xl lg:text-4xl xl:text-5xl">
                {movie.title}
              </h1>
              {movie.tagline && (
                <p className="mt-2 text-lg italic text-gray-300">
                  {movie.tagline}
                </p>
              )}

              {/* Social proof: X people have this in watchlist */}
              {watchlistCount > 0 && (
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  {watchlistCount} {watchlistCount === 1 ? "person has" : "people have"} this in their watchlist
                </p>
              )}
              {/* Meta row */}
              <div className="mt-4 flex flex-wrap items-center gap-4">
                {year && (
                  <span className="font-mono uppercase tracking-wider text-gray-300">
                    {year}
                  </span>
                )}
                <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-3 py-1 backdrop-blur-sm">
                  <span className="text-yellow-500" aria-hidden>★</span>
                  <span className="font-semibold text-white">
                    {movie.vote_average.toFixed(1)}
                  </span>
                  <span className="text-gray-400 text-sm">
                    ({movie.vote_count} votes)
                  </span>
                </span>
                {movie.runtime != null && movie.runtime > 0 && (
                  <span className="font-mono text-gray-300">
                    {formatRuntime(movie.runtime)}
                  </span>
                )}
                {movie.status && (
                  <span
                    className="rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/20 px-3 py-1 font-mono text-xs uppercase tracking-wider text-[var(--accent)]"
                  >
                    {formatStatus(movie.status)}
                  </span>
                )}
              </div>

              {/* Genre pills */}
              {movie.genres && movie.genres.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {movie.genres.map((g) => (
                    <Link
                      key={g.id}
                      href={`/genre/${g.id}`}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white backdrop-blur-sm transition-all duration-300 hover:border-[var(--accent)]/50 hover:bg-white/10"
                    >
                      {g.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                {trailerEmbedUrl && (
                  <motion.button
                    type="button"
                    onClick={() => setTrailerModalOpen(true)}
                    className="flex items-center gap-3 rounded-lg bg-[var(--accent)] px-8 py-4 font-mono text-sm uppercase tracking-wider text-white shadow-lg shadow-[var(--accent)]/30 transition-colors hover:bg-[var(--accent-hover)]"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Play Trailer
                  </motion.button>
                )}
                <motion.button
                  type="button"
                  onClick={handleWatchlistClick}
                  className={`flex items-center gap-3 rounded-lg border-2 px-6 py-4 font-medium backdrop-blur-sm ${
                    inWatchlist
                      ? "border-[var(--accent)] bg-white/10 text-[var(--accent)]"
                      : "border-white/20 bg-white/5 text-white hover:border-[var(--accent)]/50"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {inWatchlist ? (
                    <>
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      In Watchlist
                    </>
                  ) : (
                    <>
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Add to Watchlist
                    </>
                  )}
                </motion.button>
                <motion.button
                  type="button"
                  onClick={handleShare}
                  className="flex items-center gap-3 rounded-lg border border-white/20 bg-white/5 px-6 py-4 backdrop-blur-sm transition-colors hover:border-white/40 hover:bg-white/10"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                  {shareDone ? "Copied!" : "Share"}
                </motion.button>
              </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 text-white/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <motion.div
              className="font-mono text-xs uppercase tracking-wider"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Scroll
            </motion.div>
            <svg
              className="mx-auto mt-1 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </motion.div>
        </section>

        {/* Content section — overview, sidebar, cast, similar */}
        <div className="bg-black py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
              {/* Left: Overview + extra info */}
              <div className="lg:col-span-2 space-y-10">
                {movie.overview && (
                  <section>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="h-8 w-1 shrink-0 bg-[var(--accent)]" aria-hidden />
                      <h2 className="font-display text-3xl tracking-wide text-white sm:text-4xl">
                        Overview
                      </h2>
                    </div>
                    <p className="text-lg leading-relaxed text-gray-300">
                      {movie.overview}
                    </p>
                  </section>
                )}

                {/* Where to watch */}
                {watchProviders
                  ? (() => {
                      const flat = watchProviders.flatrate?.length ?? 0;
                      const rent = watchProviders.rent?.length ?? 0;
                      const buy = watchProviders.buy?.length ?? 0;
                      if (flat + rent + buy === 0) return null;
                      return (
                        <section>
                          <div className="flex items-center gap-3 mb-4">
                            <span className="h-8 w-1 shrink-0 bg-[var(--accent)]" aria-hidden />
                            <h2 className="font-display text-3xl tracking-wide text-white sm:text-4xl">
                              Where to watch
                            </h2>
                          </div>
                          <p className="mb-3 text-sm text-[var(--text-muted)]">
                            Availability in the US. Data from JustWatch via TMDb.
                          </p>
                          <div className="flex flex-col gap-4">
                            {watchProviders.flatrate && watchProviders.flatrate.length > 0 && (
                              <ProviderRow label="Stream" providers={watchProviders.flatrate} />
                            )}
                            {watchProviders.rent && watchProviders.rent.length > 0 && (
                              <ProviderRow label="Rent" providers={watchProviders.rent} />
                            )}
                            {watchProviders.buy && watchProviders.buy.length > 0 && (
                              <ProviderRow label="Buy" providers={watchProviders.buy} />
                            )}
                          </div>
                          {watchProviders.link && (
                            <a
                              href={watchProviders.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-3 inline-block text-sm text-[var(--accent)] hover:underline"
                            >
                              See all options on TMDb →
                            </a>
                          )}
                        </section>
                      );
                    })()
                  : null}

                {/* Additional info: budget, revenue, website */}
                {((movie.budget != null && movie.budget > 0) ||
                  (movie.revenue != null && movie.revenue > 0) ||
                  movie.homepage) && (
                  <section className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {movie.budget != null && movie.budget > 0 && (
                      <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
                        <p className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
                          Budget
                        </p>
                        <p className="font-display text-xl text-[var(--accent)]">
                          {formatCurrency(movie.budget)}
                        </p>
                      </div>
                    )}
                    {movie.revenue != null && movie.revenue > 0 && (
                      <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
                        <p className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
                          Revenue
                        </p>
                        <p className="font-display text-xl text-[var(--accent)]">
                          {formatCurrency(movie.revenue)}
                        </p>
                      </div>
                    )}
                    {movie.homepage && (
                      <a
                        href={movie.homepage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 text-[var(--accent)] transition-colors hover:underline"
                      >
                        <p className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
                          Website
                        </p>
                        <span className="font-display text-xl">
                          Visit →
                        </span>
                      </a>
                    )}
                  </section>
                )}

                {/* Social & external links */}
                {(externalIds?.imdb_id ||
                  externalIds?.facebook_id ||
                  externalIds?.instagram_id ||
                  externalIds?.twitter_id ||
                  externalIds?.wikidata_id) && (
                  <section>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="h-8 w-1 shrink-0 bg-[var(--accent)]" aria-hidden />
                      <h2 className="font-display text-3xl tracking-wide text-white sm:text-4xl">
                        Social & links
                      </h2>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {externalIds?.imdb_id && (
                        <a
                          href={`https://www.imdb.com/title/${externalIds.imdb_id}/`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-3 text-[var(--accent)] transition-colors hover:bg-[var(--bg-elevated)]"
                          title="IMDb"
                        >
                          <span className="font-semibold">IMDb</span>
                          <span aria-hidden>↗</span>
                        </a>
                      )}
                      {externalIds?.facebook_id && (
                        <a
                          href={`https://www.facebook.com/${externalIds.facebook_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-3 text-[var(--accent)] transition-colors hover:bg-[var(--bg-elevated)]"
                          title="Facebook"
                        >
                          <span className="font-semibold">Facebook</span>
                          <span aria-hidden>↗</span>
                        </a>
                      )}
                      {externalIds?.twitter_id && (
                        <a
                          href={`https://twitter.com/${externalIds.twitter_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-3 text-[var(--accent)] transition-colors hover:bg-[var(--bg-elevated)]"
                          title="X (Twitter)"
                        >
                          <span className="font-semibold">X</span>
                          <span aria-hidden>↗</span>
                        </a>
                      )}
                      {externalIds?.instagram_id && (
                        <a
                          href={`https://www.instagram.com/${externalIds.instagram_id}/`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-3 text-[var(--accent)] transition-colors hover:bg-[var(--bg-elevated)]"
                          title="Instagram"
                        >
                          <span className="font-semibold">Instagram</span>
                          <span aria-hidden>↗</span>
                        </a>
                      )}
                      {externalIds?.wikidata_id && (
                        <a
                          href={`https://www.wikidata.org/wiki/${externalIds.wikidata_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-3 text-[var(--accent)] transition-colors hover:bg-[var(--bg-elevated)]"
                          title="Wikidata"
                        >
                          <span className="font-semibold">Wikidata</span>
                          <span aria-hidden>↗</span>
                        </a>
                      )}
                    </div>
                  </section>
                )}

                {/* Awards (link to IMDb; TMDb does not provide awards data) */}
                {(externalIds?.imdb_id || movie.imdb_id) && (
                  <section>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="h-8 w-1 shrink-0 bg-[var(--accent)]" aria-hidden />
                      <h2 className="font-display text-3xl tracking-wide text-white sm:text-4xl">
                        Awards
                      </h2>
                    </div>
                    <p className="text-[var(--text-muted)] mb-2">
                      Award information is not provided by TMDb. View awards and nominations on IMDb.
                    </p>
                    <a
                      href={`https://www.imdb.com/title/${externalIds?.imdb_id ?? movie.imdb_id}/awards/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-[var(--accent)]/50 bg-[var(--accent)]/10 px-4 py-3 text-[var(--accent)] transition-colors hover:bg-[var(--accent)]/20"
                    >
                      View awards on IMDb
                      <span aria-hidden>↗</span>
                    </a>
                  </section>
                )}

                {/* Reviews from TMDb */}
                {reviews.length > 0 && (
                  <section>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="h-8 w-1 shrink-0 bg-[var(--accent)]" aria-hidden />
                      <h2 className="font-display text-3xl tracking-wide text-white sm:text-4xl">
                        Reviews
                      </h2>
                      {reviewsTotalCount > 0 && (
                        <span className="text-sm text-[var(--text-muted)]">
                          {reviewsTotalCount} {reviewsTotalCount === 1 ? "review" : "reviews"}
                        </span>
                      )}
                    </div>
                    <ul className="space-y-6">
                      {reviews.slice(0, 5).map((review: MovieReviewResult) => (
                        <ReviewCard key={review.id} review={review} />
                      ))}
                    </ul>
                    {reviewsTotalCount > 5 && (
                      <a
                        href={`https://www.themoviedb.org/movie/${movie.id}/reviews`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-block text-sm text-[var(--accent)] hover:underline"
                      >
                        View all {reviewsTotalCount} reviews on TMDb →
                      </a>
                    )}
                  </section>
                )}
              </div>

              {/* Sidebar: Details + Production */}
              <aside className="space-y-6">
                <div className="rounded-lg border border-[var(--border-subtle)] bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-elevated)] p-6">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
                    Details
                  </h3>
                  <dl className="mt-4 space-y-3">
                    <div>
                      <dt className="text-xs text-[var(--text-muted)]">Status</dt>
                      <dd className="font-medium text-white">
                        {formatStatus(movie.status)}
                      </dd>
                    </div>
                    {movie.release_date && (
                      <div>
                        <dt className="text-xs text-[var(--text-muted)]">Release</dt>
                        <dd className="font-medium text-white">
                          {new Date(movie.release_date).toLocaleDateString(
                            "en-US",
                            { year: "numeric", month: "long", day: "numeric" }
                          )}
                        </dd>
                      </div>
                    )}
                    {movie.runtime != null && movie.runtime > 0 && (
                      <div>
                        <dt className="text-xs text-[var(--text-muted)]">Runtime</dt>
                        <dd className="font-medium text-white">
                          {formatRuntime(movie.runtime)}
                        </dd>
                      </div>
                    )}
                    {movie.spoken_languages &&
                      movie.spoken_languages.length > 0 && (
                        <div>
                          <dt className="text-xs text-[var(--text-muted)]">
                            Language
                          </dt>
                          <dd className="font-medium text-white uppercase">
                            {movie.spoken_languages.map((l) => l.name).join(", ")}
                          </dd>
                        </div>
                      )}
                  </dl>
                </div>

                {movie.production_companies &&
                  movie.production_companies.length > 0 && (
                    <div className="rounded-lg border border-[var(--border-subtle)] bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-elevated)] p-6">
                      <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
                        Production
                      </h3>
                      <ul className="mt-4 space-y-2">
                        {movie.production_companies.slice(0, 3).map((c) => (
                          <li
                            key={c.id}
                            className="text-sm font-medium text-white"
                          >
                            {c.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </aside>
            </div>

            {/* Cast */}
            {cast.length > 0 && (
              <section className="mt-16">
                <div className="flex items-center gap-3 mb-6">
                  <span className="h-8 w-1 shrink-0 bg-[var(--accent)]" aria-hidden />
                  <h2 className="font-display text-3xl tracking-wide text-white sm:text-4xl">
                    Cast
                  </h2>
                </div>
                <div className="scroll-row flex gap-4 overflow-x-auto pb-2 pt-1">
                  <div className="min-w-[16px] shrink-0 sm:min-w-[24px]" aria-hidden />
                  {cast.map((c, index) => (
                    <motion.div
                      key={c.id}
                      className="group w-40 shrink-0"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href="#"
                        className="block overflow-hidden rounded-lg border border-white/10 transition-colors hover:border-white/20"
                      >
                        <div className="relative aspect-[2/3] overflow-hidden bg-[var(--bg-card)]">
                          {c.profile_path ? (
                            <Image
                              src={getProfileUrl(c.profile_path, "w185")}
                              alt={c.name}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-110"
                              sizes="160px"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-card)] text-4xl">
                              👤
                            </div>
                          )}
                        </div>
                        <div className="p-2">
                          <p className="truncate text-sm font-semibold text-white">
                            {c.name}
                          </p>
                          <p className="truncate text-xs text-[var(--text-muted)]">
                            {c.character}
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                  <div className="min-w-[16px] shrink-0 sm:min-w-[24px]" aria-hidden />
                </div>
              </section>
            )}

            {/* Double feature — one hand-picked pairing */}
            {similarMovies.length > 0 && (
              <section className="mt-16">
                <div className="flex items-center gap-3 mb-6">
                  <span className="h-8 w-1 shrink-0 bg-[var(--accent)]" aria-hidden />
                  <h2 className="font-display text-3xl tracking-wide text-white sm:text-4xl">
                    Perfect double feature
                  </h2>
                </div>
                <p className="mb-4 text-[var(--text-muted)]">
                  Pair with this for a great night in.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href={`/movie/${similarMovies[0].id}`}
                    className="group block w-full max-w-[200px] overflow-hidden rounded-lg border-2 border-white/10 bg-[var(--bg-card)] transition-colors hover:border-[var(--accent)]/50 hover:shadow-lg hover:shadow-[var(--accent)]/20"
                  >
                    <div className="relative aspect-[2/3] overflow-hidden bg-[var(--bg-elevated)]">
                      <Image
                        src={getPosterUrl(similarMovies[0].poster_path, "w342")}
                        alt={similarMovies[0].title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="200px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                    <div className="p-3">
                      <p className="font-semibold text-white truncate">{similarMovies[0].title}</p>
                      <p className="text-xs text-[var(--text-muted)]">View details →</p>
                    </div>
                  </Link>
                </div>
              </section>
            )}

            {/* Similar movies */}
            {similarMovies.length > 0 && (
              <section className="mt-16">
                <MovieRow
                  title="Similar movies"
                  movies={similarMovies}
                  ariaLabel="Similar movies"
                />
              </section>
            )}

            {/* Content notes — trust & safety */}
            <section className="mt-16">
              <div className="flex items-center gap-3 mb-4">
                <span className="h-8 w-1 shrink-0 bg-[var(--accent)]" aria-hidden />
                <h2 className="font-display text-3xl tracking-wide text-white sm:text-4xl">
                  Content notes
                </h2>
              </div>
              <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
                {getContentNotes(movie.id) ? (
                  <ul className="space-y-1 text-sm text-[var(--text-muted)]">
                    {getContentNotes(movie.id)!.map((note, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-[var(--accent)]" aria-hidden>⚠</span>
                        {note}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-[var(--text-muted)]">
                    No content notes for this film yet. Know something we should add? We’re working on community notes.
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* Trailer popup — theater mode when open */}
      <AnimatePresence>
        {trailerModalOpen && trailerEmbedUrl && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/95 backdrop-blur-md"
              onClick={closeTrailerModal}
              aria-hidden
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "tween", duration: 0.2 }}
              className="relative w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-4 mb-2">
                <h2 className="font-display text-lg sm:text-xl tracking-wide text-white">
                  {movie.title} — Trailer
                </h2>
                <button
                  type="button"
                  onClick={closeTrailerModal}
                  className="rounded-lg p-2 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                  aria-label="Close trailer"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black shadow-2xl">
                <iframe
                  src={trailerEmbedUrl}
                  title={`${movie.title} trailer`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
