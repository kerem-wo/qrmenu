import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const product = await prisma.product.findFirst({
      where: {
        id,
        category: {
          restaurantId: session.restaurantId,
        },
      },
      include: {
        category: true,
        translations: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Ürün bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Ürün yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const data = await request.json();
    const allowedLangs = new Set(["tr", "en", "de", "ru", "ar", "fr", "es"]);
    const rawTranslations = Array.isArray(data.translations) ? data.translations : [];
    const prepMin =
      data.prepMinMinutes === undefined || data.prepMinMinutes === null || data.prepMinMinutes === ""
        ? undefined
        : parseInt(String(data.prepMinMinutes), 10);
    const prepMax =
      data.prepMaxMinutes === undefined || data.prepMaxMinutes === null || data.prepMaxMinutes === ""
        ? undefined
        : parseInt(String(data.prepMaxMinutes), 10);

    if (
      (prepMin !== undefined && (!Number.isFinite(prepMin) || prepMin <= 0)) ||
      (prepMax !== undefined && (!Number.isFinite(prepMax) || prepMax <= 0))
    ) {
      return NextResponse.json(
        { error: "Tahmini süre aralığı geçersiz" },
        { status: 400 }
      );
    }

    // Verify product belongs to restaurant
    const existingProduct = await prisma.product.findFirst({
      where: {
        id,
        category: {
          restaurantId: session.restaurantId,
        },
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Ürün bulunamadı" },
        { status: 404 }
      );
    }

    // If category is being changed, verify new category belongs to restaurant
    if (data.categoryId && data.categoryId !== existingProduct.categoryId) {
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
    }

    // If either is present, validate min <= max
    if (prepMin !== undefined || prepMax !== undefined) {
      const nextMin = prepMin ?? existingProduct.prepMinMinutes;
      const nextMax = prepMax ?? existingProduct.prepMaxMinutes;
      if (nextMin > nextMax) {
        return NextResponse.json(
          { error: "Tahmini süre aralığı geçersiz (min <= max olmalı)" },
          { status: 400 }
        );
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description || null,
          price: data.price,
          image: data.image || null,
          stock:
            data.stock !== undefined
              ? data.stock === "" || data.stock === null
                ? null
                : parseInt(String(data.stock), 10)
              : undefined,
          prepMinMinutes: prepMin ?? undefined,
          prepMaxMinutes: prepMax ?? undefined,
          isAvailable: data.isAvailable ?? true,
          order: data.order ?? undefined,
          categoryId: data.categoryId || undefined,
        },
        include: {
          category: true,
        },
      });

      for (const t of rawTranslations) {
        const language = String(t?.language || "").trim().toLowerCase();
        if (!language || !allowedLangs.has(language) || language === "tr") continue;
        const name = String(t?.name || "").trim();
        const description =
          t?.description === null || t?.description === undefined ? "" : String(t.description).trim();

        if (!name && !description) {
          await tx.productTranslation.deleteMany({ where: { productId: id, language } });
          continue;
        }

        await tx.productTranslation.upsert({
          where: { productId_language: { productId: id, language } },
          update: {
            name: name || existingProduct.name,
            description: description ? description : null,
          },
          create: {
            productId: id,
            language,
            name: name || existingProduct.name,
            description: description ? description : null,
          },
        });
      }

      return tx.product.findUnique({
        where: { id },
        include: { category: true, translations: true },
      });
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Ürün güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const product = await prisma.product.findFirst({
      where: {
        id,
        category: {
          restaurantId: session.restaurantId,
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Ürün bulunamadı" },
        { status: 404 }
      );
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Ürün silinirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
