import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireHTTPS, getClientIP, logSecurityEvent } from "@/lib/security-edge";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Security Headers
  const response = NextResponse.next();
  
  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // HTTPS enforcement in production
  if (process.env.NODE_ENV === 'production' && !requireHTTPS(request)) {
    const httpsUrl = request.url.replace('http://', 'https://');
    return NextResponse.redirect(httpsUrl, 301);
  }

  // Protect admin routes
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const sessionCookie = request.cookies.get("admin_session");
    
    if (!sessionCookie) {
      await logSecurityEvent({
        action: 'UNAUTHORIZED_ADMIN_ACCESS_ATTEMPT',
        userType: 'anonymous',
        ip: getClientIP(request),
        userAgent: request.headers.get('user-agent') || 'unknown',
        details: { path: pathname },
        timestamp: new Date(),
      });
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // Protect platform admin routes
  if (pathname.startsWith("/platform-admin") && !pathname.startsWith("/platform-admin/login")) {
    const sessionCookie = request.cookies.get("platform_admin_session");
    
    if (!sessionCookie) {
      await logSecurityEvent({
        action: 'UNAUTHORIZED_PLATFORM_ADMIN_ACCESS_ATTEMPT',
        userType: 'anonymous',
        ip: getClientIP(request),
        userAgent: request.headers.get('user-agent') || 'unknown',
        details: { path: pathname },
        timestamp: new Date(),
      });
      return NextResponse.redirect(new URL("/platform-admin/login", request.url));
    }
  }

  // Protect document access routes
  if (pathname.startsWith("/api/documents")) {
    // This will be handled by the route handler itself
    // But we add logging here
    await logSecurityEvent({
      action: 'DOCUMENT_API_ACCESS',
      userType: 'anonymous',
      ip: getClientIP(request),
      userAgent: request.headers.get('user-agent') || 'unknown',
      details: { path: pathname },
      timestamp: new Date(),
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/platform-admin/:path*",
  ],
};
