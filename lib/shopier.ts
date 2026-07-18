import { createHmac, timingSafeEqual } from "crypto";
import type { Payment, Restaurant } from "@prisma/client";

const SHOPIER_PAYMENT_URL = "https://www.shopier.com/ShowProduct/api_pay4.php";
const TL_CURRENCY = 0;

type ShopierFormOptions = {
  payment: Payment;
  restaurant: Restaurant;
  buyerEmail?: string | null;
  buyerPhone?: string | null;
};

export function getShopierCheckoutConfig() {
  const apiKey = process.env.SHOPIER_API_KEY || "";
  const apiSecret = process.env.SHOPIER_API_SECRET || "";
  const websiteIndex = Number(process.env.SHOPIER_WEBSITE_INDEX || "1") || 1;

  return {
    apiKey,
    apiSecret,
    websiteIndex,
    configured: Boolean(apiKey && apiSecret),
  };
}

export function getShopierWebhookToken() {
  return process.env.SHOPIER_WEBHOOK_TOKEN || "";
}

export function getShopierOsbConfig() {
  return {
    username: process.env.SHOPIER_OSB_USERNAME || "",
    password: process.env.SHOPIER_OSB_PASSWORD || "",
  };
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function getBuyerParts(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) {
    return { firstName: parts[0] || "Rivo", lastName: "QR" };
  }

  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts[parts.length - 1],
  };
}

export function generateShopierCheckoutHtml({ payment, restaurant, buyerEmail, buyerPhone }: ShopierFormOptions) {
  const config = getShopierCheckoutConfig();
  if (!config.configured) {
    throw new Error("Shopier ödeme ayarları eksik");
  }

  const randomNr = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
  const platformOrderId = payment.id;
  const amount = Number(payment.amount.toFixed(2));
  const signatureData = `${randomNr}${platformOrderId}${amount}${TL_CURRENCY}`;
  const signature = createHmac("sha256", config.apiSecret).update(signatureData).digest("base64");
  const buyer = getBuyerParts(payment.customerName || restaurant.name || "Rivo QR");
  const phone = payment.customerPhone || buyerPhone || "5000000000";
  const email = payment.customerEmail || buyerEmail || "destek@rivoqr.com";
  const productName = `Rivo QR Tema Yükseltme - ${platformOrderId}`;

  const fields: Record<string, string | number> = {
    API_key: config.apiKey,
    website_index: config.websiteIndex,
    platform_order_id: platformOrderId,
    product_name: productName,
    product_type: 1,
    buyer_name: buyer.firstName,
    buyer_surname: buyer.lastName,
    buyer_email: email,
    buyer_account_age: 0,
    buyer_id_nr: platformOrderId,
    buyer_phone: phone,
    billing_address: "Online hizmet",
    billing_city: "Istanbul",
    billing_country: "Turkey",
    billing_postcode: "34000",
    shipping_address: "Dijital teslimat",
    shipping_city: "Istanbul",
    shipping_country: "Turkey",
    shipping_postcode: "34000",
    total_order_value: amount,
    currency: TL_CURRENCY,
    platform: 0,
    is_in_frame: 0,
    current_language: 0,
    modul_version: "1.0.4",
    random_nr: randomNr,
    signature,
  };

  const inputs = Object.entries(fields)
    .map(([key, value]) => `<input type="hidden" name="${escapeHtml(key)}" value="${escapeHtml(value)}">`)
    .join("\n");

  return `<!doctype html>
<html lang="tr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Shopier ödemesine yönlendiriliyor</title>
    <style>
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; font-family: Arial, sans-serif; background: #f7f3ed; color: #171614; }
      main { width: min(92vw, 420px); padding: 28px; border: 1px solid #e7ded2; border-radius: 18px; background: #fff; box-shadow: 0 24px 80px rgba(32, 25, 17, .12); text-align: center; }
      h1 { font-size: 22px; margin: 0 0 10px; }
      p { color: #625a50; line-height: 1.5; margin: 0 0 22px; }
      button { border: 0; border-radius: 12px; padding: 13px 18px; background: #ff6f00; color: #fff; font-weight: 800; cursor: pointer; }
    </style>
  </head>
  <body>
    <main>
      <h1>Shopier açılıyor</h1>
      <p>Güvenli ödeme sayfasına yönlendiriliyorsunuz. Yönlenmezse butona basın.</p>
      <form id="shopier_payment_form" method="post" action="${SHOPIER_PAYMENT_URL}">
        ${inputs}
        <button type="submit">Ödemeye geç</button>
      </form>
    </main>
    <script>document.getElementById("shopier_payment_form").submit();</script>
  </body>
</html>`;
}

export function verifyShopierClassicCallback(body: Record<string, any>) {
  const config = getShopierCheckoutConfig();
  if (!config.configured) {
    throw new Error("Shopier ödeme ayarları eksik");
  }

  const platformOrderId = String(body.platform_order_id || body.order_id || "").trim();
  const randomNr = String(body.random_nr || "").trim();
  const signature = String(body.signature || "").trim();
  const expected = createHmac("sha256", config.apiSecret).update(`${randomNr}${platformOrderId}`).digest("base64");

  if (!platformOrderId || !randomNr || !signature || !timingSafeEqualText(signature, expected)) {
    return { valid: false, paymentId: platformOrderId, paid: false };
  }

  return {
    valid: true,
    paid: String(body.status || "").toLowerCase() === "success",
    paymentId: platformOrderId,
    providerPaymentId: body.payment_id ? String(body.payment_id) : null,
    installment: body.installment ? String(body.installment) : null,
  };
}

export function verifyShopierWebhookSignature(rawBody: string, signature: string | null) {
  const token = getShopierWebhookToken();
  if (!token || !signature) return false;
  const expected = createHmac("sha256", token).update(rawBody).digest("base64");
  return timingSafeEqualText(signature, expected);
}

export function timingSafeEqualText(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

export async function readShopierBody(request: Request) {
  const rawBody = await request.text();
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      return { rawBody, body: JSON.parse(rawBody) as Record<string, any> };
    } catch {
      return { rawBody, body: {} as Record<string, any> };
    }
  }

  const params = new URLSearchParams(rawBody);
  const body = Object.fromEntries(params.entries()) as Record<string, any>;
  return { rawBody, body };
}

export function extractPaymentIdFromShopierPayload(payload: unknown): string | null {
  const seen = new Set<unknown>();
  const directKeys = [
    "platform_order_id",
    "platformOrderId",
    "buyer_id_nr",
    "order_id",
    "orderId",
    "merchant_oid",
    "merchantOid",
  ];

  function visit(value: unknown): string | null {
    if (!value || seen.has(value)) return null;
    if (typeof value === "string") {
      const match = value.match(/\bc[a-z0-9]{20,}\b/i);
      return match ? match[0] : null;
    }
    if (typeof value !== "object") return null;
    seen.add(value);

    const record = value as Record<string, unknown>;
    for (const key of directKeys) {
      const item = record[key];
      if (typeof item === "string" && item.trim()) return item.trim();
      if (typeof item === "number") return String(item);
    }

    for (const item of Object.values(record)) {
      const found = visit(item);
      if (found) return found;
    }
    return null;
  }

  return visit(payload);
}
