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

  // Protect /dashboard route: redirect unauthenticated visits to /login
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('access_token')?.value;
    if (!token || token.trim() === '') {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/login';
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
