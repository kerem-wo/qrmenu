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

    const restaurant = await prisma.restaurant.update({
      where: { id: session.restaurantId },
      data: {
        name: data.name,
        description: data.description || null,
        logo: data.logo || null,
        theme: data.theme || "default",
      },
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
