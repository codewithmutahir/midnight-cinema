"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const MOODS = [
  { label: "Action", href: "/genre/28", emoji: "💥" },
  { label: "Comedy", href: "/genre/35", emoji: "😂" },
  { label: "Drama", href: "/genre/18", emoji: "🎭" },
  { label: "Horror", href: "/genre/27", emoji: "👻" },
  { label: "Sci‑Fi", href: "/genre/878", emoji: "🚀" },
  { label: "Thriller", href: "/genre/53", emoji: "🔪" },
  { label: "Romance", href: "/genre/10749", emoji: "❤️" },
];

export function MoodBar() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" aria-label="Mood discovery">
      <h2 className="mb-4 font-display text-xl tracking-wide text-[var(--text-primary)] sm:text-2xl">
        How are you feeling?
      </h2>
      <div className="flex flex-wrap gap-2">
        {MOODS.map((mood, i) => (
          <motion.div
            key={mood.href}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Link
              href={mood.href}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent)]/10 hover:text-[var(--accent)]"
            >
              <span aria-hidden>{mood.emoji}</span>
              {mood.label}
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
