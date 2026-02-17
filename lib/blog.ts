import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  type DocumentSnapshot,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { BlogPost, BlogPostDoc, BlogPostInput } from "@/types/blog";
import { slugify } from "@/lib/slug";

const BLOGS_COLLECTION = "blogs";
const REVALIDATE_SECONDS = 86400; // 24 hours ISR

function docToPost(docSnap: DocumentSnapshot, id: string): BlogPost | null {
  const d = docSnap.data() as BlogPostDoc | undefined;
  if (!d) return null;
  const toDate = (v: BlogPostDoc["published_at"]): string => {
    if (v == null) return "";
    if (typeof v === "string") return v;
    const d = (v as { toDate?: () => Date }).toDate?.();
    return d ? d.toISOString() : "";
  };
  return {
    id,
    title: d.title,
    slug: d.slug,
    excerpt: d.excerpt,
    featured_image: d.featured_image ?? "",
    cloudinary_public_id: d.cloudinary_public_id ?? "",
    content: d.content,
    category: d.category,
    tags: d.tags ?? [],
    meta_title: d.meta_title,
    meta_description: d.meta_description,
    og_image: d.og_image,
    published_at: toDate(d.published_at),
    updated_at: toDate(d.updated_at),
    author: d.author,
    reading_time: d.reading_time ?? 0,
    is_published: d.is_published ?? false,
    tldr: d.tldr ?? undefined,
    embedding: d.embedding ?? undefined,
  };
}

/** Get a single published blog post by slug. Returns null if not found or not published. */
export async function getBlogBySlug(slug: string): Promise<BlogPost | null> {
  const q = query(
    collection(db, BLOGS_COLLECTION),
    where("slug", "==", slug),
    where("is_published", "==", true),
    limit(1)
  );
  const snap = await getDocs(q);
  const first = snap.docs[0];
  if (!first) return null;
  return docToPost(first, first.id);
}

/** Get a single blog by slug (any publish state) for admin edit. */
export async function getBlogBySlugForAdmin(slug: string): Promise<BlogPost | null> {
  const q = query(collection(db, BLOGS_COLLECTION), where("slug", "==", slug), limit(1));
  const snap = await getDocs(q);
  const first = snap.docs[0];
  if (!first) return null;
  return docToPost(first, first.id);
}

/** Get blog by ID for admin edit. */
export async function getBlogById(id: string): Promise<BlogPost | null> {
  const ref = doc(db, BLOGS_COLLECTION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return docToPost(snap, snap.id);
}

/** Check if a slug is already used (for validation before save). */
export async function isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
  const q = query(collection(db, BLOGS_COLLECTION), where("slug", "==", slug), limit(1));
  const snap = await getDocs(q);
  const first = snap.docs[0];
  if (!first) return false;
  return first.id !== excludeId;
}

export interface ListBlogsOptions {
  category?: string;
  tag?: string;
  limitCount?: number;
  startAfter?: unknown;
}

/** List published blogs, newest first. */
export async function listBlogs(options: ListBlogsOptions = {}): Promise<BlogPost[]> {
  const { category, tag, limitCount = 24 } = options;
  const constraints: QueryConstraint[] = [
    where("is_published", "==", true),
    orderBy("published_at", "desc"),
    limit(limitCount),
  ];
  if (category) constraints.unshift(where("category", "==", category));
  if (tag) constraints.unshift(where("tags", "array-contains", tag));

  const q = query(collection(db, BLOGS_COLLECTION), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToPost(d, d.id)).filter((p): p is BlogPost => p !== null);
}

/** Get all unique categories from published posts. */
export async function getCategories(): Promise<string[]> {
  const snap = await getDocs(
    query(
      collection(db, BLOGS_COLLECTION),
      where("is_published", "==", true),
      orderBy("published_at", "desc"),
      limit(500)
    )
  );
  const set = new Set<string>();
  snap.docs.forEach((d) => {
    const cat = (d.data() as BlogPostDoc).category;
    if (cat) set.add(cat);
  });
  return Array.from(set).sort();
}

/** Get all unique tags from published posts. */
export async function getTags(): Promise<string[]> {
  const snap = await getDocs(
    query(
      collection(db, BLOGS_COLLECTION),
      where("is_published", "==", true),
      orderBy("published_at", "desc"),
      limit(500)
    )
  );
  const set = new Set<string>();
  snap.docs.forEach((d) => {
    const tags = (d.data() as BlogPostDoc).tags ?? [];
    tags.forEach((t: string) => set.add(t));
  });
  return Array.from(set).sort();
}

