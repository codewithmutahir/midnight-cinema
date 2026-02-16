import Link from "next/link";

/** Build list of page numbers and ellipsis for display. */
function getPageItems(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const left = Math.max(2, current - 2);
  const right = Math.min(total - 1, current + 2);
  const items: (number | "ellipsis")[] = [1];
  if (left > 2) items.push("ellipsis");
  for (let p = left; p <= right; p++) {
    if (p !== 1 && p !== total) items.push(p);
  }
  if (right < total - 1) items.push("ellipsis");
  if (total > 1) items.push(total);
  return items;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  getPageHref: (page: number) => string;
  /** Optional label for aria, e.g. "Search results" */
  ariaLabel?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  getPageHref,
  ariaLabel = "Pagination",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pageItems = getPageItems(currentPage, totalPages);
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <nav
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
      aria-label={ariaLabel}
    >
      {hasPrev && (
        <Link
          href={currentPage === 2 ? getPageHref(1) : getPageHref(currentPage - 1)}
          className="rounded-md bg-[var(--bg-elevated)] px-3 py-2 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--accent)] min-w-[2.5rem] text-center"
          aria-label="Previous page"
        >
          Previous
        </Link>
      )}

      <ul className="flex items-center gap-1">
        {pageItems.map((item, i) =>
          item === "ellipsis" ? (
            <li key={`ellipsis-${i}`} className="px-2 text-[var(--text-muted)]" aria-hidden>
              …
            </li>
          ) : (
            <li key={item}>
              {item === currentPage ? (
                <span
                  className="flex h-9 min-w-[2.25rem] items-center justify-center rounded-md bg-[var(--accent)] px-2 text-sm font-medium text-white"
                  aria-current="page"
                >
                  {item}
                </span>
              ) : (
                <Link
                  href={getPageHref(item)}
                  className="flex h-9 min-w-[2.25rem] items-center justify-center rounded-md bg-[var(--bg-elevated)] px-2 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--accent)]"
                >
                  {item}
                </Link>
              )}
            </li>
          )
        )}
      </ul>

      {hasNext && (
        <Link
          href={getPageHref(currentPage + 1)}
          className="rounded-md bg-[var(--bg-elevated)] px-3 py-2 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--accent)] min-w-[2.5rem] text-center"
          aria-label="Next page"
        >
          Next
        </Link>
      )}
    </nav>
  );
}
