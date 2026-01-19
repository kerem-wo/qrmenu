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
            variants: {
              orderBy: { createdAt: "asc" },
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
        stock: data.stock !== undefined ? (data.stock === "" ? null : parseInt(data.stock)) : null,
        order: data.order || 0,
        categoryId: data.categoryId,
      },
      include: {
        category: true,
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
