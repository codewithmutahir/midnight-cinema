# Blog system – Midnight Cinema

Documentation for the production-ready, SEO-first blog: server-rendered pages, dynamic metadata, slug-only URLs, sitemap, and an admin area protected by Firebase Auth and an admin allowlist.

---

## Overview

- **Public blog**: Listing at `/blog`, post pages at `/blog/[slug]`, category and tag archives. All server-rendered with dynamic metadata and JSON-LD.
- **Admin**: Dashboard at `/admin`, create at `/admin/create`, edit at `/admin/edit/[id]`. Only users listed in the Firestore `admins` collection can access.
- **Storage**: Blog posts and admin list in **Firestore**; featured images in **Cloudinary** (signed upload from the admin form).

---

## Admin access

- **URLs**: `/admin`, `/admin/create`, `/admin/edit/[id]`
- **Protection**:
  - User must be signed in (Firebase Auth). If not, redirect to `/?admin=1`.
  - User must be an **admin**. Admins are defined by the Firestore collection `admins` (document ID = Firebase Auth UID). If the user is not an admin, redirect to `/?admin=denied`.
- **Implementation**: `AdminAuthGuard` (in admin layout) calls `isAdmin(user.uid)` from `lib/admin.ts`, which checks for a document at `admins/{uid}`. Admin list and edit data are loaded on the **client** so Firestore requests use the signed-in user’s token and pass security rules.

### Making a user an admin

1. In **Firebase Console** → **Firestore Database**, create a collection named `admins` if it doesn’t exist.
2. Add a document whose **document ID** is the user’s Firebase Auth **UID** (copy from **Authentication** → **Users** → select the user).
3. The document can be empty `{}` or contain optional fields (e.g. `email`, `addedAt`). Only the existence of a document with that UID matters.
4. Deploy Firestore rules after any rule change:  
   `firebase deploy --only firestore:rules`

---

## Firestore

### Collection: `blogs`

- **Fields**: `title`, `slug`, `excerpt`, `featured_image`, `cloudinary_public_id`, `content`, `category`, `tags` (array), `meta_title`, `meta_description`, `og_image`, `author` (object), `reading_time`, `is_published`, `published_at` (timestamp or null), `updated_at` (timestamp).
- **Rules**:
  - **Read**: if `resource.data.is_published == true` **or** `request.auth != null` (so drafts are only visible when signed in).
  - **Create / update / delete**: if `request.auth != null`.
- **Indexes** (in `firestore.indexes.json`): composite indexes for:
  - `is_published` + `published_at` (listing published posts)
  - `category` + `published_at` (category archives)
  - `tags` + `published_at` (tag archives)

Deploy indexes:  
`firebase deploy --only firestore:indexes`

### Collection: `admins`

- **Document ID**: Firebase Auth UID.
- **Rules**: User can **read** only the document whose ID is their own UID (to check “am I admin?”). **Write**: disabled; add/remove admins via Firebase Console or Admin SDK.

---

## Cloudinary (featured images)

