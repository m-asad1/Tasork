# 30 — Testing Strategy

> Stack: Jest (unit/integration), Playwright (E2E), Supertest (API), per `07_Technology.md`. Testing is a required stage in the CI/CD pipeline (`31_DevOps.md`), not an afterthought.

## 1. Testing Philosophy
- The testing pyramid: many fast unit tests, a moderate layer of integration tests, a thin layer of critical-path E2E tests.
- No feature ships to `main` without passing tests defined in this document — enforced by CI, not by discipline alone.
- Payment, authentication, and proposal-acceptance flows are treated as **must-not-break** paths and require the highest test coverage.

## 2. Unit Testing (Jest)
- **Scope:** pure functions, utility libraries, business-logic services (pricing calculations, validation schemas, RBAC permission checks), React component logic (via React Testing Library).
- **Target coverage:** ≥ 80% for backend business-logic modules (services, guards, pipes); ≥ 70% for shared frontend utility/hook code. UI presentational components are tested selectively, not exhaustively.
- **Conventions:** test files colocated as `*.spec.ts`/`*.test.tsx` next to source, per `09_Development_Standards.md` folder conventions.

## 3. Integration Testing
- **Backend (NestJS + Supertest):** tests exercise real HTTP request/response cycles against a test database (isolated per-run, seeded and torn down automatically), covering:
  - Auth flows (register, login, refresh, logout, RBAC-protected routes)
  - Project request → proposal → acceptance → payment happens end-to-end at the API layer
  - File upload validation and rejection paths
  - Webhook handling (Stripe events) with signature verification
- **Frontend:** component integration tests for multi-step forms (Submit Project wizard) and state-management interactions (React Query cache updates, optimistic UI).

## 4. End-to-End Testing (Playwright)
Critical user journeys run against a staging environment on every deploy:
1. Guest → register → verify email → submit a project request
2. Admin reviews request → sends proposal
3. Client receives proposal → accepts → completes advance payment (Stripe test mode)
4. Client and admin exchange messages in the project workspace
5. Admin marks project delivered → client leaves a review
6. Password reset flow
7. Google OAuth login (mocked provider in CI)
- Runs across Chromium, WebKit, and Firefox at minimum for the top 3 journeys; full matrix reserved for pre-release regression passes.
- Mobile viewport variants included (responsive breakpoints defined in `16_Design_System.md`).

## 5. API Contract Testing
- OpenAPI/Swagger spec (generated from NestJS decorators, per `13_API_Planning.md`) is validated in CI against actual endpoint responses to catch schema drift before it reaches the frontend.

## 6. Security Testing
- Automated dependency vulnerability scanning (`npm audit` / GitHub Dependabot) on every PR.
- SAST (static analysis, e.g. Semgrep or GitHub CodeQL) integrated into CI.
- Manual penetration-testing pass before public launch, covering the OWASP Top 10 (injection, broken auth, XSS, IDOR on project/proposal IDs, file-upload exploits) — cross-referenced with `14_Security.md`.
- RBAC boundary tests: automated tests that assert a customer role *cannot* access admin-only or another customer's project/payment endpoints (authorization regression protection).

## 7. Performance Testing
- Load testing (k6 or Artillery) against the API for key endpoints (submit request, list projects, messaging) before major launches, targeting the concurrency goals in `01_Project_Identity.md` ("thousands of concurrent users").
- Lighthouse CI on marketing pages for Core Web Vitals regressions (ties to `28_SEO.md`).

## 8. Accessibility Testing
- Automated: `axe-core` integrated into component tests and CI (catches color-contrast, missing labels, ARIA issues).
- Manual: keyboard-navigation and screen-reader pass (NVDA/VoiceOver) on core flows before each major release.
- Target: WCAG 2.1 AA across public and dashboard surfaces.

## 9. Manual QA
- Pre-release checklist covering cross-browser rendering, responsive breakpoints, empty/error/loading states for every screen, and edge cases automated tests don't cover well (file upload edge cases, timezone handling, currency formatting).
- Bug triage: severity levels (Blocker / Critical / Major / Minor) with defined SLAs for each before a release is approved.

## 10. Regression Testing
- Full Playwright critical-path suite re-run on every deploy to staging and production (via CI/CD pipeline).
- A "known issues" regression log maintained so previously-fixed bugs get an explicit test guarding against recurrence.

## 11. Test Data & Environments
- Seeded fixture data (fake clients, projects, proposals) via Prisma seed scripts for local/dev/staging — never production data used in test environments.
- Stripe test mode + test webhook endpoints for all non-production environments.
- Isolated test database per CI run to avoid cross-run contamination.

## 12. Definition of Done (Testing Gate)
A feature is not "done" until:
- Unit + integration tests written and passing
- Relevant E2E path updated/added if the change touches a critical journey
- No new accessibility violations introduced
- No drop in Lighthouse performance score below threshold
- Code review approved (per `09_Development_Standards.md`)
