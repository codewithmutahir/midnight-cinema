import type { MetadataRoute } from "next";
import { fetchGenreList } from "@/lib/tmdb";
import { fetchTrendingMovies } from "@/lib/tmdb";
import { getAllBlogSlugsForSitemap } from "@/lib/blog";

const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://midnight-cinema.vercel.app").replace(/\/$/, "");

/**
 * Generate sitemap for SEO. Includes homepage, blog, genre list, popular movies, and blog posts.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/search`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/indian`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/pick`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/watch-together`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  ];

  try {
    const blogSlugs = await getAllBlogSlugsForSitemap();
    for (const { slug, updated_at } of blogSlugs) {
      entries.push({
        url: `${BASE_URL}/blog/${slug}`,
        lastModified: new Date(updated_at),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch {
    // Firestore may be unavailable at build time
  }

  try {
    const { genres } = await fetchGenreList();
    for (const g of genres) {
      entries.push({
        url: `${BASE_URL}/genre/${g.id}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }

    const { results } = await fetchTrendingMovies(1, "week");
    for (const movie of results.slice(0, 20)) {
      entries.push({
        url: `${BASE_URL}/movie/${movie.id}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  } catch {
    // If TMDb fails (e.g. no API key in build), sitemap still returns static URLs
  }

  return entries;
}
