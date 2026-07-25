# 07 — Technology Stack (Locked)

> These decisions are final for the initial build. Changes require a documented architecture-decision revision, not an ad hoc swap.

## Frontend
- **Framework:** Next.js 14 (App Router, TypeScript)
- **Styling:** Tailwind CSS + shadcn/ui component primitives
- **Animation:** Framer Motion
- **State/data-fetching:** TanStack Query (React Query) + React Context for local UI state
- **Forms/validation:** React Hook Form + Zod

## Backend
- **Runtime/Framework:** Node.js + NestJS (TypeScript), REST API
- **ORM:** Prisma
- **Queue/Jobs:** BullMQ (backed by Redis) — for emails, notifications, file processing
- **Caching:** Redis

## Database
- **Primary DB:** PostgreSQL 16
- **Search:** PostgreSQL full-text search initially; Meilisearch/Algolia if scale requires (F)

## Authentication
- **Method:** JWT access tokens (short-lived) + HTTP-only refresh tokens
- **RBAC:** custom role/permission tables (roles: guest, customer, support, admin, super_admin)
- **2FA:** TOTP-based (Phase 2)

## Hosting & Cloud
- **Frontend:** Vercel
- **Backend API:** Railway (initial) → migration path to AWS (ECS/Fargate) at scale
- **Database:** Managed PostgreSQL (Railway/Neon initially → AWS RDS at scale)
- **File Storage:** Cloudflare R2 (S3-compatible, cost-efficient egress)
- **CDN:** Cloudflare

## Email
- **Transactional email:** Resend
- **Templates:** React Email

## SMS (Future)
- Twilio

## Payments
- **Provider:** Stripe (cards, wallets, Stripe Invoicing for records)
- Regional/local payment rails evaluated per market as expansion requires (F)

## Security
- **Password hashing:** Argon2id
- **Input validation:** class-validator (NestJS) + Zod (frontend)
- **Rate limiting:** NestJS Throttler + Cloudflare WAF rules
- **File scanning:** ClamAV (server-side) on upload pipeline
- **Secrets management:** environment variables via hosting provider secret store (no secrets in repo)

## Authentication Providers (OAuth, Phase 2)
- Google OAuth via NextAuth-compatible flow integrated with custom backend

## Monitoring
- **Error tracking:** Sentry (frontend + backend)
- **Uptime monitoring:** Better Uptime / UptimeRobot

## Analytics
- **Product analytics:** PostHog (self-hosted or cloud)
- **Web analytics:** Plausible (privacy-friendly, GDPR-safe)

## Deployment
- **Frontend:** Vercel automatic deployments from `main`/`staging` branches
- **Backend:** Docker containers deployed via Railway/CI pipeline
- **Environments:** local → staging → production

## Testing
- **Unit/Integration:** Jest
- **E2E:** Playwright
- **API testing:** Supertest (NestJS)

## CI/CD
- **Platform:** GitHub Actions
- **Pipeline stages:** lint → type-check → unit tests → build → deploy (staging auto, production manual approval)

## Version Control
- **Host:** GitHub
- **Branching:** Trunk-based with short-lived feature branches (see 09_Development_Standards.md)

## Logging
- **Backend:** Pino (structured JSON logs)
- **Aggregation:** Better Stack Logs (or hosting provider's built-in log drain initially)

## File Storage Structure
- Bucket per environment (`tasork-prod`, `tasork-staging`)
- Prefixed by entity: `/requests/{id}/`, `/projects/{id}/deliverables/`, `/avatars/{userId}`

## Summary Table
| Layer | Choice |
|---|---|
| Frontend | Next.js 14 + TypeScript + Tailwind + shadcn/ui |
| Backend | NestJS (Node.js/TypeScript) |
| Database | PostgreSQL + Prisma |
| Auth | JWT + Refresh Tokens, RBAC |
| Hosting (FE) | Vercel |
| Hosting (BE/DB) | Railway → AWS at scale |
| Storage | Cloudflare R2 |
| Email | Resend + React Email |
| Payments | Stripe |
| Monitoring | Sentry |
| Analytics | PostHog + Plausible |
| CI/CD | GitHub Actions |
| Testing | Jest + Playwright |
| Queue/Cache | Redis + BullMQ |
