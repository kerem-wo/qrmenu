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
        variants: {
          orderBy: { createdAt: "asc" },
        },
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
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await request.json();

    // Verify product belongs to restaurant
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: params.id,
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

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description || null,
        price: data.price,
        image: data.image || null,
        stock: data.stock !== undefined ? (data.stock === "" || data.stock === null ? null : parseInt(data.stock)) : undefined,
        isAvailable: data.isAvailable ?? true,
        order: data.order ?? undefined,
        categoryId: data.categoryId || undefined,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(product);
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
