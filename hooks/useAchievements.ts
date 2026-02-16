"use client";

import { useState, useEffect, useCallback } from "react";
import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  type: string;
}

export const ACHIEVEMENTS: Record<string, Achievement> = {
  first_movie: {
    id: "first_movie",
    name: "First Watch",
    description: "Watch your first movie",
    icon: "🎬",
    requirement: 1,
    type: "movies_watched",
  },
  movie_buff: {
    id: "movie_buff",
    name: "Movie Buff",
    description: "Watch 50 movies",
    icon: "🍿",
    requirement: 50,
    type: "movies_watched",
  },
  cinephile: {
    id: "cinephile",
    name: "Cinephile",
    description: "Watch 100 movies",
    icon: "🏆",
    requirement: 100,
    type: "movies_watched",
  },
  streak_7: {
    id: "streak_7",
    name: "Weekly Warrior",
    description: "Visit 7 days in a row",
    icon: "🔥",
    requirement: 7,
    type: "streak",
  },
  streak_30: {
    id: "streak_30",
    name: "Monthly Master",
    description: "Visit 30 days in a row",
    icon: "⭐",
    requirement: 30,
    type: "streak",
  },
  genre_explorer: {
    id: "genre_explorer",
    name: "Genre Explorer",
    description: "Watch movies from 10 different genres",
    icon: "🗺️",
    requirement: 10,
    type: "genres",
  },
  early_bird: {
    id: "early_bird",
    name: "Early Bird",
    description: "Complete daily roulette 10 times",
    icon: "🌅",
    requirement: 10,
    type: "daily_picks",
  },
  social_butterfly: {
    id: "social_butterfly",
    name: "Social Butterfly",
    description: "Join 5 Watch Together rooms",
    icon: "🦋",
    requirement: 5,
    type: "rooms_joined",
  },
};

export function useAchievements(userId: string | null) {
  const [userStats, setUserStats] = useState<{
    moviesWatched?: number;
    currentStreak?: number;
    genresWatched?: number[];
    achievements?: string[];
  } | null>(null);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);

  useEffect(() => {
    if (!userId) return;
    const userRef = doc(db, "users", userId);
    getDoc(userRef).then((snap) => {
      if (snap.exists()) {
        const stats = snap.data().stats ?? {};
        setUserStats(stats);
        setUnlockedAchievements(stats.achievements ?? []);
      }
    });
  }, [userId]);

  const checkAndUnlockAchievements = useCallback(async () => {
    if (!userId || !userStats) return [];
    const newIds: string[] = [];
    for (const ach of Object.values(ACHIEVEMENTS)) {
      if (unlockedAchievements.includes(ach.id)) continue;
      let unlocked = false;
      switch (ach.type) {
        case "movies_watched":
          unlocked = (userStats.moviesWatched ?? 0) >= ach.requirement;
          break;
        case "streak":
          unlocked = (userStats.currentStreak ?? 0) >= ach.requirement;
          break;
        case "genres":
          unlocked = (userStats.genresWatched?.length ?? 0) >= ach.requirement;
          break;
        default:
          break;
      }
      if (unlocked) newIds.push(ach.id);
    }
    if (newIds.length > 0) {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { "stats.achievements": arrayUnion(...newIds) });
      setUnlockedAchievements((prev) => [...prev, ...newIds]);
      return newIds.map((id) => ACHIEVEMENTS[id]);
    }
    return [];
  }, [userId, userStats, unlockedAchievements]);

  return {
    ACHIEVEMENTS,
    unlockedAchievements,
    checkAndUnlockAchievements,
    userStats,
  };
}
