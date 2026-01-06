import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Define public routes that don't require authentication
  const publicRoutes = ['/login', '/register'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // If user has no token and is trying to access a protected route
  if (!token && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If user has a token and is trying to access login/register, redirect to home
  if (token && isPublicRoute) {
    const homeUrl = new URL('/', request.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon|icons).*)',
  ],
};

