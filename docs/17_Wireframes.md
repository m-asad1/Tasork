# 17 — Wireframes (Layout Only, No Color/Styling)

> Structural layout intent per page from `05_Pages.md`. Purely regions and hierarchy — visual styling comes from `16_Design_System.md` in the actual design phase.

## Public / Marketing

**Home**
```
[Navbar: logo | nav links | login | CTA button]
[Hero: headline, subheadline, CTA button, supporting illustration/mesh]
[Trust bar: logos / social proof counters]
[How It Works: 3-4 step horizontal process strip]
[Features/Categories grid: cards, icon + title + short desc]
[Testimonials carousel]
[Pricing philosophy teaser: short explainer + link]
[CTA band: headline + Submit a Project button]
[Footer: link columns, legal, social icons]
```

**How It Works** — Hero → step-by-step vertical timeline (4-6 steps, icon + text) → FAQ teaser → CTA band → Footer

**Services / Category Overview** — Hero → category grid (cards) → "not sure? submit anyway" CTA → Footer

**Service Category Detail** — Breadcrumb → category header + description → related examples/use-cases list → starting-from price note → CTA → Footer

**Pricing Philosophy** — Hero → "why no fixed pricing" explainer → how quotes are built (3-step visual) → FAQ → CTA → Footer

**About Us** — Hero/mission statement → values grid → team/culture section → careers link → CTA → Footer

**Careers** — Header → open roles list (or "no openings" state) → culture blurb → Footer

**Blog Listing** — Header + search/filter bar → article card grid (paginated) → Footer

**Blog Article** — Title/meta header → content body → author bio → related articles → comments (if enabled) → Footer

**FAQ** — Header → search bar → accordion list grouped by category → "still have questions" CTA → Footer

**Testimonials/Case Studies** — Header → filter (by category) → testimonial card grid/list → CTA → Footer

**Contact Us** — Two-column: contact form (left) + contact info/map or channels (right) → Footer

**Submit a Project (Guest Intake)** — Multi-step wizard: Step indicator top → Step 1 (category) → Step 2 (description) → Step 3 (upload) → Step 4 (budget/deadline) → Step 5 (review) → account creation prompt

**Terms / Privacy / Refund Policy** — Simple header → long-form content (table of contents sidebar on desktop) → Footer

**Referral Program (landing)** — Hero (how referrals work) → 3-step visual → reward details → CTA (login to get link) → Footer

**404 / 500 / Maintenance** — Centered: icon/illustration → message → action button (home/retry)

## Auth

**Login** — Centered card: logo → email/password fields → forgot password link → submit → OAuth button → "no account? register" link

**Register** — Centered card: name/email/password fields → terms checkbox → submit → OAuth button → "have an account? login" link

**Verify Email** — Centered card: status icon → message → resend button

**Forgot Password** — Centered card: email field → submit → confirmation message

**Reset Password** — Centered card: new password + confirm fields → submit

## Client Dashboard

**Dashboard Home** — Top bar (search, notifications, avatar) → sidebar nav → welcome/summary row → stat cards (active projects, pending requests, unread messages) → recent projects list → quick actions panel

**My Requests (list)** — Sidebar + top bar → filter/sort bar → table/card list (status, category, date) → pagination

**Request Detail** — Breadcrumb → status banner → request summary (category, description, files) → timeline/activity → action buttons (edit/withdraw, contextual to status)

**New Request (wizard)** — Same structure as guest Submit-a-Project wizard, pre-filled account context

**Proposal View** — Header (status, expiry countdown) → price/timeline/deliverables/revision-policy summary blocks → payment plan table → action buttons (accept/request changes/decline) → download PDF link

**My Projects (list)** — Sidebar + top bar → filter tabs (active/completed/cancelled) → project cards (progress bar, next milestone) → pagination

**Project Detail** — Header (title, status) → tab bar (Overview / Files / Messages / Milestones / Invoices) → tab content area → sidebar (team/point of contact, quick stats)

**Payments & Invoices (list)** — Sidebar + top bar → filter bar → table (date, project, amount, status) → pagination

**Invoice Detail / PDF view** — Header → invoice line items table → totals → download/print button

**Messages (global inbox)** — Sidebar (conversation list per project) → active thread panel (messages, composer, attachment button)

**Notifications** — List grouped by date → per-item icon + text + timestamp → mark-all-read button

**Reviews (mine)** — List of past reviews (project, rating, comment, edit button if within window)

**Referrals & Credits** — Referral link/code block with copy button → stats (clicks, signups, conversions) → credits balance → redemption history table

**Support Tickets (list)** — Filter bar (open/closed) → table/list → "new ticket" button

**Support Ticket Detail** — Header (status) → message thread → composer → close/reopen button

**Account Settings (Profile / Security / Notifications / Payment Methods)** — Sidebar sub-nav within Settings → form panel per section

## Admin Panel

**Admin Dashboard** — Top bar → sidebar nav → KPI stat cards row → charts row (revenue, funnel) → recent activity feed → pending-review quick list

**Requests Queue** — Filter/sort bar → table (client, category, submitted date, status) → row click → detail

**Request Review Detail → Proposal Builder** — Left: request summary (description, files) → Right: proposal builder form (price line items, timeline, deliverables, revision count, payment plan, expiry) → send button

**Projects Pipeline (Kanban)** — Column-per-status board → draggable project cards → card click → detail

**Project Detail (Admin view)** — Same tab structure as client view + internal-only tab (internal notes, QA checklist, team assignment)

**Team & Workload** — Table/grid of team members → assigned project count → workload indicator → reassign action

**Users Management** — Filter/search bar → table (name, email, status, joined date) → row → detail

**User Detail (Admin view)** — Profile summary → linked requests/projects list → payment history → suspend/reactivate action

**Staff Management** — Table (name, role, status) → add staff button → role edit modal

**Payments & Refunds** — Filter bar → table (transaction, amount, status, date) → row → detail panel with refund action

**Coupons Management** — Table (code, type, usage, expiry) → create/edit modal

**Referral Program Settings** — Form panel: reward %, discount %, terms

**Categories/Services Management** — Table + tree view (category/subcategory) → create/edit modal

**Pricing Rubric Management** — Table of complexity tiers/role rates → edit modal

**CMS (Blog / FAQ / Testimonials / Static Pages)** — List view per content type → rich-text editor panel → draft/publish toggle

**Reviews Moderation** — Table (project, rating, status) → approve/hide action

**Support Tickets Queue (Admin)** — Same as staff queue, with reassignment controls

**Analytics & Reports** — Filter/date-range bar → chart grid (revenue, funnel, satisfaction, team performance) → export button

**Audit Logs** — Filter bar (actor, action type, date range) → table (immutable, read-only)

**Notification Templates** — List of event types → template editor (subject/body, variables)

**Platform Settings (Super Admin)** — Tabbed panel: Security / Integrations / Feature Flags / General

## Support Panel

**My Ticket Queue** — Filter bar (assigned/unassigned) → table → row → ticket detail (same structure as client-facing detail + internal notes panel)

## Shared / Utility

**Search Results** — Search bar (persisted query) → result list grouped by type (blog/FAQ) → pagination

**Print/PDF Views (Proposal, Invoice)** — Single-column print-optimized layout, no nav/sidebar chrome

**Unauthorized (403)** — Centered: icon → message → "go back" / "go home" action
