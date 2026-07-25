# 28 — SEO Strategy

> Goal: Tasork should rank for high-intent "get X done" and "hire someone to build X" queries, and outrank generic freelance marketplaces on trust/quality-signal terms.

## 1. Information Architecture for SEO
- Clean, human-readable URLs, no query-string routing for indexable pages.
  - `/`, `/about`, `/pricing`, `/services`, `/services/[category]`, `/blog`, `/blog/[slug]`, `/faq`, `/contact`
- Category pages (`/services/web-development`, `/services/academic-editing`, etc.) act as SEO landing pages targeting "get a [service] solution" long-tail terms, distinct from the generic marketing pages.
- Dashboard, auth, and account pages are **noindex, nofollow** (private app surface, not marketing surface).

## 2. Meta Strategy
- Every public page defines: `title`, `meta description`, `canonical`, `og:title`, `og:description`, `og:image`, `twitter:card`.
- Title formula: `{Primary Keyword/Page Purpose} | Tasork — Custom Digital Solutions`
- Description formula: value proposition + primary CTA, 150–160 characters, unique per page (no duplicates — checked in CI via a meta-uniqueness lint script).
- Managed centrally via Next.js Metadata API (`generateMetadata`) per route, with CMS-editable overrides for blog and service pages (see `27_Admin_Panel.md` CMS module).

## 3. Structured Data (Schema.org)
Implemented as JSON-LD, injected server-side:
- **Organization** schema on all pages (logo, name, social links, contact).
- **WebSite** schema with `SearchAction` (sitelinks search box eligibility).
- **Service** schema on each `/services/[category]` page.
- **FAQPage** schema on `/faq` and any page with an FAQ accordion.
- **BreadcrumbList** schema on all nested pages.
- **Article** schema on blog posts (author, datePublished, dateModified, image).
- **Review/AggregateRating** schema on the testimonials/reviews section, sourced from verified completed-project reviews only (no fabricated ratings).

## 4. Sitemap & Robots
- `sitemap.xml` auto-generated at build/deploy time from the public route manifest + published blog/service entries (dynamic, not hand-maintained).
- Separate `sitemap-blog.xml` and `sitemap-pages.xml`, referenced from a `sitemap-index.xml`.
- `robots.txt`:
  - Disallow: `/dashboard`, `/admin`, `/api`, `/account`, `/checkout`, `/auth`
  - Allow: everything else
  - Sitemap reference included.

## 5. Open Graph & Social
- Default OG image (branded, 1200×630) generated per page type via Next.js `ImageResponse` (dynamic OG image generation) so blog posts and service pages get auto-branded social cards without manual design work.

## 6. Performance (Core Web Vitals as an SEO input)
- Target: LCP < 2.0s, CLS < 0.05, INP < 150ms on the marketing site.
- Next.js Image component (automatic `srcset`, lazy loading, AVIF/WebP) for all marketing imagery.
- Font loading via `next/font` (self-hosted, no render-blocking Google Fonts request).
- Static generation (SSG/ISR) for marketing pages and blog; only the app shell (dashboard) is client-rendered behind auth.
- Lighthouse CI gate in the deployment pipeline (see `31_DevOps.md`) — build fails if marketing-page Lighthouse performance score drops below an agreed threshold.

## 7. Content & On-Page SEO
- Blog content strategy targets three funnel stages:
  - **Top:** "how to get [X] done", "[X] vs [Y]" comparison/educational content.
  - **Middle:** "how Tasork's proposal process works", case-study style posts.
  - **Bottom:** service-category landing pages with direct "Submit a Project" CTAs.
- Each blog post: one H1, logical H2/H3 hierarchy, internal links to relevant service category pages, descriptive image `alt` text (also an accessibility requirement).
- Internal linking: every service category page links to 2–3 related categories and to relevant blog posts; footer contains a curated (not exhaustive/spammy) sitemap of key pages.

## 8. Technical SEO Hygiene
- Canonical tags on all pages to prevent duplicate-content issues from tracking-parameter URLs.
- 301 redirects map maintained centrally (`redirects.json` consumed by `next.config.js`) — no orphaned 404s from renamed pages.
- Custom branded 404 page with search + links back to key pages (reduces bounce, preserves link equity).
- `hreflang` tags reserved for future multi-language rollout (see `01_Project_Identity.md` long-term vision) — architecture supports it from day one even if only `en` ships initially.

## 9. Local/Brand SEO
- Google Business Profile (if a registered business address applies) for brand knowledge-panel eligibility.
- Consistent NAP (Name/Address/Phone) and brand entity data across footer, schema, and social profiles.
- Claim brand handles across major platforms early to prevent impersonation and support brand SERP presence.

## 10. Measurement
- Google Search Console + Bing Webmaster Tools connected pre-launch.
- Search Console coverage and Core Web Vitals reports reviewed weekly post-launch.
- Keyword rank tracking (initially manual/spreadsheet; a paid rank tracker considered post-traction) tied to the category pages defined above.
- Tied into `29_Analytics.md` funnel definitions — organic sessions → project submission → conversion is a tracked funnel, not just traffic volume.

## 11. Anti-Patterns (Explicitly Avoided)
- No keyword stuffing, no doorway pages, no purchased backlinks, no auto-generated thin content, no cloaking.
- No fabricated review counts/ratings in schema — reviews schema only reflects real, verified data pulled from the reviews system.
