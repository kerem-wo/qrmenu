import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
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

    const order = await prisma.order.findUnique({
      where: { orderNumber },
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

    if (!order) {
      return NextResponse.json(
        { error: "Sipariş bulunamadı" },
        { status: 404 }
      );
    }

    // Queue / ETA (simple heuristic)
    // Coffee average preparation: 5–10 minutes per order.
    const avgPrepMinMinutes = 5;
    const avgPrepMaxMinutes = 10;

    const activeStatuses: Array<string> = ["pending", "confirmed", "preparing"];
    const queueAhead = await prisma.order.count({
      where: {
        restaurantId: order.restaurantId,
        createdAt: { lt: order.createdAt },
        status: { in: activeStatuses },
      },
    });

    const etaMinMinutes = (queueAhead + 1) * avgPrepMinMinutes;
    const etaMaxMinutes = (queueAhead + 1) * avgPrepMaxMinutes;

    return NextResponse.json({
      ...order,
      queue: {
        ahead: queueAhead,
        avgPrepMinMinutes,
        avgPrepMaxMinutes,
        etaMinMinutes,
        etaMaxMinutes,
      },
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}
