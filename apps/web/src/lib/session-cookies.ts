/**
 * These are NOT the source of truth for authentication — the API still
 * validates the JWT Bearer token on every request. They exist purely so
 * middleware.ts (running on the web app's own origin) can tell "probably
 * logged in" from "definitely not logged in" without a network round trip,
 * to avoid a flash of protected content before redirecting.
 *
 * The real refresh token lives in an httpOnly cookie set by the API on its
 * own origin (see apps/api AuthController) and is never touched here.
 */
const SESSION_COOKIE = 'tasork_session';
const ROLE_COOKIE = 'tasork_role';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days, mirrors the refresh token TTL

export function setSessionCookies(role: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${SESSION_COOKIE}=1; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
  document.cookie = `${ROLE_COOKIE}=${role}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
}

export function clearSessionCookies() {
  if (typeof document === 'undefined') return;
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0`;
  document.cookie = `${ROLE_COOKIE}=; path=/; max-age=0`;
}
