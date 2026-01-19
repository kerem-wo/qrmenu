import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { setAdminSession } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { createApiHandler, getValidatedBody } from "@/lib/api-handler";
import { successResponse, errorResponse, unauthorizedResponse } from "@/lib/api-response";
import { adminLoginSchema } from "@/lib/validation";
import { logger } from "@/lib/logger";
import { authRateLimit } from "@/middleware/rate-limit";
import { UnauthorizedError } from "@/lib/errors";

async function POSTHandler(req: NextRequest) {
  const validatedData = getValidatedBody(req);
  const { email, password } = validatedData;

  const admin = await prisma.admin.findUnique({
    where: { email },
    include: { restaurant: true },
  });

  if (!admin) {
    throw new UnauthorizedError("Geçersiz e-posta veya şifre");
  }

  const isValid = await bcrypt.compare(password, admin.password);

  if (!isValid) {
    throw new UnauthorizedError("Geçersiz e-posta veya şifre");
  }

  const session = {
    id: admin.id,
    email: admin.email,
    restaurantId: admin.restaurantId,
  };

  await setAdminSession(session);

  logger.info("Admin logged in", { adminId: admin.id, email: admin.email });
  return successResponse({
    success: true,
    admin: session,
  }, "Giriş başarılı");
}

export const POST = createApiHandler(POSTHandler, {
  validate: { body: adminLoginSchema },
  rateLimit: authRateLimit,
});
