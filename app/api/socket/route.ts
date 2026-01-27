import { NextResponse } from "next/server";

/**
 * Socket.io endpoint
 * 
 * For serverless environments (Vercel), Socket.io requires a custom server.
 * Consider using Server-Sent Events (SSE) or external services like Pusher/Ably.
 * 
 * For custom server setup, see: https://nextjs.org/docs/pages/building-your-application/configuring/custom-server
 */

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({ 
    message: "Socket.io endpoint",
    note: "For serverless environments, use Server-Sent Events or external real-time service",
    alternatives: [
      "Server-Sent Events (SSE)",
      "Pusher",
      "Ably",
      "Supabase Realtime"
    ]
  });
}
