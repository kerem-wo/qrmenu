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

    // Admin'i bul - select kullanarak sadece gerekli alanları al
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

    // Reset token oluştur - timestamp ile benzersizlik garantisi
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 15);
    let resetToken = `${timestamp}-${randomPart}-${generateResetToken().substring(0, 32)}`;
    
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // 1 saat geçerli

    // Update admin with reset token - try-catch ile güvenli update
    try {
      // Yeni token ile update yap
      await prisma.admin.update({
        where: { id: admin.id },
        data: {
          resetToken,
          resetTokenExpiry,
        },
      });
    } catch (updateError: any) {
      console.error("Update error:", updateError);
      console.error("Error code:", updateError?.code);
      console.error("Error message:", updateError?.message);
      console.error("Error meta:", updateError?.meta);
      
      // Eğer unique constraint hatası varsa, yeni token oluştur ve tekrar dene
      if (updateError.code === 'P2002') {
        // Önce mevcut token'ı null yap
        try {
          await prisma.admin.update({
            where: { id: admin.id },
            data: {
              resetToken: null,
              resetTokenExpiry: null,
            },
          });
        } catch (clearError: any) {
          console.warn("Could not clear existing token:", clearError?.message);
        }
        
        // Yeni token oluştur
        const newTimestamp = Date.now().toString(36);
        const newRandomPart = Math.random().toString(36).substring(2, 15);
        resetToken = `${newTimestamp}-${newRandomPart}-${generateResetToken().substring(0, 32)}`;
        
        // Yeni token ile tekrar dene
        await prisma.admin.update({
          where: { id: admin.id },
          data: {
            resetToken,
            resetTokenExpiry,
          },
        });
      } else if (updateError.code === 'P2025' || updateError.message?.includes('Record to update not found')) {
        // Admin bulunamadı hatası
        throw new Error("Admin kaydı bulunamadı");
      } else if (updateError.message?.includes('Unknown argument') || updateError.message?.includes('resetToken')) {
        // Veritabanında alan yok hatası
        console.error("Database schema mismatch: resetToken field may not exist");
        throw new Error("Veritabanı şeması güncel değil. Lütfen Vercel dashboard'dan 'prisma db push' komutunu çalıştırın.");
      } else {
        // Diğer hatalar için detaylı log ve throw
        console.error("Unexpected Prisma error:", {
          code: updateError.code,
          message: updateError.message,
          meta: updateError.meta,
        });
        throw updateError;
      }
    }

    // Production'da burada email gönderilir
    // Şimdilik token'ı response'da döndürüyoruz (güvenlik için sadece development'ta)
    const baseUrl = process.env.NEXTAUTH_URL || (process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000');
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
