"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { MovieListItem } from "@/types/movie";
import { getPosterUrl } from "@/lib/tmdb";
import { useAuth } from "@/contexts/AuthContext";
import { useWatchlist } from "@/hooks/useWatchlist";

interface MovieCardProps {
  movie: MovieListItem;
}

export function MovieCard({ movie }: MovieCardProps) {
  const posterUrl = getPosterUrl(movie.poster_path, "w342");
  const href = `/movie/${movie.id}`;
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0 });
  const { user } = useAuth();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist(user?.uid ?? null);
  const inList = isInWatchlist("movie", movie.id);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTransform({ rotateX: -y * 8, rotateY: x * 8 });
  }

  function handleMouseLeave() {
    setTransform({ rotateX: 0, rotateY: 0 });
  }

  function handleWatchlistClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    if (inList) removeFromWatchlist("movie", movie.id);
    else addToWatchlist(movie, "movie");
  }

  return (
    <Link href={href} className="block outline-none">
      <motion.div
        ref={cardRef}
        className="group relative overflow-hidden rounded-lg bg-[var(--bg-card)] shadow-lg transition-shadow duration-300 hover:shadow-[0_20px_40px_-12px_var(--accent-glow)]"
        style={{
          transformStyle: "preserve-3d",
          perspective: 1000,
          transform: `rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg)`,
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        whileHover={{ y: -4 }}
      >
        <div className="aspect-[2/3] w-full overflow-hidden bg-[var(--bg-secondary)]">
          <Image
            src={posterUrl}
            alt={`${movie.title} poster`}
            width={342}
            height={513}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
          <div className="absolute inset-x-0 bottom-0 h-1/2 gradient-overlay-bottom" />
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
            <span className="text-[var(--accent)]" aria-hidden>★</span>
            {movie.vote_average.toFixed(1)}
          </div>
          {user && (
            <button
              type="button"
              onClick={handleWatchlistClick}
              className="absolute left-2 top-2 rounded-md bg-black/70 p-2 text-white backdrop-blur-sm hover:bg-[var(--accent)]"
              aria-label={inList ? "Remove from watchlist" : "Add to watchlist"}
            >
              {inList ? (
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>
              ) : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
              )}
            </button>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="line-clamp-2 font-semibold text-[var(--text-primary)] group-hover:text-white">
            {movie.title}
          </h3>
          {movie.release_date && (
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
              {new Date(movie.release_date).getFullYear()}
            </p>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
