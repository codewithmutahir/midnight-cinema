import Link from "next/link";

export function CTABlock() {
  return (
    <section className="rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 p-6 text-center">
      <h2 className="font-display text-xl font-semibold text-[var(--text-primary)]">
        Find your next watch
      </h2>
      <p className="mt-2 text-sm text-[var(--text-muted)]">
        Explore movies and TV shows by genre, mood, and more.
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)]"
        >
          Discover movies
        </Link>
        <Link
          href="/pick"
          className="rounded-md border border-[var(--border-subtle)] bg-transparent px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-elevated)]"
        >
          Random picker
        </Link>
        <Link
          href="/indian"
          className="rounded-md border border-[var(--border-subtle)] bg-transparent px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-elevated)]"
        >
          Indian cinema
        </Link>
      </div>
    </section>
  );
}
