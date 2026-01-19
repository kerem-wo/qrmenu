import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

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

    // Reset token oluştur
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // 1 saat geçerli

    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

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
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}
