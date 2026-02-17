import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-[var(--bg-primary)]">
        <header className="sticky top-0 z-40 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]/95 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/admin" className="font-display text-xl text-[var(--text-primary)]">
              Admin
            </Link>
            <nav className="flex items-center gap-4">
              <Link
                href="/admin"
                className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/create"
                className="text-sm text-[var(--accent)] hover:underline"
              >
                New post
              </Link>
              <Link
                href="/blog"
                className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                View blog
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </AdminAuthGuard>
  );
}
