import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setAdminSession } from "@/lib/auth";
import { getGoogleTokenAndProfile } from "@/lib/google-auth";
import { getClientIP, logSecurityEvent } from "@/lib/security";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/admin/auth/google/callback?code=...
 * Exchanges code for Google user, finds Admin by email, sets admin_session, redirects to dashboard.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    request.nextUrl.origin ||
    "http://localhost:3000";
  const redirectUri = `${baseUrl}/api/admin/auth/google/callback`;

  if (!code) {
    return NextResponse.redirect(
      new URL("/admin/login?error=google_no_code", request.url)
    );
  }

  try {
    const profile = await getGoogleTokenAndProfile(code, redirectUri);
    const email = profile.email;

    const admin = await prisma.admin.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        restaurantId: true,
        restaurant: {
          select: { status: true },
        },
      },
    });

    if (!admin) {
      await logSecurityEvent({
        action: "GOOGLE_LOGIN_NO_ADMIN",
        userType: "anonymous",
        ip: getClientIP(request),
        userAgent: request.headers.get("user-agent") || "unknown",
        details: { email },
        timestamp: new Date(),
      });
      return NextResponse.redirect(
        new URL(
          "/admin/login?error=no_account&message=" +
            encodeURIComponent("Bu Google hesabına bağlı restoran hesabı bulunamadı. Önce restoran kaydı oluşturun."),
          request.url
        )
      );
    }

    if (admin.restaurant.status !== "approved") {
      return NextResponse.redirect(
        new URL(
          "/admin/login?error=not_approved&message=" +
            encodeURIComponent("Hesabınız henüz onaylanmamış."),
          request.url
        )
      );
    }

    const session = {
      id: admin.id,
      email: admin.email,
      restaurantId: admin.restaurantId,
    };

    const response = NextResponse.redirect(new URL("/admin/dashboard", request.url));
    await setAdminSession(session, response);

    await logSecurityEvent({
      action: "GOOGLE_LOGIN_SUCCESS",
      userId: session.id,
      userType: "admin",
      ip: getClientIP(request),
      userAgent: request.headers.get("user-agent") || "unknown",
      details: { email },
      timestamp: new Date(),
    });

    return response;
  } catch (error) {
    console.error("Google callback error:", error);
    return NextResponse.redirect(
      new URL("/admin/login?error=google_error", request.url)
    );
  }
}
