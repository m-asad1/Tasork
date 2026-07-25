# 15 — Roadmap

> Phased delivery plan. Each phase has a clear exit condition — the next phase does not start until the prior one's deliverables are signed off, to avoid rework caused by building on an unstable foundation.

## Phase 1 — Planning (Current Phase)
**Goal:** Complete architectural and product foundation before any design or code.
- All 15 foundation documents (`docs/01`–`15`) completed and reviewed.
- Tech stack locked (`07_Technology.md`).
- Database entities and relationships mapped (`12_Database_Planning.md`).
- API surface mapped (`13_API_Planning.md`).
- Security model defined (`14_Security.md`).
- **Exit condition:** Another developer could read `docs/` and understand the entire product without asking basic questions.

## Phase 2 — Design
**Goal:** Translate the UI research and animation catalog into an actual, implementable design system.
- Design tokens defined (colors, spacing, typography, radii, shadows) in `ui/design-tokens/`.
- Core component specs (buttons, inputs, cards, modals, tables, nav) — Figma or Storybook, matching `10_UI_Research.md` direction.
- Wireframes for all ~78 pages from `05_Pages.md`, grouped by section (Marketing / Auth / Client Dashboard / Admin / Support).
- High-fidelity mockups for the highest-priority flows first: Home, Submit a Project, Proposal View, Client Dashboard, Admin Requests Queue.
- Dark mode variants defined alongside light mode, not retrofitted later.
- **Exit condition:** Every page in `05_Pages.md` has at least a wireframe; priority flows have high-fidelity mockups approved.

## Phase 3 — Frontend
**Goal:** Build the Next.js application shell and connect it to a mocked/stubbed API layer first, then the real one once Phase 4 is underway.
- Project scaffolding per `08_Project_Structure.md` (`(marketing)`, `(auth)`, `(dashboard)`, `(admin)` route groups).
- Design system components implemented in code (shadcn/ui primitives + custom components).
- Static/marketing pages built first (Home, How It Works, Pricing Philosophy, About, FAQ, Blog shell).
- Auth flows built (Register, Login, Verify Email, Forgot/Reset Password) against real backend once available.
- Client Dashboard core flows: Submit Request wizard, Request list/detail, Proposal view, Project detail (tabs), Payments/Invoices.
- Admin Panel core flows: Requests Queue, Proposal Builder, Projects Pipeline, Users, Payments & Refunds.
- Animations from `11_Animations.md` implemented via Framer Motion, respecting `prefers-reduced-motion`.
- **Exit condition:** All MVP-priority pages (non-`(F)` features from `03_Master_Features.md`) are navigable end-to-end with real or stubbed data.

## Phase 4 — Backend
**Goal:** Implement the NestJS API per `13_API_Planning.md`, backed by the Prisma schema derived from `12_Database_Planning.md`.
- Prisma schema authored (`database/schema.prisma`) and migrated; ERD generated into `database/erd/`.
- Auth module: JWT + refresh token rotation, RBAC guards, session tracking.
- Core modules built in dependency order: `users` → `requests` → `proposals` → `projects` (+ `milestones`, `deliverables`) → `payments` (+ Stripe integration, webhooks) → `messaging` → `notifications` → `coupons`/`referrals` → `reviews` → `support` → `cms` → `admin`.
- Background jobs (BullMQ) wired for email notifications, file processing, and scheduled digests.
- Security controls from `14_Security.md` implemented alongside each module, not bolted on afterward (rate limiting, validation, audit logging from day one).
- **Exit condition:** Every endpoint in `13_API_Planning.md` is implemented, documented via Swagger, and passing integration tests.

## Phase 5 — Testing
**Goal:** Verify correctness, security, and resilience before any real client traffic.
- Unit test coverage target met (80%+ on core modules: requests, proposals, payments) per `09_Development_Standards.md`.
- Integration tests for all API endpoints (Supertest against a test database).
- E2E tests (Playwright) for critical flows: registration → email verification, request submission → proposal → payment → project completion, support ticket lifecycle.
- Manual QA pass against the `03_Master_Features.md` list to confirm no MVP feature was silently dropped.
- Security review: rate limiting, RBAC boundaries, file upload validation, and payment webhook signature verification specifically re-tested.
- Load/performance smoke test on key endpoints (request submission, dashboard list views) ahead of launch.
- **Exit condition:** CI green across unit/integration/E2E suites; no open critical or high-severity bugs.

## Phase 6 — Deployment
**Goal:** Stand up staging and production environments matching `07_Technology.md`.
- Infra-as-code for CI/CD pipelines (`.github/workflows/`) — lint → type-check → test → build → deploy (staging auto, production manual approval).
- Environments provisioned: local → staging → production, each with isolated database, storage bucket, and secrets.
- Monitoring/alerting wired: Sentry (errors), Better Uptime/UptimeRobot (uptime), PostHog + Plausible (analytics).
- Backup and disaster-recovery runbook executed as a dry run (restore test) before go-live.
- DNS, SSL, and CDN (Cloudflare) configured for production domain.
- **Exit condition:** Production environment is live, monitored, and a full restore-from-backup has been successfully tested at least once.

## Phase 7 — Launch
**Goal:** Go live, then move into iteration based on real usage.
- Soft launch to a limited audience (e.g., waitlist or early referral group) to validate the end-to-end flow with real payments.
- Support and Ops team briefed and staffed against the SLA in `02_Business_Model.md`.
- Public launch: marketing site live, analytics funnel tracked from first session.
- Post-launch monitoring window (first 1–2 weeks) with daily check-ins on error rates, payment success rates, and support ticket volume.
- Backlog seeded with Phase 2+ (`F`) features from `03_Master_Features.md` (2FA, OAuth, multi-currency, subscriptions, mobile apps, AI-assisted intake) for prioritization post-launch.
- **Exit condition:** Platform is publicly live, stable, and the team has shifted from "build" mode to "operate and iterate" mode.

---

## Cross-Phase Notes
- Documentation (`docs/`) is treated as a living reference — any architecture-level change during Phases 3–6 must be reflected back into the relevant doc, not left to drift.
- Future/`(F)` features are intentionally deferred, not designed out — the data model and API already leave room for them (e.g., `NotificationChannel.sms`, `PaymentMethodType` extensibility, multi-currency-ready invoice structure).
