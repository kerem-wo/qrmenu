import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPlatformAdminSession } from "@/lib/platform-auth";
import { decryptDataUrl } from "@/lib/encryption";
import { getClientIP, logSecurityEvent, requireHTTPS } from "@/lib/security";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * SECURE DOCUMENT ACCESS ENDPOINT
 * - Only platform admins can access documents
 * - Documents are decrypted on-the-fly
 * - Full audit logging
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { restaurantId: string } }
) {
  try {
    // 1. HTTPS Check
    if (!requireHTTPS(request)) {
      return NextResponse.json(
        { error: "HTTPS required" },
        { status: 403 }
      );
    }

    // 2. Platform Admin Authentication (ONLY)
    const session = await getPlatformAdminSession();
    if (!session) {
      await logSecurityEvent({
        action: 'UNAUTHORIZED_DOCUMENT_ACCESS_ATTEMPT',
        userType: 'anonymous',
        ip: getClientIP(request),
        userAgent: request.headers.get('user-agent') || 'unknown',
        details: { restaurantId: params.restaurantId },
        timestamp: new Date(),
      });
      return NextResponse.json(
        { error: "Unauthorized - Platform admin access required" },
        { status: 401 }
      );
    }

    // 3. Get restaurant documents
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: params.restaurantId },
      select: {
        id: true,
        name: true,
        taxDocument: true,
        businessLicense: true,
        tradeRegistry: true,
        identityDocument: true,
      },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    // 4. Decrypt documents
    const decryptedDocuments: {
      taxDocument: string | null;
      businessLicense: string | null;
      tradeRegistry: string | null;
      identityDocument: string | null;
    } = {
      taxDocument: restaurant.taxDocument ? decryptDataUrl(restaurant.taxDocument) : null,
      businessLicense: restaurant.businessLicense ? decryptDataUrl(restaurant.businessLicense) : null,
      tradeRegistry: restaurant.tradeRegistry ? decryptDataUrl(restaurant.tradeRegistry) : null,
      identityDocument: restaurant.identityDocument ? decryptDataUrl(restaurant.identityDocument) : null,
    };

    // 5. Log document access
    await logSecurityEvent({
      action: 'DOCUMENTS_ACCESSED',
      userId: session.id,
      userType: 'platform-admin',
      ip: getClientIP(request),
      userAgent: request.headers.get('user-agent') || 'unknown',
      details: {
        restaurantId: params.restaurantId,
        restaurantName: restaurant.name,
      },
      timestamp: new Date(),
    });

    return NextResponse.json({
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      documents: decryptedDocuments,
    });
  } catch (error: any) {
    console.error("Error accessing documents:", error);
    
    await logSecurityEvent({
      action: 'DOCUMENT_ACCESS_ERROR',
      userType: 'platform-admin',
      ip: getClientIP(request),
      userAgent: request.headers.get('user-agent') || 'unknown',
      details: { 
        restaurantId: params.restaurantId,
        error: error?.message 
      },
      timestamp: new Date(),
    });

    return NextResponse.json(
      { error: "Dokümanlara erişilirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
