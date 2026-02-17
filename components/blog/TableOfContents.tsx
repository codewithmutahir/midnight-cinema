"use client";

import { useEffect, useState } from "react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  htmlContent: string;
  className?: string;
}

export function TableOfContents({ htmlContent, className = "" }: TableOfContentsProps) {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const doc = new DOMParser().parseFromString(htmlContent, "text/html");
    const headings = doc.querySelectorAll("h2, h3");
    const list: TocItem[] = [];
    headings.forEach((el) => {
      const id = el.id || (el.textContent?.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") ?? "");
      if (id) list.push({ id, text: el.textContent?.trim() ?? "", level: el.tagName === "H2" ? 2 : 3 });
    });
    setItems(list);
  }, [htmlContent]);

  useEffect(() => {
    if (items.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setActiveId(e.target.id);
            break;
          }
        }
      },
      { rootMargin: "-80px 0% -80% 0%", threshold: 0 }
    );
    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav className={"sticky top-24 hidden max-h-[calc(100vh-8rem)] overflow-y-auto lg:block " + className} aria-label="Table of contents">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">On this page</p>
      <ul className="space-y-1 border-l-2 border-[var(--border-subtle)] pl-4">
        {items.map((item) => (
          <li key={item.id} style={{ paddingLeft: item.level === 3 ? "0.75rem" : 0 }} className="-ml-[2px] border-l-2 border-transparent pl-4">
            <a
              href={"#" + item.id}
              className={"block py-1 text-sm transition-colors hover:text-[var(--accent)] " + (activeId === item.id ? "text-[var(--accent)]" : "text-[var(--text-muted)]")}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
