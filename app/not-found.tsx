import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold text-[var(--text-primary)]">404</h1>
      <p className="mt-2 text-[var(--text-muted)]">This page could not be found.</p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-[var(--accent-hover)] hover:scale-105"
      >
        Back to home
      </Link>
    </div>
  );
}
