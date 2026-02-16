"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { getPosterUrl, getBackdropUrl, getProfileUrl, getProviderLogoUrl } from "@/lib/tmdb";
import type { CastMember } from "@/types/movie";
import type {
  WatchProvidersByCountry,
  WatchProviderInfo,
  MovieExternalIds,
  MovieReviewResult,
} from "@/types/movie";
import type { TVDetails, TVListItem } from "@/types/tv";
import { useAuth } from "@/contexts/AuthContext";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useWatchHistory } from "@/hooks/useWatchHistory";
import { useTVStats } from "@/hooks/useTVStats";
import { AuthModal } from "@/components/AuthModal";

interface TVDetailContentProps {
  show: TVDetails;
  cast: CastMember[];
  similarShows: TVListItem[];
  trailerKey: string | null;
  watchProviders?: WatchProvidersByCountry | null;
  externalIds?: MovieExternalIds | null;
  reviews?: MovieReviewResult[];
  reviewsTotalCount?: number;
}

const REVIEW_PREVIEW_LENGTH = 400;

function TVProviderRow({ label, providers }: { label: string; providers: WatchProviderInfo[] }) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">{label}</p>
      <div className="flex flex-wrap gap-3">
        {providers.map((p) => (
          <div
            key={p.provider_id}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--bg-elevated)] p-1.5 shadow-sm ring-1 ring-[var(--border-subtle)]"
            title={p.provider_name}
          >
            <Image src={getProviderLogoUrl(p.logo_path)} alt={p.provider_name} width={36} height={36} className="object-contain" />
          </div>
        ))}
      </div>
    </div>
  );
}

function TVReviewCard({ review }: { review: MovieReviewResult }) {
  const [expanded, setExpanded] = useState(false);
  const needsTruncation = review.content.length > REVIEW_PREVIEW_LENGTH;
  const displayContent =
    needsTruncation && !expanded ? review.content.slice(0, REVIEW_PREVIEW_LENGTH).trim() + "…" : review.content;
  const dateStr = review.created_at
    ? new Date(review.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
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
            {dateStr && <span className="text-sm text-[var(--text-muted)]">{dateStr}</span>}
          </div>
          <div className="mt-2 whitespace-pre-wrap text-[var(--text-primary)] leading-relaxed">{displayContent}</div>
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
            <a href={review.url} target="_blank" rel="noopener noreferrer" className="mt-2 block text-xs text-[var(--text-muted)] hover:text-[var(--accent)]">
              View on TMDb →
            </a>
          )}
        </div>
      </div>
    </li>
  );
}

function formatStatus(status: string | undefined): string {
  if (!status) return "—";
  return status.replace(/_/g, " ");
}

