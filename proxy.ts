import { NextResponse, type NextRequest } from 'next/server';
import { appError, errorResponse } from '@/lib/api';
import { auth } from '@/lib/auth';
import configService from '@/lib/services/config';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await auth.api.getSession({ headers: request.headers });
  if (session) return NextResponse.next();

  if (pathname.startsWith('/api/')) {
    return errorResponse(
      appError('common.UNAUTHORIZED'),
      configService.list({ language: request.cookies.get('language')?.value }).language,
    );
  }

  return NextResponse.redirect(new URL('/', request.url));
}

export const config = {
  matcher: ['/((?!$|api/(?:auth|public)(?:/|$)|_next(?:/|$)|static(?:/|$)|favicon\\.ico$).*)'],
};
