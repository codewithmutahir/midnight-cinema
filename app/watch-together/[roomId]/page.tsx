"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useWatchRoom } from "@/hooks/useWatchRoom";
import { getPosterUrl } from "@/lib/tmdb";
import { Skeleton } from "@/components/skeletons";

export default function WatchRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const { user, loading: authLoading } = useAuth();
  const {
    room,
    participants,
    messages,
    sendMessage,
    sendReaction,
    leaveRoom,
    joinRoom,
  } = useWatchRoom(roomId);
  const [messageInput, setMessageInput] = useState("");
  const joinAttempted = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || !roomId || joinAttempted.current) return;
    joinAttempted.current = true;
    joinRoom(roomId, user.uid, user.displayName || "Guest", user.photoURL || "").catch(console.error);
  }, [user, roomId, joinRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/watch-together");
  }, [authLoading, user, router]);

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = messageInput.trim();
    if (!text || !user) return;
    await sendMessage(roomId, user.uid, user.displayName || "Guest", user.photoURL || "", text);
    setMessageInput("");
  }

  async function handleLeave() {
    if (!user) return;
    await leaveRoom(roomId, user.uid);
    router.push("/watch-together");
  }

  if (authLoading || !user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <Skeleton className="h-8 w-48" />
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-64 rounded-xl lg:col-span-2" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-[var(--text-muted)]">Room not found or you don’t have access.</p>
        <Link href="/watch-together" className="mt-4 inline-block text-[var(--accent)] hover:underline">
          Back to Watch Together
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/watch-together" className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            ← Back
          </Link>
          <div>
            <h1 className="font-display text-2xl text-[var(--text-primary)]">
              {room.movieTitle || "Movie night"}
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              Code: <span className="font-mono tracking-wider text-[var(--accent)]">{room.roomCode}</span>
            </p>
          </div>
          {room.moviePoster && (
            <div className="relative h-16 w-11 overflow-hidden rounded bg-[var(--bg-card)]">
              <Image src={getPosterUrl(room.moviePoster, "w92")} alt="" fill className="object-cover" sizes="44px" />
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={handleLeave}
          className="rounded-lg border border-[var(--border-subtle)] px-4 py-2 text-sm text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
        >
          Leave room
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 lg:col-span-2">
          <h2 className="font-display text-lg text-[var(--text-primary)]">Watch</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Sync playback with your group. Play the movie on your preferred streaming service and use chat to react together.
          </p>
          {room.movieId && room.movieId > 0 && (
            <Link
              href={`/movie/${room.movieId}`}
              className="mt-4 inline-block text-[var(--accent)] hover:underline"
            >
              View movie details →
            </Link>
          )}
        </section>

        <section className="flex flex-col rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
          <h2 className="border-b border-[var(--border-subtle)] p-3 font-display text-lg text-[var(--text-primary)]">
            Participants ({participants.length})
          </h2>
          <ul className="flex-1 space-y-2 overflow-auto p-3">
            {participants.map((p) => (
              <li key={p.id} className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
                <span className="h-2 w-2 rounded-full bg-[var(--success)]" aria-hidden />
                {p.displayName}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {room.settings?.allowChat !== false && (
        <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
          <h2 className="border-b border-[var(--border-subtle)] p-3 font-display text-lg text-[var(--text-primary)]">
            Chat
          </h2>
          <div className="flex h-64 flex-col">
            <div className="flex-1 overflow-auto p-3">
              {messages.length === 0 && (
                <p className="text-sm text-[var(--text-muted)]">No messages yet. Say something!</p>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className="mb-2">
                  {msg.type === "reaction" ? (
                    <span className="text-2xl" aria-label="Reaction">{msg.message}</span>
                  ) : (
                    <p className="text-sm">
                      <span className="font-medium text-[var(--accent)]">{msg.displayName}:</span>{" "}
                      <span className="text-[var(--text-primary)]">{msg.message}</span>
                    </p>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-[var(--border-subtle)] p-3">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message…"
                className="flex-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-4 py-2 text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
              />
              <button
                type="submit"
                className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
              >
                Send
              </button>
            </form>
          </div>
        </section>
      )}
    </div>
  );
}
