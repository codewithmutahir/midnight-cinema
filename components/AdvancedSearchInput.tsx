"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getSearchHistory,
  addSearchHistory,
  clearSearchHistory,
  POPULAR_SUGGESTIONS,
} from "@/lib/searchHistory";

const PLACEHOLDER = "Movies, TV shows, and more...";

export interface AdvancedSearchInputProps {
  /** Controlled value (optional). If not provided, internal state is used. */
  value?: string;
  /** When controlled, called when the input value changes. */
  onChange?: (value: string) => void;
  /** Callback when user submits (Enter or Search button). */
  onSubmit: (query: string) => void;
  /** Compact style for header. */
  compact?: boolean;
  /** Additional class for the wrapper. */
  className?: string;
  /** Initial value for uncontrolled mode. */
  defaultValue?: string;
  /** aria-label for the input. */
  "aria-label"?: string;
}

export function AdvancedSearchInput({
  value: controlledValue,
  onChange,
  onSubmit,
  compact = false,
  className = "",
  defaultValue = "",
  "aria-label": ariaLabel = "Search movies and TV shows",
}: AdvancedSearchInputProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [history, setHistory] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const setValue = useCallback(
    (v: string) => {
      if (controlledValue === undefined) setInternalValue(v);
      else onChange?.(v);
    },
    [controlledValue, onChange]
  );

  const openDropdown = useCallback(() => {
    setIsOpen(true);
    setHistory(getSearchHistory());
    setHighlightedIndex(-1);
  }, []);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setHighlightedIndex(-1);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        closeDropdown();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [closeDropdown]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const q = value.trim();
      if (!q) return;
      addSearchHistory(q);
      closeDropdown();
      onSubmit(q);
    },
    [value, onSubmit, closeDropdown]
  );

  const handleSelect = useCallback(
    (q: string) => {
      setValue(q);
      addSearchHistory(q);
      closeDropdown();
      onSubmit(q);
    },
    [setValue, onSubmit, closeDropdown]
  );

  const handleClearHistory = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    clearSearchHistory();
    setHistory([]);
  }, []);

  const suggestions = history.length > 0 ? history : POPULAR_SUGGESTIONS;
  const showPopularLabel = history.length === 0;
  const hasSuggestions = suggestions.length > 0;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen || !hasSuggestions) {
        if (e.key === "Escape") closeDropdown();
        return;
      }
      if (e.key === "Escape") {
        closeDropdown();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((i) => (i < suggestions.length - 1 ? i + 1 : 0));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((i) => (i > 0 ? i - 1 : suggestions.length - 1));
        return;
      }
      if (e.key === "Enter" && highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        e.preventDefault();
        handleSelect(suggestions[highlightedIndex]);
      }
    },
    [isOpen, hasSuggestions, suggestions, highlightedIndex, handleSelect, closeDropdown]
  );

  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const el = listRef.current.children[highlightedIndex] as HTMLElement;
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="search"
            autoComplete="off"
            role="combobox"
            aria-expanded={isOpen}
            aria-autocomplete="list"
            aria-controls="search-suggestions"
            aria-label={ariaLabel}
            placeholder={PLACEHOLDER}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={openDropdown}
            onKeyDown={handleKeyDown}
            className={
              compact
                ? "h-9 w-36 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-1.5 pr-8 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] sm:w-44"
                : "w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-4 py-2.5 pr-10 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            }
          />
          {compact && (
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
          )}
        </div>
        <button
          type="submit"
          className={
            compact
              ? "rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)]"
              : "rounded-md bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)]"
          }
        >
          Search
        </button>
      </form>

      {isOpen && (
        <div
          id="search-suggestions"
          role="listbox"
          className="absolute left-0 top-full z-50 mt-1 min-w-[var(--input-width,16rem)] max-w-md rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] py-2 shadow-xl"
          style={compact ? { minWidth: "14rem" } : undefined}
        >
          {hasSuggestions && (
            <>
              <div className="flex items-center justify-between px-3 pb-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  {showPopularLabel ? "Popular searches" : "Recent searches"}
                </span>
                {history.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearHistory}
                    className="text-xs text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]"
                  >
                    Clear history
                  </button>
                )}
              </div>
              <ul ref={listRef} className="max-h-60 overflow-y-auto">
                {suggestions.map((q, i) => (
                  <li key={q}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={i === highlightedIndex}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--accent)]/20 hover:text-[var(--accent)] ${
                        i === highlightedIndex ? "bg-[var(--accent)]/20 text-[var(--accent)]" : ""
                      }`}
                      onClick={() => handleSelect(q)}
                    >
                      <svg className="h-4 w-4 shrink-0 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="truncate">{q}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
          {!hasSuggestions && (
            <p className="px-3 py-4 text-sm text-[var(--text-muted)]">
              Type and press Enter to search. Recent searches will appear here.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
