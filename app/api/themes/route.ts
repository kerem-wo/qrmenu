import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { THEME_PACKAGES } from "@/lib/package-catalog";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const dbThemes = await prisma.theme.findMany({
      where: { isActive: true },
      select: { id: true, name: true, isActive: true, createdAt: true, updatedAt: true },
    });
    const themeIds = new Map(dbThemes.map((theme) => [theme.name, theme.id]));

    const themes = THEME_PACKAGES.map((item) => ({
      id: themeIds.get(item.theme) || item.theme,
      name: item.theme,
      displayName: item.displayName,
      description: item.description,
      isActive: true,
      monthlyPrice: item.monthlyPrice,
      yearlyPrice: item.yearlyPrice,
      yearlyDiscount: item.yearlyDiscount,
      features: item.features,
      tier: item.tier,
      tierName: item.tierName,
      accent: item.accent,
      popular: item.popular || false,
      isNew: item.isNew || false,
    }));

    return NextResponse.json(themes);
  } catch (error: any) {
    console.error("Error fetching themes:", error);
    // Return empty array instead of error during build time
    if (error?.message?.includes("Can't reach database server")) {
      console.warn("Database not available during build, returning catalog themes");
      return NextResponse.json(
        THEME_PACKAGES.map((item) => ({
          id: item.theme,
          name: item.theme,
          displayName: item.displayName,
          description: item.description,
          isActive: true,
          monthlyPrice: item.monthlyPrice,
          yearlyPrice: item.yearlyPrice,
          yearlyDiscount: item.yearlyDiscount,
          features: item.features,
          tier: item.tier,
          tierName: item.tierName,
          accent: item.accent,
          popular: item.popular || false,
          isNew: item.isNew || false,
        }))
      );
    }
    return NextResponse.json(
      { error: "Temalar yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
