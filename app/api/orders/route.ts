import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.restaurantId || !data.items || data.items.length === 0) {
      return NextResponse.json(
        { error: "Restoran ID ve ürünler gereklidir" },
        { status: 400 }
      );
    }

    // Calculate total
    const total = data.items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    // Create order
    const order = await prisma.order.create({
      data: {
        restaurantId: data.restaurantId,
        tableNumber: data.tableNumber || null,
        customerName: data.customerName || null,
        customerPhone: data.customerPhone || null,
        status: "pending",
        total: total,
        items: {
          create: data.items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
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

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Sipariş oluşturulurken bir hata oluştu" },
      { status: 500 }
    );
  }
}
