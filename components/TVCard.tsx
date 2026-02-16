"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { TVListItem } from "@/types/tv";
import { getPosterUrl } from "@/lib/tmdb";
import { useAuth } from "@/contexts/AuthContext";
import { useWatchlist } from "@/hooks/useWatchlist";
import { AuthModal } from "@/components/AuthModal";

interface TVCardProps {
  show: TVListItem;
}

export function TVCard({ show }: TVCardProps) {
  const posterUrl = getPosterUrl(show.poster_path, "w342");
  const href = `/tv/${show.id}`;
  const year = show.first_air_date ? new Date(show.first_air_date).getFullYear() : "";
  const { user } = useAuth();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist(user?.uid ?? null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const inList = isInWatchlist("tv", show.id);

  const handleWatchlistClick = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!user) {
        setAuthModalOpen(true);
        return;
      }
      if (busy) return;
      setBusy(true);
      try {
        if (inList) await removeFromWatchlist("tv", show.id);
        else await addToWatchlist(show, "tv");
      } catch (err) {
        console.error("Watchlist update failed:", err);
      } finally {
        setBusy(false);
      }
    },
    [user, busy, inList, show, addToWatchlist, removeFromWatchlist]
  );

  const handleWatchlistPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return (
    <motion.div
      className="group relative overflow-hidden rounded-lg bg-[var(--bg-card)] shadow-lg transition-shadow duration-300 hover:shadow-[0_20px_40px_-12px_var(--accent-glow)]"
      whileHover={{ y: -4 }}
    >
      <Link href={href} className="block outline-none">
        <div className="aspect-[2/3] w-full overflow-hidden bg-[var(--bg-secondary)] relative">
          <Image
            src={posterUrl}
            alt={`${show.name} — TV show poster`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="gradient-overlay-bottom absolute inset-0" />
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded bg-black/70 px-2 py-0.5 text-sm text-white">
            <span className="text-yellow-500">★</span>
            <span>{show.vote_average.toFixed(1)}</span>
          </div>
          <span className="absolute left-2 top-2 rounded bg-[var(--accent)]/90 px-2 py-0.5 text-xs font-medium text-white">
            TV
          </span>
        </div>
        <div className="p-3">
          <p className="font-semibold text-[var(--text-primary)] line-clamp-2">{show.name}</p>
          {year && <p className="mt-0.5 text-xs text-[var(--text-muted)]">{year}</p>}
        </div>
      </Link>
      {/* Watchlist button outside Link so click always adds/removes instead of navigating */}
      <button
        type="button"
        onClick={handleWatchlistClick}
        onPointerDown={handleWatchlistPointerDown}
        onPointerDownCapture={handleWatchlistPointerDown}
        disabled={busy}
        className="absolute left-12 top-2 z-20 rounded-md bg-black/70 p-2 text-white backdrop-blur-sm hover:bg-[var(--accent)] disabled:opacity-70"
        aria-label={inList ? "Remove from watchlist" : "Add to watchlist"}
      >
        {inList ? (
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>
        ) : (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
        )}
      </button>
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </motion.div>
  );
}
