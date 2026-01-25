import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

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
      include: { translations: true },
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

    const restaurant = await prisma.$transaction(async (tx) => {
      const updated = await tx.restaurant.update({
        where: { id: session.restaurantId },
        data: {
          name: data.name,
          description: data.description || null,
          logo: data.logo || null,
          theme: data.theme || "default",
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
        include: { translations: true },
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
