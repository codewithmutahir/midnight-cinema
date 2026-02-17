import type { Metadata } from "next";
import Link from "next/link";
import { AdminPostList } from "@/components/admin/AdminPostList";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
      <p className="mt-1 text-sm text-[var(--text-muted)]">Manage blog posts.</p>
      <div className="mt-6">
        <Link
          href="/admin/create"
          className="inline-flex rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
        >
          Create post
        </Link>
      </div>
      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold text-[var(--text-primary)]">Recent posts</h2>
        <AdminPostList />
      </section>
    </div>
  );
}
