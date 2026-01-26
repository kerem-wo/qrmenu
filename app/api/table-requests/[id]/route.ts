import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// PATCH: İsteği okundu olarak işaretle
export async function PATCH(
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

    const tableRequest = await prisma.tableRequest.update({
      where: {
        id,
        restaurantId: session.restaurantId, // Sadece kendi restoranının isteklerini güncelleyebilir
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json(tableRequest);
  } catch (error) {
    console.error("Error updating table request:", error);
    return NextResponse.json(
      { error: "İstek güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
