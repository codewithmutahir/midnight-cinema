"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import { AdvancedSearchInput } from "@/components/AdvancedSearchInput";

const BRAND = "Midnight Cinema";

const MOVIE_GENRES = [
  { id: 28, name: "Action", href: (id: number) => `/genre/${id}` },
  { id: 12, name: "Adventure", href: (id: number) => `/genre/${id}` },
  { id: 35, name: "Comedy", href: (id: number) => `/genre/${id}` },
  { id: 18, name: "Drama", href: (id: number) => `/genre/${id}` },
  { id: 27, name: "Horror", href: (id: number) => `/genre/${id}` },
  { id: 10749, name: "Romance", href: (id: number) => `/genre/${id}` },
  { id: 878, name: "Sci-Fi", href: (id: number) => `/genre/${id}` },
  { id: 53, name: "Thriller", href: (id: number) => `/genre/${id}` },
];

const TV_GENRES = [
  { id: 10759, name: "Action & Adventure", href: (id: number) => `/genre/tv/${id}` },
  { id: 35, name: "Comedy", href: (id: number) => `/genre/tv/${id}` },
  { id: 18, name: "Drama", href: (id: number) => `/genre/tv/${id}` },
  { id: 10765, name: "Sci-Fi & Fantasy", href: (id: number) => `/genre/tv/${id}` },
  { id: 9648, name: "Mystery", href: (id: number) => `/genre/tv/${id}` },
];

