import type { Prisma } from "@prisma/client";
import { getThemePackage, type BillingCycle } from "@/lib/package-catalog";

type PaymentProviderInfo = {
  provider?: string;
  orderId?: string | number | null;
  paymentId?: string | number | null;
  installment?: string | number | null;
  raw?: unknown;
};

function asRecord(value: unknown): Record<string, any> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, any>) : {};
}

function addBillingPeriod(date: Date, packageType: BillingCycle) {
  const endDate = new Date(date);
  if (packageType === "yearly") {
    endDate.setFullYear(endDate.getFullYear() + 1);
  } else {
    endDate.setMonth(endDate.getMonth() + 1);
  }
  return endDate;
}

export async function applyThemeUpgradePayment(
  tx: Prisma.TransactionClient,
  paymentId: string,
  providerInfo: PaymentProviderInfo = {}
) {
  const payment = await tx.payment.findUnique({
    where: { id: paymentId },
    include: { restaurant: true },
  });

  if (!payment) {
    return { ok: false, status: "missing" as const };
  }

  const metadata = asRecord(payment.metadata);
  if (metadata.purpose !== "theme_upgrade") {
    return { ok: false, status: "not_theme_upgrade" as const };
  }

  if (payment.status === "paid") {
    return { ok: true, status: "already_paid" as const, payment };
  }

  if (!payment.restaurantId || !payment.restaurant) {
    return { ok: false, status: "restaurant_missing" as const };
  }

  const selectedPackage = getThemePackage(metadata.targetTheme);
  if (!selectedPackage) {
    return { ok: false, status: "invalid_theme" as const };
  }

  const packageType: BillingCycle = metadata.packageType === "yearly" ? "yearly" : "monthly";
  const now = new Date();
  const existingEndDate =
    payment.restaurant?.packageStatus === "active" &&
    payment.restaurant.packageEndDate &&
    payment.restaurant.packageEndDate > now
      ? payment.restaurant.packageEndDate
      : null;

  const theme = await tx.theme.upsert({
    where: { name: selectedPackage.theme },
    update: {
      displayName: selectedPackage.displayName,
      description: selectedPackage.description,
      monthlyPrice: selectedPackage.monthlyPrice,
      yearlyPrice: selectedPackage.yearlyPrice,
      yearlyDiscount: selectedPackage.yearlyDiscount,
      features: selectedPackage.features,
      isActive: true,
    },
    create: {
      name: selectedPackage.theme,
      displayName: selectedPackage.displayName,
      description: selectedPackage.description,
      monthlyPrice: selectedPackage.monthlyPrice,
      yearlyPrice: selectedPackage.yearlyPrice,
      yearlyDiscount: selectedPackage.yearlyDiscount,
      features: selectedPackage.features,
      isActive: true,
    },
  });

  const mergedMetadata = {
    ...metadata,
    provider: providerInfo.provider || "shopier",
    shopierOrderId: providerInfo.orderId ? String(providerInfo.orderId) : metadata.shopierOrderId,
    shopierPaymentId: providerInfo.paymentId ? String(providerInfo.paymentId) : metadata.shopierPaymentId,
    installment: providerInfo.installment ?? metadata.installment ?? null,
    paidAt: now.toISOString(),
    providerRaw: providerInfo.raw ?? metadata.providerRaw ?? null,
  };

  const [restaurant, updatedPayment] = await Promise.all([
    tx.restaurant.update({
      where: { id: payment.restaurantId },
      data: {
        theme: selectedPackage.theme,
        packageType,
        packageThemeId: theme.id,
        packageStatus: "active",
        packageStartDate: payment.restaurant?.packageStartDate || now,
        packageEndDate: existingEndDate || addBillingPeriod(now, packageType),
      },
    }),
    tx.payment.update({
      where: { id: payment.id },
      data: {
        status: "paid",
        paymentMethod: providerInfo.provider || "shopier",
        paytrPaymentId: providerInfo.paymentId ? String(providerInfo.paymentId) : payment.paytrPaymentId,
        metadata: mergedMetadata as Prisma.InputJsonValue,
      },
    }),
  ]);

  return { ok: true, status: "paid" as const, payment: updatedPayment, restaurant };
}
