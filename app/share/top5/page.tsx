import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getPosterUrl } from "@/lib/tmdb";
import { fetchMovieDetails } from "@/lib/tmdb";

const DEFAULT_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://midnight-cinema.vercel.app";

type Props = { searchParams: Promise<{ ids?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { ids } = await searchParams;
  const idList = ids?.split(",").slice(0, 5).join(",") ?? "";
  return {
    title: "My Top 5 on Midnight Cinema",
    description: "My top 5 movie picks — Midnight Cinema",
    openGraph: {
      title: "My Top 5 on Midnight Cinema",
      images: idList ? [{ url: `${DEFAULT_SITE_URL}/api/og/top5?ids=${idList}` }] : [],
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function ShareTop5Page({ searchParams }: Props) {
  const { ids } = await searchParams;
  const idList = (ids ?? "")
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !Number.isNaN(n))
    .slice(0, 5);

  const movies = idList.length > 0
    ? await Promise.all(
        idList.map((id) => fetchMovieDetails(id).catch(() => null))
      ).then((list) => list.filter(Boolean))
    : [];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="font-display text-4xl tracking-wide text-[var(--accent)]">
          Midnight Cinema
        </h1>
        <h2 className="mt-4 font-display text-2xl">My Top 5</h2>
        {movies.length > 0 ? (
          <ul className="mt-8 space-y-4">
            {movies.map((m, i) => (
              <li key={m!.id}>
                <Link
                  href={`/movie/${m!.id}`}
                  className="flex gap-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 transition-colors hover:border-[var(--accent)]/50"
                >
                  <span className="font-display text-2xl text-[var(--text-muted)]">
                    {i + 1}
                  </span>
                  <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded bg-[var(--bg-elevated)]">
                    <Image
                      src={getPosterUrl(m!.poster_path, "w154")}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="font-semibold">{m!.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 text-[var(--text-muted)]">
            Add movie IDs to the URL: /share/top5?ids=1,2,3,4,5
          </p>
        )}
        <Link
          href="/"
          className="mt-10 inline-block font-mono text-sm uppercase tracking-wider text-[var(--accent)] hover:underline"
        >
          ← Back to Midnight Cinema
        </Link>
      </div>
    </div>
  );
}
