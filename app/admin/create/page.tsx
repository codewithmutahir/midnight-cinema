import type { Metadata } from "next";
import { BlogPostForm } from "@/components/admin/BlogPostForm";

export const metadata: Metadata = {
  title: "Create post",
  robots: { index: false, follow: false },
};

export default function AdminCreatePage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">Create post</h1>
      <p className="mt-1 text-sm text-[var(--text-muted)]">Add a new blog post.</p>
      <BlogPostForm />
    </div>
  );
}
