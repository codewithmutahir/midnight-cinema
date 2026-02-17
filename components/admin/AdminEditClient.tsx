"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBlogById } from "@/lib/blog";
import { BlogPostForm } from "@/components/admin/BlogPostForm";
import type { BlogPost } from "@/types/blog";

interface AdminEditClientProps {
  id: string;
}

export function AdminEditClient({ id }: AdminEditClientProps) {
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null | undefined>(undefined);

  useEffect(() => {
    getBlogById(id)
      .then(setPost)
      .catch(() => setPost(null));
  }, [id]);

  if (post === undefined) {
    return <p className="mt-4 text-sm text-[var(--text-muted)]">Loading…</p>;
  }

  if (post === null) {
    return (
      <div className="mt-4">
        <p className="text-sm text-[var(--text-muted)]">Post not found.</p>
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="mt-2 text-sm text-[var(--accent)] hover:underline"
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  return (
    <>
      <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">Edit post</h1>
      <p className="mt-1 text-sm text-[var(--text-muted)]">{post.slug}</p>
      <BlogPostForm post={post} />
    </>
  );
}
