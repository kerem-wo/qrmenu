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
    const category = await prisma.category.findFirst({
      where: {
        id,
        restaurantId: session.restaurantId,
      },
      include: {
        translations: true,
        products: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Kategori bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { error: "Kategori yüklenirken bir hata oluştu" },
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

    const existingCategory = await prisma.category.findFirst({
      where: { id, restaurantId: session.restaurantId },
      select: { id: true, name: true },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Kategori bulunamadı" },
        { status: 404 }
      );
    }

    const updatedCategory = await prisma.$transaction(async (tx) => {
      await tx.category.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description || null,
          image: data.image || null,
          order: data.order ?? undefined,
          isAvailable: data.isAvailable !== undefined ? data.isAvailable : undefined,
        },
      });

      for (const t of rawTranslations) {
        const language = String(t?.language || "").trim().toLowerCase();
        if (!language || !allowedLangs.has(language) || language === "tr") continue;
        const name = String(t?.name || "").trim();
        const description =
          t?.description === null || t?.description === undefined ? "" : String(t.description).trim();

        if (!name && !description) {
          await tx.categoryTranslation.deleteMany({ where: { categoryId: id, language } });
          continue;
        }

        await tx.categoryTranslation.upsert({
          where: { categoryId_language: { categoryId: id, language } },
          update: {
            name: name || existingCategory.name,
            description: description ? description : null,
          },
          create: {
            categoryId: id,
            language,
            name: name || existingCategory.name,
            description: description ? description : null,
          },
        });
      }

      return tx.category.findUnique({
        where: { id },
        include: { translations: true },
      });
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Kategori güncellenirken bir hata oluştu" },
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
    const category = await prisma.category.findFirst({
      where: {
        id,
        restaurantId: session.restaurantId,
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Kategori bulunamadı" },
        { status: 404 }
      );
    }

    if (category._count.products > 0) {
      return NextResponse.json(
        { error: "Bu kategoride ürünler var. Önce ürünleri silin veya başka kategoriye taşıyın." },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Kategori silinirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
