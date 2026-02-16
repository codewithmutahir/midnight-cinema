"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileSkeleton } from "@/components/skeletons";

export default function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-[var(--text-muted)]">Sign in to view your profile.</p>
        <Link href="/" className="mt-4 inline-block text-[var(--accent)] hover:underline">
          Back home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl tracking-wide text-[var(--text-primary)] sm:text-4xl">
        Profile
      </h1>

      <div className="mt-8 flex flex-col items-start gap-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 sm:flex-row sm:items-center">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-[var(--bg-elevated)]">
          {user.photoURL ? (
            <Image
              src={user.photoURL}
              alt=""
              fill
              className="object-cover"
              sizes="96px"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-3xl font-medium text-[var(--accent)]">
              {(user.displayName || user.email)?.[0]?.toUpperCase() ?? "?"}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-xl text-[var(--text-primary)]">
            {user.displayName || "Anonymous"}
          </p>
          {user.email && (
            <p className="mt-1 truncate text-sm text-[var(--text-muted)]">
              {user.email}
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 space-y-2">
        <h2 className="font-display text-lg text-[var(--text-primary)]">Quick links</h2>
        <ul className="space-y-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] p-2">
          <li>
            <Link
              href="/watchlist"
              className="block rounded-md px-4 py-3 text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-elevated)]"
            >
              Watchlist
            </Link>
          </li>
          <li>
            <Link
              href="/watch-together"
              className="block rounded-md px-4 py-3 text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-elevated)]"
            >
              Watch Together
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
