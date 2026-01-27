import { NextResponse } from "next/server";
import Iyzipay from "iyzipay";
import { prisma } from "@/lib/prisma";

// İyzico yapılandırması
const getIyzipayConfig = () => {
  const apiKey = process.env.IYZICO_API_KEY;
  const secretKey = process.env.IYZICO_SECRET_KEY;

  if (!apiKey || !secretKey) {
    throw new Error("İyzico API anahtarları yapılandırılmamış");
  }

  return {
    apiKey,
    secretKey,
    uri: process.env.NODE_ENV === "production" 
      ? "https://api.iyzipay.com" 
      : "https://sandbox-api.iyzipay.com",
  };
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const token = formData.get("token") as string;

    if (!token) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/order/error?message=Ödeme token bulunamadı`
      );
    }

    // İyzico yapılandırması
    const config = getIyzipayConfig();
    const iyzipay = new Iyzipay(config);

    // Checkout form result'ı al
    return new Promise((resolve) => {
      iyzipay.checkoutForm.retrieve(
        {
          token: token,
        },
        async (err: any, result: any) => {
          if (err) {
            console.error("İyzico callback error:", err);
            return resolve(
              NextResponse.redirect(
                `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/order/error?message=${encodeURIComponent(err.message || "Ödeme işlemi başarısız")}`
              )
            );
          }

          if (result.status === "failure") {
            console.error("İyzico callback failure:", result.errorMessage);
            
            // Payment kaydını bul ve failed olarak güncelle
            const conversationId = result.conversationId;
            if (conversationId) {
              try {
                const payment = await prisma.payment.findFirst({
                  where: { iyzicoConversationId: conversationId },
                });
                
                if (payment) {
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
                }
              } catch (updateError) {
                console.error("Payment update error:", updateError);
              }
            }

            return resolve(
              NextResponse.redirect(
                `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/order/error?message=${encodeURIComponent(result.errorMessage || "Ödeme işlemi başarısız")}`
              )
            );
          }

          // Ödeme başarılı
          const conversationId = result.conversationId;
          const basketId = result.basketId;
          const paymentId = result.paymentId;

          if (!conversationId) {
            return resolve(
              NextResponse.redirect(
                `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/order/error?message=Ödeme bilgisi bulunamadı`
              )
            );
          }

          try {
            // Payment kaydını bul (conversationId ile)
            const payment = await prisma.payment.findFirst({
              where: { iyzicoConversationId: conversationId },
              include: {
                order: true,
                restaurant: true,
                packageTheme: true,
              },
            });

            if (!payment) {
              return resolve(
                NextResponse.redirect(
                  `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/order/error?message=Ödeme kaydı bulunamadı`
                )
              );
            }

            // Payment durumunu güncelle
            await prisma.payment.update({
              where: { id: payment.id },
              data: {
                status: "paid",
                paymentMethod: "online",
                iyzicoPaymentId: paymentId,
              },
            });

            // Ödeme tipine göre işlem yap
            if (payment.type === "order" && payment.orderId) {
              // Sipariş ödemesi
              await prisma.order.update({
                where: { id: payment.orderId },
                data: {
                  paymentStatus: "paid",
                  paymentMethod: "online",
                },
              });

              // Başarılı ödeme sayfasına yönlendir
              resolve(
                NextResponse.redirect(
                  `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/order/${payment.order?.orderNumber}?payment=success`
                )
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

              // Başarılı ödeme sayfasına yönlendir
              resolve(
                NextResponse.redirect(
                  `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/restaurant/register/success?payment=success&restaurantId=${payment.restaurantId}`
                )
              );
            } else {
              // Bilinmeyen ödeme tipi
              resolve(
                NextResponse.redirect(
                  `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/order/error?message=Geçersiz ödeme tipi`
                )
              );
            }
          } catch (updateError: any) {
            console.error("Payment update error:", updateError);
            resolve(
              NextResponse.redirect(
                `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/order/error?message=${encodeURIComponent(updateError.message || "Ödeme güncellenirken bir hata oluştu")}`
              )
            );
          }
        }
      );
    });
  } catch (error: any) {
    console.error("Callback error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/order/error?message=${encodeURIComponent(error.message || "Bir hata oluştu")}`
    );
  }
}

// GET request için de destek (iyzico bazen GET ile de gönderebilir)
export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/order/error?message=Ödeme token bulunamadı`
    );
  }

  // POST handler'ı çağır
  const formData = new FormData();
  formData.append("token", token);
  
  const mockRequest = new Request(request.url, {
    method: "POST",
    body: formData,
  });

  return POST(mockRequest);
}
