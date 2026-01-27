import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const order = await prisma.order.findFirst({
      where: {
        id,
        restaurantId: session.restaurantId,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Sipariş bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Sipariş yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const data = await request.json();
    const nextStatus = String(data.status || "").trim();

    const STOCK_DEDUCTED_STATUSES = new Set(["confirmed", "preparing", "ready", "completed"]);
    const STOCK_NOT_DEDUCTED_STATUSES = new Set(["pending", "cancelled"]);

    if (!nextStatus) {
      return NextResponse.json({ error: "Geçersiz durum" }, { status: 400 });
    }

    const updateResult = await prisma.$transaction(async (tx) => {
      const existing = await tx.order.findFirst({
        where: { id, restaurantId: session.restaurantId },
        include: {
          items: { select: { productId: true, quantity: true } },
        },
      });

      if (!existing) return { count: 0 as const };

      const prevStatus = existing.status;

      const prevDeducted = STOCK_DEDUCTED_STATUSES.has(prevStatus);
      const nextDeducted = STOCK_DEDUCTED_STATUSES.has(nextStatus);
      const prevNotDeducted = STOCK_NOT_DEDUCTED_STATUSES.has(prevStatus);
      const nextNotDeducted = STOCK_NOT_DEDUCTED_STATUSES.has(nextStatus);

      // If unknown statuses appear, be conservative: don't touch stock
      const canManageStock = (prevDeducted || prevNotDeducted) && (nextDeducted || nextNotDeducted);

      if (canManageStock && !prevDeducted && nextDeducted) {
        // pending/cancelled -> confirmed/... : now reserve stock
        for (const item of existing.items) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
            select: { id: true, stock: true, isAvailable: true, name: true },
          });

          if (!product || !product.isAvailable) {
            throw new Error(`${product?.name || "Ürün"} mevcut değil`);
          }

          if (product.stock === null) continue; // unlimited

          const res = await tx.product.updateMany({
            where: { id: product.id, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
          });

          if (res.count === 0) {
            throw new Error(`${product.name} için yeterli stok yok (Stok: ${product.stock})`);
          }
        }
      } else if (canManageStock && prevDeducted && !nextDeducted) {
        // confirmed/... -> pending/cancelled : release stock back
        for (const item of existing.items) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
            select: { id: true, stock: true },
          });
          if (!product) continue;
          if (product.stock === null) continue; // unlimited
          await tx.product.update({
            where: { id: product.id },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      const order = await tx.order.updateMany({
        where: {
          id,
          restaurantId: session.restaurantId,
        },
        data: {
          status: nextStatus,
          tableNumber: data.tableNumber || undefined,
          customerName: data.customerName || undefined,
          customerPhone: data.customerPhone || undefined,
        },
      });

      return order;
    });

    if (updateResult.count === 0) {
      return NextResponse.json(
        { error: "Sipariş bulunamadı" },
        { status: 404 }
      );
    }

    const updatedOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sipariş güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    
    // Check if order belongs to restaurant
    const order = await prisma.order.findFirst({
      where: {
        id,
        restaurantId: session.restaurantId,
      },
      include: {
        items: { select: { productId: true, quantity: true } },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Sipariş bulunamadı" },
        { status: 404 }
      );
    }

    const STOCK_DEDUCTED_STATUSES = new Set(["confirmed", "preparing", "ready", "completed"]);

    await prisma.$transaction(async (tx) => {
      // If stock was reserved, release it back before delete
      if (STOCK_DEDUCTED_STATUSES.has(order.status)) {
        for (const item of order.items) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
            select: { id: true, stock: true },
          });
          if (!product) continue;
          if (product.stock === null) continue;
          await tx.product.update({
            where: { id: product.id },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      // Delete order (cascade will delete order items)
      await tx.order.delete({ where: { id } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { error: "Sipariş silinirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
