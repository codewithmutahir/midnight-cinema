"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { listBlogsForAdmin, deleteBlog } from "@/lib/blog";
import type { BlogPost } from "@/types/blog";

export function AdminPostList() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchPosts = useCallback(() => {
    setLoading(true);
    listBlogsForAdmin(100)
      .then(setPosts)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleDelete = async (post: BlogPost) => {
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    setDeletingId(post.id);
    setError(null);
    try {
      await deleteBlog(post.id);
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <p className="mt-4 text-sm text-[var(--text-muted)]">Loading posts…</p>;
  }

  if (error) {
    return (
      <p className="mt-4 text-sm text-red-400">
        {error}
      </p>
    );
  }

  if (posts.length === 0) {
    return <p className="mt-4 text-sm text-[var(--text-muted)]">No posts yet.</p>;
  }

  return (
    <ul className="mt-4 space-y-2">
      {posts.slice(0, 20).map((post) => (
        <li
          key={post.id}
          className="flex items-center justify-between rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3"
        >
          <div>
            <Link
              href={post.is_published ? `/blog/${post.slug}` : `/admin/edit/${post.id}`}
              className="font-medium text-[var(--text-primary)] hover:text-[var(--accent)]"
            >
              {post.title}
            </Link>
            <p className="text-xs text-[var(--text-muted)]">
              {post.category} · {post.reading_time} min {!post.is_published && "· Draft"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/edit/${post.id}`}
              className="rounded-md border border-[var(--border-subtle)] px-3 py-1.5 text-sm text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]"
            >
              Edit
            </Link>
            <button
              type="button"
              onClick={() => handleDelete(post)}
              disabled={deletingId === post.id}
              className="rounded-md border border-red-500/50 px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10 disabled:opacity-50"
              title="Delete post"
            >
              {deletingId === post.id ? "Deleting…" : "Delete"}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
