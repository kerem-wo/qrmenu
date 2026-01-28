import { NextRequest } from "next/server";

/**
 * Edge-runtime compatible security helpers.
 *
 * IMPORTANT:
 * - Do NOT import Node-only modules here (e.g. 'crypto', 'fs', Buffer-heavy logic).
 * - Keep this file safe to import from `middleware.ts`.
 */

/**
 * Check if request is from HTTPS (production)
 */
export function requireHTTPS(request: NextRequest): boolean {
  // In development, allow HTTP (return false = HTTPS not required)
  if (process.env.NODE_ENV === "development") {
    return false;
  }

  const protocol =
    request.headers.get("x-forwarded-proto") ||
    (request.url.startsWith("https://") ? "https" : "http");

  return protocol === "https";
}

/**
 * Get client IP address
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  // `request.ip` exists in Next.js types; may be undefined depending on runtime/proxy.
  return (request as any).ip || "unknown";
}

/**
 * Audit log entry
 */
export interface AuditLog {
  action: string;
  userId?: string;
  userType: "admin" | "platform-admin" | "customer" | "anonymous";
  ip: string;
  userAgent: string;
  details?: any;
  timestamp: Date;
}

/**
 * Log security events (Edge-safe)
 */
export async function logSecurityEvent(log: AuditLog) {
  try {
    console.log("[SECURITY AUDIT]", {
      action: log.action,
      userId: log.userId,
      userType: log.userType,
      ip: log.ip,
      userAgent: log.userAgent,
      timestamp: log.timestamp.toISOString(),
      details: log.details,
    });
  } catch (error) {
    console.error("Failed to log security event:", error);
  }
}

