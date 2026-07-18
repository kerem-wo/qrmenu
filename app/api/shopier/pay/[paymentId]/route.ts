import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { generateShopierCheckoutHtml } from "@/lib/shopier";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    const { paymentId } = await params;
    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        restaurantId: session.restaurantId,
        status: "pending",
      },
      include: {
        restaurant: true,
      },
    });

    if (!payment?.restaurant) {
      return new NextResponse("Ödeme bulunamadı veya ödeme artık aktif değil.", { status: 404 });
    }

    const html = generateShopierCheckoutHtml({
      payment,
      restaurant: payment.restaurant,
      buyerEmail: session.email,
    });

    return new NextResponse(html, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  } catch (error: any) {
    console.error("Shopier checkout error:", error);
    return new NextResponse(error?.message || "Shopier ödeme sayfası hazırlanamadı.", { status: 500 });
  }
}
