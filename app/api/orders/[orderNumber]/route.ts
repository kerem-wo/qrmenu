import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;
    const url = new URL(request.url);
    const requestedLang = (url.searchParams.get("lang") || "").trim().toLowerCase() || "";

    if (!orderNumber) {
      return NextResponse.json(
        { error: "Sipariş numarası gerekli" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        restaurant: {
          select: {
            language: true,
            slug: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                prepMinMinutes: true,
                prepMaxMinutes: true,
                translations: {
                  where: {
                    language: requestedLang || "tr",
                  },
                  select: {
                    name: true,
                  },
                },
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

    const lang = requestedLang || order.restaurant?.language || "tr";

    // If requested lang wasn't provided, reload translations using restaurant default language
    if (!requestedLang && lang !== "tr") {
      const reloaded = await prisma.order.findUnique({
        where: { orderNumber },
        include: {
          restaurant: { select: { language: true } },
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  prepMinMinutes: true,
                  prepMaxMinutes: true,
                  translations: {
                    where: { language: lang },
                    select: { name: true },
                  },
                },
              },
            },
          },
        },
      });
      if (reloaded) {
        (order as any).items = reloaded.items;
      }
    }

    const activeStatuses: Array<string> = ["pending", "confirmed", "preparing"];
    const aheadOrders = await prisma.order.findMany({
      where: {
        restaurantId: order.restaurantId,
        createdAt: { lt: order.createdAt },
        status: { in: activeStatuses },
      },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        items: {
          select: {
            quantity: true,
            product: {
              select: {
                prepMinMinutes: true,
                prepMaxMinutes: true,
              },
            },
          },
        },
      },
    });

    const currentMin = order.items.reduce(
      (sum, it) => sum + (it.product.prepMinMinutes ?? 5) * it.quantity,
      0
    );
    const currentMax = order.items.reduce(
      (sum, it) => sum + (it.product.prepMaxMinutes ?? 10) * it.quantity,
      0
    );

    const aheadMin = aheadOrders.reduce((sum, o) => {
      const m = o.items.reduce((s, it) => s + (it.product.prepMinMinutes ?? 5) * it.quantity, 0);
      return sum + m;
    }, 0);
    const aheadMax = aheadOrders.reduce((sum, o) => {
      const m = o.items.reduce((s, it) => s + (it.product.prepMaxMinutes ?? 10) * it.quantity, 0);
      return sum + m;
    }, 0);

    const etaMinMinutes = aheadMin + currentMin;
    const etaMaxMinutes = aheadMax + currentMax;

    const resolvedItems = order.items.map((it) => ({
      ...it,
      product: {
        name: it.product.translations?.[0]?.name || it.product.name,
      },
    }));

    return NextResponse.json({
      ...order,
      items: resolvedItems,
      queue: {
        ahead: aheadOrders.length,
        etaMinMinutes,
        etaMaxMinutes,
        breakdown: {
          aheadMinMinutes: aheadMin,
          aheadMaxMinutes: aheadMax,
          currentMinMinutes: currentMin,
          currentMaxMinutes: currentMax,
        },
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
