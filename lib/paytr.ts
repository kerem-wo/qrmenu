import crypto from "crypto";

/**
 * PayTR Helper Functions
 */

export interface PayTRConfig {
  merchantId: string;
  merchantKey: string;
  merchantSalt: string;
  testMode: boolean;
}

export interface PayTRTokenRequest {
  merchant_id: string;
  merchant_key: string;
  merchant_salt: string;
  email: string;
  payment_amount: number;
  payment_type: "normal" | "subscription";
  currency: string;
  merchant_oid: string;
  test_mode: number;
  no_installment: number;
  max_installment: number;
  user_name: string;
  user_address: string;
  user_phone: string;
  user_basket: string; // Base64 encoded JSON
  user_ip: string;
  callback_url: string;
  fail_url: string;
  hash: string;
}

export interface PayTRCallbackData {
  merchant_oid: string;
  status: "success" | "failed";
  total_amount: string;
  hash: string;
  failed_reason_code?: string;
  failed_reason_msg?: string;
  test_mode?: string;
  payment_type?: string;
  currency?: string;
}

/**
 * Get PayTR configuration from environment variables
 */
export function getPayTRConfig(): PayTRConfig {
  const merchantId = process.env.PAYTR_MERCHANT_ID;
  const merchantKey = process.env.PAYTR_MERCHANT_KEY;
  const merchantSalt = process.env.PAYTR_MERCHANT_SALT;

  if (!merchantId || !merchantKey || !merchantSalt) {
    throw new Error("PayTR API anahtarları yapılandırılmamış");
  }

  return {
    merchantId,
    merchantKey,
    merchantSalt,
    testMode: process.env.NODE_ENV !== "production",
  };
}

/**
 * Generate PayTR hash for token request (iFrame API)
 * PayTR hash: merchant_salt + merchant_id + user_ip + merchant_oid + email + payment_amount + user_basket + no_installment + max_installment + currency + test_mode
 */
export function generatePayTRHash(params: {
  merchant_id: string;
  user_ip: string;
  merchant_oid: string;
  email: string;
  payment_amount: number;
  user_basket: string;
  no_installment: number;
  max_installment: number;
  currency: string;
  test_mode: number;
}): string {
  const config = getPayTRConfig();
  
  // PayTR hash string: merchant_salt + parametreler (belirli sırada)
  const hashString = `${config.merchantSalt}${params.merchant_id}${params.user_ip}${params.merchant_oid}${params.email}${params.payment_amount}${params.user_basket}${params.no_installment}${params.max_installment}${params.currency}${params.test_mode}`;
  
  const hash = crypto
    .createHash("sha256")
    .update(hashString)
    .digest("base64");
  
  return hash;
}

/**
 * Verify PayTR callback hash
 * PayTR callback hash: merchant_salt + merchant_oid + status + total_amount
 */
export function verifyPayTRCallback(data: PayTRCallbackData): boolean {
  try {
    const config = getPayTRConfig();
    
    // PayTR callback hash: merchant_salt + merchant_oid + status + total_amount
    // Status değerini küçük harfe çevir (PayTR dokümantasyonuna göre)
    const statusLower = (data.status || "").toLowerCase();
    const hashString = `${config.merchantSalt}${data.merchant_oid}${statusLower}${data.total_amount}`;
    const calculatedHash = crypto
      .createHash("sha256")
      .update(hashString)
      .digest("base64");
    
    return calculatedHash === data.hash;
  } catch (error) {
    console.error("PayTR hash verification error:", error);
    return false;
  }
}

/**
 * Create user basket for PayTR
 */
export function createUserBasket(items: Array<{ name: string; price: number; quantity: number }>): string {
  const basket = items.map((item) => [
    item.name,
    item.price.toFixed(2),
    item.quantity,
  ]);
  
  return Buffer.from(JSON.stringify(basket)).toString("base64");
}

/**
 * Get PayTR token (iFrame API)
 */
export async function getPayTRToken(requestData: Omit<PayTRTokenRequest, "hash">): Promise<{ token: string }> {
  const config = getPayTRConfig();
  
  // Generate hash (PayTR iFrame API hash formatı)
  const hash = generatePayTRHash({
    merchant_id: requestData.merchant_id,
    user_ip: requestData.user_ip,
    merchant_oid: requestData.merchant_oid,
    email: requestData.email,
    payment_amount: requestData.payment_amount,
    user_basket: requestData.user_basket,
    no_installment: requestData.no_installment,
    max_installment: requestData.max_installment,
    currency: requestData.currency,
    test_mode: requestData.test_mode,
  });

  const formData = new URLSearchParams();
  Object.entries({ ...requestData, hash }).forEach(([key, value]) => {
    formData.append(key, String(value));
  });

  const response = await fetch("https://www.paytr.com/odeme/api/get-token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  const result = await response.json();

  if (result.status === "success") {
    return { token: result.token };
  } else {
    throw new Error(result.reason || "PayTR token alınamadı");
  }
}
