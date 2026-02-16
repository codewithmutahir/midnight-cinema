"use client";

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { MovieListItem } from "@/types/movie";
import type { TVListItem } from "@/types/tv";

export type HistoryMediaType = "movie" | "tv";

export interface WatchHistoryItem {
  id: string;
  type: HistoryMediaType;
  itemId: number;
  /** @deprecated use itemId; kept for legacy movie docs */
  movieId?: number;
  title: string;
  posterPath: string | null;
  watchedAt: unknown;
  rating?: number;
  watchCount?: number;
}

function historyDocId(type: HistoryMediaType, itemId: number): string {
  return `${type}_${itemId}`;
}

export function useWatchHistory(userId: string | null) {
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setHistory([]);
      setLoading(false);
      return;
    }
    const historyRef = collection(db, "users", userId, "history");
    const q = query(historyRef, orderBy("watchedAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((d) => {
        const data = d.data();
        const hasTypeInId = d.id.includes("_");
        const type: HistoryMediaType =
          (data.type as HistoryMediaType) ??
          (hasTypeInId ? (d.id.startsWith("tv_") ? "tv" : "movie") : "movie");
        const itemId =
          typeof data.itemId === "number"
            ? data.itemId
            : (data.movieId ??
              (hasTypeInId ? Number.parseInt(d.id.split("_")[1], 10) : Number.parseInt(d.id, 10)));
        const title = data.title ?? "";
        const posterPath = data.posterPath ?? null;
        return {
          id: d.id,
          type,
          itemId,
          movieId: data.movieId,
          title,
          posterPath,
          watchedAt: data.watchedAt,
          rating: data.rating,
          watchCount: data.watchCount,
        } as WatchHistoryItem;
      });
      setHistory(items);
      setLoading(false);
    });
    return unsubscribe;
  }, [userId]);

  const addToHistory = useCallback(
    async (
      item:
        | MovieListItem
        | TVListItem
        | { id: number; title?: string; name?: string; poster_path: string | null },
      type: HistoryMediaType = "movie"
    ) => {
      if (!userId) return;
      const itemId = item.id;
      const title =
        "title" in item && item.title != null
          ? item.title
          : "name" in item && item.name != null
            ? item.name
            : "";
      const posterPath = "poster_path" in item ? item.poster_path ?? null : null;
      const docIdKey = historyDocId(type, itemId);
      const historyRef = doc(db, "users", userId, "history", docIdKey);
      const payload: Record<string, unknown> = {
        type,
        itemId,
        title,
        posterPath,
        watchedAt: serverTimestamp(),
        watchCount: 1,
      };
      if (type === "movie") payload.movieId = itemId;
      await setDoc(historyRef, payload, { merge: true });
    },
    [userId]
  );

  const removeFromHistory = useCallback(
    async (type: HistoryMediaType, itemId: number) => {
      if (!userId) return;
      const historyRef = doc(db, "users", userId, "history", historyDocId(type, itemId));
      await deleteDoc(historyRef);
    },
    [userId]
  );

  const getHistory = useCallback(() => history, [history]);

  return {
    history,
    loading,
    addToHistory,
    removeFromHistory,
    getHistory,
  };
}
