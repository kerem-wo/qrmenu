import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applyThemeUpgradePayment } from "@/lib/theme-upgrade-payments";
import {
  extractPaymentIdFromShopierPayload,
  getShopierOsbConfig,
  readShopierBody,
  timingSafeEqualText,
} from "@/lib/shopier";
import { createHmac } from "crypto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function decodeBasicAuth(header: string | null) {
  if (!header?.toLowerCase().startsWith("basic ")) return null;
  try {
    const decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
    const index = decoded.indexOf(":");
    if (index === -1) return null;
    return {
      username: decoded.slice(0, index),
      password: decoded.slice(index + 1),
    };
  } catch {
    return null;
  }
}

function verifyOsbAccess(request: Request, body: Record<string, any>) {
  const config = getShopierOsbConfig();
  if (!config.username || !config.password) return false;

  const res = String(body.res || "").trim();
  const hash = String(body.hash || "").trim();
  if (res && hash) {
    const expected = createHmac("sha256", config.password).update(`${res}${config.username}`).digest("hex");
    return timingSafeEqualText(hash, expected);
  }

  const basic = decodeBasicAuth(request.headers.get("authorization"));
  if (
    basic &&
    timingSafeEqualText(basic.username, config.username) &&
    timingSafeEqualText(basic.password, config.password)
  ) {
    return true;
  }

  const username = String(body.username || body.userName || body.osb_username || body.osbUser || "").trim();
  const password = String(body.password || body.osb_password || body.osbPassword || "").trim();
  return (
    Boolean(username && password) &&
    timingSafeEqualText(username, config.username) &&
    timingSafeEqualText(password, config.password)
  );
}

function tryDecodeEmbeddedPayload(body: Record<string, any>) {
  if (typeof body.res === "string" && body.res.trim()) {
    try {
      const decoded = Buffer.from(body.res, "base64").toString("utf8");
      return JSON.parse(decoded);
    } catch {
      return body;
    }
  }

  for (const value of Object.values(body)) {
    if (typeof value !== "string" || value.length < 16) continue;
    try {
      const decoded = Buffer.from(value, "base64").toString("utf8");
      if (!decoded.trim().startsWith("{") && !decoded.trim().startsWith("[")) continue;
      return JSON.parse(decoded);
    } catch {
      // OSB farklı alanlar gönderebildiği için okunamayan alanları yok sayıyoruz.
    }
  }
  return body;
}

function payloadIsNotFailed(payload: unknown) {
  const text = JSON.stringify(payload).toLowerCase();
  return !text.includes('"failed"') && !text.includes('"cancel"') && !text.includes('"refund"');
}

export async function POST(request: Request) {
  try {
    const { body } = await readShopierBody(request);
    if (!verifyOsbAccess(request, body)) {
      return NextResponse.json({ error: "Geçersiz OSB erişimi" }, { status: 401 });
    }

    const payload = tryDecodeEmbeddedPayload(body);
    if (!payloadIsNotFailed(payload)) {
      return new NextResponse("success", { status: 200 });
    }

    const paymentId = extractPaymentIdFromShopierPayload(payload);
    if (!paymentId) {
      return new NextResponse("success", { status: 200 });
    }

    await prisma.$transaction((tx) =>
      applyThemeUpgradePayment(tx, paymentId, {
        provider: "shopier-osb",
        orderId: (payload as any)?.id || (payload as any)?.orderId || (payload as any)?.order_id || null,
        paymentId: (payload as any)?.paymentId || (payload as any)?.payment_id || null,
        raw: payload,
      })
    );

    return new NextResponse("success", { status: 200 });
  } catch (error) {
    console.error("Shopier OSB error:", error);
    return NextResponse.json({ error: "Shopier OSB işlenemedi" }, { status: 500 });
  }
}
