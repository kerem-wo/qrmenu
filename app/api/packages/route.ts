import { NextResponse } from "next/server";
import { PACKAGE_TIERS } from "@/lib/package-catalog";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const billingOptions = [
  {
    id: "monthly",
    name: "monthly",
    displayName: "Aylık Paket",
    period: "ay",
    startingPrice: PACKAGE_TIERS.starter.monthlyPrice,
    discountPercent: 0,
    isActive: true,
  },
  {
    id: "yearly",
    name: "yearly",
    displayName: "Yıllık Paket",
    period: "yıl",
    startingPrice: PACKAGE_TIERS.starter.yearlyPrice,
    discountPercent: PACKAGE_TIERS.starter.yearlyDiscount,
    isActive: true,
  },
];

export async function GET() {
  return NextResponse.json(billingOptions);
}
