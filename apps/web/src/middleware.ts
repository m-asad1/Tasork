import { type NextRequest, NextResponse } from 'next/server';

const PROTECTED_PREFIXES = ['/dashboard', '/admin'];
const ADMIN_ONLY_PREFIXES = ['/admin'];

/**
 * Edge-level route gate. The real authorization decision still happens on the
 * API (RBAC guards, see docs/14_Security.md) — this middleware exists purely
 * to redirect unauthenticated/unauthorized users before the page renders,
 * avoiding a flash of protected content.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('tasork_session')?.value;
  const role = request.cookies.get('tasork_role')?.value;

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  if (!sessionCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const isAdminOnly = ADMIN_ONLY_PREFIXES.some((p) => pathname.startsWith(p));
  if (isAdminOnly && role !== 'ADMIN' && role !== 'SUPER_ADMIN' && role !== 'SUPPORT') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
