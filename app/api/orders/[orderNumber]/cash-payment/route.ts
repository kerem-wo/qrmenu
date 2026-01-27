import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;

    if (!orderNumber) {
      return NextResponse.json(
        { error: "Sipariş numarası gerekli" },
        { status: 400 }
      );
    }

    // Siparişi bul ve güncelle
    const order = await prisma.order.update({
      where: { orderNumber },
      data: {
        paymentStatus: "paid",
        paymentMethod: "cash",
      },
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
      },
    });
  } catch (error) {
    console.error("Error updating cash payment:", error);
    return NextResponse.json(
      { error: "Ödeme durumu güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
