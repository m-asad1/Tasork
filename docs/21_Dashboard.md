# 21 — Dashboard Planning

> Each role gets a dashboard tuned to its job-to-be-done: Customers need reassurance and visibility, Admins need throughput and triage speed, Support needs queue clarity, Super Admin needs platform health. All dashboards share the same component library (`18_UI_Components.md`) and layout shell (`17_Wireframes.md`).

## 1. Customer Dashboard

### Purpose
Give the client immediate answers to "where does my stuff stand?" without digging.

### Layout (ref. `17_Wireframes.md` → Dashboard Home)
Top bar (search, notification bell, avatar) → sidebar nav → welcome row → stat cards → recent activity → quick actions.

### Widgets
| Widget | Data source | Notes |
|---|---|---|
| Welcome row | `auth/me` | Name + time-of-day greeting, "You have X pending items" summary line |
| Stat card — Active Projects | `['projects', {status:'active'}]` count | Click-through to My Projects |
| Stat card — Pending Requests | `['solution-requests', {status:'pending_review'}]` count | Click-through to My Requests |
| Stat card — Unread Messages | Notification context unread count (messaging subset) | Click-through to Messages |
| Stat card — Referral Credits | `['referrals/me/credits']` | Encourages referral usage |
| Recent Projects list | `['projects']` sorted by `updatedAt`, limit 5 | ProjectCard component, shows progress bar + next milestone |
| Proposal awaiting action banner | `['solution-requests', {status:'proposal_sent'}]` | High-visibility Alert/Banner if any proposal needs a decision — never buried below the fold |
| Getting Started Checklist | Local + `auth/me` flags | Clerk-style pattern (`10_UI_Research.md`): verify email, submit first request, complete profile — dismissible once all done |
| Quick Actions panel | Static | "Submit a Project", "View Messages", "Contact Support" buttons |

### States
- **Empty state (no requests yet):** replaces stat cards/recent list with a single centered EmptyState illustration + "Submit your first project" CTA.
- **Loading:** skeleton cards for stats + recent list (per `11_Animations.md`).

## 2. Admin Dashboard

### Purpose
Surface what needs a human decision *right now* and the overall health of the business.

### Widgets
| Widget | Data source | Notes |
|---|---|---|
| KPI stat cards row | `GET /admin/dashboard/kpis` | New requests today, revenue MTD, active projects, avg. proposal turnaround |
| Pending-review quick list | `['solution-requests', {status:'pending_review'}]` | Top 5, oldest-first, direct link into Proposal Builder |
| Revenue chart | `GET /admin/analytics/revenue` | LineChart, date-range selectable (7d/30d/90d/custom) |
| Funnel chart | `GET /admin/analytics/funnel` | BarChart: requests → proposals sent → accepted → paid → completed |
| Recent activity feed | `AuditLog` (recent, filtered to notable events) | Proposal sent, payment received, project completed, staff action |
| Team workload snapshot | `ProjectAssignment` aggregate | Mini version of the full Team & Workload page — flags anyone over-capacity |
| Support queue snapshot | `SupportTicket` count by status | Open/unassigned count, link to full queue |

### Layout
Same shell as Client Dashboard (top bar + sidebar) but content is chart/table-dense (Supabase-style per `10_UI_Research.md`), not card-illustrative.

## 3. Super Admin Dashboard
- Inherits everything from Admin Dashboard, plus a **System Health** widget: API error rate (Sentry feed), uptime status (Better Uptime), background job queue depth (BullMQ — flags stuck/failed jobs).
- **Platform-wide financial summary** (not just per-team) — total revenue, refund rate, coupon redemption cost.
- Nav includes Platform Settings, Staff Management, Audit Logs (full, unfiltered) — not shown to regular Admins.

## 4. Support Dashboard
- **My Ticket Queue** as the landing view rather than KPI cards — Support's job is queue-clearing, not strategic overview.
- Widgets: assigned-to-me count, unassigned count (claimable), average response time (personal), tickets resolved today.
- Quick filter chips: Open / In Progress / Escalated / Resolved.

## 5. Team Member View
- Not a full "dashboard" in the KPI sense — a scoped, read/update view of *their assigned projects only* (via `ProjectAssignment`), reusing the Client Project Detail tab structure but with team-only actions (update milestone status, upload deliverables) instead of client actions (accept/pay).

## 6. Shared Dashboard Principles
- **Stat cards are always clickable** — every number is a shortcut to the filtered list behind it, never a dead-end display.
- **Charts share one visual language** — consistent axis/tooltip/legend styling (`18_UI_Components.md` → Chart component) regardless of which dashboard renders them.
- **Real-time feel without full real-time infrastructure everywhere** — dashboards refetch on window focus (TanStack Query default) and via targeted WebSocket-triggered invalidation for message/notification counts specifically (per `19_State_Management.md`); KPI/revenue widgets are fine on a normal refetch interval (not push-driven) since second-to-second precision isn't needed there.
- **Date-range consistency** — any dashboard with a date-range selector (Admin revenue/funnel) uses the same control and persists the last-selected range in that session only (not saved permanently, to avoid stale defaults surprising the next visit).
- **Mobile:** stat cards stack to a horizontal-scroll row on small screens rather than a cramped grid; charts collapse to a simplified single-series view with a "view full report" link to a desktop-optimized page.
