import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawCode = searchParams.get("code");
    const parsedAmount = Number.parseFloat(searchParams.get("amount") || "0");
    const amount = Number.isFinite(parsedAmount) ? parsedAmount : 0;

    const code = (rawCode || "").trim();
    if (!code) {
      // Business validation failure: return 200 to avoid noisy "Failed to load resource" logs.
      return NextResponse.json({ valid: false, error: "Kupon kodu gerekli" });
    }

    const campaign = await prisma.campaign.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!campaign) {
      return NextResponse.json({ valid: false, error: "Kupon kodu bulunamadı" });
    }

    // Kontroller
    if (!campaign.isActive) {
      return NextResponse.json({ valid: false, error: "Kupon aktif değil" });
    }

    const now = new Date();
    if (now < campaign.startDate || now > campaign.endDate) {
      return NextResponse.json({ valid: false, error: "Kupon geçerli tarih aralığında değil" });
    }

    if (campaign.usageLimit && campaign.usedCount >= campaign.usageLimit) {
      return NextResponse.json({ valid: false, error: "Kupon kullanım limiti dolmuş" });
    }

    if (campaign.minAmount && amount < campaign.minAmount) {
      return NextResponse.json({ valid: false, error: `Minimum sipariş tutarı: ${campaign.minAmount} ₺` });
    }

    // İndirim hesaplama
    let discount = 0;
    if (campaign.type === "percentage") {
      discount = (amount * campaign.value) / 100;
    } else {
      discount = campaign.value;
    }

    // Maksimum indirim limiti (hem yüzde hem sabit tutar için)
    if (campaign.maxDiscount !== null && campaign.maxDiscount !== undefined) {
      discount = Math.min(discount, campaign.maxDiscount);
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
