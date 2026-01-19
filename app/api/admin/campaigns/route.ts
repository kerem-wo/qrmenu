import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { createApiHandler, getValidatedBody } from "@/lib/api-handler";
import { successResponse, errorResponse, unauthorizedResponse, internalErrorResponse } from "@/lib/api-response";
import { createCampaignSchema } from "@/lib/validation";
import { logger } from "@/lib/logger";
import { authRateLimit } from "@/middleware/rate-limit";
import { ConflictError } from "@/lib/errors";

async function GETHandler(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return unauthorizedResponse("Unauthorized");
  }

  const campaigns = await prisma.campaign.findMany({
    where: { restaurantId: session.restaurantId },
    orderBy: { createdAt: "desc" },
  });

  return successResponse(campaigns);
}

async function POSTHandler(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return unauthorizedResponse("Unauthorized");
  }

  const validatedData = getValidatedBody(req);

  try {
    const campaign = await prisma.campaign.create({
      data: {
        name: validatedData.name,
        code: validatedData.code.toUpperCase(),
        type: validatedData.type,
        value: validatedData.value,
        minAmount: validatedData.minAmount || null,
        maxDiscount: validatedData.maxDiscount || null,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
        isActive: validatedData.isActive ?? true,
        usageLimit: validatedData.usageLimit || null,
        restaurantId: session.restaurantId,
      },
    });

    logger.info("Campaign created", { campaignId: campaign.id, restaurantId: session.restaurantId });
    return successResponse(campaign, "Kampanya başarıyla oluşturuldu", 201);
  } catch (error: any) {
    logger.error("Error creating campaign", error);
    if (error.code === "P2002") {
      throw new ConflictError("Bu kupon kodu zaten kullanılıyor");
    }
    throw error;
  }
}

export const GET = createApiHandler(GETHandler, {
  requireAuth: true,
  rateLimit: authRateLimit,
});

export const POST = createApiHandler(POSTHandler, {
  requireAuth: true,
  validate: { body: createCampaignSchema },
  rateLimit: authRateLimit,
});
