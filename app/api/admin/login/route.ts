import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setAdminSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

import { rateLimit, getClientIP, logSecurityEvent, requireHTTPS, sanitizeInput } from "@/lib/security";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // HTTPS Check
    if (!requireHTTPS(request)) {
      return NextResponse.json(
        { error: "HTTPS required" },
        { status: 403 }
      );
    }

    // Rate Limiting
    const clientIP = getClientIP(request);
    const rateLimitKey = `login:${clientIP}`;
    if (!rateLimit(rateLimitKey, 5, 60000)) { // 5 attempts per minute
      await logSecurityEvent({
        action: 'LOGIN_RATE_LIMIT_EXCEEDED',
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

    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email.trim().toLowerCase());
    const sanitizedPassword = password; // Don't sanitize password (it's hashed anyway)

    // Select only needed fields to avoid schema mismatch issues
    const admin = await prisma.admin.findUnique({
      where: { email: sanitizedEmail },
      select: {
        id: true,
        email: true,
        password: true,
        restaurantId: true,
        restaurant: {
          select: {
            status: true,
          },
        },
      },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Geçersiz e-posta veya şifre" },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(sanitizedPassword, admin.password);

    if (!isValid) {
      await logSecurityEvent({
        action: 'FAILED_LOGIN_ATTEMPT',
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

    // Check if restaurant is approved
    if (admin.restaurant.status !== 'approved') {
      return NextResponse.json(
        { error: "Hesabınız henüz onaylanmamış. Lütfen platform yöneticilerinin onayını bekleyin." },
        { status: 403 }
      );
    }

    const session = {
      id: admin.id,
      email: admin.email,
      restaurantId: admin.restaurantId,
    };

    // Set session cookie
    try {
      await setAdminSession(session);
      if (process.env.NODE_ENV === "production") {
        console.log("Admin session cookie set successfully");
      }
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
      action: 'SUCCESSFUL_LOGIN',
      userId: session.id,
      userType: 'admin',
      ip: clientIP,
      userAgent: request.headers.get('user-agent') || 'unknown',
      details: { email: sanitizedEmail },
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      admin: session,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    console.error("Error details:", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    });
    return NextResponse.json(
      { 
        error: error?.message || "Bir hata oluştu", 
        details: process.env.NODE_ENV === "development" ? error?.stack : undefined 
      },
      { status: 500 }
    );
  }
}
