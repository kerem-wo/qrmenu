import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const url = new URL(request.url);
    const requestedLang = (url.searchParams.get("lang") || "").trim().toLowerCase() || "";
    const requestedTheme = (url.searchParams.get("theme") || "").trim().toLowerCase() || "";
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        description: true,
        logo: true,
        language: true,
        enableTakeaway: true,
        theme: true,
      },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restoran bulunamadı" },
        { status: 404 }
      );
    }

    const lang = requestedLang || restaurant.language || "tr";

    const restaurantTranslation = await prisma.restaurantTranslation.findFirst({
      where: { restaurantId: restaurant.id, language: lang },
      select: { name: true, description: true },
    });

    const categories = await prisma.category.findMany({
      where: {
        restaurantId: restaurant.id,
      },
      include: {
        translations: {
          where: { language: lang },
          select: { name: true, description: true },
        },
        products: {
          where: {
            isAvailable: true,
          },
          include: {
            translations: {
              where: { language: lang },
              select: { name: true, description: true },
            },
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

    const resolvedRestaurant = {
      id: restaurant.id,
      name: restaurantTranslation?.name || restaurant.name,
      description: restaurantTranslation?.description ?? restaurant.description,
      logo: restaurant.logo,
      enableTakeaway: restaurant.enableTakeaway,
      theme: requestedTheme || restaurant.theme || "default",
    };

    const resolvedCategories = categories.map((c) => {
      const cName = c.translations?.[0]?.name || c.name;
      const cDesc = c.translations?.[0]?.description ?? c.description;
      const products = (c.products ?? []).map((p) => ({
        ...p,
        name: p.translations?.[0]?.name || p.name,
        description: p.translations?.[0]?.description ?? p.description,
        translations: undefined,
      }));
      return {
        ...c,
        name: cName,
        description: cDesc,
        products,
        translations: undefined,
      };
    });

    return NextResponse.json({
      restaurant: resolvedRestaurant,
      categories: resolvedCategories,
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
