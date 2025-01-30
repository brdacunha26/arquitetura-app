import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublicPath = path === '/login';
  const token = request.cookies.get('user')?.value || '';

  // Rotas públicas
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Rotas privadas
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Rotas de admin
  if (path.startsWith('/admin')) {
    const user = token ? JSON.parse(token) : null;
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

// Configurar quais rotas serão verificadas pelo middleware
export const config = {
  matcher: [
    '/',
    '/login',
    '/admin',
    '/permissions',
    '/admin/:path*',
    '/projects/:path*',
    '/tasks/:path*',
    '/team/:path*',
    '/clients/:path*',
    '/finance/:path*'
  ]
} 