import { NextResponse, type NextRequest } from 'next/server';
import { appError, errorResponse } from '@/lib/api';
import { auth } from '@/lib/auth';

// 首页对访客默认展示，登录态由页面自己判断
const PUBLIC_PAGES = new Set(['/', '/sign-in', '/sign-up']);

// 内嵌检查只读目标站的响应头，不含用户数据，访客也能调
const PUBLIC_APIS = new Set(['/api/iframe/check']);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_PAGES.has(pathname) || PUBLIC_APIS.has(pathname)) return NextResponse.next();

  const session = await auth.api.getSession({ headers: request.headers });
  if (session) return NextResponse.next();

  if (pathname.startsWith('/api/')) {
    return errorResponse(appError('UNAUTHORIZED'));
  }

  return NextResponse.redirect(new URL('/sign-in', request.url));
}

export const config = {
  // 默认拦全部，只放行 better-auth 接口与静态资源。
  matcher: ['/((?!api/auth|_next|images|uploads|favicon).*)'],
};
