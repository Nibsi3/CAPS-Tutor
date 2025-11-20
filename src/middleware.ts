import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Ensure CSP header is set correctly on all HTML responses
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

  // Set CSP header on all responses (it will override any duplicate from next.config.ts)
  response.headers.set('Content-Security-Policy', cspHeader);

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

