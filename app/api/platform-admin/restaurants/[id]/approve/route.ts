import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPlatformAdminSession } from "@/lib/platform-auth";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getPlatformAdminSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const restaurant = await prisma.restaurant.update({
      where: { id },
      data: {
        status: 'approved',
        reviewedAt: new Date(),
        reviewedBy: session.id,
        rejectionReason: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Restoran onaylandı",
      restaurant,
    });
  } catch (error: any) {
    console.error("Error approving restaurant:", error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Restoran bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Restoran onaylanırken bir hata oluştu" },
      { status: 500 }
    );
  }
}
