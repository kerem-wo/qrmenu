import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const sessionCookie = request.cookies.get("admin_session");
    
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // Protect platform admin routes
  if (pathname.startsWith("/platform-admin") && !pathname.startsWith("/platform-admin/login")) {
    const sessionCookie = request.cookies.get("platform_admin_session");
    
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/platform-admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/platform-admin/:path*",
  ],
};
