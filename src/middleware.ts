import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Skip middleware during build time
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  // Only set CSP on HTML responses (not API routes, static files, etc.)
  const pathname = request.nextUrl.pathname;
  const isHtmlResponse = 
    !pathname.startsWith('/api/') &&
    !pathname.startsWith('/_next/') &&
    !pathname.includes('.') && // Exclude files with extensions
    pathname !== '/favicon.ico';

  if (isHtmlResponse) {
    // Ensure CSP header is set correctly on HTML responses
    // This explicitly blocks fonts from assets.appwrite.io
    const cspHeader = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fra.cloud.appwrite.io https://*.appwrite.io",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Explicitly block fonts from assets.appwrite.io - only allow self-hosted and Google fonts
      "font-src 'self' data: https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://fra.cloud.appwrite.io https://*.appwrite.io https://*.appwrite.network wss://*.appwrite.io",
      "frame-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join('; ');

    // Set CSP header on HTML responses (it will override any duplicate from next.config.ts)
    response.headers.set('Content-Security-Policy', cspHeader);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

