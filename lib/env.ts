import { z } from "zod";

/**
 * Environment variables schema
 */
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // NextAuth
  NEXTAUTH_SECRET: z.string().min(32, "NEXTAUTH_SECRET must be at least 32 characters"),
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL must be a valid URL"),

  // Node Environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // Cloudinary (optional)
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // Stripe (optional - only needed if using payment)
  STRIPE_SECRET_KEY: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  NEXT_PUBLIC_BASE_URL: z.string().url().optional(),

  // Socket.io (optional)
  NEXT_PUBLIC_SOCKET_URL: z.string().url().optional().or(z.literal("")),
});

/**
 * Validate environment variables on startup
 */
export function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("\n");
      throw new Error(
        `❌ Environment variables validation failed:\n${missingVars}\n\nPlease check your .env file.`
      );
    }
    throw error;
  }
}

/**
 * Get validated environment variables
 */
export const env = validateEnv();

/**
 * Type-safe environment variable access
 */
export function getEnv() {
  return env;
}
