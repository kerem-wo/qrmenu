import { NextRequest, NextResponse } from "next/server";
import { getGoogleAuthUrl } from "@/lib/google-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/admin/auth/google
 * Redirects to Google OAuth consent screen.
 */
export async function GET(request: NextRequest) {
  try {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return NextResponse.redirect(
        new URL("/admin/login?error=google_not_configured", request.url)
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      request.nextUrl.origin ||
      "http://localhost:3000";
    const redirectUri = `${baseUrl}/api/admin/auth/google/callback`;

    const authUrl = getGoogleAuthUrl(redirectUri);
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Google auth redirect error:", error);
    return NextResponse.redirect(
      new URL("/admin/login?error=google_error", request.url)
    );
  }
}
