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
    const { restaurantId, themeId, packageType, customerName, customerPhone, customerEmail } = await request.json();

    // Validasyon
    if (!restaurantId || !themeId || !packageType || !customerName) {
      return NextResponse.json(
        { error: "Eksik bilgi: restaurantId, themeId, packageType ve customerName gereklidir" },
        { status: 400 }
      );
    }

    if (packageType !== "monthly" && packageType !== "yearly") {
      return NextResponse.json(
        { error: "Geçersiz paket tipi. 'monthly' veya 'yearly' olmalıdır" },
        { status: 400 }
      );
    }

    // Restaurant kontrolü
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restoran bulunamadı" },
        { status: 404 }
      );
    }

    // Tema kontrolü
    const theme = await prisma.theme.findUnique({
      where: { id: themeId },
    });

    if (!theme || !theme.isActive) {
      return NextResponse.json(
        { error: "Geçersiz veya aktif olmayan tema" },
        { status: 400 }
      );
    }

    // Fiyat hesaplama
    let amount = 0;
    if (packageType === "monthly") {
      amount = theme.monthlyPrice;
    } else {
      amount = theme.yearlyPrice;
      // Yıllık indirim uygula
      if (theme.yearlyDiscount > 0) {
        amount = theme.yearlyPrice * (1 - theme.yearlyDiscount / 100);
      }
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Geçersiz fiyat" },
        { status: 400 }
      );
    }

    // İyzico yapılandırması
    const config = getIyzipayConfig();
    const iyzipay = new Iyzipay(config);

    // Müşteri IP adresini al
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : "127.0.0.1";

    // Conversation ID oluştur (restaurantId + timestamp)
    const conversationId = `sub_${restaurantId}_${Date.now()}`;

    // İyzico checkout form initialize request
    const request = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: conversationId,
      price: amount.toFixed(2),
      paidPrice: amount.toFixed(2),
      currency: Iyzipay.CURRENCY.TRY,
      basketId: `subscription_${restaurantId}`,
      paymentGroup: Iyzipay.PAYMENT_GROUP.SUBSCRIPTION,
      callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/payment/iyzico/callback`,
      enabledInstallments: [2, 3, 6, 9],
      buyer: {
        id: restaurantId,
        name: customerName.split(" ")[0] || customerName,
        surname: customerName.split(" ").slice(1).join(" ") || customerName,
        gsmNumber: customerPhone || "5550000000",
        email: customerEmail || `${restaurantId}@restaurant.com`,
        identityNumber: "11111111111", // Test için, production'da gerçek TC kimlik no gerekir
        registrationAddress: "Test Adres",
        ip: ip,
        city: "Istanbul",
        country: "Turkey",
        zipCode: "34000",
      },
      shippingAddress: {
        contactName: customerName,
        city: "Istanbul",
        country: "Turkey",
        address: "Test Adres",
        zipCode: "34000",
      },
      billingAddress: {
        contactName: customerName,
        city: "Istanbul",
        country: "Turkey",
        address: "Test Adres",
        zipCode: "34000",
      },
      basketItems: [
        {
          id: themeId,
          name: `${theme.displayName} - ${packageType === "monthly" ? "Aylık" : "Yıllık"} Paket`,
          category1: "Abonelik",
          itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
          price: amount.toFixed(2),
        },
      ],
    };

    // Ödeme kaydı oluştur
    const payment = await prisma.payment.create({
      data: {
        type: "subscription",
        amount: amount,
        currency: "TRY",
        status: "pending",
        restaurantId: restaurantId,
        packageType: packageType,
        packageThemeId: themeId,
        customerName: customerName,
        customerEmail: customerEmail || null,
        customerPhone: customerPhone || null,
        iyzicoConversationId: conversationId,
        metadata: {
          themeName: theme.name,
          themeDisplayName: theme.displayName,
          packageType: packageType,
        },
      },
    });

    // Promise wrapper for callback-based iyzipay
    return new Promise((resolve, reject) => {
      iyzipay.checkoutFormInitialize.create(request, (err: any, result: any) => {
        if (err) {
          console.error("İyzico initialize error:", err);
          // Payment kaydını failed olarak güncelle
          prisma.payment.update({
            where: { id: payment.id },
            data: { status: "failed" },
          }).catch(console.error);
          
          return resolve(
            NextResponse.json(
              { error: err.message || "Ödeme başlatılamadı" },
              { status: 400 }
            )
          );
        }

        if (result.status === "failure") {
          console.error("İyzico initialize failure:", result.errorMessage);
          // Payment kaydını failed olarak güncelle
          prisma.payment.update({
            where: { id: payment.id },
            data: { status: "failed" },
          }).catch(console.error);
          
          return resolve(
            NextResponse.json(
              { error: result.errorMessage || "Ödeme başlatılamadı" },
              { status: 400 }
            )
          );
        }

        // Payment kaydını token ile güncelle
        prisma.payment.update({
          where: { id: payment.id },
          data: { iyzicoToken: result.token },
        }).catch(console.error);

        resolve(
          NextResponse.json({
            paymentId: payment.id,
            checkoutFormContent: result.checkoutFormContent,
            paymentPageUrl: result.paymentPageUrl,
            token: result.token,
          })
        );
      });
    });
  } catch (error: any) {
    console.error("Payment initialize error:", error);
    return NextResponse.json(
      { error: error.message || "Ödeme başlatılamadı" },
      { status: 500 }
    );
  }
}