- **Env** (see [Environment variables](#environment-variables)): `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
- **Upload**: Admin form uploads via `POST /api/cloudinary/upload` (signed server upload; images only, 5MB limit). Response returns `secure_url` and `public_id`; form stores them in `featured_image` and `cloudinary_public_id`.
- **Display**: Public post and cards use `getFeaturedImageUrl(publicId, size)` from `lib/cloudinary.ts` for responsive URLs; fallback to `featured_image` URL when no `cloudinary_public_id`.
- **Edit form**: When loading a post for edit, the form syncs `featured_image` and `cloudinary_public_id` from the document (with safe defaults so missing fields don’t break the UI) and shows a small preview image so the current featured image is visible when revisiting.

---

## Public blog routes

| Route | Description |
|-------|-------------|
| `/blog` | Server-rendered listing; search and category via query params; featured post; pagination. |
| `/blog/[slug]` | Server-rendered post; `generateMetadata()`; JSON-LD (Article + Breadcrumb); table of contents, author box, related posts, CTA. |
| `/category/[slug]` | Server-rendered category archive. |
| `/tag/[slug]` | Server-rendered tag archive. |

- **Sitemap**: Blog posts are included in `/sitemap.xml` via `getAllBlogSlugsForSitemap()` (published posts only).

---

## Admin workflow

- **Create**: Set title (slug auto-generated, editable), excerpt, upload featured image, write content with the **Quill** rich text editor (bold, italic, lists, headings, links, blockquote, code-block), category, tags, optional meta/OG fields, then check “Publish” and submit. Content is sanitized (script and `on*` attributes removed) before save.
- **Edit**: Revisit from dashboard or direct `/admin/edit/[id]`. Featured image loads and shows a preview; upload a new file to replace. **Publish / unpublish**: Check “Publish” and save sets `published_at` to server timestamp; uncheck and save sets `published_at` to `null` (Firestore does not allow `undefined`).
- **Slug**: Must be unique. Use “Slug (URL)” to override the auto-generated slug. Optional client-side check via `/api/blog/check-slug?slug=...`.

---

## Key implementation details

- **Slug**: `lib/slug.ts` – `slugify()`, `isValidSlug()`.
- **Blog data**: `lib/blog.ts` – `getBlogBySlug`, `getBlogById`, `listBlogs`, `listBlogsForAdmin`, `getCategories`, `getTags`, `getRelatedPosts`, `getReadingTimeMinutes`, `getAllBlogSlugsForSitemap`; create/update from client with `addDoc`/`updateDoc`. `docToPost()` normalizes timestamps and uses `""` for missing `featured_image` / `cloudinary_public_id`.
- **Admin list/edit on client**: `AdminPostList` and `AdminEditClient` fetch data in the browser so Firestore sees the authenticated user and allows reads of drafts and admin list.
- **Design**: Dark cinematic theme; sticky table of contents on desktop; internal links (tags → tag archive; CTA → home, Pick, Indian).

---

## File structure (blog-related)

```
app/
  blog/
    page.tsx              # Listing
    [slug]/page.tsx       # Post page (metadata, JSON-LD)
    loading.tsx
  category/[slug]/page.tsx
  tag/[slug]/page.tsx
  admin/
    layout.tsx            # AdminAuthGuard, nav
    page.tsx              # Dashboard (shell + AdminPostList)
    create/page.tsx
    edit/[id]/page.tsx    # Shell + AdminEditClient
  api/
    cloudinary/upload/route.ts
    blog/check-slug/route.ts (if present)
components/
  blog/                   # BlogCard, BlogContent, BlogListSearch, TableOfContents, AuthorBox, RelatedPosts, CTABlock
  admin/                  # AdminAuthGuard, AdminPostList, AdminEditClient, BlogPostForm, RichTextEditor, quill-admin.css
lib/
  blog.ts
  slug.ts
  cloudinary.ts
  admin.ts                # isAdmin(uid)
types/
  blog.ts
firestore.rules           # blogs + admins
firestore.indexes.json
sitemap.ts                # includes blog slugs
```

---

## Environment variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name (client + server). |
| `CLOUDINARY_API_KEY` | Cloudinary API key (server; upload API). |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret (server; upload API). |

Firebase and TMDB vars are unchanged. No upload preset required for the current signed-upload flow.

---

## Deployment checklist

1. Set Cloudinary and Firebase env vars in your hosting environment.
2. Deploy Firestore rules:  
   `firebase deploy --only firestore:rules`
3. Deploy Firestore indexes:  
   `firebase deploy --only firestore:indexes`
4. Add admin users in Firestore (`admins` collection, document ID = UID).
5. Ensure `next.config.ts` allows `res.cloudinary.com` in `images.remotePatterns` (already configured).

---

## Summary

- **Auth**: Only listed admins can access `/admin`; admin data is loaded on the client so Firestore rules see the signed-in user.
- **Blog**: Firestore `blogs` + Cloudinary images; server-rendered public pages; slug-only URLs; sitemap; drafts vs published with `published_at` (never `undefined`).
- **Admin**: Create/edit with featured image upload; image persists and shows on revisit (form sync + preview).