/** Cosine similarity between two vectors. */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

/** Get related posts: by embedding similarity when available, else by category/tags. */
export async function getRelatedPosts(post: BlogPost, count = 5): Promise<BlogPost[]> {
  const candidates = await listBlogs({ limitCount: 80 });
  const filtered = candidates.filter((p) => p.id !== post.id);
  if (filtered.length === 0) return [];

  if (post.embedding && post.embedding.length > 0) {
    const withEmbedding = filtered.filter((p) => p.embedding && p.embedding.length > 0);
    if (withEmbedding.length > 0) {
      const scored = withEmbedding.map((p) => ({
        post: p,
        score: cosineSimilarity(post.embedding!, p.embedding!),
      }));
      scored.sort((a, b) => b.score - a.score);
      return scored.slice(0, count).map((s) => s.post);
    }
  }

  const byCategory = filtered.filter((p) => p.category === post.category);
  if (byCategory.length >= count) return byCategory.slice(0, count);
  const rest = filtered.filter((p) => p.category !== post.category);
  const tagSet = new Set(post.tags);
  rest.sort((a, b) => {
    const aTags = (a.tags ?? []).filter((t) => tagSet.has(t)).length;
    const bTags = (b.tags ?? []).filter((t) => tagSet.has(t)).length;
    return bTags - aTags;
  });
  return [...byCategory, ...rest].slice(0, count);
}

/** Calculate reading time in minutes from HTML content (approx 200 wpm). */
export function getReadingTimeMinutes(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

/** Create a new blog post (admin). */
export async function createBlog(input: BlogPostInput): Promise<string> {
  const reading_time = getReadingTimeMinutes(input.content);
  const ref = await addDoc(collection(db, BLOGS_COLLECTION), {
    ...input,
    reading_time,
    published_at: input.is_published ? serverTimestamp() : null,
    updated_at: serverTimestamp(),
    ...(input.tldr != null && input.tldr !== "" ? { tldr: input.tldr } : {}),
    ...(input.embedding != null && input.embedding.length > 0 ? { embedding: input.embedding } : {}),
  });
  return ref.id;
}

/** Update an existing blog post (admin). */
export async function updateBlog(id: string, input: BlogPostInput): Promise<void> {
  const reading_time = getReadingTimeMinutes(input.content);
  const ref = doc(db, BLOGS_COLLECTION, id);
  await updateDoc(ref, {
    ...input,
    reading_time,
    updated_at: serverTimestamp(),
    ...(input.is_published ? { published_at: serverTimestamp() } : {}),
    ...(input.tldr != null ? { tldr: input.tldr || null } : {}),
    ...(input.embedding != null ? { embedding: input.embedding.length ? input.embedding : null } : {}),
  });
}

/** Delete a blog post (admin). */
export async function deleteBlog(id: string): Promise<void> {
  const ref = doc(db, BLOGS_COLLECTION, id);
  await deleteDoc(ref);
}

/** List all blogs for admin (published and drafts), newest first. */
export async function listBlogsForAdmin(limitCount = 100): Promise<BlogPost[]> {
  const q = query(
    collection(db, BLOGS_COLLECTION),
    orderBy("updated_at", "desc"),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToPost(d, d.id)).filter((p): p is BlogPost => p !== null);
}

/** Get all published blog slugs and updated_at for sitemap. */
export async function getAllBlogSlugsForSitemap(): Promise<{ slug: string; updated_at: string }[]> {
  const snap = await getDocs(
    query(
      collection(db, BLOGS_COLLECTION),
      where("is_published", "==", true),
      orderBy("published_at", "desc"),
      limit(2000)
    )
  );
  return snap.docs.map((d) => {
    const d2 = d.data() as BlogPostDoc;
    const updated = typeof d2.updated_at === "string" ? d2.updated_at : (d2.updated_at as { toDate?: () => Date })?.toDate?.()?.toISOString() ?? new Date().toISOString();
    return { slug: d2.slug, updated_at: updated };
  });
}

export const BLOG_REVALIDATE = REVALIDATE_SECONDS;
