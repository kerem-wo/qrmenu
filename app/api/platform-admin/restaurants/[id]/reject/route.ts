import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPlatformAdminSession } from "@/lib/platform-auth";

export const dynamic = 'force-dynamic';

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
    const { reason } = await request.json();

    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { error: "Red nedeni gereklidir" },
        { status: 400 }
      );
    }

    const restaurant = await prisma.restaurant.update({
      where: { id },
      data: {
        status: 'rejected',
        reviewedAt: new Date(),
        reviewedBy: session.id,
        rejectionReason: reason.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Restoran reddedildi",
      restaurant,
    });
  } catch (error: any) {
    console.error("Error rejecting restaurant:", error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Restoran bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Restoran reddedilirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
