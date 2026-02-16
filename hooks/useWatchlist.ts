"use client";

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { MovieListItem } from "@/types/movie";
import type { TVListItem } from "@/types/tv";

export type WatchlistMediaType = "movie" | "tv";

export interface WatchlistItem {
  id: string;
  type: WatchlistMediaType;
  itemId: number;
  /** @deprecated use itemId; kept for legacy docs */
  movieId?: number;
  title: string;
  posterPath: string | null;
  genres?: number[];
  addedAt: unknown;
  priority?: string;
  notes?: string;
}

function docId(type: WatchlistMediaType, itemId: number): string {
  return `${type}_${itemId}`;
}

function getStatsRef(type: WatchlistMediaType, itemId: number) {
  const collectionName = type === "movie" ? "movieStats" : "tvStats";
  return doc(db, collectionName, String(itemId));
}

export function useWatchlist(userId: string | null) {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setWatchlist([]);
      setLoading(false);
      return;
    }
    const watchlistRef = collection(db, "users", userId, "watchlist");
    const q = query(watchlistRef, orderBy("addedAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((d) => {
        const data = d.data();
        const hasTypeInId = d.id.includes("_");
        const type: WatchlistMediaType = (data.type as WatchlistMediaType) ?? (hasTypeInId ? (d.id.startsWith("tv_") ? "tv" : "movie") : "movie");
        const itemId = typeof data.itemId === "number" ? data.itemId : (data.movieId ?? (hasTypeInId ? Number.parseInt(d.id.split("_")[1], 10) : Number.parseInt(d.id, 10)));
        return {
          id: d.id,
          type,
          itemId,
          movieId: data.movieId,
          title: data.title,
          posterPath: data.posterPath ?? null,
          genres: data.genres,
          addedAt: data.addedAt,
          priority: data.priority,
          notes: data.notes,
        } as WatchlistItem;
      });
      setWatchlist(items);
      setLoading(false);
    });
    return unsubscribe;
  }, [userId]);

  const addToWatchlist = useCallback(
    async (
      item: MovieListItem | TVListItem | { id: number; title?: string; name?: string; poster_path: string | null; genre_ids?: number[] },
      type: WatchlistMediaType = "movie",
      priority = "medium",
      notes = ""
    ) => {
      if (!userId) return;
      const itemId = item.id;
      const title = "title" in item && item.title != null ? item.title : ("name" in item ? item.name : "");
      const posterPath = "poster_path" in item ? item.poster_path : null;
      const genreIds = "genre_ids" in item ? item.genre_ids : [];
      const docIdKey = docId(type, itemId);
      const movieRef = doc(db, "users", userId, "watchlist", docIdKey);
      const statsRef = getStatsRef(type, itemId);
      const payload: Record<string, unknown> = {
        type,
        itemId,
        title,
        posterPath,
        genres: genreIds ?? [],
        addedAt: serverTimestamp(),
        priority,
        notes,
      };
      if (type === "movie") payload.movieId = itemId;
      await setDoc(movieRef, payload);
      await setDoc(statsRef, { watchlistCount: increment(1) }, { merge: true });
    },
    [userId]
  );

  const removeFromWatchlist = useCallback(
    async (typeOrItem: WatchlistMediaType | WatchlistItem, itemId?: number) => {
      if (!userId) return;
      let ref;
      let type: WatchlistMediaType;
      let id: number;
      if (typeof typeOrItem === "object" && typeOrItem !== null && "id" in typeOrItem) {
        ref = doc(db, "users", userId, "watchlist", typeOrItem.id);
        type = typeOrItem.type;
        id = typeOrItem.itemId;
      } else {
        type = typeOrItem;
        id = itemId ?? 0;
        ref = doc(db, "users", userId, "watchlist", docId(type, id));
      }
      const statsRef = getStatsRef(type, id);
      await deleteDoc(ref);
      await setDoc(statsRef, { watchlistCount: increment(-1) }, { merge: true });
    },
    [userId]
  );

  const isInWatchlist = useCallback(
    (type: WatchlistMediaType, id: number) =>
      watchlist.some((item) => item.type === type && item.itemId === id),
    [watchlist]
  );

  const updatePriority = useCallback(
    async (type: WatchlistMediaType, id: number, priority: string) => {
      if (!userId) return;
      const ref = doc(db, "users", userId, "watchlist", docId(type, id));
      await updateDoc(ref, { priority });
    },
    [userId]
  );

  return {
    watchlist,
    loading,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    updatePriority,
  };
}
