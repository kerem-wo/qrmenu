import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const packages = await prisma.packagePricing.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(packages);
  } catch (error: any) {
    console.error("Error fetching packages:", error);
    // Return empty array instead of error during build time
    if (error?.message?.includes("Can't reach database server")) {
      console.warn("Database not available during build, returning empty array");
      return NextResponse.json([]);
    }
    return NextResponse.json(
      { error: "Paketler yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
