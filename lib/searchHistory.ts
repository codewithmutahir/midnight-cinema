const STORAGE_KEY = "midnight-cinema-search-history";
const MAX_ITEMS = 10;

export function getSearchHistory(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string" && x.trim().length > 0).slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
}

export function addSearchHistory(query: string): void {
  const q = query.trim();
  if (!q) return;
  const list = getSearchHistory().filter((x) => x.toLowerCase() !== q.toLowerCase());
  const next = [q, ...list].slice(0, MAX_ITEMS);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export function clearSearchHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** Static suggestions when there’s no or little history. */
export const POPULAR_SUGGESTIONS = [
  "Inception",
  "Breaking Bad",
  "The Dark Knight",
  "Stranger Things",
  "Dune",
];
