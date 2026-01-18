import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const amount = parseFloat(searchParams.get("amount") || "0");

    if (!code) {
      return NextResponse.json(
        { error: "Kupon kodu gerekli" },
        { status: 400 }
      );
    }

    const campaign = await prisma.campaign.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Kupon kodu bulunamadı" },
        { status: 404 }
      );
    }

    // Kontroller
    if (!campaign.isActive) {
      return NextResponse.json(
        { error: "Kupon aktif değil" },
        { status: 400 }
      );
    }

    const now = new Date();
    if (now < campaign.startDate || now > campaign.endDate) {
      return NextResponse.json(
        { error: "Kupon geçerli tarih aralığında değil" },
        { status: 400 }
      );
    }

    if (campaign.usageLimit && campaign.usedCount >= campaign.usageLimit) {
      return NextResponse.json(
        { error: "Kupon kullanım limiti dolmuş" },
        { status: 400 }
      );
    }

    if (campaign.minAmount && amount < campaign.minAmount) {
      return NextResponse.json(
        { error: `Minimum sipariş tutarı: ${campaign.minAmount} ₺` },
        { status: 400 }
      );
    }

    // İndirim hesaplama
    let discount = 0;
    if (campaign.type === "percentage") {
      discount = (amount * campaign.value) / 100;
      if (campaign.maxDiscount) {
        discount = Math.min(discount, campaign.maxDiscount);
      }
    } else {
      discount = campaign.value;
    }

    return NextResponse.json({
      valid: true,
      discount: Math.min(discount, amount), // İndirim toplam tutardan fazla olamaz
      campaign: {
        name: campaign.name,
        type: campaign.type,
        value: campaign.value,
      },
    });
  } catch (error) {
    console.error("Error validating campaign:", error);
    return NextResponse.json(
      { error: "Kupon doğrulanırken bir hata oluştu" },
      { status: 500 }
    );
  }
}
