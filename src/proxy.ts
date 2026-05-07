import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || 'secret' });
  const isAuthPage = req.nextUrl.pathname.startsWith('/login');
  
  if (!token) {
    if (!isAuthPage) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return null;
  }

  if (isAuthPage) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Admin route protection
  if (req.nextUrl.pathname.startsWith('/admin') && token.role !== 'Admin') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icon-192x192.png|icon-512x512.png).*)'],
};
