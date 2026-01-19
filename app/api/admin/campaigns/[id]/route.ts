import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { createApiHandler, getValidatedBody } from "@/lib/api-handler";
import { successResponse, notFoundResponse, unauthorizedResponse } from "@/lib/api-response";
import { updateCampaignSchema } from "@/lib/validation";
import { logger } from "@/lib/logger";
import { authRateLimit } from "@/middleware/rate-limit";
import { ConflictError, NotFoundError } from "@/lib/errors";

async function GETHandler(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return unauthorizedResponse("Unauthorized");
  }

  const { id } = await params;
  const campaign = await prisma.campaign.findFirst({
    where: {
      id,
      restaurantId: session.restaurantId,
    },
  });

  if (!campaign) {
    return notFoundResponse("Kampanya bulunamadı");
  }

  return successResponse(campaign);
}

async function PUTHandler(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return unauthorizedResponse("Unauthorized");
  }

  const { id } = await params;
  const validatedData = getValidatedBody(req);

  // Verify campaign belongs to restaurant
  const existingCampaign = await prisma.campaign.findFirst({
    where: {
      id,
      restaurantId: session.restaurantId,
    },
  });

  if (!existingCampaign) {
    throw new NotFoundError("Kampanya bulunamadı");
  }

  // Check if code is being changed and if it's unique
  if (validatedData.code && validatedData.code.toUpperCase() !== existingCampaign.code) {
    const codeExists = await prisma.campaign.findFirst({
      where: {
        code: validatedData.code.toUpperCase(),
        id: { not: id },
      },
    });

    if (codeExists) {
      throw new ConflictError("Bu kupon kodu zaten kullanılıyor");
    }
  }

  const updateData: any = {};
  if (validatedData.name !== undefined) updateData.name = validatedData.name;
  if (validatedData.code !== undefined) updateData.code = validatedData.code.toUpperCase();
  if (validatedData.type !== undefined) updateData.type = validatedData.type;
  if (validatedData.value !== undefined) updateData.value = validatedData.value;
  if (validatedData.minAmount !== undefined) updateData.minAmount = validatedData.minAmount;
  if (validatedData.maxDiscount !== undefined) updateData.maxDiscount = validatedData.maxDiscount;
  if (validatedData.startDate !== undefined) updateData.startDate = new Date(validatedData.startDate);
  if (validatedData.endDate !== undefined) updateData.endDate = new Date(validatedData.endDate);
  if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive;
  if (validatedData.usageLimit !== undefined) updateData.usageLimit = validatedData.usageLimit;

  const campaign = await prisma.campaign.updateMany({
    where: {
      id,
      restaurantId: session.restaurantId,
    },
    data: updateData,
  });

  if (campaign.count === 0) {
    throw new NotFoundError("Kampanya bulunamadı");
  }

  const updatedCampaign = await prisma.campaign.findUnique({
    where: { id },
  });

  logger.info("Campaign updated", { campaignId: id, restaurantId: session.restaurantId });
  return successResponse(updatedCampaign, "Kampanya başarıyla güncellendi");
}

async function DELETEHandler(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return unauthorizedResponse("Unauthorized");
  }

  const { id } = await params;
  
  const campaign = await prisma.campaign.findFirst({
    where: {
      id,
      restaurantId: session.restaurantId,
    },
  });

  if (!campaign) {
    return notFoundResponse("Kampanya bulunamadı");
  }

  await prisma.campaign.deleteMany({
    where: {
      id,
      restaurantId: session.restaurantId,
    },
  });

  logger.info("Campaign deleted", { campaignId: id, restaurantId: session.restaurantId });
  return successResponse({ success: true }, "Kampanya başarıyla silindi");
}

export const GET = createApiHandler(GETHandler, {
  requireAuth: true,
  rateLimit: authRateLimit,
});

export const PUT = createApiHandler(PUTHandler, {
  requireAuth: true,
  validate: { body: updateCampaignSchema },
  rateLimit: authRateLimit,
});

export const DELETE = createApiHandler(DELETEHandler, {
  requireAuth: true,
  rateLimit: authRateLimit,
});
