"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useWatchHistory } from "@/hooks/useWatchHistory";
import { RowSkeleton } from "@/components/skeletons";
import { HistoryRow } from "./HistoryRow";

const MAX_ITEMS = 12;

export function RecentlyWatched() {
  const { user } = useAuth();
  const { history, loading } = useWatchHistory(user?.uid ?? null);

  if (!user) return null;
  if (loading) return <RowSkeleton cardCount={6} />;
  if (history.length === 0) return null;

  const items = history.slice(0, MAX_ITEMS);
  return (
    <HistoryRow
      title="Recently watched"
      items={items}
      seeAllHref="/history"
      ariaLabel="Recently watched movies and TV shows"
    />
  );
}
