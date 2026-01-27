import { NextResponse } from "next/server";
import { clearAdminSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST() {
  await clearAdminSession();
  return NextResponse.json({ success: true });
}
