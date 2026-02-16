"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function useTVStats(tvId: number | null) {
  const [watchlistCount, setWatchlistCount] = useState<number>(0);

  useEffect(() => {
    if (tvId == null) return;
    const ref = doc(db, "tvStats", String(tvId));
    const unsubscribe = onSnapshot(
      ref,
      (snap) => setWatchlistCount(snap.data()?.watchlistCount ?? 0),
      () => setWatchlistCount(0)
    );
    return unsubscribe;
  }, [tvId]);

  return { watchlistCount };
}
