/**
 * Slug utilities: generate from title, validate format, and check uniqueness.
 */

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Generate a URL-safe slug from a title: lowercase, hyphen-separated, no special chars. */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "untitled";
}

/** Validate slug format (lowercase, hyphens only, no special chars). */
export function isValidSlug(slug: string): boolean {
  return slug.length > 0 && slug.length <= 200 && SLUG_REGEX.test(slug);
}
