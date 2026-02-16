"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { getPosterUrl } from "@/lib/tmdb";
import type { WatchHistoryItem } from "@/hooks/useWatchHistory";

interface HistoryCardProps {
  item: WatchHistoryItem;
}

export function HistoryCard({ item }: HistoryCardProps) {
  const href = item.type === "movie" ? `/movie/${item.itemId}` : `/tv/${item.itemId}`;
  const posterUrl = getPosterUrl(item.posterPath, "w342");

  return (
    <Link href={href} className="block outline-none">
      <motion.div
        className="group relative overflow-hidden rounded-lg bg-[var(--bg-card)] shadow-lg transition-shadow duration-300 hover:shadow-[0_20px_40px_-12px_var(--accent-glow)]"
        whileHover={{ y: -4 }}
      >
        <div className="aspect-[2/3] w-full overflow-hidden bg-[var(--bg-secondary)] relative">
          <Image
            src={posterUrl}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          <div className="gradient-overlay-bottom absolute inset-0" />
          <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-0.5 text-xs font-medium text-white">
            {item.type === "tv" ? "TV" : "Movie"}
          </span>
        </div>
        <div className="p-3">
          <p className="font-semibold text-[var(--text-primary)] line-clamp-2">{item.title}</p>
        </div>
      </motion.div>
    </Link>
  );
}
