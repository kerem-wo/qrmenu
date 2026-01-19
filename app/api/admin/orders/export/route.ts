import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "json";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: any = {
      restaurantId: session.restaurantId,
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
            variants: {
              include: {
                variant: {
                  select: {
                    name: true,
                    price: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (format === "csv") {
      // CSV formatında export
      const csvHeaders = [
        "Sipariş No",
        "Tarih",
        "Masa",
        "Müşteri",
        "Telefon",
        "Durum",
        "Toplam",
        "Ürünler",
      ];

      const csvRows = orders.map((order) => {
        const items = order.items
          .map(
            (item) =>
              `${item.product.name} x${item.quantity}${item.variants.length > 0 ? ` (${item.variants.map((v) => v.variant.name).join(", ")})` : ""}`
          )
          .join("; ");

        return [
          order.orderNumber,
          new Date(order.createdAt).toLocaleString("tr-TR"),
          order.tableNumber || "-",
          order.customerName || "-",
          order.customerPhone || "-",
          order.status,
          order.total.toFixed(2),
          items,
        ];
      });

      const csvContent = [
        csvHeaders.join(","),
        ...csvRows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="siparisler-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    // JSON formatında export
    return NextResponse.json({
      orders,
      total: orders.length,
      totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
      exportedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error exporting orders:", error);
    return NextResponse.json(
      { error: "Siparişler export edilirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
