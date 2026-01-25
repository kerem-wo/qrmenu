import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        description: true,
        logo: true,
      },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restoran bulunamadı" },
        { status: 404 }
      );
    }

    const categories = await prisma.category.findMany({
      where: {
        restaurantId: restaurant.id,
      },
      include: {
        products: {
          where: {
            isAvailable: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        order: "asc",
      },
    });

    const now = new Date();
    const rawCampaigns = await prisma.campaign.findMany({
      where: {
        restaurantId: restaurant.id,
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      select: {
        id: true,
        name: true,
        code: true,
        type: true,
        value: true,
        minAmount: true,
        maxDiscount: true,
        endDate: true,
        usageLimit: true,
        usedCount: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const campaigns = rawCampaigns
      .filter((c) => c.usageLimit === null || c.usedCount < c.usageLimit)
      .slice(0, 10)
      .map(({ usageLimit, usedCount, ...rest }) => rest);

    return NextResponse.json({
      restaurant,
      categories,
      campaigns,
    });
  } catch (error) {
    console.error("Error fetching menu:", error);
    return NextResponse.json(
      { error: "Menü yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
