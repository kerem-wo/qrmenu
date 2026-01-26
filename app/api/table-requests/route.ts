import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// POST: Yeni masa isteği oluştur (müşteri tarafından)
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { restaurantId, type, tableNumber } = data;

    if (!restaurantId || !type) {
      return NextResponse.json(
        { error: "Restoran ID ve istek tipi gerekli" },
        { status: 400 }
      );
    }

    if (type !== "waiter" && type !== "bill") {
      return NextResponse.json(
        { error: "Geçersiz istek tipi" },
        { status: 400 }
      );
    }

    const tableRequest = await prisma.tableRequest.create({
      data: {
        restaurantId,
        type,
        tableNumber: tableNumber || null,
        isRead: false,
      },
    });

    return NextResponse.json(tableRequest);
  } catch (error) {
    console.error("Error creating table request:", error);
    return NextResponse.json(
      { error: "İstek oluşturulurken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// GET: Admin için okunmamış istekleri getir
export async function GET(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const requests = await prisma.tableRequest.findMany({
      where: {
        restaurantId: session.restaurantId,
        isRead: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Error fetching table requests:", error);
    return NextResponse.json(
      { error: "İstekler yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
