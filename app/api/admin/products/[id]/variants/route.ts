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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    
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

    const variants = await prisma.productVariant.findMany({
      where: { productId: id },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(variants);
  } catch (error) {
    console.error("Error fetching variants:", error);
    return NextResponse.json(
      { error: "Varyantlar yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
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

    const variant = await prisma.productVariant.create({
      data: {
        name: data.name,
        price: data.price,
        productId: id,
      },
    });

    return NextResponse.json(variant, { status: 201 });
  } catch (error: any) {
    console.error("Error creating variant:", error);
    return NextResponse.json(
      { error: error.message || "Varyant oluşturulurken bir hata oluştu" },
      { status: 500 }
    );
  }
}
