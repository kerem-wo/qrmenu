import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPlatformAdminSession } from "@/lib/platform-auth";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Debug: Log all cookies
    const cookieHeader = request.headers.get('cookie');
    console.log('Platform admin restaurants API - Cookies received:', cookieHeader ? 'Yes' : 'No');
    if (cookieHeader) {
      console.log('Cookie header:', cookieHeader.substring(0, 200)); // First 200 chars
    }
    
    const session = await getPlatformAdminSession();
    console.log('Platform admin session:', session ? `Found (${session.email})` : 'Not found');
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized", debug: { cookiesReceived: !!cookieHeader } },
        { status: 401 }
      );
    }

    const restaurants = await prisma.restaurant.findMany({
      include: {
        admin: {
          select: {
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(restaurants);
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    return NextResponse.json(
      { error: "Restoranlar yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
