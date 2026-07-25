# 27 — Admin Panel

> Consolidated functional spec for every Admin-facing capability, tying together the pages inventory (`05_Pages.md`), sitemap (`06_Sitemap.md`), and feature list (`03_Master_Features.md` §C/D) into one operational reference.

## 1. Users Management
- **List view:** searchable/filterable table (name, email, status, joined date, total spend) — `Table` component, Admin density variant.
- **User Detail:** profile summary, linked requests/projects list, full payment history, session list, suspend/reactivate action (`PATCH /users/:id/status`).
- **Suspend flow:** requires a reason (logged to `AuditLog`); suspended users are blocked at login with a clear message, existing data untouched (soft action, reversible).
- **Audit trail per user:** `GET /users/:id/audit-logs` — every sensitive action tied to that account, visible to Admin for support/investigation.

## 2. Projects & Requests Oversight
- **Requests Queue:** filter/sort by status/category/date; row click → Request Review Detail → Proposal Builder (full flow in `22_Proposal_System.md`).
- **Projects Pipeline (Kanban):** column-per-status board (Unassigned → In Progress → In Review → Delivered → Completed/Disputed), draggable cards, click-through to Project Detail (Admin view) with an internal-only tab (notes, QA checklist, team assignment) layered on top of the client-facing tab structure.
- **Team & Workload:** table of internal team members with assigned-project counts and a workload indicator (color-coded: light/moderate/at-capacity); reassign action moves a `ProjectAssignment` without disrupting project history.

## 3. Payments & Refunds
- Full spec in `23_Payment_System.md`; Admin surface here is the operational table: transaction, amount, status, date, linked project → detail panel with the refund action and audit trail.
- **Reconciliation view:** filter by status (`payments(status)` index, `12_Database_Planning.md`) to spot stuck/failed payments needing follow-up.

## 4. Coupons & Referral Settings
- **Coupons Management:** table (code, type, usage count/limit, expiry) → create/edit modal (percentage/flat, category restriction, stackability flag per `23_Payment_System.md` §4).
- **Referral Program Settings:** single form panel — reward percentage, first-project discount percentage, terms copy — feeds the public Referral Program landing page (`05_Pages.md` #17) and in-app referral flow (`04_User_Flow.md` Flow 14).

## 5. Categories / Services & Pricing Rubric
- **Categories Management:** table + tree view for category/subcategory hierarchy (matches `Category` entity, `12_Database_Planning.md`) — create/edit modal, feeds public Services pages and the request-submission wizard's category selector.
- **Pricing Rubric Management:** table of complexity tiers × role rates used internally to guide (not automate) proposal pricing consistency across reviewers (`02_Business_Model.md` §4) — edit modal per tier.

## 6. CMS
- Unified list-view-per-content-type pattern for Blog, FAQ, Testimonials, Static Pages — rich-text editor panel, draft/publish/schedule toggle (`03_Master_Features.md` §K).
- **Media library:** shared asset picker across all CMS content types, avoiding duplicate uploads of the same image.
- SEO metadata fields (title, description, OG image, canonical) attached per content item, feeding `28_SEO.md`.

## 7. Reviews Moderation
- Table (project, rating, comment excerpt, status) → approve/hide action; only `approved` reviews render on the public Testimonials page and structured data (`28_SEO.md` JSON-LD).

## 8. Support Tickets Queue (Admin View)
- Superset of the Support-role queue (`24_Messaging.md`/Support Panel) — Admin can view/reassign any ticket, escalate, or override status; internal notes visible.

## 9. Analytics & Reports
- Chart grid: revenue trend, funnel (request → proposal → payment → completion), client satisfaction/NPS, team performance (turnaround time, revision rate) — full detail in `29_Analytics.md`.
- **Export:** `GET /admin/export/:resource` (CSV/Excel) for requests, payments, users — used for offline reporting or accounting handoff.

## 10. Audit Logs
- Read-only, immutable table: actor, action, target entity, timestamp, IP/user-agent — filterable by actor/action-type/date range.
- Full unrestricted view is **Super Admin only**; regular Admin sees a scoped subset relevant to their own actions and team's projects (least-privilege, `14_Security.md` §3).

## 11. Notification Templates
- List of event types (`25_Notifications.md` §4 matrix) → template editor (subject/body, variable interpolation, live preview).

## 12. Platform Settings (Super Admin Only)
- **Tabbed panel:**
  - **Security** — password policy, session timeout/absolute lifetime, 2FA enforcement toggle per role.
  - **Integrations** — payment gateway credentials, email/SMS provider keys (masked, never displayed in full after initial entry).
  - **Feature Flags** — toggle Phase-2/F features on/off without a redeploy (e.g., enabling 2FA, OAuth, multi-currency ahead of general rollout).
  - **General** — platform-wide fees, default currency, tax rule defaults.
- **Staff Management:** create/edit staff accounts, assign roles (`support`, `team_member`, `admin`, `super_admin`), role-change actions logged.

## 13. System Health (Super Admin)
- Lightweight operational view: API error rate (Sentry), uptime status (Better Uptime), background job queue depth/failures (BullMQ) — surfaced here and echoed as a Super Admin Dashboard widget (`21_Dashboard.md` §3).

## 14. Admin Panel Cross-Cutting Rules
- Every write action from this panel that touches sensitive data (refunds, staff roles, suspensions, data exports) logs to `AuditLog` — no exceptions, no "quiet" admin actions.
- Dense table views default to the **compact** density variant (`18_UI_Components.md` Table) to maximize information visibility for staff working the queue all day, vs. the client dashboard's more spacious card-based feel.
- Every list view supports the same filter/sort/paginate contract as the API (`13_API_Planning.md` Conventions) — no bespoke pagination logic per page.