export function TVDetailContent({
  show,
  cast,
  similarShows,
  trailerKey,
  watchProviders,
  externalIds,
  reviews = [],
  reviewsTotalCount = 0,
}: TVDetailContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist(user?.uid ?? null);
  const { addToHistory } = useWatchHistory(user?.uid ?? null);
  const { watchlistCount } = useTVStats(show.id);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [trailerModalOpen, setTrailerModalOpen] = useState(false);
  const [shareDone, setShareDone] = useState(false);

  const inWatchlist = isInWatchlist("tv", show.id);
  const handleWatchlistClick = useCallback(() => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (inWatchlist) removeFromWatchlist("tv", show.id);
    else addToWatchlist(show, "tv");
  }, [user, inWatchlist, show, addToWatchlist, removeFromWatchlist]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const backdropY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const backdropOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.5, 0]);

  const trailerEmbedUrl = trailerKey
    ? `https://www.youtube.com/embed/${trailerKey}?autoplay=1`
    : null;
  const closeTrailerModal = useCallback(() => setTrailerModalOpen(false), []);
  const year = show.first_air_date
    ? new Date(show.first_air_date).getFullYear()
    : "";
  const posterUrl = getPosterUrl(show.poster_path, "w500");
  const backdropUrl = getBackdropUrl(show.backdrop_path, "original");

  // Add to watch history when user views this show (signed-in only)
  useEffect(() => {
    if (!user) return;
    addToHistory(show, "tv");
  }, [user?.uid, show.id, show.name, show.poster_path, addToHistory]);

  useEffect(() => {
    if (!trailerModalOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeTrailerModal();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [trailerModalOpen, closeTrailerModal]);

  useEffect(() => {
    if (trailerModalOpen) document.body.classList.add("theater-mode");
    else document.body.classList.remove("theater-mode");
    return () => document.body.classList.remove("theater-mode");
  }, [trailerModalOpen]);

  function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      navigator.share({ title: show.name, text: show.overview ?? undefined, url }).then(() => setShareDone(true)).catch(() => {});
    } else {
      navigator.clipboard?.writeText(url).then(() => setShareDone(true));
    }
  }

  return (
    <>
      <div ref={containerRef} className="bg-[var(--black)]">
        <section
          className="relative flex min-h-[min(70vh,480px)] flex-col justify-end pb-12 pt-16 sm:min-h-[80vh] sm:pb-16 sm:pt-20 lg:min-h-[85vh]"
          aria-label="Show hero"
        >
          <div className="absolute inset-0 overflow-hidden">
            {backdropUrl ? (
              <motion.div className="absolute inset-0 will-change-transform" style={{ y: backdropY, opacity: backdropOpacity }}>
                <Image src={backdropUrl} alt="" fill className="object-cover object-center" sizes="100vw" priority />
              </motion.div>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-primary)]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" aria-hidden />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black/50" aria-hidden />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black" aria-hidden />
            <div className="grain absolute inset-0" aria-hidden />
          </div>

          <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-8">
            <div className="flex justify-center lg:col-span-3 lg:justify-end">
              <div className="relative aspect-[2/3] w-full max-w-[300px] overflow-hidden rounded-lg border-2 border-white/10 shadow-2xl lg:max-w-none">
                {show.poster_path ? (
                  <Image src={posterUrl} alt={`${show.name} poster`} fill className="object-cover" sizes="(max-width: 1024px) 300px, 320px" priority />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[var(--bg-card)] text-6xl">📺</div>
                )}
              </div>
            </div>

            <div className="lg:col-span-9 lg:flex lg:flex-col lg:justify-end">
              <div className="max-w-2xl">
                <p className="text-sm font-mono uppercase tracking-wider text-[var(--accent)]">TV Series</p>
                <h1 className="font-display text-3xl font-bold leading-tight tracking-wide text-white sm:text-4xl lg:text-5xl xl:text-6xl">
                  {show.name}
                </h1>
                {show.tagline && <p className="mt-2 text-lg italic text-gray-300">{show.tagline}</p>}

                <div className="mt-4 flex flex-wrap items-center gap-4">
                  {year && <span className="font-mono uppercase tracking-wider text-gray-300">{year}</span>}
                  <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-3 py-1 backdrop-blur-sm">
                    <span className="text-yellow-500" aria-hidden>★</span>
                    <span className="font-semibold text-white">{show.vote_average.toFixed(1)}</span>
                    <span className="text-sm text-gray-400">({show.vote_count} votes)</span>
                  </span>
                  {show.number_of_seasons > 0 && (
                    <span className="font-mono text-gray-300">
                      {show.number_of_seasons} {show.number_of_seasons === 1 ? "season" : "seasons"}
                      {show.number_of_episodes > 0 && ` · ${show.number_of_episodes} episodes`}
                    </span>
                  )}
                  {show.status && (
                    <span className="rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/20 px-3 py-1 font-mono text-xs uppercase tracking-wider text-[var(--accent)]">
                      {formatStatus(show.status)}
                    </span>
                  )}
                </div>

                {watchlistCount > 0 && (
                  <p className="mt-2 text-sm text-gray-400">
                    {watchlistCount} {watchlistCount === 1 ? "person has" : "people have"} this in their watchlist
                  </p>
                )}

                {show.genres && show.genres.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {show.genres.map((g) => (
                      <Link
                        key={g.id}
                        href={`/genre/tv/${g.id}`}
                        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white backdrop-blur-sm transition-all duration-300 hover:border-[var(--accent)]/50 hover:bg-white/10"
                      >
                        {g.name}
                      </Link>
                    ))}
                  </div>
                )}

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  {trailerEmbedUrl && (
                    <motion.button
                      type="button"
                      onClick={() => setTrailerModalOpen(true)}
                      className="flex items-center gap-3 rounded-lg bg-[var(--accent)] px-8 py-4 font-mono text-sm uppercase tracking-wider text-white shadow-lg shadow-[var(--accent)]/30 transition-colors hover:bg-[var(--accent-hover)]"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      Play Trailer
                    </motion.button>
                  )}
                  <motion.button
                    type="button"
                    onClick={handleWatchlistClick}
                    className="flex items-center gap-3 rounded-lg border border-white/20 bg-white/5 px-6 py-4 backdrop-blur-sm transition-colors hover:border-white/40 hover:bg-white/10"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {inWatchlist ? (
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
                    )}
                    {inWatchlist ? "In watchlist" : "Add to watchlist"}
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={handleShare}
                    className="flex items-center gap-3 rounded-lg border border-white/20 bg-white/5 px-6 py-4 backdrop-blur-sm transition-colors hover:border-white/40 hover:bg-white/10"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    {shareDone ? "Copied!" : "Share"}
                  </motion.button>
                </div>
              </div>
            </div>
          </div>

          <motion.div
            className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 text-white/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <motion.div className="font-mono text-xs uppercase tracking-wider" animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
              Scroll
            </motion.div>
            <svg className="mx-auto mt-1 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </section>

        <div className="bg-black py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-10">
                {show.overview && (
                  <section>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="h-8 w-1 shrink-0 bg-[var(--accent)]" aria-hidden />
                      <h2 className="font-display text-3xl tracking-wide text-white sm:text-4xl">Overview</h2>
                    </div>
                    <p className="text-lg leading-relaxed text-gray-300">{show.overview}</p>
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
                            <h2 className="font-display text-3xl tracking-wide text-white sm:text-4xl">Where to watch</h2>
                          </div>
                          <p className="mb-3 text-sm text-[var(--text-muted)]">Availability in the US. Data from JustWatch via TMDb.</p>
                          <div className="flex flex-col gap-4">
                            {watchProviders.flatrate && watchProviders.flatrate.length > 0 && (
                              <TVProviderRow label="Stream" providers={watchProviders.flatrate} />
                            )}
                            {watchProviders.rent && watchProviders.rent.length > 0 && (
                              <TVProviderRow label="Rent" providers={watchProviders.rent} />
                            )}
                            {watchProviders.buy && watchProviders.buy.length > 0 && (
                              <TVProviderRow label="Buy" providers={watchProviders.buy} />
                            )}
                          </div>
                          {watchProviders.link && (
                            <a href={watchProviders.link} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm text-[var(--accent)] hover:underline">
                              See all options on TMDb →
                            </a>
                          )}
                        </section>
                      );
                    })()
                  : null}

                {/* Social & external links */}
                {(externalIds?.imdb_id || externalIds?.facebook_id || externalIds?.instagram_id || externalIds?.twitter_id || externalIds?.wikidata_id) && (
                  <section>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="h-8 w-1 shrink-0 bg-[var(--accent)]" aria-hidden />
                      <h2 className="font-display text-3xl tracking-wide text-white sm:text-4xl">Social & links</h2>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {externalIds?.imdb_id && (
                        <a href={`https://www.imdb.com/title/${externalIds.imdb_id}/`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-3 text-[var(--accent)] transition-colors hover:bg-[var(--bg-elevated)]" title="IMDb">
                          <span className="font-semibold">IMDb</span>
                          <span aria-hidden>↗</span>
                        </a>
                      )}
                      {externalIds?.facebook_id && (
                        <a href={`https://www.facebook.com/${externalIds.facebook_id}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-3 text-[var(--accent)] transition-colors hover:bg-[var(--bg-elevated)]" title="Facebook">
                          <span className="font-semibold">Facebook</span>
                          <span aria-hidden>↗</span>
                        </a>
                      )}
                      {externalIds?.twitter_id && (
                        <a href={`https://twitter.com/${externalIds.twitter_id}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-3 text-[var(--accent)] transition-colors hover:bg-[var(--bg-elevated)]" title="X (Twitter)">
                          <span className="font-semibold">X</span>
                          <span aria-hidden>↗</span>
                        </a>
                      )}
                      {externalIds?.instagram_id && (
                        <a href={`https://www.instagram.com/${externalIds.instagram_id}/`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-3 text-[var(--accent)] transition-colors hover:bg-[var(--bg-elevated)]" title="Instagram">
                          <span className="font-semibold">Instagram</span>
                          <span aria-hidden>↗</span>
                        </a>
                      )}
                      {externalIds?.wikidata_id && (
                        <a href={`https://www.wikidata.org/wiki/${externalIds.wikidata_id}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-3 text-[var(--accent)] transition-colors hover:bg-[var(--bg-elevated)]" title="Wikidata">
                          <span className="font-semibold">Wikidata</span>
                          <span aria-hidden>↗</span>
                        </a>
                      )}
                      {show.homepage && (
                        <a href={show.homepage} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-3 text-[var(--accent)] transition-colors hover:bg-[var(--bg-elevated)]" title="Official website">
                          <span className="font-semibold">Website</span>
                          <span aria-hidden>↗</span>
                        </a>
                      )}
                    </div>
                  </section>
                )}

                {/* Awards (link to IMDb) */}
                {externalIds?.imdb_id && (
                  <section>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="h-8 w-1 shrink-0 bg-[var(--accent)]" aria-hidden />
                      <h2 className="font-display text-3xl tracking-wide text-white sm:text-4xl">Awards</h2>
                    </div>
                    <p className="text-[var(--text-muted)] mb-2">Award information is not provided by TMDb. View awards and nominations on IMDb.</p>
                    <a href={`https://www.imdb.com/title/${externalIds.imdb_id}/awards/`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-[var(--accent)]/50 bg-[var(--accent)]/10 px-4 py-3 text-[var(--accent)] transition-colors hover:bg-[var(--accent)]/20">
                      View awards on IMDb
                      <span aria-hidden>↗</span>
                    </a>
                  </section>
                )}

                {/* Reviews */}
                {reviews.length > 0 && (
                  <section>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="h-8 w-1 shrink-0 bg-[var(--accent)]" aria-hidden />
                      <h2 className="font-display text-3xl tracking-wide text-white sm:text-4xl">Reviews</h2>
                      {reviewsTotalCount > 0 && (
                        <span className="text-sm text-[var(--text-muted)]">{reviewsTotalCount} {reviewsTotalCount === 1 ? "review" : "reviews"}</span>
                      )}
                    </div>
                    <ul className="space-y-6">
                      {reviews.slice(0, 5).map((review: MovieReviewResult) => (
                        <TVReviewCard key={review.id} review={review} />
                      ))}
                    </ul>
                    {reviewsTotalCount > 5 && (
                      <a href={`https://www.themoviedb.org/tv/${show.id}/reviews`} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm text-[var(--accent)] hover:underline">
                        View all {reviewsTotalCount} reviews on TMDb →
                      </a>
                    )}
                  </section>
                )}
              </div>

              <aside className="space-y-6">
                <div className="rounded-lg border border-[var(--border-subtle)] bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-elevated)] p-6">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">Details</h3>
                  <dl className="mt-4 space-y-3">
                    <div>
                      <dt className="text-xs text-[var(--text-muted)]">Status</dt>
                      <dd className="font-medium text-white">{formatStatus(show.status)}</dd>
                    </div>
                    {show.first_air_date && (
                      <div>
                        <dt className="text-xs text-[var(--text-muted)]">First air date</dt>
                        <dd className="font-medium text-white">
                          {new Date(show.first_air_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                        </dd>
                      </div>
                    )}
                    {show.number_of_seasons > 0 && (
                      <div>
                        <dt className="text-xs text-[var(--text-muted)]">Seasons / Episodes</dt>
                        <dd className="font-medium text-white">{show.number_of_seasons} · {show.number_of_episodes} episodes</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </aside>
            </div>

            {cast.length > 0 && (
              <section className="mt-16">
                <div className="flex items-center gap-3 mb-6">
                  <span className="h-8 w-1 shrink-0 bg-[var(--accent)]" aria-hidden />
                  <h2 className="font-display text-3xl tracking-wide text-white sm:text-4xl">Cast</h2>
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
                      <Link href="#" className="block overflow-hidden rounded-lg border border-white/10 transition-colors hover:border-white/20">
                        <div className="relative aspect-[2/3] overflow-hidden bg-[var(--bg-card)]">
                          {c.profile_path ? (
                            <Image src={getProfileUrl(c.profile_path, "w185")} alt={c.name} fill className="object-cover transition-transform duration-300 group-hover:scale-110" sizes="160px" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-card)] text-4xl">👤</div>
                          )}
                        </div>
                        <div className="p-2">
                          <p className="truncate text-sm font-semibold text-white">{c.name}</p>
                          <p className="truncate text-xs text-[var(--text-muted)]">{c.character}</p>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                  <div className="min-w-[16px] shrink-0 sm:min-w-[24px]" aria-hidden />
                </div>
              </section>
            )}

            {similarShows.length > 0 && (
              <section className="mt-16">
                <div className="flex items-center gap-3 mb-6">
                  <span className="h-8 w-1 shrink-0 bg-[var(--accent)]" aria-hidden />
                  <h2 className="font-display text-3xl tracking-wide text-white sm:text-4xl">Similar shows</h2>
                </div>
                <div className="scroll-row flex gap-4 overflow-x-auto pb-2 pt-1">
                  <div className="min-w-[16px] shrink-0 sm:min-w-[24px]" aria-hidden />
                  {similarShows.map((s) => (
                    <Link
                      key={s.id}
                      href={`/tv/${s.id}`}
                      className="group w-36 shrink-0 sm:w-40 md:w-44"
                    >
                      <div className="overflow-hidden rounded-lg border border-white/10 bg-[var(--bg-card)] transition-colors group-hover:border-[var(--accent)]/50">
                        <div className="relative aspect-[2/3] bg-[var(--bg-elevated)]">
                          <Image
                            src={getPosterUrl(s.poster_path, "w342")}
                            alt={s.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="176px"
                          />
                        </div>
                        <div className="p-2">
                          <p className="truncate text-sm font-medium text-white">{s.name}</p>
                          <p className="text-xs text-[var(--text-muted)]">
                            {s.first_air_date ? new Date(s.first_air_date).getFullYear() : ""}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                  <div className="min-w-[16px] shrink-0 sm:min-w-[24px]" aria-hidden />
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {trailerModalOpen && trailerEmbedUrl && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={closeTrailerModal} aria-hidden />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "tween", duration: 0.2 }}
              className="relative w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-4 mb-2">
                <h2 className="font-display text-lg sm:text-xl tracking-wide text-white">{show.name} — Trailer</h2>
                <button type="button" onClick={closeTrailerModal} className="rounded-lg p-2 text-white/80 hover:bg-white/10 hover:text-white transition-colors" aria-label="Close trailer">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black shadow-2xl">
                <iframe src={trailerEmbedUrl} title={`${show.name} trailer`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="absolute inset-0 h-full w-full" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}
