"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getPosterUrl } from "@/lib/tmdb";

const SEGMENT_COUNT = 8;
const WHEEL_COLORS = [
  "var(--accent)",
  "var(--bg-elevated)",
  "#1f2937",
  "var(--accent)",
  "var(--bg-card)",
  "#262626",
  "var(--accent-hover)",
  "var(--bg-elevated)",
];

type MediaType = "movie" | "tv";

interface WheelItem {
  id: number;
  title: string;
  poster_path: string | null;
  type: MediaType;
}

export default function PickPage() {
  const [mediaType, setMediaType] = useState<MediaType>("movie");
  const [items, setItems] = useState<WheelItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [targetWinnerIndex, setTargetWinnerIndex] = useState<number | null>(null);
  const [winner, setWinner] = useState<WheelItem | null>(null);
  const [hasSpun, setHasSpun] = useState(false);
  const [restRotation, setRestRotation] = useState(0);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setWinner(null);
    setHasSpun(false);
    setRestRotation(0);
    try {
      const res = await fetch(`/api/pick/random?type=${mediaType}&count=${SEGMENT_COUNT}`);
      const data = await res.json();
      setItems(data.items ?? []);
    } finally {
      setLoading(false);
    }
  }, [mediaType]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSpin = useCallback(() => {
    if (items.length < SEGMENT_COUNT || spinning) return;
    const winnerIndex = Math.floor(Math.random() * Math.min(SEGMENT_COUNT, items.length));
    setTargetWinnerIndex(winnerIndex);
    setSpinning(true);
    setWinner(null);
    setHasSpun(true);
    setTimeout(() => {
      setWinner(items[winnerIndex]);
      setSpinning(false);
      setTargetWinnerIndex(null);
      setRestRotation(rotationForWinner(winnerIndex));
    }, 5200);
  }, [items, spinning]);

  const segmentAngle = 360 / SEGMENT_COUNT;
  const rotationForWinner = (winnerIndex: number) => {
    const base = 360 * 6;
    const offset = 360 - (winnerIndex * segmentAngle + segmentAngle / 2);
    return base + offset;
  };

  const resolvedWinnerIndex = targetWinnerIndex ?? (winner && items.length ? items.findIndex((i) => i.id === winner.id && i.type === winner.type) : -1);
  const finalRotation = resolvedWinnerIndex >= 0 ? rotationForWinner(resolvedWinnerIndex) : restRotation;
  const displayRotation = spinning ? finalRotation : restRotation;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-display text-3xl tracking-wide text-[var(--text-primary)] sm:text-4xl">
          Spin the wheel
        </h1>
        <p className="mt-2 text-[var(--text-muted)]">
          Pick movies or TV — let fate decide what to watch.
        </p>
      </div>

      <div className="relative z-10 mt-8 flex justify-center gap-2" role="tablist" aria-label="Content type">
        {(["movie", "tv"] as const).map((type) => (
          <button
            key={type}
            type="button"
            role="tab"
            aria-selected={mediaType === type}
            tabIndex={mediaType === type ? 0 : -1}
            onClick={(e) => {
              e.preventDefault();
              setMediaType(type);
            }}
            className={`rounded-full px-5 py-2.5 text-sm font-medium capitalize transition-colors ${
              mediaType === type
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            {type === "tv" ? "TV shows" : "Movies"}
          </button>
        ))}
      </div>

      <div className="mt-10 flex flex-col items-center">
        {loading && (
          <div className="flex h-72 w-72 items-center justify-center rounded-full border-2 border-[var(--border-subtle)] bg-[var(--bg-card)]">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
          </div>
        )}

        {!loading && items.length === 0 && !hasSpun && (
          <motion.button
            type="button"
            onClick={fetchItems}
            className="rounded-xl border-2 border-dashed border-[var(--border-subtle)] bg-[var(--bg-card)] px-8 py-6 text-[var(--text-muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            Load wheel
          </motion.button>
        )}

        {!loading && items.length >= SEGMENT_COUNT && (
          <>
            <div className="relative">
              <div
                className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1"
                style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.5))" }}
                aria-hidden
              >
                <svg width="32" height="28" viewBox="0 0 32 28" fill="none" className="text-[var(--accent)]">
                  <path d="M16 0L32 28H0L16 0Z" fill="currentColor" />
                </svg>
              </div>
              <motion.div
                className="relative h-64 w-64 rounded-full border-4 border-[var(--border-subtle)] shadow-[0_0_40px_rgba(0,0,0,0.5)] sm:h-72 sm:w-72"
                style={{
                  background: `conic-gradient(from 0deg, ${WHEEL_COLORS.map((c, i) => `${c} ${i * segmentAngle}deg ${(i + 1) * segmentAngle}deg`).join(", ")})`,
                }}
                animate={{ rotate: displayRotation }}
                transition={
                  spinning
                    ? {
                        type: "tween",
                        duration: 5,
                        ease: [0.17, 0.67, 0.22, 0.99],
                      }
                    : { duration: 0 }
                }
              >
                {items.slice(0, SEGMENT_COUNT).map((item, i) => {
                  const angleDeg = i * segmentAngle + segmentAngle / 2;
                  const radiusPct = 42;
                  const angleRad = (angleDeg * Math.PI) / 180;
                  const x = 50 + radiusPct * Math.sin(angleRad);
                  const y = 50 - radiusPct * Math.cos(angleRad);
                  return (
                    <div
                      key={`${item.type}-${item.id}-${i}`}
                      className="pointer-events-none absolute flex items-center justify-center"
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        width: "28%",
                        transform: `translate(-50%, -50%) rotate(${angleDeg}deg)`,
                      }}
                    >
                      <span
                        className="block max-w-full truncate text-center text-[10px] font-medium leading-tight text-white"
                        style={{ textShadow: "0 0 3px #000, 0 1px 4px #000" }}
                      >
                        {item.title}
                      </span>
                    </div>
                  );
                })}
                <div className="absolute left-1/2 top-1/2 z-10 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-[var(--border-subtle)] bg-[var(--bg-primary)] shadow-inner sm:h-20 sm:w-20">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Wheel</span>
                </div>
              </motion.div>
            </div>

            <motion.button
              type="button"
              onClick={handleSpin}
              disabled={spinning || items.length < SEGMENT_COUNT}
              className="mt-8 rounded-full bg-[var(--accent)] px-8 py-3.5 text-lg font-semibold text-white shadow-[0_0_24px_var(--accent-glow)] transition-opacity hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:pointer-events-none"
            >
              {spinning ? "Spinning…" : "Spin"}
            </motion.button>
          </>
        )}

        <AnimatePresence mode="wait">
          {winner && !spinning && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-12 w-full max-w-sm"
            >
              <p className="mb-4 text-center text-sm font-medium uppercase tracking-wider text-[var(--accent)]">
                Your pick
              </p>
              <Link
                href={winner.type === "movie" ? `/movie/${winner.id}` : `/tv/${winner.id}`}
                className="block overflow-hidden rounded-xl border-2 border-[var(--accent)] bg-[var(--bg-card)] shadow-[0_0 30px_var(--accent-glow)] transition-transform hover:scale-[1.02]"
              >
                <div className="aspect-[2/3] relative overflow-hidden bg-[var(--bg-secondary)]">
                  <Image
                    src={getPosterUrl(winner.poster_path, "w500")}
                    alt={winner.title}
                    fill
                    className="object-cover"
                    sizes="400px"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
                </div>
                <div className="p-4">
                  <h2 className="font-display text-xl text-[var(--text-primary)]">{winner.title}</h2>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">
                    {winner.type === "movie" ? "Movie" : "TV show"} — View details →
                  </p>
                </div>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
