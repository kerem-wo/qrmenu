import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const themes = await prisma.theme.findMany({
      where: { isActive: true },
      orderBy: { monthlyPrice: "asc" },
    });

    return NextResponse.json(themes);
  } catch (error: any) {
    console.error("Error fetching themes:", error);
    // Return empty array instead of error during build time
    if (error?.message?.includes("Can't reach database server")) {
      console.warn("Database not available during build, returning empty array");
      return NextResponse.json([]);
    }
    return NextResponse.json(
      { error: "Temalar yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
