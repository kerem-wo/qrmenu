import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get("paymentId");

    if (!paymentId) {
      return NextResponse.json(
        { error: "Payment ID gerekli" },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      select: {
        paytrMerchantOid: true,
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      merchantOid: payment.paytrMerchantOid,
    });
  } catch (error) {
    console.error("Error fetching mock payment info:", error);
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}
