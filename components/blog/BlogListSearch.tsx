import Link from "next/link";

interface BlogListSearchProps {
  categories: string[];
  initialQuery?: string;
  initialCategory?: string;
}

export function BlogListSearch({
  categories,
  initialQuery = "",
  initialCategory = "",
}: BlogListSearchProps) {
  return (
    <form
      method="GET"
      action="/blog"
      className="mt-6 flex flex-wrap items-center gap-3"
    >
      <input
        type="search"
        name="q"
        defaultValue={initialQuery}
        placeholder="Search posts..."
        className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
      />
      <select
        name="category"
        defaultValue={initialCategory}
        className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
      >
        Search
      </button>
      {(initialQuery || initialCategory) && (
        <Link
          href="/blog"
          className="rounded-md border border-[var(--border-subtle)] px-4 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
          Clear
        </Link>
      )}
    </form>
  );
}
