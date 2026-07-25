# 20 — Authentication Flow

> Full lifecycle of identity on Tasork: registration through logout, plus every edge case in between. Implements the security model from `14_Security.md` and the API contract from `13_API_Planning.md`.

## 1. Registration (Email/Password)
- **Trigger points:** standalone `/register` page, or auto-prompted at the end of guest Submit-a-Project flow (`04_User_Flow.md` Flow 1).
- **Fields:** full name, email, password, confirm password, Terms of Service checkbox (required).
- **Client-side validation (Zod + React Hook Form):** email format, password strength (min 8 chars, 1 upper, 1 number), passwords match, terms checked.
- **Server-side:** re-validates everything (class-validator), checks email uniqueness, hashes password with Argon2id, creates `User` row with `role: customer`, `emailVerifiedAt: null`.
- **Post-create:** verification email dispatched (via BullMQ job → Resend), account usable in a limited state (can browse dashboard, cannot submit payment) until verified — soft gate, not a hard block, to avoid killing conversion.
- **Guest-intake merge:** if registration happens mid-Submit-a-Project flow, the in-progress `RequestWizardProvider` state (see `19_State_Management.md`) is attached to the newly created user on success rather than discarded.

## 2. Login
- **Fields:** email, password.
- **Flow:** `POST /auth/login` → validates credentials → issues short-lived JWT access token (returned in response body, held in memory per `19_State_Management.md`) + refresh token (set as HTTP-only, `Secure`, `SameSite=Strict` cookie).
- **Failure handling:** generic "Invalid email or password" message (never reveals which field is wrong) to avoid account enumeration.
- **Rate limiting:** 5 attempts/min/IP (per `14_Security.md`); escalating cooldown beyond that — first lockout 1 min, doubling per repeated violation, capped.
- **Unverified email:** login succeeds but dashboard shows a persistent "verify your email" banner (`Alert/Banner` component) with a resend action; payment/proposal-acceptance actions are blocked server-side until verified.

## 3. Email Verification
- **Token:** signed, time-limited (24h) verification token embedded in the emailed link (`/verify-email?token=...`).
- **Flow:** client hits `/verify-email`, page auto-calls `POST /auth/verify-email` with the token → on success, `emailVerifiedAt` set, success state shown, redirect to Dashboard.
- **Expired/invalid token:** clear error state + "Resend verification email" button (`POST /auth/resend-verification`, itself rate-limited to prevent spam).

## 4. Forgot Password
- **Flow:** user enters email on `/forgot-password` → `POST /auth/forgot-password` → always returns a generic "if that email exists, a reset link has been sent" response (prevents account enumeration) → reset email dispatched if the account exists.
- **Reset token:** signed, single-use, 1-hour expiry.

## 5. Reset Password
- **Flow:** `/reset-password?token=...` → new password + confirm fields → `POST /auth/reset-password`.
- **On success:** password updated (Argon2id re-hash), **all existing sessions for that user are invalidated** (security best practice — a leaked old password shouldn't retain a live session), user redirected to Login with a success toast.

## 6. Google OAuth (Phase 2 / F)
- **Provider:** Google OAuth via NextAuth-compatible flow, bridged to the custom NestJS backend (`07_Technology.md`).
- **Flow:** "Continue with Google" button → OAuth consent → callback exchanges code for profile (email, name, avatar) → backend finds-or-creates `User` (linked via a `provider`/`providerId` pair on the user record) → issues the same JWT + refresh-token pair as password login, so downstream session handling is identical regardless of auth method.
- **Account linking:** if the Google email matches an existing password-based account, the accounts are linked (not duplicated) after an ownership check (e.g., confirm via existing password or email verification).

## 7. Session Management
- **Access token:** 15-minute JWT, held only in memory (`AuthProvider` context) — never localStorage, never a readable cookie.
- **Refresh token:** HTTP-only cookie, 7–30 day expiry, tracked server-side in the `Session` table (device/IP/last-active recorded) so it can be individually revoked.
- **Refresh flow:** API client intercepts any `401` → calls `POST /auth/refresh-token` (cookie-authenticated) → on success, retries the original request transparently; on failure, forces logout + redirect to Login.
- **Rotation:** every refresh issues a new refresh token and invalidates the old one; reuse of a rotated token is treated as a compromise signal (`14_Security.md` §2) — all sessions force-logged-out.
- **User-facing session list:** Account Settings → Security shows active sessions (device, location approximation from IP, last active) with a revoke action per session (`DELETE /auth/sessions/:sessionId`), plus a "log out of all other devices" bulk action.

## 8. Two-Factor Authentication (Phase 2 / F)
- **Method:** TOTP (authenticator app) — Google Authenticator/Authy compatible.
- **Enrollment:** Settings → Security → "Enable 2FA" → QR code + manual key shown → user confirms with a generated code → 10 single-use backup/recovery codes issued (shown once, downloadable).
- **Login with 2FA:** after correct password, a second step prompts for the 6-digit code (or a backup code) before tokens are issued.
- **Enforcement:** Super Admin can mandate 2FA for `admin`/`super_admin` roles platform-wide once launched (`14_Security.md` §10).

## 9. Logout
- **Flow:** `POST /auth/logout` → current refresh token invalidated server-side (removed from `Session` table), access token discarded client-side, all TanStack Query caches cleared (per `19_State_Management.md` §1) to prevent stale data leaking to the next user on a shared device.
- **Confirmation page:** brief transient "You've been logged out" state before redirect to Home (per `05_Pages.md` #27).

## 10. Role-Based Redirect Logic
| Role | Post-login destination |
|---|---|
| `customer` | Client Dashboard Home |
| `support` | Support Ticket Queue |
| `team_member` | Assigned Projects view (Client-dashboard-style, scoped) |
| `admin` | Admin Dashboard |
| `super_admin` | Admin Dashboard (with Platform Settings nav visible) |

## 11. Edge Cases & Guardrails
- **Concurrent login on multiple devices:** allowed by default (each gets its own tracked `Session` row); Super Admin security policy can later cap concurrent sessions per user if abuse patterns emerge.
- **Deactivated/suspended account:** login blocked with a clear message and a support-contact link, rather than a generic auth failure.
- **Password change while logged in elsewhere:** all other sessions invalidated immediately (per §5/§7); current session continues if the change was self-initiated with correct current-password confirmation.
- **Email change:** requires re-verification of the new email address before it becomes the primary login identifier; old email remains valid until the new one is confirmed.
