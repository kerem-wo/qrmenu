import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setAdminSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "E-posta ve şifre gereklidir" },
        { status: 400 }
      );
    }

    // Select only needed fields to avoid schema mismatch issues
    const admin = await prisma.admin.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        restaurantId: true,
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
