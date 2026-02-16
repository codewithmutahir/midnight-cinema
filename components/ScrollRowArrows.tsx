"use client";

import { useRef, useState, useCallback, useEffect } from "react";

const SCROLL_AMOUNT = 0.75; // fraction of visible width to scroll per click

interface ScrollRowArrowsProps {
  children: React.ReactNode;
  /** Optional aria-label for the scroll region (e.g. "Trending movies row"). */
  ariaLabel?: string;
  /** Extra class for the scroll container (e.g. scroll-row mt-3 ...). */
  className?: string;
}

export function ScrollRowArrows({
  children,
  ariaLabel,
  className = "",
}: ScrollRowArrowsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 8);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 8);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    const raf = requestAnimationFrame(() => updateScrollState());
    el.addEventListener("scroll", updateScrollState);
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", updateScrollState);
      ro.disconnect();
    };
  }, [updateScrollState, children]);

  function scroll(direction: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * SCROLL_AMOUNT;
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  return (
    <div className="relative group/row">
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scroll("left")}
          aria-label="Scroll left"
          className="absolute left-0 top-0 z-10 flex h-full w-10 shrink-0 items-center justify-center bg-gradient-to-r from-[var(--bg-primary)] to-transparent opacity-0 transition-opacity focus:opacity-100 focus:outline-none group-hover/row:opacity-100 md:w-12 md:opacity-100"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-md ring-1 ring-[var(--border-subtle)] transition-colors hover:bg-[var(--accent)] hover:text-white">
            ‹
          </span>
        </button>
      )}
      <div
        ref={scrollRef}
        className={`scroll-row flex gap-4 overflow-x-auto pb-2 pt-1 ${className}`}
        aria-label={ariaLabel}
      >
        <div className="min-w-[16px] shrink-0 sm:min-w-[24px]" aria-hidden />
        {children}
        <div className="min-w-[16px] shrink-0 sm:min-w-[24px]" aria-hidden />
      </div>
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scroll("right")}
          aria-label="Scroll right"
          className="absolute right-0 top-0 z-10 flex h-full w-10 shrink-0 items-center justify-center bg-gradient-to-l from-[var(--bg-primary)] to-transparent opacity-0 transition-opacity focus:opacity-100 focus:outline-none group-hover/row:opacity-100 md:w-12 md:opacity-100"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-md ring-1 ring-[var(--border-subtle)] transition-colors hover:bg-[var(--accent)] hover:text-white">
            ›
          </span>
        </button>
      )}
    </div>
  );
}
