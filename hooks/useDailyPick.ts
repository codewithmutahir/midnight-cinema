"use client";

import { useState, useEffect, useCallback } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const THEMES = [
  "Action Classics",
  "Mind Benders",
  "Feel Good Friday",
  "Thriller Thursday",
  "Weekend Blockbusters",
  "Hidden Gems",
  "Cult Favorites",
];

function getToday() {
  return new Date().toISOString().split("T")[0];
}

export function useDailyPick(userId: string | null) {
  const today = getToday();
  const [dailyMovieIds, setDailyMovieIds] = useState<number[]>([]);
  const [theme, setTheme] = useState<string>("");
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [hasPickedToday, setHasPickedToday] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchPicks() {
      const picksRef = doc(db, "dailyPicks", today);
      const picksSnap = await getDoc(picksRef);
      if (cancelled) return;
      if (picksSnap.exists()) {
        const data = picksSnap.data();
        setDailyMovieIds(data.movieIds ?? []);
        setTheme(data.theme ?? "");
      } else {
        try {
          const res = await fetch("/api/movies/random");
          const data = (await res.json()) as { movieIds: number[] };
          const movieIds = data.movieIds ?? [];
          const randomTheme = THEMES[Math.floor(Math.random() * THEMES.length)];
          if (movieIds.length > 0) {
            await setDoc(picksRef, {
              date: today,
              movieIds,
              generatedAt: serverTimestamp(),
              theme: randomTheme,
            });
            if (!cancelled) {
              setDailyMovieIds(movieIds);
              setTheme(randomTheme);
            }
          }
        } catch {
          if (!cancelled) setDailyMovieIds([]);
        }
      }
      if (!cancelled) setLoading(false);
    }
    fetchPicks();
    return () => {
      cancelled = true;
    };
  }, [today]);

  useEffect(() => {
    if (!userId) return;
    const selectionRef = doc(db, "users", userId, "dailySelections", today);
    getDoc(selectionRef).then((snap) => {
      if (snap.exists()) {
        setHasPickedToday(true);
        setSelectedMovieId(snap.data().selectedMovieId ?? null);
      }
    });
  }, [userId, today]);

  const saveSelection = useCallback(
    async (movieId: number) => {
      if (!userId) return;
      const selectionRef = doc(db, "users", userId, "dailySelections", today);
      await setDoc(selectionRef, {
        date: today,
        selectedMovieId: movieId,
        selectedAt: serverTimestamp(),
        wasLiked: false,
      });
      setHasPickedToday(true);
      setSelectedMovieId(movieId);
    },
    [userId, today]
  );

  return {
    dailyMovieIds,
    theme,
    selectedMovieId,
    hasPickedToday,
    loading,
    saveSelection,
    today,
  };
}
