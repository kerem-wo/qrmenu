import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPayTRConfig, getPayTRToken, createUserBasket } from "@/lib/paytr";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { orderId, orderNumber, amount, customerName, customerPhone, customerEmail } = await request.json();

    // Validasyon
    if (!orderId || !orderNumber || !amount || !customerName) {
      return NextResponse.json(
        { error: "Eksik bilgi: orderId, orderNumber, amount ve customerName gereklidir" },
        { status: 400 }
      );
    }

    // Siparişi kontrol et
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Sipariş bulunamadı" },
        { status: 404 }
      );
    }

    if (order.paymentStatus === "paid") {
      return NextResponse.json(
        { error: "Bu sipariş zaten ödenmiş" },
        { status: 400 }
      );
    }

    // PayTR yapılandırması
    const config = getPayTRConfig(); // Localhost'ta null dönebilir (mock mode)

    // Müşteri IP adresini al
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : "127.0.0.1";

    // Merchant OID oluştur (unique order ID)
    const merchantOid = `order_${orderId}_${Date.now()}`;

    // Basket items oluştur
    const basketItems = order.items.map((item) => ({
      name: item.product.name,
      price: item.price * item.quantity,
      quantity: item.quantity,
    }));

    // İndirim varsa basket'e ekle
    if (order.discount > 0) {
      basketItems.push({
        name: "İndirim",
        price: -order.discount,
        quantity: 1,
      });
    }

    const userBasket = createUserBasket(basketItems);

    // Ödeme kaydı oluştur
    const payment = await prisma.payment.create({
      data: {
        type: "order",
        amount: order.total,
        currency: "TRY",
        status: "pending",
        orderId: orderId,
        customerName: customerName,
        customerEmail: customerEmail || null,
        customerPhone: customerPhone || null,
        paytrMerchantOid: merchantOid,
        metadata: {
          orderNumber: orderNumber,
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
            orderNumber: orderNumber,
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
        email: customerEmail || `${orderId}@temp.com`,
        payment_amount: order.total,
        payment_type: "normal",
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
