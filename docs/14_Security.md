# 14 — Security Planning

> Principle: security is layered (defense-in-depth), not a single checkpoint. Every layer below assumes the ones before it can fail.

## 1. Authentication
- **JWT access tokens** — short-lived (15 min), signed with a rotating secret (stored in hosting provider's secret manager, never in repo).
- **Refresh tokens** — long-lived (7–30 days), HTTP-only + `Secure` + `SameSite=Strict` cookies, never exposed to JS.
- Refresh tokens are tracked server-side in the `Session` table (per `12_Database_Planning.md`) so any session can be individually revoked.
- On password change or suspicious activity, all sessions for that user are invalidated.

## 2. Refresh Token Rotation
- Every refresh request issues a new refresh token and invalidates the old one (rotation).
- Reuse of an already-rotated refresh token is treated as a compromise signal — all sessions for that user are force-logged-out and flagged in the audit log.

## 3. Role-Based Access Control (RBAC)
- Roles: `guest`, `customer`, `support`, `team_member`, `admin`, `super_admin`.
- Permissions are granular and role-mapped (e.g., `requests.review`, `payments.refund`, `staff.manage`) rather than hardcoded role checks scattered through the code — enforced via a NestJS `PermissionsGuard` decorator on each route.
- Principle of least privilege: `support` role has read-only access to project/payment context needed for tickets, never write access to payments or proposals.

## 4. CSRF Protection
- State-changing requests from browser sessions require a CSRF token (double-submit cookie pattern), validated on the backend for any cookie-authenticated route.
- Pure API-token (Bearer JWT) requests from the SPA are inherently less CSRF-prone, but the refresh-cookie endpoint specifically is CSRF-protected since it's cookie-based.

## 5. XSS Protection
- All user-generated content (messages, reviews, CMS rich text) is sanitized server-side before storage and again escaped on render.
- Strict Content Security Policy (CSP) headers restrict script sources; no inline scripts without nonce.
- React's default escaping is relied on for output; `dangerouslySetInnerHTML` is banned except for the CMS rich-text renderer, which passes through a sanitizer (e.g., DOMPurify) first.

## 6. SQL Injection Prevention
- All database access goes through Prisma's parameterized query builder — no raw string-concatenated SQL anywhere in the codebase.
- Any future raw SQL (rare, performance-tuning only) must go through parameterized `$queryRaw` and be code-reviewed specifically for injection risk.

## 7. Rate Limiting
- NestJS Throttler applied per-route with different thresholds (see `13_API_Planning.md` rate-limiting notes).
- Cloudflare WAF rules add a network-edge layer: bot mitigation, geo/IP reputation filtering, and DDoS protection ahead of the application layer.
- Escalating lockout on repeated failed login attempts (temporary IP + account-level cooldown).

## 8. File Upload Validation
- Allowed MIME types and max file size enforced both client-side (UX) and server-side (authoritative).
- Every uploaded file is scanned by ClamAV in the upload pipeline before being persisted to Cloudflare R2; rejected files never touch permanent storage.
- Files are stored with generated (non-guessable) keys, not the original filename, to prevent path traversal or overwrite attacks.
- Signed, time-limited URLs are used for private file access (deliverables, attachments) rather than public bucket links.

## 9. Password Hashing
- **Argon2id** (memory-hard, GPU-resistant) for all password storage — matches the locked technology decision in `07_Technology.md`.
- Passwords are never logged, never included in error messages, and never sent back in any API response.
- Minimum password policy enforced at registration (length + complexity baseline), configurable by Super Admin.

## 10. Two-Factor Authentication (Phase 2 / F)
- TOTP-based (authenticator app), optional per-user, enforceable per-role by Super Admin (e.g., mandatory for `admin`/`super_admin` accounts once launched).
- Backup/recovery codes issued at enrollment, single-use.

## 11. Audit Logs
- Every sensitive action (login, role change, refund, proposal edit, staff account changes, data export) writes an immutable `AuditLog` row: actor, action, target entity, timestamp, IP/user-agent.
- Audit logs are append-only — no update/delete capability exposed anywhere, including to Super Admin, except via a documented, logged data-retention process.

## 12. Session Management
- Users can view and revoke their own active sessions (device/IP/last-active shown) from Account Settings → Security.
- Admin can force-terminate any user's sessions (e.g., in response to a support/security incident), itself an audited action.
- Idle session timeout and absolute session lifetime both configurable via Super Admin security policy settings.

## 13. Data Protection & Confidentiality
- All traffic enforced over HTTPS/TLS (HSTS enabled).
- Sensitive fields (payment details) never touch application servers directly — handled via Stripe's hosted/tokenized flow (no raw card data stored by Tasork).
- Database-level encryption at rest (managed by the PostgreSQL provider).
- Confidentiality by default on all client project data — internal access strictly scoped to assigned staff via RBAC (see `02_Business_Model.md` Confidentiality Policy).

## 14. Backup & Recovery
- Automated daily database backups with point-in-time recovery, retained per a defined window (e.g., 30 days).
- File storage (R2) versioning enabled for accidental-deletion recovery.
- Documented disaster-recovery runbook: restore order, RTO/RPO targets, and responsible roles — finalized before production launch.

## 15. Secrets Management
- No secrets, API keys, or credentials committed to the repository (`.env.example` only contains placeholder keys).
- Secrets stored in the hosting provider's secret manager, injected at deploy/runtime.
- Secret rotation policy defined for payment/email/API keys, especially after any staff offboarding.

## 16. Dependency & Supply Chain Security
- Automated dependency vulnerability scanning in CI (e.g., `npm audit` / GitHub Dependabot alerts) blocking merge on critical findings.
- Lockfiles committed and enforced (`package-lock.json`) to prevent unpinned/drifting dependency versions.

## 17. Incident Response (Baseline)
- Defined escalation path for a suspected breach: Engineering Lead → Operations Lead → Founder, with client notification obligations assessed per severity.
- Security-relevant errors always logged to Sentry even when handled gracefully for the end user, so patterns can be investigated after the fact.
