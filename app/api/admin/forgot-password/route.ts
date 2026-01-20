import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

export const dynamic = 'force-dynamic';

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
    });

    // Güvenlik için: Admin bulunmasa bile başarılı mesajı döndür
    if (!admin) {
      return NextResponse.json({
        success: true,
        message: "Eğer bu e-posta adresi kayıtlıysa, şifre sıfırlama linki gönderildi.",
      });
    }

    // Reset token oluştur - unique constraint için önceki token'ı temizle
    let resetToken: string;
    let attempts = 0;
    const maxAttempts = 5;

    do {
      resetToken = randomBytes(32).toString("hex");
      attempts++;
      
      // Mevcut token'ı kontrol et
      const existingAdmin = await prisma.admin.findUnique({
        where: { resetToken },
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

    try {
      await prisma.admin.update({
        where: { id: admin.id },
        data: {
          resetToken,
          resetTokenExpiry,
        },
      });
    } catch (updateError: any) {
      console.error("Error updating admin reset token:", updateError);
      // Unique constraint hatası olabilir, tekrar dene
      if (updateError.code === 'P2002' && attempts < maxAttempts) {
        // Recursive call yerine basit bir retry
        const newToken = randomBytes(32).toString("hex");
        await prisma.admin.update({
          where: { id: admin.id },
          data: {
            resetToken: newToken,
            resetTokenExpiry,
          },
        });
        resetToken = newToken;
      } else {
        throw updateError;
      }
    }

    // Production'da burada email gönderilir
    // Şimdilik token'ı response'da döndürüyoruz (güvenlik için sadece development'ta)
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin/reset-password/${resetToken}`;

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
      stack: error?.stack,
    });
    return NextResponse.json(
      { 
        error: error?.message || "Bir hata oluştu",
        details: process.env.NODE_ENV === "development" ? error?.stack : undefined,
      },
      { status: 500 }
    );
  }
}
