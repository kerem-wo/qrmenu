import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Server-Sent Events for real-time notifications (Vercel compatible)
export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const lastOrderId = searchParams.get("lastOrderId");

  // Get new orders since lastOrderId
  const newOrders = await prisma.order.findMany({
    where: {
      restaurantId: session.restaurantId,
      ...(lastOrderId ? { id: { gt: lastOrderId } } : {}),
      status: { in: ["pending", "confirmed"] },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      items: {
        include: {
          product: {
            select: { name: true },
          },
        },
      },
    },
  });

  return NextResponse.json({ orders: newOrders });
}
