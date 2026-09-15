import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathParam = request.nextUrl.searchParams.get('path');
  if (pathParam) {
    const cleanPath = pathParam.startsWith('/') ? pathParam : `/${pathParam}`;
    const url = request.nextUrl.clone();
    url.pathname = cleanPath;
    url.searchParams.delete('path');
    return NextResponse.rewrite(url);
  }

  // Redirect /contribute to /dashboard?tab=contribute so users access the official dashboard contribute workflow
  if (request.nextUrl.pathname === '/contribute') {
    const dashUrl = request.nextUrl.clone();
    dashUrl.pathname = '/dashboard';
    dashUrl.searchParams.set('tab', 'contribute');
    return NextResponse.redirect(dashUrl);
  }

  // Protect privileged /admin routes: redirect unauthenticated visits to /login
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const token =
      request.cookies.get('access_token')?.value ||
      request.cookies.get('auth_token')?.value;
    if (!token || token.trim() === '') {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/login';
      const redirectTarget = request.nextUrl.pathname + request.nextUrl.search;
      loginUrl.search = '';
      loginUrl.searchParams.set('redirect', redirectTarget);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot|css|js)).*)',
  ],
};
