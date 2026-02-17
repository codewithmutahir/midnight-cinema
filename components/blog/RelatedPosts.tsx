import Link from "next/link";
import Image from "next/image";
import type { BlogPost } from "@/types/blog";
import { getFeaturedImageUrl } from "@/lib/cloudinary";

interface RelatedPostsProps {
  posts: BlogPost[];
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6">
      <h2 className="font-display text-xl font-semibold text-[var(--text-primary)] mb-4">
        Related reads
      </h2>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => {
          const imageUrl = post.cloudinary_public_id
            ? getFeaturedImageUrl(post.cloudinary_public_id, "card")
            : post.featured_image;
          return (
            <li key={post.id}>
              <Link
                href={`/blog/${post.slug}`}
                className="group flex gap-3 rounded-lg transition-colors hover:bg-[var(--bg-elevated)] p-2 -m-2"
              >
                <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-md bg-[var(--bg-elevated)]">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt=""
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="112px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[var(--text-muted)] text-xs">No image</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-[var(--text-primary)] line-clamp-2 group-hover:text-[var(--accent)]">
                    {post.title}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">{post.reading_time} min read</p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
