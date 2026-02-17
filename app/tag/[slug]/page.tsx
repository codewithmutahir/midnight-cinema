import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { listBlogs, getTags } from "@/lib/blog";
import { BlogCard } from "@/components/blog/BlogCard";

export const revalidate = 86400;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tagName = decodeURIComponent(slug).replace(/-/g, " ");
  const title = `Tag: ${tagName} | Blog`;
  return {
    title,
    description: `Blog posts tagged with ${tagName}.`,
    openGraph: { title },
  };
}

export async function generateStaticParams() {
  const tags = await getTags();
  return tags.map((t) => ({ slug: t.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") }));
}

export default async function TagPage({ params }: PageProps) {
  const { slug } = await params;
  const allTags = await getTags();
  const tagSlug = decodeURIComponent(slug).replace(/-/g, " ");
  const match = allTags.find((t) => t.toLowerCase().replace(/\s+/g, "-") === slug || t === tagSlug);
  const tagName = match ?? tagSlug;

  const posts = await listBlogs({ tag: tagName, limitCount: 50 });
  if (posts.length === 0 && !match) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-[var(--text-muted)]">
        <Link href="/" className="hover:text-[var(--accent)]">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/blog" className="hover:text-[var(--accent)]">Blog</Link>
        <span className="mx-2">/</span>
        <span className="text-[var(--text-primary)]">{tagName}</span>
      </nav>
      <h1 className="font-display text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">
        Tag: {tagName}
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
