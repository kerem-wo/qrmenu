import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBillingPrice, getThemePackage, type BillingCycle } from "@/lib/package-catalog";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function addBillingPeriod(date: Date, packageType: BillingCycle) {
  const endDate = new Date(date);
  if (packageType === "yearly") {
    endDate.setFullYear(endDate.getFullYear() + 1);
  } else {
    endDate.setMonth(endDate.getMonth() + 1);
  }
  return endDate;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const restaurantId = String(body?.restaurantId || "").trim();
    const packageType = String(body?.packageType || "monthly").trim() as BillingCycle;
    const themeKey = String(body?.theme || body?.themeId || "").trim().toLowerCase();

    if (!restaurantId) {
      return NextResponse.json({ error: "Restoran bilgisi bulunamadı" }, { status: 400 });
    }

    if (packageType !== "monthly" && packageType !== "yearly") {
      return NextResponse.json({ error: "Geçersiz paket tipi" }, { status: 400 });
    }

    let selectedPackage = getThemePackage(themeKey);
    if (!selectedPackage) {
      const dbTheme = await prisma.theme.findFirst({
        where: { OR: [{ id: themeKey }, { name: themeKey }] },
        select: { name: true },
      });
      selectedPackage = getThemePackage(dbTheme?.name);
    }

    if (!selectedPackage) {
      return NextResponse.json({ error: "Geçersiz tema veya paket" }, { status: 400 });
    }

    const startDate = new Date();
    const endDate = addBillingPeriod(startDate, packageType);
    const amount = getBillingPrice(selectedPackage, packageType);

    const result = await prisma.$transaction(async (tx) => {
      const theme = await tx.theme.upsert({
        where: { name: selectedPackage.theme },
        update: {
          displayName: selectedPackage.displayName,
          description: selectedPackage.description,
          monthlyPrice: selectedPackage.monthlyPrice,
          yearlyPrice: selectedPackage.yearlyPrice,
          yearlyDiscount: selectedPackage.yearlyDiscount,
          features: selectedPackage.features,
          isActive: true,
        },
        create: {
          name: selectedPackage.theme,
          displayName: selectedPackage.displayName,
          description: selectedPackage.description,
          monthlyPrice: selectedPackage.monthlyPrice,
          yearlyPrice: selectedPackage.yearlyPrice,
          yearlyDiscount: selectedPackage.yearlyDiscount,
          features: selectedPackage.features,
          isActive: true,
        },
      });

      const restaurant = await tx.restaurant.update({
        where: { id: restaurantId },
        data: {
          theme: selectedPackage.theme,
          packageType,
          packageThemeId: theme.id,
          packageStartDate: startDate,
          packageEndDate: endDate,
          packageStatus: "active",
        },
        select: {
          id: true,
          name: true,
          slug: true,
          theme: true,
          packageType: true,
          packageStatus: true,
          packageStartDate: true,
          packageEndDate: true,
        },
      });

      await tx.payment.create({
        data: {
          type: "subscription",
          amount,
          status: "pending",
          paymentMethod: "manual",
          restaurantId,
          packageType,
          packageThemeId: theme.id,
          metadata: {
            tier: selectedPackage.tier,
            tierName: selectedPackage.tierName,
            theme: selectedPackage.theme,
            features: selectedPackage.features,
          },
        },
      });

      return { restaurant, theme };
    });

    return NextResponse.json({
      success: true,
      message: "Paket seçimi kaydedildi",
      restaurant: result.restaurant,
      package: {
        theme: selectedPackage.theme,
        displayName: selectedPackage.displayName,
        tier: selectedPackage.tier,
        tierName: selectedPackage.tierName,
        packageType,
        amount,
        features: selectedPackage.features,
      },
    });
  } catch (error: any) {
    console.error("Package selection error:", error);
    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Restoran bulunamadı" }, { status: 404 });
    }
    return NextResponse.json(
      { error: error?.message || "Paket seçimi kaydedilirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
