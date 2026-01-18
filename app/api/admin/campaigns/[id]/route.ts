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
    const campaign = await prisma.campaign.findFirst({
      where: {
        id,
        restaurantId: session.restaurantId,
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Kampanya bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(campaign);
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return NextResponse.json(
      { error: "Kampanya yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    // Verify campaign belongs to restaurant
    const existingCampaign = await prisma.campaign.findFirst({
      where: {
        id,
        restaurantId: session.restaurantId,
      },
    });

    if (!existingCampaign) {
      return NextResponse.json(
        { error: "Kampanya bulunamadı" },
        { status: 404 }
      );
    }

    // Check if code is being changed and if it's unique
    if (data.code && data.code.toUpperCase() !== existingCampaign.code) {
      const codeExists = await prisma.campaign.findFirst({
        where: {
          code: data.code.toUpperCase(),
          id: { not: id },
        },
      });

      if (codeExists) {
        return NextResponse.json(
          { error: "Bu kupon kodu zaten kullanılıyor" },
          { status: 400 }
        );
      }
    }

    const campaign = await prisma.campaign.updateMany({
      where: {
        id,
        restaurantId: session.restaurantId,
      },
      data: {
        name: data.name,
        code: data.code ? data.code.toUpperCase() : undefined,
        type: data.type,
        value: data.value,
        minAmount: data.minAmount || null,
        maxDiscount: data.maxDiscount || null,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        isActive: data.isActive ?? true,
        usageLimit: data.usageLimit || null,
      },
    });

    if (campaign.count === 0) {
      return NextResponse.json(
        { error: "Kampanya bulunamadı" },
        { status: 404 }
      );
    }

    const updatedCampaign = await prisma.campaign.findUnique({
      where: { id },
    });

    return NextResponse.json(updatedCampaign);
  } catch (error: any) {
    console.error("Error updating campaign:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Bu kupon kodu zaten kullanılıyor" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Kampanya güncellenirken bir hata oluştu" },
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.campaign.deleteMany({
      where: {
        id,
        restaurantId: session.restaurantId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    return NextResponse.json(
      { error: "Kampanya silinirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
