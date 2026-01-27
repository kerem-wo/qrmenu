import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setPlatformAdminSession } from "@/lib/platform-auth";
import bcrypt from "bcryptjs";
import { rateLimit, getClientIP, logSecurityEvent, sanitizeInput } from "@/lib/security";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Rate Limiting (stricter for platform admin)
    const clientIP = getClientIP(request);
    const rateLimitKey = `platform-login:${clientIP}`;
    if (!rateLimit(rateLimitKey, 3, 60000)) { // 3 attempts per minute
      await logSecurityEvent({
        action: 'PLATFORM_ADMIN_LOGIN_RATE_LIMIT_EXCEEDED',
        userType: 'anonymous',
        ip: clientIP,
        userAgent: request.headers.get('user-agent') || 'unknown',
        timestamp: new Date(),
      });
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429 }
      );
    }

    const { email, password } = await request.json();

    // Input validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "E-posta ve şifre gereklidir" },
        { status: 400 }
      );
    }

    // Sanitize email
    const sanitizedEmail = sanitizeInput(email.trim().toLowerCase());

    const admin = await prisma.platformAdmin.findUnique({
      where: { email: sanitizedEmail },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
      },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Geçersiz e-posta veya şifre" },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, admin.password);

    if (!isValid) {
      await logSecurityEvent({
        action: 'FAILED_PLATFORM_ADMIN_LOGIN_ATTEMPT',
        userType: 'anonymous',
        ip: clientIP,
        userAgent: request.headers.get('user-agent') || 'unknown',
        details: { email: sanitizedEmail },
        timestamp: new Date(),
      });
      return NextResponse.json(
        { error: "Geçersiz e-posta veya şifre" },
        { status: 401 }
      );
    }

    const session = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
    };

    // Set session cookie FIRST, then create response
    try {
      await setPlatformAdminSession(session);
      console.log(`Platform admin session cookie set - NODE_ENV: ${process.env.NODE_ENV}, URL: ${request.url}`);
    } catch (sessionError: any) {
      console.error("Session cookie error:", sessionError?.message || sessionError);
      // In production, cookie setting failure is critical
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          { error: "Session oluşturulamadı. Lütfen tekrar deneyin." },
          { status: 500 }
        );
      }
      // In development, continue anyway - client will use localStorage
    }

    // Log successful login
    await logSecurityEvent({
      action: 'PLATFORM_ADMIN_SUCCESSFUL_LOGIN',
      userId: session.id,
      userType: 'platform-admin',
      ip: clientIP,
      userAgent: request.headers.get('user-agent') || 'unknown',
      details: { email: sanitizedEmail },
      timestamp: new Date(),
    });

    // Create response AFTER cookie is set
    return NextResponse.json({
      success: true,
      admin: session,
    });
  } catch (error: any) {
    console.error("Platform admin login error:", error);
    return NextResponse.json(
      { error: "Giriş sırasında bir hata oluştu" },
      { status: 500 }
    );
  }
}
