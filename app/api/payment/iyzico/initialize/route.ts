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

    // İyzico yapılandırması
    const config = getIyzipayConfig();
    const iyzipay = new Iyzipay(config);

    // Müşteri IP adresini al
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : "127.0.0.1";

    // Basket items oluştur
    const basketItems = order.items.map((item) => ({
      id: item.productId,
      name: item.product.name,
      category1: "Sipariş",
      itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
      price: (item.price * item.quantity).toFixed(2),
    }));

    // İndirim varsa basket'e ekle
    if (order.discount > 0) {
      basketItems.push({
        id: "discount",
        name: "İndirim",
        category1: "İndirim",
        itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
        price: (-order.discount).toFixed(2),
      });
    }

    // Conversation ID oluştur (orderId + timestamp)
    const conversationId = `order_${orderId}_${Date.now()}`;

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
        iyzicoConversationId: conversationId,
        metadata: {
          orderNumber: orderNumber,
        },
      },
    });

    // İyzico checkout form initialize request
    const request = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: conversationId,
      price: order.total.toFixed(2),
      paidPrice: order.total.toFixed(2),
      currency: Iyzipay.CURRENCY.TRY,
      basketId: orderNumber,
      paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
      callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/payment/iyzico/callback`,
      enabledInstallments: [2, 3, 6, 9],
      buyer: {
        id: order.customerId || orderId,
        name: customerName.split(" ")[0] || customerName,
        surname: customerName.split(" ").slice(1).join(" ") || customerName,
        gsmNumber: customerPhone || "5550000000",
        email: customerEmail || `${orderId}@temp.com`,
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
      basketItems,
    };

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
