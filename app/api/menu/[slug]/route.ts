import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const url = new URL(request.url);
    const requestedLang = (url.searchParams.get("lang") || "").trim().toLowerCase() || "";
    const requestedTheme = (url.searchParams.get("theme") || "").trim().toLowerCase() || "";
    
    console.log(`[Menu API] Fetching menu for slug: ${slug}, lang: ${requestedLang}`);
    
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
      console.log(`[Menu API] Restaurant not found for slug: ${slug}`);
      return NextResponse.json(
        { error: "Restoran bulunamadı" },
        { status: 404 }
      );
    }

    console.log(`[Menu API] Restaurant found: ${restaurant.id} (${restaurant.name})`);

    const lang = requestedLang || restaurant.language || "tr";

    const restaurantTranslation = await prisma.restaurantTranslation.findFirst({
      where: { restaurantId: restaurant.id, language: lang },
      select: { name: true, description: true },
    });

    console.log(`[Menu API] Fetching categories for restaurant: ${restaurant.id}`);
    const categories = await prisma.category.findMany({
      where: {
        restaurantId: restaurant.id,
        isAvailable: true, // Only show available categories
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

    console.log(`[Menu API] Found ${categories.length} categories`);

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
    }).catch((err) => {
      console.error("[Menu API] Error fetching campaigns:", err);
      return []; // Return empty array if campaigns query fails
    });

    const campaigns = rawCampaigns
      .filter((c) => c.usageLimit === null || (c.usedCount !== undefined && c.usedCount < c.usageLimit))
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
  } catch (error: any) {
    console.error("Error fetching menu:", error);
    console.error("Error details:", {
      message: error?.message,
      stack: error?.stack,
      code: error?.code,
      meta: error?.meta,
    });
    return NextResponse.json(
      { 
        error: "Menü yüklenirken bir hata oluştu",
        ...(process.env.NODE_ENV === "development" && {
          details: error?.message || String(error),
        }),
      },
      { status: 500 }
    );
  }
}
