import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getBlogBySlug, getRelatedPosts } from "@/lib/blog";
import { getFeaturedImageUrl } from "@/lib/cloudinary";
import { BlogContent } from "@/components/blog/BlogContent";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { AuthorBox } from "@/components/blog/AuthorBox";
import { RelatedPosts } from "@/components/blog/RelatedPosts";
import { CTABlock } from "@/components/blog/CTABlock";

/** 24h ISR – value must be a literal for Next.js segment config */
export const revalidate = 86400;

const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://midnight-cinema.vercel.app").replace(/\/$/, "");

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);
  if (!post) return { title: "Post not found" };

  const title = post.meta_title || post.title;
  const description = post.meta_description || post.excerpt || undefined;
  const ogImage = post.og_image || (post.cloudinary_public_id ? getFeaturedImageUrl(post.cloudinary_public_id, "og") : null) || post.featured_image;
  const canonical = `${BASE_URL}/blog/${post.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description: description ?? undefined,
      url: canonical,
      type: "article",
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: description ?? undefined,
      images: ogImage ? [ogImage] : undefined,
    },
    robots: { index: true, follow: true },
  };
}

function ArticleJsonLd({ post }: { post: Awaited<ReturnType<typeof getBlogBySlug>> }) {
  if (!post) return null;
  const ogImage = post.og_image || post.featured_image;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.meta_description || post.excerpt,
    image: ogImage ? [ogImage] : undefined,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: {
      "@type": "Person",
      name: post.author.displayName,
    },
    publisher: {
      "@type": "Organization",
      name: "Midnight Cinema",
      logo: { "@type": "ImageObject", url: `${BASE_URL}/mc-logo.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${BASE_URL}/blog/${post.slug}` },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

function BreadcrumbJsonLd({ post }: { post: Awaited<ReturnType<typeof getBlogBySlug>> }) {
  if (!post) return null;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${BASE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: `${BASE_URL}/blog/${post.slug}` },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);
  if (!post) notFound();

  const [related] = await Promise.all([getRelatedPosts(post)]);

  const featuredUrl = post.cloudinary_public_id
    ? getFeaturedImageUrl(post.cloudinary_public_id, "wide")
    : post.featured_image;

  return (
    <>
      <ArticleJsonLd post={post} />
      <BreadcrumbJsonLd post={post} />

      <article className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-[var(--text-muted)]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[var(--accent)]">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/blog" className="hover:text-[var(--accent)]">Blog</Link>
          <span className="mx-2">/</span>
          <span className="text-[var(--text-primary)]">{post.title}</span>
        </nav>

        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--text-muted)]">
            <span>{post.category}</span>
            <span>·</span>
            <time dateTime={post.published_at}>
              {new Date(post.published_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            <span>·</span>
            <span>{post.reading_time} min read</span>
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl lg:text-5xl">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="mt-4 text-lg text-[var(--text-muted)]">{post.excerpt}</p>
          )}
        </header>

        {featuredUrl && (
          <div className="relative mb-10 aspect-[21/9] overflow-hidden rounded-xl bg-[var(--bg-elevated)]">
            <Image
              src={featuredUrl}
              alt=""
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 1200px"
            />
          </div>
        )}

        {post.tldr && (
          <div className="mb-10 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">TL;DR</p>
            <p className="mt-2 text-[var(--text-primary)] leading-relaxed">{post.tldr}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_240px]">
          <div className="min-w-0 overflow-hidden">
            <div className="min-w-0 max-w-3xl">
              <BlogContent html={post.content} />
            </div>

            <div className="mt-10 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/tag/${encodeURIComponent(tag.toLowerCase().replace(/\s+/g, "-"))}`}
                  className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-1 text-sm text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  {tag}
                </Link>
              ))}
            </div>

            <div className="mt-10">
              <AuthorBox author={post.author} />
            </div>

            <div className="mt-10">
              <RelatedPosts posts={related} />
            </div>

            <div className="mt-10">
              <CTABlock />
            </div>
          </div>

          <aside className="lg:pl-4">
            <TableOfContents htmlContent={post.content} />
          </aside>
        </div>
      </article>
    </>
  );
}
