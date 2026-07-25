# 10 — UI Research & Inspiration

> Goal: extract *principles*, not pixels. Nothing here is to be copied directly — used to define Tasork's own design language in the `ui/` folder.

## Stripe
- **Hero:** Large, confident headline + subtle animated gradient mesh background; immediate credibility signals (logos) below the fold.
- **Navigation:** Mega-menu with icons + short descriptions per item; sticky, minimal height.
- **Animations:** Scroll-triggered reveals, subtle parallax on illustrations, smooth hover states on cards.
- **Typography:** Custom sans-serif, tight letter-spacing on headlines, generous line-height on body.
- **Colors:** Near-black text on white, restrained accent (indigo/violet), gradients used sparingly for emphasis.
- **Card styles:** Soft shadows, 12–16px radius, thin 1px borders in light mode.
- **Buttons:** High-contrast primary, ghost/secondary variant, consistent 8px-grid padding.
- **Forms:** Inline validation, floating labels, clear focus rings.
- **Dashboard layout:** Left sidebar nav + top bar with breadcrumbs; content in max-width container.
- **Footer:** Dense, well-organized multi-column links.
- **Mobile:** Hamburger nav, stacked cards, thumb-friendly CTA placement.

## Linear
- **Hero:** Dark mode by default, product screenshot integrated into the hero itself.
- **Navigation:** Minimal top nav, few items, strong CTA button.
- **Animations:** Extremely snappy micro-interactions; keyboard-shortcut-driven feel even on marketing pages.
- **Typography:** Tight, modern, high contrast; headline weight variation for hierarchy.
- **Colors:** Deep charcoal background, single accent color (purple), used consistently for interactive elements only.
- **Card styles:** Flat with subtle border, minimal shadow — relies on contrast, not elevation.
- **Buttons:** Small, precise, consistent icon+label spacing.
- **Dashboard layout:** Command-palette-driven navigation; inspires our future "quick actions" pattern.
- **Mobile:** Content-first, simplified nav drawer.

## Vercel
- **Hero:** Monochrome base with one bold accent; large geometric shapes/gradients as background texture.
- **Navigation:** Clean, few top-level items, product dropdown grouped by use case.
- **Animations:** Grid/line animations reinforcing a "technical precision" feel.
- **Typography:** Geist font family — modern, geometric, excellent at small sizes for dashboards.
- **Colors:** Black/white base, accent used only for status and links.
- **Buttons:** Pill and rounded-rect variants; clear hover elevation change.
- **Dashboard layout:** Left nav + breadcrumb + deployment status front and center — a pattern worth adapting for our Project status front-and-center dashboard.
- **Footer:** Structured, includes changelog link — good trust signal.

## Notion
- **Hero:** Illustration-driven, playful but clean; product screenshot shown inside a "browser frame."
- **Navigation:** Simple horizontal nav; product/pricing/resources grouped clearly.
- **Animations:** Gentle fade/slide on scroll; nothing distracting.
- **Typography:** Friendly serif for headlines + clean sans for body — approachable without losing polish.
- **Colors:** Warm off-white background instead of pure white; soft pastel accents per section.
- **Card styles:** Rounded corners, illustration-forward, light borders.
- **Forms:** Conversational copy in labels/placeholders.
- **Mobile responsiveness:** Excellent — content reflows naturally, touch targets generous.

## Framer
- **Hero:** Bold, editorial typography; interactive draggable/hover elements right in the hero.
- **Navigation:** Minimal, transparent-over-hero nav that solidifies on scroll.
- **Animations:** Most animation-forward of the set — cursor-follow effects, staggered entrance animations.
- **Typography:** Large-scale, expressive; strong use of variable fonts.
- **Colors:** High-contrast black/white with vivid single accent per campaign.
- **Card styles:** Interactive hover-tilt effects; bold imagery.
- **Buttons:** Custom cursor states on hover — a nice-to-have interaction pattern, not core.

## Clerk
- **Hero:** Developer-focused, code snippet embedded directly in hero.
- **Navigation:** Docs-first nav structure — useful reference for our future API docs section.
- **Typography:** Monospace accents mixed with clean sans for a "technical trust" feel.
- **Colors:** Purple/blue accent on white/dark toggle.
- **Dashboard layout:** Clear "getting started" checklist pattern on first login — strong pattern to reuse for Tasork's first-time client onboarding.
- **Forms:** Extremely tight validation feedback loop, inline and immediate.

## Supabase
- **Hero:** Dark, terminal-inspired aesthetic; green accent as a trust/action signal.
- **Navigation:** Product-grouped dropdown, GitHub star count displayed (social proof pattern).
- **Dashboard layout:** Table-dense views done well — readable at high information density, relevant for our Admin Requests Queue and Projects Pipeline.
- **Card styles:** Bordered, low-shadow, information-dense without feeling cluttered.

## Webflow
- **Hero:** Bright, colorful, illustration + gradient blend; strong visual energy for a broad, non-technical audience — closest analog to Tasork's audience breadth (students to businesses).
- **Navigation:** Solutions-by-audience mega-menu (by role: marketers, agencies, enterprises) — directly relevant since Tasork also serves multiple audience segments and could group services "by who you are."
- **Card styles:** Bright gradient cards for templates/showcase — good pattern for our category/services grid.
- **Footer:** Extensive, SEO-friendly link structure.

---

## Synthesized Design Direction for Tasork
- **Base:** Clean, mostly white/off-white in light mode with a true dark mode (not just inverted) — following Stripe/Notion's approachability rather than Linear's developer-dark-by-default.
- **Accent color:** A single confident accent (deep indigo/teal) used consistently for CTAs, status, and links only — following Vercel/Linear discipline.
- **Typography:** Modern geometric sans for UI (Inter or Geist) + a touch of personality in marketing headlines only (following Notion's approachable warmth).
- **Cards:** Soft shadow + thin border + 12px radius — Stripe-style, since it reads premium without being cold.
- **Dashboard:** Left sidebar + top breadcrumb, dense but legible tables (Supabase-style) for Admin; friendlier card-based layout for Client dashboard.
- **Onboarding:** Clerk-style "getting started" checklist for first-time clients (submit first request, verify email, etc.).
- **Animation restraint:** Framer-level animation-forward only on the marketing homepage hero; everywhere else (especially dashboards), animation stays snappy and functional like Linear/Vercel — never decorative at the cost of speed.
