import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Debug: Log all cookies
    const cookieHeader = request.headers.get('cookie');
    console.log('Admin me API - Cookies received:', cookieHeader ? 'Yes' : 'No');
    if (cookieHeader) {
      console.log('Cookie header:', cookieHeader.substring(0, 200)); // First 200 chars
    }
    
    const session = await getAdminSession();
    console.log('Admin session:', session ? `Found (${session.email})` : 'Not found');
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized", debug: { cookiesReceived: !!cookieHeader } },
        { status: 401 }
      );
    }
    
    return NextResponse.json(session);
  } catch (error: any) {
    console.error("Error in /api/admin/me:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
