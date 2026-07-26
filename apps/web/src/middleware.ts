import { type NextRequest, NextResponse } from 'next/server';

const PROTECTED_PREFIXES = ['/dashboard', '/admin'];
const ADMIN_ONLY_PREFIXES = ['/admin'];

/**
 * Middleware that runs on every request to `/dashboard` and `/admin` paths.
 * It checks for a valid session cookie (`tasork_session`) and redirects to
 * login if missing. For admin routes, it also checks the user role cookie.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('tasork_session')?.value;
  const role = request.cookies.get('tasork_role')?.value;

  // Check if the path is protected
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtected) {
    return NextResponse.next();
  }

  // No session → redirect to login
  if (!sessionCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin-only check
  const isAdminOnly = ADMIN_ONLY_PREFIXES.some((p) => pathname.startsWith(p));
  if (isAdminOnly && !['ADMIN', 'SUPER_ADMIN', 'SUPPORT'].includes(role || '')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // All good
  return NextResponse.next();
}

/**
 * Matcher configuration: run middleware only on dashboard and admin routes.
 */
export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};