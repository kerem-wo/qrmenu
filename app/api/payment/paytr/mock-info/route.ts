import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const paymentId = searchParams.get("paymentId");

    if (!paymentId) {
      return NextResponse.json(
        { error: "paymentId gereklidir" },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      select: {
        paytrMerchantOid: true,
        id: true,
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      merchantOid: payment.paytrMerchantOid || `order_${payment.id}_${Date.now()}`,
    });
  } catch (error: any) {
    console.error("Mock info error:", error);
    return NextResponse.json(
      { error: error.message || "Bir hata oluştu" },
      { status: 500 }
    );
  }
}
