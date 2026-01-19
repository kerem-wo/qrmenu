import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const campaigns = await prisma.campaign.findMany({
      where: { restaurantId: session.restaurantId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json(
      { error: "Kampanyalar yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    const campaign = await prisma.campaign.create({
      data: {
        name: data.name,
        code: data.code.toUpperCase(),
        type: data.type,
        value: data.value,
        minAmount: data.minAmount || null,
        maxDiscount: data.maxDiscount || null,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        isActive: data.isActive ?? true,
        usageLimit: data.usageLimit || null,
        restaurantId: session.restaurantId,
      },
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error: any) {
    console.error("Error creating campaign:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Bu kupon kodu zaten kullanılıyor" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Kampanya oluşturulurken bir hata oluştu" },
      { status: 500 }
    );
  }
}
