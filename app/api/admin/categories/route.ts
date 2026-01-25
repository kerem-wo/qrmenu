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

    const categories = await prisma.category.findMany({
      where: {
        restaurantId: session.restaurantId,
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: {
        order: "asc",
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Kategoriler yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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
    const translations = rawTranslations
      .map((t: any) => ({
        language: String(t?.language || "").trim().toLowerCase(),
        name: String(t?.name || "").trim(),
        description: (t?.description === null || t?.description === undefined) ? "" : String(t.description).trim(),
      }))
      .filter((t: any) => t.language && allowedLangs.has(t.language) && t.language !== "tr")
      .filter((t: any) => t.name || t.description)
      .map((t: any) => ({
        language: t.language,
        name: t.name || String(data.name || "").trim(),
        description: t.description ? t.description : null,
      }));

    const category = await prisma.category.create({
      data: {
        name: data.name,
        description: data.description || null,
        image: data.image || null,
        order: data.order || 0,
        restaurantId: session.restaurantId,
        translations: translations.length > 0 ? { create: translations } : undefined,
      },
      include: { translations: true },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Kategori oluşturulurken bir hata oluştu" },
      { status: 500 }
    );
  }
}
