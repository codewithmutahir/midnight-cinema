import Image from "next/image";
import type { BlogAuthor } from "@/types/blog";

interface AuthorBoxProps {
  author: BlogAuthor;
}

export function AuthorBox({ author }: AuthorBoxProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
      {author.photoURL ? (
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[var(--bg-elevated)]">
          <Image src={author.photoURL} alt="" width={48} height={48} className="object-cover" />
        </div>
      ) : (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/20 text-lg font-semibold text-[var(--accent)]">
          {author.displayName?.charAt(0) ?? "?"}
        </div>
      )}
      <div>
        <p className="font-semibold text-[var(--text-primary)]">{author.displayName}</p>
        <p className="text-sm text-[var(--text-muted)]">Author</p>
      </div>
    </div>
  );
}
