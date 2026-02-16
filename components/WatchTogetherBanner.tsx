"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function WatchTogetherBanner() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
    >
      <Link
        href="/watch-together"
        className="block overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-8 transition-colors hover:border-[var(--accent)]/50 hover:bg-[var(--accent)]/5 sm:p-12"
      >
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-sm font-medium uppercase tracking-wider text-[var(--accent)]">
              Watch together
            </span>
            <h2 className="mt-2 font-display text-2xl tracking-wide text-[var(--text-primary)] sm:text-3xl md:text-4xl">
              Create a room. Share the code. Watch in sync.
            </h2>
            <p className="mt-3 max-w-xl text-[var(--text-muted)]">
              Start a Watch Together room, invite friends with a 6-letter code, and chat while you watch.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-6 py-3 font-medium text-white">
            Get started
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </span>
        </div>
      </Link>
    </motion.section>
  );
}
