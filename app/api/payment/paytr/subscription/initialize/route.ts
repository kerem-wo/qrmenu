import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPayTRConfig, getPayTRToken, createUserBasket } from "@/lib/paytr";

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

    // PayTR yapılandırması
    const config = getPayTRConfig(); // Localhost'ta null dönebilir (mock mode)

    // Müşteri IP adresini al
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : "127.0.0.1";

    // Merchant OID oluştur (unique order ID)
    const merchantOid = `sub_${restaurantId}_${Date.now()}`;

    // Basket items oluştur
    const basketItems = [
      {
        name: `${theme.displayName} - ${packageType === "monthly" ? "Aylık" : "Yıllık"} Paket`,
        price: amount,
        quantity: 1,
      },
    ];

    const userBasket = createUserBasket(basketItems);

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
        paytrMerchantOid: merchantOid,
        metadata: {
          themeName: theme.name,
          themeDisplayName: theme.displayName,
          packageType: packageType,
        },
      },
    });

    // MOCK MODE: Localhost'ta API bilgileri yoksa mock token döndür
    if (!config) {
      const mockToken = `mock_token_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      // Payment kaydını mock token ile güncelle
      await prisma.payment.update({
        where: { id: payment.id },
        data: { 
          paytrToken: mockToken,
          metadata: {
            ...(payment.metadata as object || {}),
            mockMode: true,
            themeName: theme.name,
            themeDisplayName: theme.displayName,
            packageType: packageType,
          },
        },
      });

      return NextResponse.json({
        paymentId: payment.id,
        token: mockToken,
        iframeUrl: "mock", // Frontend'de mock iframe gösterecek
        mockMode: true,
        message: "Mock mode aktif - PayTR API bilgileri yapılandırılmamış (localhost)",
      });
    }

    try {
      // PayTR token al
      const tokenResult = await getPayTRToken({
        merchant_id: config.merchantId,
        merchant_key: config.merchantKey,
        merchant_salt: config.merchantSalt,
        email: customerEmail || `${restaurantId}@restaurant.com`,
        payment_amount: amount,
        payment_type: "subscription",
        currency: "TL",
        merchant_oid: merchantOid,
        test_mode: config.testMode ? 1 : 0,
        no_installment: 0,
        max_installment: 9,
        user_name: customerName,
        user_address: "Test Adres",
        user_phone: customerPhone || "5550000000",
        user_basket: userBasket,
        user_ip: ip,
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/payment/paytr/callback`,
        fail_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/order/error?message=Ödeme başarısız`,
      });

      // Payment kaydını token ile güncelle
      await prisma.payment.update({
        where: { id: payment.id },
        data: { paytrToken: tokenResult.token },
      });

      return NextResponse.json({
        paymentId: payment.id,
        token: tokenResult.token,
        iframeUrl: "https://www.paytr.com/odeme/guvenli",
      });
    } catch (error: any) {
      console.error("PayTR token error:", error);
      
      // Payment kaydını failed olarak güncelle
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "failed" },
      }).catch(console.error);

      return NextResponse.json(
        { error: error.message || "Ödeme başlatılamadı" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Payment initialize error:", error);
    return NextResponse.json(
      { error: error.message || "Ödeme başlatılamadı" },
      { status: 500 }
    );
  }
}
