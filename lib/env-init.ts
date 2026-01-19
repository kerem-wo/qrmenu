/**
 * Initialize and validate environment variables on app startup
 * Import this file at the top of your entry point
 */

import { validateEnv } from "./env";

// Validate environment variables on startup
try {
  validateEnv();
  console.log("✅ Environment variables validated successfully");
} catch (error) {
  console.error(error instanceof Error ? error.message : "Environment validation failed");
  // In production, you might want to exit the process
  if (process.env.NODE_ENV === "production") {
    process.exit(1);
  }
}
