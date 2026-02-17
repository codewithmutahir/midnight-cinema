"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { collection, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { slugify } from "@/lib/slug";
import { isValidSlug } from "@/lib/slug";
import type { BlogPost } from "@/types/blog";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { AiSectionCard } from "@/components/admin/AiSectionCard";
import { AiLoadingDots } from "@/components/admin/AiLoadingDots";
import { motion, AnimatePresence } from "framer-motion";

function getReadingTimeMinutes(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, "");
}

interface BlogPostFormProps {
  post?: BlogPost | null;
}

export function BlogPostForm({ post }: BlogPostFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(false);
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [featuredImage, setFeaturedImage] = useState(post?.featured_image ?? "");
  const [cloudinaryPublicId, setCloudinaryPublicId] = useState(post?.cloudinary_public_id ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [category, setCategory] = useState(post?.category ?? "");
  const [tagsStr, setTagsStr] = useState(post?.tags?.join(", ") ?? "");
  const [metaTitle, setMetaTitle] = useState(post?.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(post?.meta_description ?? "");
  const [ogImage, setOgImage] = useState(post?.og_image ?? "");
  const [isPublished, setIsPublished] = useState(post?.is_published ?? false);
  const [tldr, setTldr] = useState(post?.tldr ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [draftTopic, setDraftTopic] = useState("");
  const [generatingDraft, setGeneratingDraft] = useState(false);
  const [suggestingSeo, setSuggestingSeo] = useState(false);
  const [generatingTldr, setGeneratingTldr] = useState(false);
  const [generatingEmbedding, setGeneratingEmbedding] = useState(false);
  const [seoKeywords, setSeoKeywords] = useState<string[]>([]);

  // When editing, sync image state from post when the post we're editing loads or changes
  useEffect(() => {
    if (post) {
      setFeaturedImage(post.featured_image ?? "");
      setCloudinaryPublicId(post.cloudinary_public_id ?? "");
      setTldr(post.tldr ?? "");
    }
  }, [post?.id, post?.featured_image, post?.cloudinary_public_id, post?.tldr]);

  const handleGenerateDraft = async () => {
    if (!draftTopic.trim()) return;
    setGeneratingDraft(true);
    setError("");
    try {
      const res = await fetch("/api/blog/ai-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: draftTopic.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setTitle(data.title ?? "");
      setSlug(slugify(data.title ?? ""));
      setSlugTouched(false);
      setExcerpt(data.excerpt ?? "");
      setContent(data.content ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Draft generation failed");
    } finally {
      setGeneratingDraft(false);
    }
  };

  const handleSuggestSeo = async () => {
    if (!title.trim() && !content.trim()) {
      setError("Add a title or content first.");
      return;
    }
    setSuggestingSeo(true);
    setError("");
    try {
      const res = await fetch("/api/blog/ai-seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, excerpt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMetaTitle(data.meta_title ?? "");
      setMetaDescription(data.meta_description ?? "");
      setSeoKeywords(Array.isArray(data.keywords) ? data.keywords : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "SEO suggestion failed");
    } finally {
      setSuggestingSeo(false);
    }
  };

  const handleGenerateTldr = async () => {
    const plain = content.replace(/<[^>]+>/g, " ").trim();
    if (plain.length < 200) {
      setError("Add more content (at least ~200 chars) for a TL;DR.");
      return;
    }
    setGeneratingTldr(true);
    setError("");
    try {
      const res = await fetch("/api/blog/ai-tldr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setTldr(data.tldr ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "TL;DR generation failed");
    } finally {
      setGeneratingTldr(false);
    }
  };

  const handleGenerateEmbedding = async () => {
    if (!post) return;
    setGeneratingEmbedding(true);
    setError("");
    try {
      const res = await fetch("/api/blog/ai-embedding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, excerpt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      const embedding = data.embedding;
      if (!Array.isArray(embedding)) throw new Error("Invalid embedding");
      await updateDoc(doc(db, "blogs", post.id), {
        embedding,
        updated_at: serverTimestamp(),
      });
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Embedding update failed");
    } finally {
      setGeneratingEmbedding(false);
    }
  };

  const deriveSlug = useCallback(() => {
    if (!slugTouched && title) setSlug(slugify(title));
  }, [title, slugTouched]);

  const handleTitleChange = (v: string) => {
    setTitle(v);
    if (!slugTouched) setSlug(slugify(v));
  };

  const handleSlugBlur = () => setSlugTouched(true);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("folder", "blog");
      const res = await fetch("/api/cloudinary/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Upload failed");
      }
      const data = await res.json();
      setFeaturedImage(data.secure_url);
      setCloudinaryPublicId(data.public_id);
      if (!ogImage) setOgImage(data.secure_url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!user) {
      setError("You must be signed in.");
      return;
    }
    const slugTrim = slug.trim().toLowerCase();
    if (!slugTrim || !isValidSlug(slugTrim)) {
      setError("Slug must be lowercase, hyphen-separated, no special characters.");
      return;
    }
    const contentTrim = content.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    if (!contentTrim) {
      setError("Content is required.");
      return;
    }
    const tags = tagsStr.split(",").map((t) => t.trim()).filter(Boolean);
    const author = {
      uid: user.uid,
      displayName: user.displayName ?? "Anonymous",
      email: user.email ?? undefined,
      photoURL: user.photoURL ?? undefined,
    };
    const reading_time = getReadingTimeMinutes(content);
    const payload = {
      title: title.trim(),
      slug: slugTrim,
      excerpt: excerpt.trim(),
      featured_image: featuredImage,
      cloudinary_public_id: cloudinaryPublicId,
      content: sanitizeHtml(content),
      category: category.trim(),
      tags,
      meta_title: metaTitle.trim() || title.trim(),
      meta_description: metaDescription.trim() || excerpt.trim(),
      og_image: ogImage.trim() || featuredImage,
      author,
      reading_time,
      is_published: isPublished,
      tldr: tldr.trim() || null,
    };

    setSaving(true);
    try {
      if (post) {
        await updateDoc(doc(db, "blogs", post.id), {
          ...payload,
          updated_at: serverTimestamp(),
          ...(isPublished
            ? post.published_at
              ? {}
              : { published_at: serverTimestamp() }
            : { published_at: null }),
        });
        router.push("/admin");
        router.refresh();
      } else {
        const ref = await addDoc(collection(db, "blogs"), {
          ...payload,
          published_at: isPublished ? serverTimestamp() : null,
          updated_at: serverTimestamp(),
        });
        router.push("/admin/edit/" + ref.id);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6 max-w-3xl">
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-md bg-red-500/10 border border-red-500/30 px-4 py-2 text-sm text-red-400"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {!post && (
        <AiSectionCard
          title="Draft from idea"
          description="Describe a topic and AI will suggest a title, excerpt, and first draft."
          isGenerating={generatingDraft}
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={draftTopic}
              onChange={(e) => setDraftTopic(e.target.value)}
              placeholder="e.g. Why horror movies are good for you"
              className="flex-1 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
              disabled={generatingDraft}
            />
            <button
              type="button"
              onClick={handleGenerateDraft}
              disabled={generatingDraft || !draftTopic.trim()}
              className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-60 flex items-center gap-2"
            >
              {generatingDraft ? <AiLoadingDots /> : "Generate draft"}
            </button>
          </div>
        </AiSectionCard>
      )}

      <div>
        <label className="block text-sm font-medium text-[var(--text-muted)]">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          onBlur={deriveSlug}
          required
          className="mt-1 w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-[var(--text-primary)]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-muted)]">Slug (URL)</label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          onBlur={handleSlugBlur}
          placeholder="my-post-title"
          className="mt-1 w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-[var(--text-primary)]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-muted)]">Excerpt</label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-[var(--text-primary)]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-muted)]">Featured image</label>
        <input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading} className="mt-1 text-sm" />
        {uploading && <p className="mt-1 text-xs text-[var(--text-muted)]">Uploading...</p>}
        {featuredImage && (
          <div className="mt-2 flex items-start gap-3">
            <img
              src={featuredImage}
              alt="Featured"
              className="h-24 w-24 rounded border border-[var(--border-subtle)] object-cover"
            />
            <p className="text-xs text-[var(--text-muted)]">Current image. Upload a new file to replace.</p>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-muted)]">Content</label>
        <p className="mt-1 text-xs text-[var(--text-muted)]">Use the toolbar for bold, lists, links, headings, and more.</p>
        <div className="mt-2">
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Write your post content…"
            disabled={saving}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-[var(--text-muted)]">Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Horror"
            className="mt-1 w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-[var(--text-primary)]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-muted)]">Tags (comma-separated)</label>
          <input
            type="text"
            value={tagsStr}
            onChange={(e) => setTagsStr(e.target.value)}
            placeholder="horror, thriller, 2025"
            className="mt-1 w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-[var(--text-primary)]"
          />
        </div>
      </div>

      <AiSectionCard
        title="SEO"
        description="Suggest meta title, description, and focus keywords from your content."
        isGenerating={suggestingSeo}
      >
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleSuggestSeo}
            disabled={suggestingSeo || (!title.trim() && !content.trim())}
            className="rounded-md border border-[var(--accent)] px-3 py-1.5 text-sm text-[var(--accent)] hover:bg-[var(--accent)]/10 disabled:opacity-50 flex items-center gap-2"
          >
            {suggestingSeo ? <AiLoadingDots /> : "Suggest meta & keywords"}
          </button>
          {seoKeywords.length > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-[var(--text-muted)]"
            >
              Keywords: {seoKeywords.join(", ")}
            </motion.p>
          )}
        </div>
      </AiSectionCard>

      <div>
        <label className="block text-sm font-medium text-[var(--text-muted)]">Meta title (optional)</label>
        <input
          type="text"
          value={metaTitle}
          onChange={(e) => setMetaTitle(e.target.value)}
          className="mt-1 w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-[var(--text-primary)]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-muted)]">Meta description (optional)</label>
        <textarea
          value={metaDescription}
          onChange={(e) => setMetaDescription(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-[var(--text-primary)]"
        />
      </div>

      <AiSectionCard
        title="TL;DR"
        description="Short summary for long posts (shown at the top on the blog)."
        isGenerating={generatingTldr}
      >
        <div className="space-y-2">
          <textarea
            value={tldr}
            onChange={(e) => setTldr(e.target.value)}
            placeholder="Optional. Use the button to generate from content."
            rows={2}
            className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
          />
          <button
            type="button"
            onClick={handleGenerateTldr}
            disabled={generatingTldr || content.replace(/<[^>]+>/g, " ").trim().length < 200}
            className="rounded-md border border-[var(--border-subtle)] px-3 py-1.5 text-sm text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] disabled:opacity-50 flex items-center gap-2"
          >
            {generatingTldr ? <AiLoadingDots /> : "Generate from content"}
          </button>
        </div>
      </AiSectionCard>

      {post && (
        <AiSectionCard
          title="Related posts"
          description="Update embedding so “Related posts” uses semantic similarity."
          isGenerating={generatingEmbedding}
        >
          <button
            type="button"
            onClick={handleGenerateEmbedding}
            disabled={generatingEmbedding}
            className="rounded-md border border-[var(--border-subtle)] px-3 py-1.5 text-sm text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] disabled:opacity-50 flex items-center gap-2"
          >
            {generatingEmbedding ? <AiLoadingDots /> : "Update embedding"}
          </button>
        </AiSectionCard>
      )}

      <div>
        <label className="block text-sm font-medium text-[var(--text-muted)]">OG image URL (optional)</label>
        <input
          type="url"
          value={ogImage}
          onChange={(e) => setOgImage(e.target.value)}
          className="mt-1 w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-[var(--text-primary)]"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="published"
          checked={isPublished}
          onChange={(e) => setIsPublished(e.target.checked)}
          className="rounded border-[var(--border-subtle)]"
        />
        <label htmlFor="published" className="text-sm text-[var(--text-primary)]">Publish</label>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-70"
        >
          {saving ? "Saving…" : post ? "Update" : "Create"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-[var(--border-subtle)] px-4 py-2 text-sm text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
