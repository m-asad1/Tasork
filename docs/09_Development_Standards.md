# 09 — Development Standards

## Coding Standards
- TypeScript strict mode enabled across frontend and backend — no `any` without explicit justification comment.
- Functional, composable code preferred; avoid deep inheritance hierarchies.
- Business logic lives in services (backend) or hooks/lib (frontend) — never inline in controllers or components beyond orchestration.
- Every module (NestJS) is self-contained: controller → service → repository (Prisma) → DTOs.
- No magic strings/numbers — use enums/constants (e.g., `ProjectStatus.IN_PROGRESS`, not `"in_progress"` scattered around).

## Naming Convention
- **Files:** kebab-case (`project-detail.tsx`, `create-proposal.service.ts`)
- **Components (React):** PascalCase (`ProjectDetailCard`)
- **Variables/functions:** camelCase
- **Types/Interfaces:** PascalCase, interfaces prefixed only if disambiguation is needed (avoid `IUser`, prefer `User`)
- **Database tables:** snake_case, plural (`solution_requests`, `proposals`)
- **API routes:** kebab-case, resource-plural (`/api/solution-requests`)
- **Environment variables:** SCREAMING_SNAKE_CASE

## Git Workflow
- Trunk-based development with short-lived feature branches off `main`.
- Branch naming: `feature/<ticket-id>-short-description`, `fix/<ticket-id>-short-description`, `chore/...`
- No direct commits to `main` or `staging` — all changes via Pull Request.
- Minimum 1 reviewer approval required before merge.
- Squash-merge to keep history clean.

## Commit Rules
- Conventional Commits format: `type(scope): message`
  - Types: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `perf`, `style`
  - Example: `feat(proposals): add proposal PDF export`
- Commits should be atomic — one logical change per commit.

## Branch Strategy
```
main        → production-ready, protected
staging     → pre-production, auto-deployed to staging env
feature/*   → individual work, PR into staging
hotfix/*    → urgent production fixes, PR into main + backport to staging
```

## Linting & Formatting
- **Linter:** ESLint (Airbnb-based config, TypeScript rules) for both frontend and backend.
- **Formatter:** Prettier, enforced via pre-commit hook.
- **Pre-commit:** Husky + lint-staged runs lint + format + type-check on staged files.

## Documentation
- Every module includes a short `README.md` explaining its purpose and key flows.
- Public API endpoints documented via OpenAPI annotations (NestJS Swagger module) — kept in sync with `api/openapi.yaml`.
- Complex business logic gets inline comments explaining *why*, not *what*.

## Error Handling
- Centralized exception filter (NestJS) maps domain errors to consistent HTTP responses: `{ statusCode, message, errorCode, timestamp }`.
- Frontend uses a shared API client that normalizes error responses and surfaces user-friendly messages via toast/inline form errors.
- No silent failures — all caught errors are logged (Sentry) even if handled gracefully for the user.

## Logging
- Structured JSON logs (Pino) with request ID correlation across services.
- Log levels: `error`, `warn`, `info`, `debug` — `debug` disabled in production.
- Sensitive data (passwords, tokens, full card numbers) never logged.

## Testing
- **Unit tests** required for all service-layer business logic (target 80%+ coverage on core modules: requests, proposals, payments).
- **Integration tests** for API endpoints using Supertest against a test database.
- **E2E tests** (Playwright) for critical flows: registration, request submission, proposal acceptance, payment, project completion.
- Tests run automatically in CI on every PR; merge blocked on failure.

## Review Process
1. Author opens PR with description, linked ticket, and screenshots/GIFs for UI changes.
2. Automated checks run (lint, type-check, tests, build).
3. Reviewer checks: correctness, adherence to these standards, security implications, test coverage.
4. Author addresses feedback; reviewer approves.
5. Squash-merge into target branch; ticket moved to Done.
