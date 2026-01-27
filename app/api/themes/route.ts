import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const themes = await prisma.theme.findMany({
      where: { isActive: true },
      orderBy: { monthlyPrice: "asc" },
    });

    return NextResponse.json(themes);
  } catch (error: any) {
    console.error("Error fetching themes:", error);
    return NextResponse.json(
      { error: "Temalar yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
