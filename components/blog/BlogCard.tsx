import Link from "next/link";
import Image from "next/image";
import type { BlogPost } from "@/types/blog";
import { getFeaturedImageUrl } from "@/lib/cloudinary";

interface BlogCardProps {
  post: BlogPost;
  size?: "default" | "featured";
}

export function BlogCard({ post, size = "default" }: BlogCardProps) {
  const imageUrl = post.cloudinary_public_id
    ? getFeaturedImageUrl(post.cloudinary_public_id, size === "featured" ? "wide" : "card")
    : post.featured_image;

  return (
    <article className="group">
      <Link href={`/blog/${post.slug}`} className="block overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] transition-colors hover:border-[var(--accent)]/30">
        <div className={`relative overflow-hidden bg-[var(--bg-elevated)] ${size === "featured" ? "aspect-[21/9]" : "aspect-[16/10]"}`}>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt=""
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes={size === "featured" ? "(max-width: 768px) 100vw, 1200px" : "(max-width: 640px) 100vw, 400px"}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[var(--text-muted)]">No image</div>
          )}
        </div>
        <div className="p-4">
          <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
            <span>{post.category}</span>
            <span>·</span>
            <span>{post.reading_time} min read</span>
          </div>
          <h2 className="font-display text-lg font-semibold leading-snug text-[var(--text-primary)] group-hover:text-[var(--accent)]">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="mt-2 line-clamp-2 text-sm text-[var(--text-muted)]">{post.excerpt}</p>
          )}
        </div>
      </Link>
    </article>
  );
}
