import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPayTRCallback, PayTRCallbackData } from "@/lib/paytr";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    // PayTR callback data
    const callbackData: PayTRCallbackData = {
      merchant_oid: formData.get("merchant_oid") as string,
      status: formData.get("status") as "success" | "failed",
      total_amount: formData.get("total_amount") as string,
      hash: formData.get("hash") as string,
      failed_reason_code: formData.get("failed_reason_code") as string | undefined,
      failed_reason_msg: formData.get("failed_reason_msg") as string | undefined,
      test_mode: formData.get("test_mode") as string | undefined,
      payment_type: formData.get("payment_type") as string | undefined,
      currency: formData.get("currency") as string | undefined,
    };

    if (!callbackData.merchant_oid || !callbackData.hash) {
      return NextResponse.json(
        { error: "Geçersiz callback verisi" },
        { status: 400 }
      );
    }

    // Hash doğrulama (mock mode için atla)
    const isMockMode = callbackData.hash?.startsWith("mock_hash_");
    if (!isMockMode && !verifyPayTRCallback(callbackData)) {
      console.error("PayTR callback hash verification failed");
      return NextResponse.json(
        { error: "Hash doğrulama başarısız" },
        { status: 400 }
      );
    }

    // Payment kaydını bul (mock mode için farklı arama)
    let payment;
    if (isMockMode) {
      // Mock mode: merchant_oid formatı farklı olabilir, en son pending payment'i bul
      // merchant_oid formatı: "order_{orderId}_..." veya "sub_{restaurantId}_..."
      const merchantOidParts = callbackData.merchant_oid.split("_");
      const searchId = merchantOidParts.length > 1 ? merchantOidParts[1] : null;
      
      // Mock mode: Önce merchant_oid ile dene, sonra fallback
      payment = await prisma.payment.findFirst({
        where: { 
          paytrMerchantOid: callbackData.merchant_oid,
          status: "pending",
        },
        include: {
          order: {
            include: {
              restaurant: {
                select: {
                  slug: true,
                },
              },
            },
          },
          restaurant: true,
          packageTheme: true,
        },
      });

      // Eğer bulunamazsa, merchant_oid'in başlangıcına göre ara
      if (!payment) {
        if (merchantOidParts[0] === "order" && searchId) {
          // Sipariş ödemesi için orderId ile ara
          payment = await prisma.payment.findFirst({
            where: { 
              status: "pending",
              orderId: searchId,
              paytrToken: { contains: "mock_token" },
            },
            include: {
              order: {
                include: {
                  restaurant: {
                    select: {
                      slug: true,
                    },
                  },
                },
              },
              restaurant: true,
              packageTheme: true,
            },
            orderBy: { createdAt: "desc" },
          });
        } else if (merchantOidParts[0] === "sub" && searchId) {
          // Bayilik ödemesi için restaurantId ile ara
          payment = await prisma.payment.findFirst({
            where: { 
              status: "pending",
              restaurantId: searchId,
              paytrToken: { contains: "mock_token" },
            },
            include: {
              order: {
                include: {
                  restaurant: {
                    select: {
                      slug: true,
                    },
                  },
                },
              },
              restaurant: true,
              packageTheme: true,
            },
            orderBy: { createdAt: "desc" },
          });
        }
      }
    } else {
      payment = await prisma.payment.findFirst({
        where: { paytrMerchantOid: callbackData.merchant_oid },
        include: {
          order: {
            include: {
              restaurant: {
                select: {
                  slug: true,
                },
              },
            },
          },
          restaurant: true,
          packageTheme: true,
        },
      });
    }

    if (!payment) {
      console.error("Payment not found for merchant_oid:", callbackData.merchant_oid);
      return NextResponse.json(
        { error: "Ödeme kaydı bulunamadı" },
        { status: 404 }
      );
    }

    // PayTR callback'te status kontrolü (case-insensitive)
    const statusLower = callbackData.status?.toLowerCase();
    const isSuccess = statusLower === "success";
    
    // Ödeme durumuna göre işlem yap
    if (isSuccess) {
      // Ödeme başarılı
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "paid",
          paymentMethod: "online",
          paytrPaymentId: callbackData.merchant_oid, // PayTR'de merchant_oid payment ID olarak kullanılabilir
        },
      });

      // Ödeme tipine göre işlem yap
      if (payment.type === "order" && payment.orderId) {
        // Sipariş ödemesi
        const updatedOrder = await prisma.order.update({
          where: { id: payment.orderId },
          data: {
            paymentStatus: "paid",
            paymentMethod: "online",
          },
        });

        // Sipariş takip sayfasına yönlendir
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/order/${updatedOrder.orderNumber}?payment=success`
        );
      } else if (payment.type === "subscription" && payment.restaurantId) {
        // Bayilik ödemesi
        const startDate = new Date();
        const endDate = new Date();
        
        if (payment.packageType === "monthly") {
          endDate.setMonth(endDate.getMonth() + 1);
        } else {
          endDate.setFullYear(endDate.getFullYear() + 1);
        }

        await prisma.restaurant.update({
          where: { id: payment.restaurantId },
          data: {
            packageType: payment.packageType,
            packageThemeId: payment.packageThemeId,
            packageStartDate: startDate,
            packageEndDate: endDate,
            packageStatus: "active",
            theme: payment.packageTheme?.name || "default",
            status: "approved", // Ödeme yapıldığı için otomatik onay
          },
        });

        // Admin login sayfasına yönlendir
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/admin/login?payment=success&restaurantId=${payment.restaurantId}`
        );
      } else {
        // Bilinmeyen ödeme tipi
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/order/error?message=Geçersiz ödeme tipi`
        );
      }
    } else {
      // Ödeme başarısız
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "failed" },
      });

      // Eğer sipariş ödemesi ise order'ı da güncelle
      if (payment.type === "order" && payment.orderId) {
        await prisma.order.update({
          where: { id: payment.orderId },
          data: { paymentStatus: "failed" },
        });
      }

      const errorMessage = callbackData.failed_reason_msg || "Ödeme işlemi başarısız";
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/order/error?message=${encodeURIComponent(errorMessage)}`
      );
    }
  } catch (error: any) {
    console.error("PayTR callback error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/order/error?message=${encodeURIComponent(error.message || "Bir hata oluştu")}`
    );
  }
}
