"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useWatchlist } from "@/hooks/useWatchlist";
import { getPosterUrl } from "@/lib/tmdb";
import { GridSkeleton } from "@/components/skeletons";

export default function WatchlistPage() {
  const { user, loading: authLoading } = useAuth();
  const { watchlist, loading: listLoading, removeFromWatchlist } = useWatchlist(user?.uid ?? null);

  if (authLoading || !user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-[var(--text-muted)]">Sign in to view your watchlist.</p>
      </div>
    );
  }

  if (listLoading) {
    return <GridSkeleton title count={10} cols={5} />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl tracking-wide text-[var(--text-primary)] sm:text-4xl">
        Your watchlist
      </h1>
      <p className="mt-1 text-[var(--text-muted)]">
        {watchlist.length} item{watchlist.length !== 1 ? "s" : ""}
        {watchlist.length > 0 && (
          <> ({watchlist.filter((i) => i.type === "movie").length} movie{watchlist.filter((i) => i.type === "movie").length !== 1 ? "s" : ""}, {watchlist.filter((i) => i.type === "tv").length} TV)</>
        )}
      </p>
      {watchlist.length === 0 ? (
        <div className="mt-12 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-12 text-center">
          <p className="text-[var(--text-muted)]">Nothing saved yet. Add movies and TV shows from the home page or detail pages.</p>
          <Link href="/" className="mt-4 inline-block text-[var(--accent)] hover:underline">
            Discover
          </Link>
        </div>
      ) : (
        <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {watchlist.map((item) => (
            <li key={item.id} className="group relative">
              <Link
                href={item.type === "tv" ? `/tv/${item.itemId}` : `/movie/${item.itemId}`}
                className="block overflow-hidden rounded-lg bg-[var(--bg-card)]"
              >
                <div className="aspect-[2/3] overflow-hidden bg-[var(--bg-secondary)]">
                  <Image
                    src={getPosterUrl(item.posterPath, "w342")}
                    alt={item.title}
                    width={342}
                    height={513}
                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
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
                  removeFromWatchlist(item);
                }}
                className="absolute right-2 top-2 rounded-md bg-black/70 p-2 text-white hover:bg-[var(--accent)]"
                aria-label="Remove from watchlist"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M5 3v18h14V3H5zm2 2h10v14H7V5zm2 2v10h2V7H9zm4 0v10h2V7h-2z"/></svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
