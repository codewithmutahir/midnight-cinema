"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { MovieListItem } from "@/types/movie";
import { getBackdropUrl } from "@/lib/tmdb";

const AUTOPLAY_MS = 5500;
const TICK_MS = 50;

interface HeroSliderProps {
  movies: MovieListItem[];
}

export function HeroSlider({ movies }: HeroSliderProps) {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const startTimeRef = useRef(Date.now());
  const total = movies.length;

  const goNext = useCallback(() => {
    startTimeRef.current = Date.now();
    setProgress(0);
    setIndex((i) => (i + 1) % total);
  }, [total]);

  const goPrev = useCallback(() => {
    startTimeRef.current = Date.now();
    setProgress(0);
    setIndex((i) => (i - 1 + total) % total);
  }, [total]);

  const goTo = useCallback((i: number) => {
    startTimeRef.current = Date.now();
    setProgress(0);
    setIndex(i);
  }, []);

  useEffect(() => {
    if (total <= 1) return;
    const t = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const p = Math.min(elapsed / AUTOPLAY_MS, 1);
      setProgress(p);
      if (p >= 1) {
        startTimeRef.current = Date.now();
        setProgress(0);
        setIndex((i) => (i + 1) % total);
      }
    }, TICK_MS);
    return () => clearInterval(t);
  }, [total]);

  if (movies.length === 0) return null;

  const movie = movies[index];

  return (
    <section className="relative h-[min(75vh,640px)] w-full overflow-hidden" aria-label="Featured movies slider">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={movie.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0"
        >
          <HeroSlide movie={movie} isFirstSlide={index === 0} />
        </motion.div>
      </AnimatePresence>

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-2 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] sm:left-4"
            aria-label="Previous slide"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={goNext}
            className="absolute right-2 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] sm:right-4"
            aria-label="Next slide"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 sm:bottom-6">
            {movies.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                className={`relative overflow-hidden rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)] ${
                  i === index ? "h-2 w-8 bg-white/30 hover:bg-white/40" : "h-2 w-2 bg-white/50 hover:bg-white/70"
                }`}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
              >
                {i === index && (
                  <span
                    className="absolute inset-y-0 left-0 rounded-full bg-[var(--accent)]"
                    style={{ width: `${progress * 100}%` }}
                  />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function HeroSlide({ movie, isFirstSlide }: { movie: MovieListItem; isFirstSlide?: boolean }) {
  const backdropUrl = getBackdropUrl(movie.backdrop_path, "w1280");

  return (
    <div className="absolute inset-0 bg-[var(--bg-secondary)] min-h-[min(65vh,400px)] sm:min-h-[min(75vh,640px)]">
      {backdropUrl ? (
        <Image
          src={backdropUrl}
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
          priority
          fetchPriority={isFirstSlide ? "high" : undefined}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-card)] to-[var(--bg-primary)]" />
      )}
      <div className="absolute inset-0 gradient-hero-left" />
      <div className="absolute inset-0 gradient-hero-bottom" />
      <div className="grain absolute inset-0" />

      <div className="relative z-10 flex h-full items-end px-4 pb-16 pt-20 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
        <div className="mx-auto w-full max-w-7xl">
          <div className="flex max-w-2xl flex-col gap-4 sm:gap-5">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
              Trending now
            </span>
            <h1 className="font-display text-3xl leading-[1.1] tracking-wide text-[var(--text-primary)] sm:text-5xl md:text-6xl lg:text-7xl">
              <Link
                href={`/movie/${movie.id}`}
                className="transition-opacity hover:opacity-90"
              >
                {movie.title}
              </Link>
            </h1>
            {movie.overview && (
              <p className="line-clamp-3 max-w-xl text-sm text-[var(--text-muted)] sm:text-base">
                {movie.overview}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--text-muted)]">
              {movie.release_date && (
                <span>{new Date(movie.release_date).getFullYear()}</span>
              )}
              <span className="flex items-center gap-1.5">
                <span className="text-[var(--accent)]" aria-hidden>★</span>
                <span>{movie.vote_average.toFixed(1)}</span>
              </span>
            </div>
            <Link
              href={`/movie/${movie.id}`}
              className="mt-1 inline-flex w-fit items-center rounded-md bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-[var(--accent-hover)] hover:shadow-[0_0_20px_var(--accent-glow)]"
            >
              View details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
