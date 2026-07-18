import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import {
  getBillingPrice,
  getPackageTierRank,
  getThemePackage,
  getThemeUpgradeAmount,
  type BillingCycle,
} from "@/lib/package-catalog";
import { getShopierCheckoutConfig } from "@/lib/shopier";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: session.restaurantId },
      include: { translations: true, packageTheme: true },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restoran bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(restaurant);
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    return NextResponse.json(
      { error: "Restoran bilgileri yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await request.json();
    const allowedLangs = new Set(["tr", "en", "de", "ru", "ar", "fr", "es"]);
    const rawTranslations = Array.isArray(data.translations) ? data.translations : [];
    const requestedTheme = String(data.theme || "default").trim().toLowerCase();
    const targetPackage = getThemePackage(requestedTheme);

    if (!targetPackage) {
      return NextResponse.json({ error: "Geçersiz tema seçimi" }, { status: 400 });
    }

    const existingRestaurant = await prisma.restaurant.findUnique({
      where: { id: session.restaurantId },
      include: { packageTheme: true, admin: true },
    });

    if (!existingRestaurant) {
      return NextResponse.json(
        { error: "Restoran bulunamadı" },
        { status: 404 }
      );
    }

    const themeChanged = requestedTheme !== existingRestaurant.theme;
    const packageType: BillingCycle = existingRestaurant.packageType === "yearly" ? "yearly" : "monthly";
    const hasActivePackage = Boolean(
      existingRestaurant.packageStatus === "active" && existingRestaurant.packageThemeId
    );
    const currentPaidTheme = hasActivePackage
      ? existingRestaurant.packageTheme?.name || existingRestaurant.theme
      : "default";
    const currentPackage = getThemePackage(currentPaidTheme);
    const currentRank = getPackageTierRank(currentPackage?.tier);
    const targetRank = getPackageTierRank(targetPackage.tier);
    const upgradeAmount = themeChanged
      ? getThemeUpgradeAmount(currentPaidTheme, targetPackage.theme, packageType, hasActivePackage)
      : 0;

    if (themeChanged && targetRank > currentRank && upgradeAmount > 0) {
      const theme = await prisma.theme.upsert({
        where: { name: targetPackage.theme },
        update: {
          displayName: targetPackage.displayName,
          description: targetPackage.description,
          monthlyPrice: targetPackage.monthlyPrice,
          yearlyPrice: targetPackage.yearlyPrice,
          yearlyDiscount: targetPackage.yearlyDiscount,
          features: targetPackage.features,
          isActive: true,
        },
        create: {
          name: targetPackage.theme,
          displayName: targetPackage.displayName,
          description: targetPackage.description,
          monthlyPrice: targetPackage.monthlyPrice,
          yearlyPrice: targetPackage.yearlyPrice,
          yearlyDiscount: targetPackage.yearlyDiscount,
          features: targetPackage.features,
          isActive: true,
        },
      });

      const payment = await prisma.payment.create({
        data: {
          type: "subscription",
          amount: upgradeAmount,
          status: "pending",
          paymentMethod: "shopier",
          restaurantId: existingRestaurant.id,
          packageType,
          packageThemeId: theme.id,
          customerName: existingRestaurant.name,
          customerEmail: existingRestaurant.admin?.email || session.email,
          metadata: {
            purpose: "theme_upgrade",
            provider: "shopier",
            currentTheme: existingRestaurant.theme,
            currentPaidTheme,
            targetTheme: targetPackage.theme,
            targetDisplayName: targetPackage.displayName,
            currentTier: currentPackage?.tier || "starter",
            targetTier: targetPackage.tier,
            packageType,
            amount: upgradeAmount,
            targetFullPrice: getBillingPrice(targetPackage, packageType),
            createdFrom: "admin_settings",
          },
        },
      });

      return NextResponse.json(
        {
          error: "Bu tema için ödeme gerekiyor",
          requiresPayment: true,
          paymentUrl: `/api/shopier/pay/${payment.id}`,
          paymentConfigured: getShopierCheckoutConfig().configured,
          amount: upgradeAmount,
          currency: "TRY",
          packageType,
          targetPackage: {
            theme: targetPackage.theme,
            displayName: targetPackage.displayName,
            tierName: targetPackage.tierName,
            features: targetPackage.features,
          },
        },
        { status: 402 }
      );
    }

    const restaurant = await prisma.$transaction(async (tx) => {
      const updated = await tx.restaurant.update({
        where: { id: session.restaurantId },
        data: {
          name: data.name,
          description: data.description || null,
          logo: data.logo || null,
          theme: requestedTheme,
          language: typeof data.language === "string" && data.language ? data.language : undefined,
          enableTakeaway:
            typeof data.enableTakeaway === "boolean" ? data.enableTakeaway : undefined,
        },
      });

      for (const t of rawTranslations) {
        const language = String(t?.language || "").trim().toLowerCase();
        if (!language || !allowedLangs.has(language) || language === "tr") continue;
        const name = String(t?.name || "").trim();
        const description =
          t?.description === null || t?.description === undefined ? "" : String(t.description).trim();

        if (!name && !description) {
          await tx.restaurantTranslation.deleteMany({ where: { restaurantId: updated.id, language } });
          continue;
        }

        await tx.restaurantTranslation.upsert({
          where: { restaurantId_language: { restaurantId: updated.id, language } },
          update: {
            name: name || updated.name,
            description: description ? description : null,
          },
          create: {
            restaurantId: updated.id,
            language,
            name: name || updated.name,
            description: description ? description : null,
          },
        });
      }

      return tx.restaurant.findUnique({
        where: { id: updated.id },
        include: { translations: true, packageTheme: true },
      });
    });

    return NextResponse.json(restaurant);
  } catch (error) {
    console.error("Error updating restaurant:", error);
    return NextResponse.json(
      { error: "Restoran bilgileri güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Restaurant'ı sil (Cascade delete ile admin, categories, products, orders, campaigns otomatik silinir)
    await prisma.restaurant.delete({
      where: { id: session.restaurantId },
    });

    return NextResponse.json({ 
      success: true,
      message: "Restoran hesabı başarıyla silindi"
    });
  } catch (error: any) {
    console.error("Error deleting restaurant:", error);
    
    // Restaurant bulunamadı hatası
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Restoran bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Restoran silinirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