export function Header() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [genresOpen, setGenresOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const handleSearchSubmit = useCallback(
    (query: string) => {
      const q = query.trim();
      if (q) {
        router.push(`/search?q=${encodeURIComponent(q)}`);
        setMobileMenuOpen(false);
      }
    },
    [router]
  );

  const closeMenus = useCallback(() => {
    setGenresOpen(false);
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target) &&
          userMenuRef.current && !userMenuRef.current.contains(target) &&
          mobileMenuRef.current && !mobileMenuRef.current.contains(target)) {
        setGenresOpen(false);
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]/90 backdrop-blur-md safe-area-padding-x">
        <div className="mx-auto flex h-14 min-h-[3.5rem] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 shrink-0 transition-opacity hover:opacity-90"
            aria-label={BRAND}
          >
            <Image
              src="/mc-logo.png"
              alt=""
              width={200}
              height={56}
              className="h-11 w-auto sm:h-14"
              priority
            />
          </Link>

          {/* Desktop nav: hidden on mobile */}
          <nav className="hidden md:flex md:items-center md:gap-1 lg:gap-2">
            <Link
              href="/"
              className="rounded-md px-3 py-2 text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
            >
              Home
            </Link>

            <Link
              href="/watch-together"
              className="rounded-md px-3 py-2 text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
            >
              Watch Together
            </Link>

            <Link
              href="/pick"
              className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--accent)]"
              title="Spin the wheel — random movie or TV pick"
              aria-label="Random picker — spin the wheel"
            >
              <span className="flex h-7 w-7 items-center justify-center" aria-hidden>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--accent)]">
                  <circle cx="12" cy="12" r="9" />
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
                    const rad = (deg * Math.PI) / 180;
                    const x = 12 + 9 * Math.sin(rad);
                    const y = 12 - 9 * Math.cos(rad);
                    return <line key={deg} x1="12" y1="12" x2={x} y2={y} />;
                  })}
                </svg>
              </span>
              <span className="hidden sm:inline">Pick</span>
            </Link>

            <Link
              href="/indian"
              className="rounded-md px-3 py-2 text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
              title="Bollywood & Indian cinema — separate from international"
            >
              Indian
            </Link>

            {user && (
              <>
                <Link
                  href="/watchlist"
                  className="rounded-md px-3 py-2 text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                >
                  Watchlist
                </Link>
                <Link
                  href="/history"
                  className="rounded-md px-3 py-2 text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                >
                  History
                </Link>
              </>
            )}

            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setGenresOpen((o) => !o)}
                className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                aria-expanded={genresOpen}
                aria-haspopup="true"
              >
                Discover
                <svg className="h-4 w-4 transition-transform" style={{ transform: genresOpen ? "rotate(180deg)" : undefined }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {genresOpen && (
                <div className="absolute left-0 top-full z-50 mt-1 w-56 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] py-1 shadow-xl">
                  <p className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    Movies
                  </p>
                  {MOVIE_GENRES.map((g) => (
                    <Link
                      key={`movie-${g.id}`}
                      href={g.href(g.id)}
                      className="block px-4 py-2 text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--accent)]/20 hover:text-[var(--accent)]"
                      onClick={() => setGenresOpen(false)}
                    >
                      {g.name}
                    </Link>
                  ))}
                  <p className="mt-2 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    TV shows
                  </p>
                  {TV_GENRES.map((g) => (
                    <Link
                      key={`tv-${g.id}`}
                      href={g.href(g.id)}
                      className="block px-4 py-2 text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--accent)]/20 hover:text-[var(--accent)]"
                      onClick={() => setGenresOpen(false)}
                    >
                      {g.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <AdvancedSearchInput
              compact
              onSubmit={handleSearchSubmit}
              aria-label="Search movies and TV shows"
            />

            {!authLoading && (
              user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen((o) => !o)}
                    className="flex items-center gap-2 rounded-full border border-[var(--border-subtle)] p-0.5 transition-colors hover:border-[var(--accent)]/50"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                  >
                    {user.photoURL ? (
                      <Image src={user.photoURL} alt="" width={32} height={32} className="rounded-full" />
                    ) : (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-medium text-white">
                        {(user.displayName || user.email)?.[0]?.toUpperCase() ?? "?"}
                      </span>
                    )}
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] py-1 shadow-xl">
                      <div className="border-b border-[var(--border-subtle)] px-4 py-2">
                        <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                          {user.displayName || "Anonymous"}
                        </p>
                        {user.email && (
                          <p className="truncate text-xs text-[var(--text-muted)]">
                            {user.email}
                          </p>
                        )}
                      </div>
                      <Link
                        href="/profile"
                        className="block px-4 py-2.5 text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--accent)]/20 hover:text-[var(--accent)]"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        href="/watchlist"
                        className="block px-4 py-2.5 text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--accent)]/20 hover:text-[var(--accent)]"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Watchlist
                      </Link>
                      <Link
                        href="/watch-together"
                        className="block px-4 py-2.5 text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--accent)]/20 hover:text-[var(--accent)]"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Watch Together
                      </Link>
                      <div className="my-1 border-t border-[var(--border-subtle)]" />
                      <button
                        type="button"
                        onClick={() => {
                          signOut();
                          setUserMenuOpen(false);
                        }}
                        className="block w-full px-4 py-2.5 text-left text-sm text-[var(--text-muted)] transition-colors hover:bg-[var(--accent)]/20 hover:text-[var(--accent)]"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setAuthOpen(true)}
                  className="rounded-md border border-[var(--accent)] bg-transparent px-3 py-1.5 text-sm font-medium text-[var(--accent)] transition-colors hover:bg-[var(--accent)]/10"
                >
                  Sign in
                </button>
              )
            )}
          </nav>

          {/* Mobile: hamburger only; search is inside mobile menu */}
          <div className="flex items-center justify-end md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-card)]"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        <div
          id="mobile-menu"
          ref={mobileMenuRef}
          className={`absolute left-0 right-0 top-full z-40 max-h-[calc(100vh-3.5rem)] overflow-y-auto border-b border-[var(--border-subtle)] bg-[var(--bg-primary)] md:hidden ${mobileMenuOpen ? "block" : "hidden"}`}
          aria-hidden={!mobileMenuOpen}
        >
          <nav className="flex flex-col py-4">
            <Link href="/" className="min-h-[2.75rem] px-4 py-3 text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]" onClick={closeMenus}>Home</Link>
            <Link href="/watch-together" className="min-h-[2.75rem] px-4 py-3 text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]" onClick={closeMenus}>Watch Together</Link>
            <Link href="/pick" className="min-h-[2.75rem] px-4 py-3 text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]" onClick={closeMenus}>Pick</Link>
            <Link href="/indian" className="min-h-[2.75rem] px-4 py-3 text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]" onClick={closeMenus}>Indian</Link>
            {user && (
              <>
                <Link href="/watchlist" className="min-h-[2.75rem] px-4 py-3 text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]" onClick={closeMenus}>Watchlist</Link>
                <Link href="/history" className="min-h-[2.75rem] px-4 py-3 text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]" onClick={closeMenus}>History</Link>
              </>
            )}
            <div className="border-t border-[var(--border-subtle)] px-4 py-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Discover</p>
              <div className="flex flex-wrap gap-2">
                {MOVIE_GENRES.slice(0, 4).map((g) => (
                  <Link key={g.id} href={g.href(g.id)} className="rounded-md bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)]" onClick={closeMenus}>{g.name}</Link>
                ))}
                <Link href="/search" className="rounded-md bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)]" onClick={closeMenus}>All genres</Link>
              </div>
            </div>
            <div className="mt-2 border-t border-[var(--border-subtle)] px-4 py-3">
              <AdvancedSearchInput onSubmit={handleSearchSubmit} className="w-full" aria-label="Search movies and TV shows" />
            </div>
            {!authLoading && (
              <div className="border-t border-[var(--border-subtle)] px-4 py-3">
                {user ? (
                  <>
                    <div className="mb-2 truncate text-sm text-[var(--text-muted)]">{user.displayName || user.email}</div>
                    <Link href="/profile" className="block min-h-[2.75rem] py-2 text-[var(--text-primary)]" onClick={closeMenus}>Profile</Link>
                    <button type="button" onClick={() => { signOut(); closeMenus(); }} className="block w-full text-left min-h-[2.75rem] py-2 text-[var(--text-muted)]">Sign out</button>
                  </>
                ) : (
                  <button type="button" onClick={() => { setAuthOpen(true); closeMenus(); }} className="min-h-[2.75rem] w-full rounded-md border border-[var(--accent)] py-2 text-sm font-medium text-[var(--accent)]">Sign in</button>
                )}
              </div>
            )}
          </nav>
        </div>
      </header>
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
