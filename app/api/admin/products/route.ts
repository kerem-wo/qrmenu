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

    // Get categories for this restaurant first
    const categories = await prisma.category.findMany({
      where: { restaurantId: session.restaurantId },
      select: { id: true },
    });

    const categoryIds = categories.map((c) => c.id);

    const products = categoryIds.length > 0 
      ? await prisma.product.findMany({
          where: {
            categoryId: { in: categoryIds },
          },
          include: {
            category: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        })
      : [];

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Ürünler yüklenirken bir hata oluştu" },
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
    const prepMin = Number.isFinite(Number(data.prepMinMinutes)) ? parseInt(String(data.prepMinMinutes), 10) : 5;
    const prepMax = Number.isFinite(Number(data.prepMaxMinutes)) ? parseInt(String(data.prepMaxMinutes), 10) : 10;

    if (prepMin <= 0 || prepMax <= 0 || prepMin > prepMax) {
      return NextResponse.json(
        { error: "Tahmini süre aralığı geçersiz (min <= max olmalı)" },
        { status: 400 }
      );
    }

    // Verify category belongs to restaurant
    const category = await prisma.category.findFirst({
      where: {
        id: data.categoryId,
        restaurantId: session.restaurantId,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Kategori bulunamadı" },
        { status: 404 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description || null,
        price: data.price,
        image: data.image || null,
        isAvailable: data.isAvailable ?? true,
        stock: data.stock !== undefined ? (data.stock === "" ? null : parseInt(String(data.stock), 10)) : null,
        prepMinMinutes: prepMin,
        prepMaxMinutes: prepMax,
        order: data.order || 0,
        categoryId: data.categoryId,
        translations: translations.length > 0 ? { create: translations } : undefined,
      },
      include: {
        category: true,
        translations: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: error.message || "Ürün oluşturulurken bir hata oluştu" },
      { status: 500 }
    );
  }
}
