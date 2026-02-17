import type { Metadata } from "next";
import Link from "next/link";
import { listBlogs, getCategories } from "@/lib/blog";
import { BlogCard } from "@/components/blog/BlogCard";
import { BlogListSearch } from "@/components/blog/BlogListSearch";

export const revalidate = 86400; // 24h ISR

export const metadata: Metadata = {
  title: "Blog | Movie guides, lists & recommendations",
  description:
    "Read guides, lists, and recommendations for movies and TV. Find your next watch with our SEO-optimized blog.",
  openGraph: {
    title: "Blog | Midnight Cinema",
    description: "Movie guides, lists & recommendations.",
  },
};

const POSTS_PER_PAGE = 12;

interface PageProps {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}

export default async function BlogPage({ searchParams }: PageProps) {
  const { q, category, page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));

  const [allPosts, categories] = await Promise.all([
    listBlogs({ category: category ?? undefined, limitCount: 100 }),
    getCategories(),
  ]);

  const filtered = q
    ? allPosts.filter(
        (p) =>
          p.title.toLowerCase().includes(q.toLowerCase()) ||
          p.excerpt.toLowerCase().includes(q.toLowerCase()) ||
          p.category.toLowerCase().includes(q.toLowerCase()) ||
          p.tags.some((t) => t.toLowerCase().includes(q.toLowerCase()))
      )
    : allPosts;

  const total = filtered.length;
  const start = (page - 1) * POSTS_PER_PAGE;
  const posts = filtered.slice(start, start + POSTS_PER_PAGE);
  const featured = filtered[0];
  const totalPages = Math.ceil(total / POSTS_PER_PAGE);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10">
        <h1 className="font-display text-3xl tracking-tight text-[var(--text-primary)] sm:text-4xl">
          Blog
        </h1>
        <p className="mt-2 text-[var(--text-muted)]">
          Guides, lists, and recommendations for your next watch.
        </p>
        <BlogListSearch categories={categories} initialQuery={q} initialCategory={category} />
      </header>

      {featured && page === 1 && !q && (
        <section className="mb-10">
          <BlogCard post={featured} size="featured" />
        </section>
      )}

      {posts.length === 0 ? (
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-12 text-center">
          <p className="text-[var(--text-muted)]">
            {q || category ? "No posts match your filters." : "No posts yet. Check back soon."}
          </p>
          {(q || category) && (
            <Link href="/blog" className="mt-4 inline-block text-[var(--accent)] hover:underline">
              Clear filters
            </Link>
          )}
        </div>
      ) : (
        <>
          <section className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </section>

          {totalPages > 1 && (
            <nav className="mt-10 flex justify-center gap-2" aria-label="Pagination">
              {page > 1 && (
                <Link
                  href={
                    (() => {
                      const params = new URLSearchParams();
                      if (page - 1 > 1) params.set("page", String(page - 1));
                      if (category) params.set("category", category);
                      if (q) params.set("q", q);
                      const s = params.toString();
                      return s ? `/blog?${s}` : "/blog";
                    })()
                  }
                  className="rounded-md bg-[var(--bg-elevated)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--accent)]"
                >
                  Previous
                </Link>
              )}
              <span className="flex items-center px-4 py-2 text-sm text-[var(--text-muted)]">
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={`/blog?page=${page + 1}${category ? `&category=${encodeURIComponent(category)}` : ""}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                  className="rounded-md bg-[var(--bg-elevated)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--accent)]"
                >
                  Next
                </Link>
              )}
            </nav>
          )}
        </>
      )}
    </div>
  );
}
