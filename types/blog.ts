/**
 * Blog post as stored in Firestore and used in the app.
 * All dates are Firestore Timestamps or ISO strings when serialized.
 */
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string;
  cloudinary_public_id: string;
  content: string;
  category: string;
  tags: string[];
  meta_title: string;
  meta_description: string;
  og_image: string;
  published_at: string;
  updated_at: string;
  author: BlogAuthor;
  reading_time: number;
  is_published: boolean;
  /** Optional AI-generated short summary for long posts. */
  tldr?: string;
  /** Optional embedding vector for semantic related-posts (title + excerpt). */
  embedding?: number[];
}

export interface BlogAuthor {
  uid: string;
  displayName: string;
  email?: string;
  photoURL?: string;
}

/** For admin create/edit forms and API. */
export interface BlogPostInput {
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string;
  cloudinary_public_id: string;
  content: string;
  category: string;
  tags: string[];
  meta_title: string;
  meta_description: string;
  og_image: string;
  author: BlogAuthor;
  is_published: boolean;
  tldr?: string;
  embedding?: number[];
}

/** Firestore document with optional Timestamp fields. */
export interface BlogPostDoc {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string;
  cloudinary_public_id: string;
  content: string;
  category: string;
  tags: string[];
  meta_title: string;
  meta_description: string;
  og_image: string;
  published_at: { toDate?: () => Date } | string;
  updated_at: { toDate?: () => Date } | string;
  author: BlogAuthor;
  reading_time: number;
  is_published: boolean;
  tldr?: string;
  embedding?: number[];
}
