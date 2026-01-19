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
        language: data.language || "tr",
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
