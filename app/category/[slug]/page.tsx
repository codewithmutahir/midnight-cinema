import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { listBlogs, getCategories } from "@/lib/blog";
import { BlogCard } from "@/components/blog/BlogCard";

export const revalidate = 86400;

const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://midnight-cinema.vercel.app").replace(/\/$/, "");

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const categoryName = decodeURIComponent(slug).replace(/-/g, " ");
  const title = `${categoryName} | Blog`;
  return {
    title,
    description: `Blog posts in ${categoryName}.`,
    openGraph: { title },
  };
}

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ slug: c.toLowerCase().replace(/\s+/g, "-") }));
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const categories = await getCategories();
  const categorySlug = decodeURIComponent(slug).replace(/-/g, " ");
  const match = categories.find((c) => c.toLowerCase().replace(/\s+/g, "-") === slug || c === categorySlug);
  const categoryName = match ?? categorySlug;

  const posts = await listBlogs({ category: categoryName, limitCount: 50 });
  if (posts.length === 0 && !match) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-[var(--text-muted)]">
        <Link href="/" className="hover:text-[var(--accent)]">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/blog" className="hover:text-[var(--accent)]">Blog</Link>
        <span className="mx-2">/</span>
        <span className="text-[var(--text-primary)]">{categoryName}</span>
      </nav>
      <h1 className="font-display text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">
        {categoryName}
      </h1>
      <p className="mt-2 text-[var(--text-muted)]">{posts.length} post{posts.length !== 1 ? "s" : ""}</p>
      <section className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </section>
    </div>
  );
}
