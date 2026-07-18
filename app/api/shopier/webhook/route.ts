import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applyThemeUpgradePayment } from "@/lib/theme-upgrade-payments";
import {
  extractPaymentIdFromShopierPayload,
  readShopierBody,
  verifyShopierWebhookSignature,
} from "@/lib/shopier";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function payloadLooksPaid(payload: unknown) {
  const text = JSON.stringify(payload).toLowerCase();
  return text.includes('"paid"') || text.includes('"success"') || text.includes('"completed"');
}

export async function POST(request: Request) {
  try {
    const signature = request.headers.get("shopier-signature");
    const { rawBody, body } = await readShopierBody(request);

    if (!verifyShopierWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Geçersiz Shopier webhook imzası" }, { status: 401 });
    }

    if (!payloadLooksPaid(body)) {
      return NextResponse.json({ ok: true, ignored: "payment_not_completed" });
    }

    const paymentId = extractPaymentIdFromShopierPayload(body);
    if (!paymentId) {
      return NextResponse.json({ ok: true, ignored: "payment_id_not_found" });
    }

    const applied = await prisma.$transaction((tx) =>
      applyThemeUpgradePayment(tx, paymentId, {
        provider: "shopier-webhook",
        orderId: body?.id || body?.orderId || body?.order_id || null,
        paymentId: body?.paymentId || body?.payment_id || null,
        raw: body,
      })
    );

    return NextResponse.json({ ok: applied.ok, status: applied.status });
  } catch (error) {
    console.error("Shopier webhook error:", error);
    return NextResponse.json({ error: "Shopier webhook işlenemedi" }, { status: 500 });
  }
}
