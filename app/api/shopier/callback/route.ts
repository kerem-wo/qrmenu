import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applyThemeUpgradePayment } from "@/lib/theme-upgrade-payments";
import { readShopierBody, verifyShopierClassicCallback } from "@/lib/shopier";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function settingsUrl(request: Request, status: "success" | "failed") {
  return new URL(`/admin/settings?payment=${status}`, request.url);
}

export async function POST(request: Request) {
  try {
    const { body } = await readShopierBody(request);
    const result = verifyShopierClassicCallback(body);

    if (!result.valid || !result.paymentId) {
      return NextResponse.json({ error: "Geçersiz Shopier imzası" }, { status: 401 });
    }

    if (!result.paid) {
      await prisma.payment.updateMany({
        where: { id: result.paymentId, status: "pending" },
        data: {
          status: "failed",
          paymentMethod: "shopier",
          metadata: {
            provider: "shopier",
            status: "failed",
            failedAt: new Date().toISOString(),
          },
        },
      });

      return NextResponse.redirect(settingsUrl(request, "failed"), { status: 303 });
    }

    const applied = await prisma.$transaction((tx) =>
      applyThemeUpgradePayment(tx, result.paymentId, {
        provider: "shopier",
        paymentId: result.providerPaymentId,
        installment: result.installment,
        raw: body,
      })
    );

    if (!applied.ok) {
      return NextResponse.redirect(settingsUrl(request, "failed"), { status: 303 });
    }

    return NextResponse.redirect(settingsUrl(request, "success"), { status: 303 });
  } catch (error) {
    console.error("Shopier callback error:", error);
    return NextResponse.json({ error: "Shopier ödeme dönüşü işlenemedi" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return NextResponse.redirect(settingsUrl(request, "failed"));
}
