"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const TRICKLE_INTERVAL = 60;
const TRICKLE_AMOUNT = 6;
const MAX_PERCENT = 90;
const COMPLETE_AFTER_MAX_MS = 120;
const FADE_OUT_MS = 180;
const FALLBACK_COMPLETE_MS = 2500;

function scheduleComplete(
  onComplete: () => void,
  completeRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>,
  hideRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>,
  onHide: () => void
) {
  if (completeRef.current) clearTimeout(completeRef.current);
  completeRef.current = setTimeout(() => {
    completeRef.current = null;
    onComplete();
    if (hideRef.current) clearTimeout(hideRef.current);
    hideRef.current = setTimeout(() => {
      hideRef.current = null;
      onHide();
    }, FADE_OUT_MS);
  }, COMPLETE_AFTER_MAX_MS);
}

export function TopLoadingBar() {
  const pathname = usePathname();
  const [percent, setPercent] = useState(0);
  const [visible, setVisible] = useState(false);
  const trickleRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fallbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevPathnameRef = useRef(pathname);
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      prevPathnameRef.current = pathname;
      return;
    }

    if (pathname === prevPathnameRef.current) return;
    prevPathnameRef.current = pathname;

    if (trickleRef.current) clearInterval(trickleRef.current);
    trickleRef.current = null;
    if (completeRef.current) clearTimeout(completeRef.current);
    completeRef.current = null;
    if (hideRef.current) clearTimeout(hideRef.current);
    hideRef.current = null;
    if (fallbackRef.current) clearTimeout(fallbackRef.current);
    fallbackRef.current = null;

    setVisible(true);
    setPercent(0);

    trickleRef.current = setInterval(() => {
      setPercent((p) => {
        const next = Math.min(p + TRICKLE_AMOUNT, MAX_PERCENT);
        if (next >= MAX_PERCENT && trickleRef.current) {
          clearInterval(trickleRef.current);
          trickleRef.current = null;
          if (fallbackRef.current) {
            clearTimeout(fallbackRef.current);
            fallbackRef.current = null;
          }
          scheduleComplete(
            () => setPercent(100),
            completeRef,
            hideRef,
            () => {
              setVisible(false);
              setPercent(0);
            }
          );
        }
        return next;
      });
    }, TRICKLE_INTERVAL);

    fallbackRef.current = setTimeout(() => {
      fallbackRef.current = null;
      if (trickleRef.current) {
        clearInterval(trickleRef.current);
        trickleRef.current = null;
      }
      setPercent(100);
      hideRef.current = setTimeout(() => {
        hideRef.current = null;
        setVisible(false);
        setPercent(0);
      }, FADE_OUT_MS);
    }, FALLBACK_COMPLETE_MS);

    return () => {
      if (trickleRef.current) clearInterval(trickleRef.current);
      if (completeRef.current) clearTimeout(completeRef.current);
      if (hideRef.current) clearTimeout(hideRef.current);
      if (fallbackRef.current) clearTimeout(fallbackRef.current);
    };
  }, [pathname]);

  return (
    <div
      aria-hidden
      className="fixed left-0 right-0 top-0 z-[9999] h-0.5 overflow-hidden transition-opacity duration-200"
      style={{
        opacity: visible ? 1 : 0,
        pointerEvents: "none",
      }}
    >
      <div
        className="h-full bg-[var(--accent)] shadow-[0_0_10px_var(--accent-glow)]"
        style={{
          width: `${percent}%`,
          transition: percent === 100 ? `width ${FADE_OUT_MS}ms ease-out` : "width 120ms ease-out",
        }}
      />
    </div>
  );
}
