import Link from "next/link";
import Image from "next/image";

const BRAND = "Midnight Cinema";

const GENRES = [
  { id: 28, name: "Action" },
  { id: 18, name: "Drama" },
  { id: 27, name: "Horror" },
  { id: 35, name: "Comedy" },
  { id: 878, name: "Sci-Fi" },
  { id: 53, name: "Thriller" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] safe-area-padding-x pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <Link
              href="/"
              className="inline-block transition-opacity hover:opacity-90"
              aria-label={BRAND}
            >
              <Image
                src="/mc-logo.png"
                alt=""
                width={200}
                height={56}
                className="h-12 w-auto"
              />
            </Link>
            <p className="mt-2 max-w-sm text-sm text-[var(--text-muted)]">
              Discover movies, explore genres, and find your next watch. Powered by TMDb.
            </p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Discover by genre
            </h3>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
              {GENRES.map((g) => (
                <li key={g.id}>
                  <Link
                    href={`/genre/${g.id}`}
                    className="text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]"
                  >
                    {g.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 border-t border-[var(--border-subtle)] pt-6 text-sm text-[var(--text-muted)]">
          <Link href="/search" className="transition-colors hover:text-[var(--text-primary)]">
            Search
          </Link>
        </div>
        <p className="mt-4 text-center text-xs text-[var(--text-muted)]">
          © {year} {BRAND}. Not a streaming service.
        </p>
      </div>
    </footer>
  );
}
