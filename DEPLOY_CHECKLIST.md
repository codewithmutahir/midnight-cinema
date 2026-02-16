# Pre-deploy checklist — Midnight Cinema

Use this before going live so the app stands out and runs smoothly.

---

## Before every deploy

### 1. Build and test locally
```bash
npm run build
npm run start
```
- Open `http://localhost:3000` and click through: Home, Search, a movie/TV detail, Indian, Pick, Watch Together.
- Confirm no red errors in the terminal or browser console.
- Visit a bad URL (e.g. `/movie/999999999`) to see 404; trigger an error to see the error boundary.

### 2. Environment variables (on your host)
- **`NEXT_PUBLIC_SITE_URL`** — Set to your real URL (e.g. `https://midnight-cinema.vercel.app`) so OG tags, sitemap, and canonical URLs are correct.
- **TMDb API** — `TMDB_API_KEY` or `NEXT_PUBLIC_TMDB_API_KEY` must be set or search/detail/trending will fail.
- **Firebase** (if you use auth/watchlist/history) — Add all Firebase env vars your app uses (e.g. `NEXT_PUBLIC_FIREBASE_*` and any server-side keys).

### 3. Favicon and PWA icons
- **Favicon** — You have `app/favicon.ico`; Next.js serves it automatically.
- **PWA** — Manifest uses `public/icons/icon-192.png` and `public/icons/icon-512.png`. Replace these with your branded icons (e.g. from `mc-logo.png`) so “Add to Home Screen” looks correct.
- Optional: add `public/apple-touch-icon.png` (180×180) or remove the `apple` entry from `metadata.icons` in `app/layout.tsx` to avoid a 404.

### 4. Open Graph default image (recommended)
- Add a default share image (e.g. 1200×630) so links to your site show a proper preview when a page has no specific OG image.
- In `app/layout.tsx` metadata: set `openGraph.images` and `twitter.images` to that image, or add `app/opengraph-image.png` and Next.js will use it.

### 5. Quick smoke test
- [ ] Home loads and hero/rows show.
- [ ] Search returns results.
- [ ] Movie and TV detail pages load (poster, cast, similar).
- [ ] Indian section and Pick wheel work.
- [ ] Sign in / sign out (if using auth); add/remove from watchlist or history once.
- [ ] 404 and error boundary (e.g. break something temporarily) look correct.

---

## Already in place

- **Error boundary** — `app/error.tsx` with Try again / Back home.
- **Sitemap** — `app/sitemap.ts` for SEO.
- **Root loading** — `app/loading.tsx` skeleton.
- **PWA** — Manifest + minimal service worker.
- **Analytics** — `@vercel/analytics` in layout (enable in Vercel dashboard if needed).
- **Performance** — Hero `fetchPriority="high"`, aspect ratios and sizes to limit CLS.
- **Accessibility** — Skip link, focus-visible, alt on posters.

---

## After deploy

- Set **NEXT_PUBLIC_SITE_URL** on the host to the real production URL (if not already).
- Submit **sitemap**: `https://yourdomain.com/sitemap.xml` in Google Search Console (and Bing if you use it).
- Test on a real phone and with DevTools network throttling to confirm loading/skeletons feel good.
