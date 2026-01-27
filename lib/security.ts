import crypto from 'crypto';
import { NextRequest, NextResponse } from "next/server";
import { getPlatformAdminSession } from "./platform-auth";

/**
 * Rate limiting store (in production, use Redis)
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Rate limiting middleware
 */
export function rateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minute
): boolean {
  const now = Date.now();
  const key = identifier;
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * Clean up old rate limit records
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of Array.from(rateLimitStore.entries())) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean every minute

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(token: string, sessionToken: string): boolean {
  if (!token || !sessionToken) return false;
  return crypto.timingSafeEqual(
    Buffer.from(token),
    Buffer.from(sessionToken)
  );
}

/**
 * Sanitize input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Validate file type by magic bytes (more secure than MIME type)
 */
export function validateFileType(buffer: Buffer, allowedTypes: string[]): boolean {
  // Magic bytes for common file types
  const magicBytes: { [key: string]: number[][] } = {
    'image/jpeg': [[0xFF, 0xD8, 0xFF]],
    'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
    'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
  };

  for (const type of allowedTypes) {
    const signatures = magicBytes[type];
    if (!signatures) continue;

    for (const signature of signatures) {
      if (buffer.length < signature.length) continue;
      
      const matches = signature.every((byte, index) => buffer[index] === byte);
      if (matches) return true;
    }
  }

  return false;
}

/**
 * Check if request is from HTTPS (production)
 */
export function requireHTTPS(request: NextRequest): boolean {
  if (process.env.NODE_ENV === 'development') {
    return true; // Allow HTTP in development
  }

  const protocol = request.headers.get('x-forwarded-proto') || 
                   (request.url.startsWith('https://') ? 'https' : 'http');
  
  return protocol === 'https';
}

/**
 * Get client IP address
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  return request.ip || 'unknown';
}

/**
 * Audit log entry
 */
export interface AuditLog {
  action: string;
  userId?: string;
  userType: 'admin' | 'platform-admin' | 'customer' | 'anonymous';
  ip: string;
  userAgent: string;
  details?: any;
  timestamp: Date;
}

/**
 * Log security events
 */
export async function logSecurityEvent(log: AuditLog) {
  try {
    // In production, send to logging service (e.g., CloudWatch, Datadog)
    console.log('[SECURITY AUDIT]', {
      action: log.action,
      userId: log.userId,
      userType: log.userType,
      ip: log.ip,
      userAgent: log.userAgent,
      timestamp: log.timestamp.toISOString(),
      details: log.details,
    });

    // TODO: Store in database for audit trail
    // await prisma.auditLog.create({ data: { ... } });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

/**
 * Check if user is platform admin (for sensitive operations)
 */
export async function requirePlatformAdmin(request: NextRequest): Promise<boolean> {
  const session = await getPlatformAdminSession();
  if (!session) {
    await logSecurityEvent({
      action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
      userType: 'anonymous',
      ip: getClientIP(request),
      userAgent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date(),
    });
    return false;
  }
  return true;
}
