import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPlatformAdminSession } from "@/lib/platform-auth";
import { decryptDataUrl } from "@/lib/encryption";
import { getClientIP, logSecurityEvent, requireHTTPS } from "@/lib/security";

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // HTTPS Check
    if (!requireHTTPS(request)) {
      return NextResponse.json(
        { error: "HTTPS required" },
        { status: 403 }
      );
    }

    const session = await getPlatformAdminSession();
    if (!session) {
      await logSecurityEvent({
        action: 'UNAUTHORIZED_RESTAURANT_ACCESS_ATTEMPT',
        userType: 'anonymous',
        ip: getClientIP(request),
        userAgent: request.headers.get('user-agent') || 'unknown',
        timestamp: new Date(),
      });
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        admin: {
          select: {
            email: true,
            createdAt: true,
          },
        },
      },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restoran bulunamadı" },
        { status: 404 }
      );
    }

    // Decrypt documents for platform admin viewing
    const decryptedRestaurant = {
      ...restaurant,
      taxDocument: restaurant.taxDocument ? decryptDataUrl(restaurant.taxDocument) : null,
      businessLicense: restaurant.businessLicense ? decryptDataUrl(restaurant.businessLicense) : null,
      tradeRegistry: restaurant.tradeRegistry ? decryptDataUrl(restaurant.tradeRegistry) : null,
      identityDocument: restaurant.identityDocument ? decryptDataUrl(restaurant.identityDocument) : null,
    };

    // Log document access
    await logSecurityEvent({
      action: 'RESTAURANT_DOCUMENTS_ACCESSED',
      userId: session.id,
      userType: 'platform-admin',
      ip: getClientIP(request),
      userAgent: request.headers.get('user-agent') || 'unknown',
      details: {
        restaurantId: id,
        restaurantName: restaurant.name,
      },
      timestamp: new Date(),
    });

    return NextResponse.json(decryptedRestaurant);
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    return NextResponse.json(
      { error: "Restoran yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getPlatformAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        admin: { select: { id: true } },
      },
    });

    if (!restaurant) {
      return NextResponse.json({ error: "Restoran bulunamadı" }, { status: 404 });
    }

    const canDelete =
      restaurant.status === "approved" ||
      restaurant.status === "rejected" ||
      restaurant.admin === null; // hesabı silinmiş/eksik admin gibi durumlar

    if (!canDelete) {
      return NextResponse.json(
        { error: "Sadece onaylanmış, reddedilmiş veya hesabı silinmiş kayıtlar silinebilir." },
        { status: 400 }
      );
    }

    // Silme işlemini ilişkili kayıtları doğru sırayla temizleyerek yap (FK hatalarını önler).
    await prisma.$transaction(async (tx) => {
      await tx.orderItemVariant.deleteMany({
        where: { orderItem: { order: { restaurantId: id } } },
      });
      await tx.orderItem.deleteMany({
        where: { order: { restaurantId: id } },
      });
      await tx.order.deleteMany({
        where: { restaurantId: id },
      });

      await tx.productVariant.deleteMany({
        where: { product: { category: { restaurantId: id } } },
      });
      await tx.product.deleteMany({
        where: { category: { restaurantId: id } },
      });
      await tx.category.deleteMany({
        where: { restaurantId: id },
      });
      await tx.campaign.deleteMany({
        where: { restaurantId: id },
      });
      await tx.admin.deleteMany({
        where: { restaurantId: id },
      });

      await tx.restaurant.delete({
        where: { id },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting restaurant (platform admin):", error);

    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Restoran bulunamadı" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Restoran silinirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
