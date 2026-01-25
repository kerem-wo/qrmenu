import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Benzersiz sipariş numarası oluştur
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const orderTypeRaw = String(data.orderType || "restaurant").trim().toLowerCase();
    const orderType = orderTypeRaw === "takeaway" || orderTypeRaw === "restaurant" ? orderTypeRaw : "restaurant";

    // Validate required fields
    if (!data.restaurantId || !data.items || data.items.length === 0) {
      return NextResponse.json(
        { error: "Restoran ID ve ürünler gereklidir" },
        { status: 400 }
      );
    }

    // Restaurant settings check (enableTakeaway)
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: data.restaurantId },
      select: { enableTakeaway: true },
    });
    if (!restaurant) {
      return NextResponse.json(
        { error: "Restoran bulunamadı" },
        { status: 404 }
      );
    }
    if (orderType === "takeaway" && !restaurant.enableTakeaway) {
      return NextResponse.json(
        { error: "Gel Al seçeneği şu anda kapalı" },
        { status: 400 }
      );
    }

    // Stok kontrolü
    for (const item of data.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product || !product.isAvailable) {
        return NextResponse.json(
          { error: `${product?.name || "Ürün"} mevcut değil` },
          { status: 400 }
        );
      }

      if (product.stock !== null && product.stock < item.quantity) {
        return NextResponse.json(
          { error: `${product.name} için yeterli stok yok (Stok: ${product.stock})` },
          { status: 400 }
        );
      }
    }

    // Calculate total
    let total = data.items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    // Kupon kontrolü
    let discount = 0;
    if (data.couponCode) {
      const campaign = await prisma.campaign.findUnique({
        where: { code: data.couponCode },
      });

      if (campaign && campaign.isActive && 
          new Date() >= campaign.startDate && 
          new Date() <= campaign.endDate &&
          (!campaign.usageLimit || campaign.usedCount < campaign.usageLimit) &&
          (!campaign.minAmount || total >= campaign.minAmount)) {
        
        if (campaign.type === "percentage") {
          discount = (total * campaign.value) / 100;
          if (campaign.maxDiscount) {
            discount = Math.min(discount, campaign.maxDiscount);
          }
        } else {
          discount = campaign.value;
        }
        total = Math.max(0, total - discount);
      }
    }

    // Sipariş oluşturma (stok rezervasyonu admin onayında yapılır)
    const order = await prisma.$transaction(async (tx) => {
      // Kupon kullanım sayısını artır
      if (data.couponCode) {
        await tx.campaign.updateMany({
          where: { code: data.couponCode },
          data: { usedCount: { increment: 1 } },
        });
      }

      // Sipariş oluştur
      return await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          restaurantId: data.restaurantId,
          orderType,
          tableNumber: orderType === "takeaway" ? null : (data.tableNumber || null),
          customerName: data.customerName || null,
          customerPhone: data.customerPhone || null,
          customerId: data.customerId || null,
          status: "pending",
          total: total,
          discount: discount,
          couponCode: data.couponCode || null,
          paymentStatus: data.paymentStatus || "pending",
          paymentMethod: data.paymentMethod || null,
          items: {
            create: data.items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              notes: item.notes || null,
            })),
          },
        },
        include: {
          restaurant: { select: { id: true } },
          items: {
            include: {
              product: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });
    });

    return NextResponse.json({ 
      ...order,
      orderNumber: order.orderNumber 
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: error.message || "Sipariş oluşturulurken bir hata oluştu" },
      { status: 500 }
    );
  }
}
