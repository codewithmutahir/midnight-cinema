"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function useMovieStats(movieId: number | null) {
  const [watchlistCount, setWatchlistCount] = useState<number>(0);

  useEffect(() => {
    if (movieId == null) return;
    const ref = doc(db, "movieStats", String(movieId));
    const unsubscribe = onSnapshot(
      ref,
      (snap) => setWatchlistCount(snap.data()?.watchlistCount ?? 0),
      () => setWatchlistCount(0)
    );
    return unsubscribe;
  }, [movieId]);

  return { watchlistCount };
}
