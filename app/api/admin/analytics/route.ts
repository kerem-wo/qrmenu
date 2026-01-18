import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "7"; // days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Toplam siparişler
    const totalOrders = await prisma.order.count({
      where: {
        restaurantId: session.restaurantId,
        createdAt: { gte: startDate },
      },
    });

    // Toplam gelir
    const revenueData = await prisma.order.aggregate({
      where: {
        restaurantId: session.restaurantId,
        createdAt: { gte: startDate },
        status: { not: "cancelled" },
      },
      _sum: { total: true },
    });
    const totalRevenue = revenueData._sum.total || 0;

    // Ortalama sipariş değeri
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Durum bazlı siparişler
    const ordersByStatus = await prisma.order.groupBy({
      by: ["status"],
      where: {
        restaurantId: session.restaurantId,
        createdAt: { gte: startDate },
      },
      _count: true,
    });

    // En çok satan ürünler
    const topProducts = await prisma.orderItem.groupBy({
      by: ["productId"],
      where: {
        order: {
          restaurantId: session.restaurantId,
          createdAt: { gte: startDate },
        },
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 10,
    });

    const topProductsWithNames = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true },
        });
        return {
          productId: item.productId,
          productName: product?.name || "Bilinmeyen",
          totalQuantity: item._sum.quantity || 0,
        };
      })
    );

    // Günlük gelir trendi
    const dailyRevenue = await prisma.$queryRaw<Array<{ date: string; revenue: number }>>`
      SELECT 
        DATE(created_at) as date,
        SUM(total) as revenue
      FROM "Order"
      WHERE restaurant_id = ${session.restaurantId}
        AND created_at >= ${startDate}
        AND status != 'cancelled'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    return NextResponse.json({
      totalOrders,
      totalRevenue,
      avgOrderValue,
      ordersByStatus,
      topProducts: topProductsWithNames,
      dailyRevenue,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Analitik veriler yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
