/**
 * Renders blog HTML and ensures H2/H3 have id attributes for table of contents anchoring.
 */
export function BlogContent({ html }: { html: string }) {
  const withIds = addHeadingIds(html);
  return (
    <div
      className="blog-content max-w-3xl text-[var(--text-primary)]"
      dangerouslySetInnerHTML={{ __html: withIds }}
    />
  );
}

function addHeadingIds(html: string): string {
  return html.replace(/<h([23])([^>]*)>([^<]*)<\/h\1>/gi, (_, level, attrs, text) => {
    const id = text
      .replace(/<[^>]+>/g, "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    if (!id) return `<h${level}${attrs}>${text}</h${level}>`;
    if (attrs.includes("id=")) return `<h${level}${attrs}>${text}</h${level}>`;
    return `<h${level}${attrs} id="${id}">${text}</h${level}>`;
  });
}
