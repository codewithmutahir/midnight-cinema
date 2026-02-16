"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useWatchRoom } from "@/hooks/useWatchRoom";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getPosterUrl } from "@/lib/tmdb";

interface WatchEvent {
  id: string;
  movieId: number;
  movieTitle: string;
  moviePoster: string | null;
  scheduledAt: { toDate: () => Date };
  hostId: string;
  hostName: string;
  createdAt: unknown;
}

export default function WatchEventsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { createRoom } = useWatchRoom(null);
  const [events, setEvents] = useState<WatchEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [movieId, setMovieId] = useState("");
  const [movieTitle, setMovieTitle] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("20:00");

  useEffect(() => {
    const q = query(
      collection(db, "watchEvents"),
      orderBy("scheduledAt", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as WatchEvent & { id: string }))
        .filter((e) => e.scheduledAt && new Date((e.scheduledAt as { toDate: () => Date }).toDate()) > new Date());
      setEvents(list);
      setLoading(false);
    });
    return unsub;
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !movieId.trim() || !scheduledDate || !scheduledTime) return;
    setCreating(true);
    try {
      const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`);
      if (scheduledAt <= new Date()) {
        alert("Please pick a future date and time.");
        setCreating(false);
        return;
      }
      await addDoc(collection(db, "watchEvents"), {
        movieId: parseInt(movieId, 10),
        movieTitle: movieTitle.trim() || "Movie night",
        moviePoster: null,
        scheduledAt,
        hostId: user.uid,
        hostName: user.displayName || user.email || "Anonymous",
        createdAt: serverTimestamp(),
      });
      setMovieId("");
      setMovieTitle("");
      setScheduledDate("");
      setScheduledTime("20:00");
    } catch (err) {
      console.error(err);
      alert("Failed to create event.");
    }
    setCreating(false);
  }

  async function handleStartRoom(event: WatchEvent) {
    if (!user) {
      router.push("/watch-together");
      return;
    }
    try {
      const { roomId } = await createRoom(
        user.uid,
        user.displayName || user.email || "Anonymous",
        event.movieId,
        event.movieTitle,
        event.moviePoster ?? null
      );
      router.push(`/watch-together/${roomId}`);
    } catch {
      router.push("/watch-together");
    }
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="font-display text-3xl text-[var(--text-primary)]">Community watches</h1>
        <p className="mt-4 text-[var(--text-muted)]">Sign in to create or join scheduled events.</p>
        <Link href="/watch-together" className="mt-6 inline-block text-[var(--accent)] hover:underline">
          ← Back to Watch Together
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl tracking-wide text-[var(--text-primary)]">
          Community watches
        </h1>
        <Link
          href="/watch-together"
          className="text-sm text-[var(--text-muted)] hover:text-[var(--accent)]"
        >
          ← Watch Together
        </Link>
      </div>

      <section className="mb-12 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6">
        <h2 className="font-display text-xl text-[var(--text-primary)]">Schedule an event</h2>
        <form onSubmit={handleCreate} className="mt-4 flex flex-wrap gap-4">
          <input
            type="number"
            placeholder="TMDb Movie ID"
            value={movieId}
            onChange={(e) => setMovieId(e.target.value)}
            className="w-36 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-[var(--text-primary)]"
          />
          <input
            type="text"
            placeholder="Movie title (optional)"
            value={movieTitle}
            onChange={(e) => setMovieTitle(e.target.value)}
            className="min-w-[200px] flex-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-[var(--text-primary)]"
          />
          <input
            type="date"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-[var(--text-primary)]"
          />
          <input
            type="time"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
            className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-[var(--text-primary)]"
          />
          <button
            type="submit"
            disabled={creating || !movieId.trim() || !scheduledDate}
            className="rounded-lg bg-[var(--accent)] px-6 py-2 font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-50"
          >
            {creating ? "Creating…" : "Create event"}
          </button>
        </form>
      </section>

      <section>
        <h2 className="font-display text-xl text-[var(--text-primary)] mb-4">Upcoming events</h2>
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
                <div className="h-24 w-16 shrink-0 animate-pulse rounded bg-[var(--bg-elevated)]" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-[var(--bg-elevated)]" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-[var(--bg-elevated)]" />
                  <div className="h-3 w-1/3 animate-pulse rounded bg-[var(--bg-elevated)]" />
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <p className="text-[var(--text-muted)]">No upcoming events. Create one above!</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex gap-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4"
              >
                <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded bg-[var(--bg-elevated)]">
                  {event.moviePoster ? (
                    <Image src={getPosterUrl(event.moviePoster, "w154")} alt="" fill className="object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-2xl">🎬</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[var(--text-primary)] truncate">{event.movieTitle}</p>
                  <p className="text-sm text-[var(--text-muted)]">
                    {new Date((event.scheduledAt as { toDate: () => Date }).toDate()).toLocaleString()}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">Host: {event.hostName}</p>
                  <button
                    type="button"
                    onClick={() => handleStartRoom(event)}
                    className="mt-2 text-sm font-medium text-[var(--accent)] hover:underline"
                  >
                    Start room when ready →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
