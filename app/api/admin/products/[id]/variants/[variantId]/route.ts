import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, variantId } = await params;
    const data = await request.json();

    // Verify product belongs to restaurant
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

    // Verify variant belongs to product
    const variant = await prisma.productVariant.findFirst({
      where: {
        id: variantId,
        productId: id,
      },
    });

    if (!variant) {
      return NextResponse.json(
        { error: "Varyant bulunamadı" },
        { status: 404 }
      );
    }

    const updatedVariant = await prisma.productVariant.update({
      where: { id: variantId },
      data: {
        name: data.name,
        price: data.price,
      },
    });

    return NextResponse.json(updatedVariant);
  } catch (error: any) {
    console.error("Error updating variant:", error);
    return NextResponse.json(
      { error: error.message || "Varyant güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, variantId } = await params;

    // Verify product belongs to restaurant
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

    // Verify variant belongs to product
    const variant = await prisma.productVariant.findFirst({
      where: {
        id: variantId,
        productId: id,
      },
    });

    if (!variant) {
      return NextResponse.json(
        { error: "Varyant bulunamadı" },
        { status: 404 }
      );
    }

    await prisma.productVariant.delete({
      where: { id: variantId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting variant:", error);
    return NextResponse.json(
      { error: error.message || "Varyant silinirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
