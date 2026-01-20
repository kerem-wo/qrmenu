import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// Simple token generator without crypto dependency issues
function generateResetToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "E-posta gereklidir" },
        { status: 400 }
      );
    }

    const admin = await prisma.admin.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
      },
    });

    // Güvenlik için: Admin bulunmasa bile başarılı mesajı döndür
    if (!admin) {
      return NextResponse.json({
        success: true,
        message: "Eğer bu e-posta adresi kayıtlıysa, şifre sıfırlama linki gönderildi.",
      });
    }

    // Reset token oluştur
    let resetToken: string;
    let attempts = 0;
    const maxAttempts = 10;

    // Unique token oluştur
    do {
      resetToken = generateResetToken();
      attempts++;
      
      // Mevcut token'ı kontrol et
      const existingAdmin = await prisma.admin.findUnique({
        where: { resetToken },
        select: { id: true },
      });
      
      if (!existingAdmin) {
        break; // Token benzersiz, devam et
      }
      
      if (attempts >= maxAttempts) {
        throw new Error("Token oluşturulamadı, lütfen tekrar deneyin");
      }
    } while (attempts < maxAttempts);

    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // 1 saat geçerli

    // Update admin with reset token
    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Production'da burada email gönderilir
    // Şimdilik token'ı response'da döndürüyoruz (güvenlik için sadece development'ta)
    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
    const resetUrl = `${baseUrl}/admin/reset-password/${resetToken}`;

    return NextResponse.json({
      success: true,
      message: "Şifre sıfırlama linki oluşturuldu.",
      // Development için token'ı gösteriyoruz
      ...(process.env.NODE_ENV === "development" && {
        resetToken,
        resetUrl,
        note: "Development modunda token gösteriliyor. Production'da email gönderilir.",
      }),
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    console.error("Error details:", {
      message: error?.message,
      code: error?.code,
      name: error?.name,
      stack: process.env.NODE_ENV === "development" ? error?.stack : undefined,
    });
    return NextResponse.json(
      { 
        error: error?.message || "Bir hata oluştu",
        ...(process.env.NODE_ENV === "development" && {
          details: error?.stack,
          code: error?.code,
        }),
      },
      { status: 500 }
    );
  }
}
