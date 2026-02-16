"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useWatchRoom } from "@/hooks/useWatchRoom";
import { WatchTogetherSkeleton } from "@/components/skeletons";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function WatchTogetherPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { createRoom } = useWatchRoom(null);
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [createMovieId, setCreateMovieId] = useState("");
  const [createMovieTitle, setCreateMovieTitle] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);

  async function handleCreateRoom() {
    if (!user) return;
    setCreateLoading(true);
    setCreateError("");
    try {
      const movieId = createMovieId ? parseInt(createMovieId, 10) : 0;
      const title = createMovieTitle || "Movie night";
      const createWithTimeout = Promise.race([
        createRoom(user.uid, user.displayName || "Host", movieId, title, null),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("timeout")), 30000)
        ),
      ]);
      const { roomId } = await createWithTimeout;
      router.push(`/watch-together/${roomId}`);
    } catch (e) {
      let message = "Failed to create room.";
      if (e instanceof Error) {
        if (e.message === "timeout") {
          message =
            "Request timed out. Check your connection and try again. " +
            "If this keeps happening: open Firebase Console → Firestore (ensure database exists and rules are deployed), and check that your network can reach firestore.googleapis.com.";
        } else {
          message = e.message;
          const err = e as { code?: string };
          if (err.code === "permission-denied") {
            message =
              "Permission denied. Sign in again and ensure Firestore rules are deployed (firebase deploy --only firestore:rules).";
          } else if (err.code === "unavailable" || err.code === "resource-exhausted") {
            message = "Firestore unavailable or rate limited. Check your connection and try again later.";
          }
        }
      }
      setCreateError(message);
      console.error("Create room error:", e);
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleJoinRoom(e: React.FormEvent) {
    e.preventDefault();
    const code = joinCode.trim().toUpperCase();
    if (!code || code.length !== 6) {
      setJoinError("Enter a 6-character code");
      return;
    }
    if (!user) return;
    setJoinLoading(true);
    setJoinError("");
    try {
      const q = query(
        collection(db, "watchRooms"),
        where("roomCode", "==", code),
        limit(1)
      );
      const snap = await getDocs(q);
      const roomDoc = snap.docs[0];
      if (!roomDoc) {
        setJoinError("Room not found. Check the code.");
        setJoinLoading(false);
        return;
      }
      router.push(`/watch-together/${roomDoc.id}`);
    } catch (err) {
      setJoinError("Could not join room.");
    } finally {
      setJoinLoading(false);
    }
  }

  if (authLoading) {
    return <WatchTogetherSkeleton />;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-[var(--text-muted)]">Sign in to create or join a Watch Together room.</p>
        <Link href="/" className="mt-4 inline-block text-[var(--accent)] hover:underline">Back home</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl tracking-wide text-[var(--text-primary)] sm:text-4xl">
        Watch Together
      </h1>
      <p className="mt-2 text-[var(--text-muted)]">
        Create a room and share the code, or join with a code from a friend.
      </p>

      <div className="mt-10 space-y-10">
        <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6">
          <h2 className="font-display text-xl text-[var(--text-primary)]">Create a room</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Optional: add a movie so friends know what you’re watching.</p>
          <div className="mt-4 space-y-4">
            <input
              type="number"
              placeholder="TMDB Movie ID (optional)"
              value={createMovieId}
              onChange={(e) => setCreateMovieId(e.target.value)}
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-4 py-2.5 text-[var(--text-primary)]"
            />
            <input
              type="text"
              placeholder="Movie title (optional)"
              value={createMovieTitle}
              onChange={(e) => setCreateMovieTitle(e.target.value)}
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-4 py-2.5 text-[var(--text-primary)]"
            />
            {createError && (
              <p className="text-sm text-[var(--error)]">{createError}</p>
            )}
            <button
              type="button"
              onClick={handleCreateRoom}
              disabled={createLoading}
              className="w-full rounded-lg bg-[var(--accent)] py-3 font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-50"
            >
              {createLoading ? "Creating…" : "Create room"}
            </button>
          </div>
        </section>

        <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6">
          <h2 className="font-display text-xl text-[var(--text-primary)]">Join with code</h2>
          <form onSubmit={handleJoinRoom} className="mt-4 space-y-4">
            <input
              type="text"
              placeholder="e.g. ABC123"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
              maxLength={6}
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-4 py-2.5 text-center text-lg tracking-[0.3em] text-[var(--text-primary)]"
            />
            {joinError && <p className="text-sm text-[var(--error)]">{joinError}</p>}
            <button
              type="submit"
              disabled={joinLoading}
              className="w-full rounded-lg border border-[var(--accent)] bg-transparent py-3 font-medium text-[var(--accent)] hover:bg-[var(--accent)]/10 disabled:opacity-50"
            >
              {joinLoading ? "Joining…" : "Join room"}
            </button>
          </form>
        </section>

        <p className="text-center text-sm text-[var(--text-muted)]">
          <Link href="/watch-together/events" className="text-[var(--accent)] hover:underline">
            Schedule a community watch →
          </Link>
        </p>
      </div>
    </div>
  );
}
