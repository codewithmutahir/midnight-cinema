"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useWatchHistory } from "@/hooks/useWatchHistory";
import { getPosterUrl } from "@/lib/tmdb";
import { GridSkeleton } from "@/components/skeletons";

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const { history, loading: listLoading, removeFromHistory } = useWatchHistory(user?.uid ?? null);

  if (authLoading || !user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-[var(--text-muted)]">Sign in to view your watch history.</p>
      </div>
    );
  }

  if (listLoading) {
    return <GridSkeleton title count={10} cols={5} />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl tracking-wide text-[var(--text-primary)] sm:text-4xl">
        Recently watched
      </h1>
      <p className="mt-1 text-[var(--text-muted)]">
        Movies and TV shows you&apos;ve viewed. Visit a detail page again to update the list.
      </p>
      {history.length === 0 ? (
        <div className="mt-12 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-12 text-center">
          <p className="text-[var(--text-muted)]">No history yet. Open a movie or TV show to start.</p>
          <Link href="/" className="mt-4 inline-block text-[var(--accent)] hover:underline">
            Discover
          </Link>
        </div>
      ) : (
        <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {history.map((item) => (
            <li key={item.id} className="group relative">
              <Link
                href={item.type === "tv" ? `/tv/${item.itemId}` : `/movie/${item.itemId}`}
                className="block overflow-hidden rounded-lg bg-[var(--bg-card)]"
              >
                <div className="aspect-[2/3] relative overflow-hidden bg-[var(--bg-secondary)]">
                  <Image
                    src={getPosterUrl(item.posterPath, "w342")}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-200 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, 20vw"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-1/2 gradient-overlay-bottom" />
                  <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-0.5 text-xs font-medium text-white">
                    {item.type === "tv" ? "TV" : "Movie"}
                  </span>
                </div>
                <div className="p-3">
                  <h3 className="line-clamp-2 font-medium text-[var(--text-primary)]">{item.title}</h3>
                </div>
              </Link>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  removeFromHistory(item.type, item.itemId);
                }}
                className="absolute right-2 top-2 rounded bg-black/70 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600/90"
                aria-label={`Remove ${item.title} from history`}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
