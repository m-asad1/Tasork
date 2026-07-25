# 31 — DevOps Planning

> Aligns with `07_Technology.md`: GitHub, GitHub Actions, Docker, Vercel (frontend), Railway → AWS at scale (backend/DB).

## 1. Environments
| Environment | Purpose | Deploy Trigger |
|---|---|---|
| Local | Individual developer machines | Manual, via Docker Compose |
| Preview | Per-PR ephemeral environment | Automatic on PR open (Vercel preview + Railway PR environment) |
| Staging | Pre-production validation, QA, demo | Automatic on merge to `staging` |
| Production | Live platform | Manual approval after staging validation, deploy from `main` |

## 2. Containerization (Docker)
- Backend (NestJS) fully dockerized; multi-stage Dockerfile (build stage → slim runtime image) to minimize image size and attack surface.
- `docker-compose.yml` for local dev spins up: API, PostgreSQL, Redis, and a local S3-compatible storage emulator (e.g., MinIO) so local development mirrors production dependencies without needing cloud accounts.
- Frontend runs natively via Vercel's build system (no Docker needed for Next.js deployment), but a Dockerfile is maintained for portability in case of future migration off Vercel.

## 3. CI/CD Pipeline (GitHub Actions)
Pipeline stages, matching `07_Technology.md` and `30_Testing.md`:
1. **Lint** — ESLint + Prettier check (fails fast on style violations)
2. **Type-check** — `tsc --noEmit` across frontend and backend
3. **Unit + integration tests** — Jest/Supertest, with coverage report uploaded as a build artifact
4. **Build** — Next.js build + NestJS build, verifying production build succeeds
5. **E2E (staging only)** — Playwright critical-path suite against the freshly deployed staging environment
6. **Security scan** — dependency audit + SAST
7. **Deploy** — staging auto-deploys on merge to `staging`; production requires a manual approval gate (protected environment in GitHub Actions) plus a green staging E2E run
- Branch protection: `main` and `staging` require passing CI + at least one approving review before merge (per `09_Development_Standards.md`).

## 4. Secrets Management
- No secrets committed to the repository, ever (enforced via a pre-commit secret-scanning hook + GitHub secret scanning).
- Environment variables managed per-environment in Vercel and Railway's native secret stores.
- Shared secrets (Stripe keys, JWT signing secrets, database URLs) rotated on a defined schedule and immediately on suspected compromise.
- `.env.example` maintained in-repo with variable names only, never real values.

## 5. Infrastructure as Code
- Railway/Vercel configuration tracked as code where supported (`railway.json`, `vercel.json`) so environment setup is reproducible, not manual click-ops.
- Migration path to AWS (documented in `07_Technology.md`) will introduce Terraform for infrastructure provisioning at that scale threshold.

## 6. Backups & Disaster Recovery
- **Database:** automated daily PostgreSQL backups (provider-managed snapshots) with point-in-time recovery enabled; retention: 30 days minimum.
- **File storage (Cloudflare R2):** versioning enabled on production buckets; lifecycle policy for old versions.
- **Recovery testing:** a restore drill performed quarterly (restore a backup into a scratch environment and verify integrity) — untested backups are treated as no backup.
- **RPO/RTO targets:** Recovery Point Objective ≤ 24 hours, Recovery Time Objective ≤ 4 hours for production database restoration.

## 7. Monitoring & Alerting
- **Error tracking:** Sentry, alerting the team via Slack/email on new error types or spikes in error rate.
- **Uptime monitoring:** synthetic checks on key endpoints (marketing site, login, API health check) every 1–5 minutes, alerting on downtime.
- **Infrastructure metrics:** CPU/memory/response-time dashboards from Railway/hosting provider; alert thresholds configured for sustained high load.
- **Logging:** structured JSON logs (Pino) aggregated centrally, searchable by request ID for tracing a single user action across services.
- On-call/escalation path defined even at small scale (who gets paged for a production outage) — informal but explicit.

## 8. Scaling Strategy
- Stateless backend services (JWT-based auth, no server-side session state) so horizontal scaling is a matter of adding instances behind a load balancer.
- Redis used for caching and job queues, sized/monitored independently of the API instances.
- Database connection pooling (e.g., PgBouncer or provider-managed pooling) to handle scaling of concurrent connections as traffic grows.
- Migration trigger points to AWS defined in advance (e.g., sustained load beyond Railway's practical ceiling) rather than decided reactively under pressure.

## 9. Release Process
- Semantic versioning for backend API releases (tags on `main`).
- Release notes auto-generated from conventional commits (per `09_Development_Standards.md` commit rules).
- Feature flags (via PostHog, per `29_Analytics.md`) used for risky or partial rollouts instead of long-lived feature branches, keeping `main` always deployable.
- Rollback plan: every production deploy can be reverted to the previous known-good build within minutes (Vercel instant rollback; Railway redeploy of previous image).

## 10. Cost & Resource Governance
- Monthly review of hosting/infrastructure spend against usage (avoids silent cost creep as the platform scales).
- Staging/preview environments auto-suspended after inactivity where the provider supports it, to control non-production costs.
