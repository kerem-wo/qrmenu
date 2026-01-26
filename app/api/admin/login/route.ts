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

    const isValid = await bcrypt.compare(password, admin.password);

    if (!isValid) {
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

    // Try to set session cookie, but don't fail if it doesn't work
    // Client-side localStorage will handle it
    try {
      await setAdminSession(session);
    } catch (sessionError: any) {
      console.error("Session cookie error (non-fatal):", sessionError?.message || sessionError);
      // Continue anyway - client will use localStorage
    }

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
