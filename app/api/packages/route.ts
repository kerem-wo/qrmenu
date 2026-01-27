import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const packages = await prisma.packagePricing.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(packages);
  } catch (error: any) {
    console.error("Error fetching packages:", error);
    return NextResponse.json(
      { error: "Paketler yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
