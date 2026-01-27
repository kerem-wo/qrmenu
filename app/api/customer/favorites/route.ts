import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");
    const productIds = searchParams.get("productIds");

    if (!customerId || !productIds) {
      return NextResponse.json(
        { error: "Müşteri ID ve ürün ID'leri gereklidir" },
        { status: 400 }
      );
    }

    const ids = productIds.split(",");
    const products = await prisma.product.findMany({
      where: {
        id: { in: ids },
        isAvailable: true,
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching favorite products:", error);
    return NextResponse.json(
      { error: "Favori ürünler yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
