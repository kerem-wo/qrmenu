import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export interface PlatformAdminSession {
  id: string;
  email: string;
  name: string;
}

export async function getPlatformAdminSession(): Promise<PlatformAdminSession | null> {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get("platform_admin_session");
    
    console.log('getPlatformAdminSession - Cookie found:', !!sessionCookie);
    if (!sessionCookie) {
      // Log all cookies for debugging
      const allCookies = cookieStore.getAll();
      console.log('getPlatformAdminSession - All cookies:', allCookies.map(c => c.name).join(', '));
      return null;
    }
    
    console.log('getPlatformAdminSession - Cookie value length:', sessionCookie.value.length);
    
    // Verify signature
    const crypto = await import('crypto');
    const secret = process.env.SESSION_SECRET || process.env.ENCRYPTION_KEY || 'default-secret-change-in-production';
    
    // Split cookie value - last part is signature, everything before is sessionData
    const lastDotIndex = sessionCookie.value.lastIndexOf('.');
    if (lastDotIndex === -1) {
      // No signature found, try legacy format
      try {
        const session = JSON.parse(sessionCookie.value) as PlatformAdminSession;
        const admin = await prisma.platformAdmin.findUnique({
          where: { id: session.id },
          select: { id: true },
        });
        return admin ? session : null;
      } catch {
        return null;
      }
    }
    
    const sessionData = sessionCookie.value.substring(0, lastDotIndex);
    const signature = sessionCookie.value.substring(lastDotIndex + 1).trim();
    
    if (!signature || !sessionData) {
      // Legacy session format (backward compatibility)
      try {
        const session = JSON.parse(sessionCookie.value) as PlatformAdminSession;
        const admin = await prisma.platformAdmin.findUnique({
          where: { id: session.id },
          select: { id: true },
        });
        return admin ? session : null;
      } catch {
        return null;
      }
    }
    
    // Verify signature
    const expectedSignature = crypto.createHmac('sha256', secret)
      .update(sessionData)
      .digest('hex');
    
    // Check signature length first (timingSafeEqual requires same length)
    if (signature.length !== expectedSignature.length) {
      console.error(`Platform admin session signature length mismatch - received: ${signature.length}, expected: ${expectedSignature.length}`);
      return null;
    }
    
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      console.error("Platform admin session signature verification failed - possible tampering");
      return null;
    }
    
    const session = JSON.parse(sessionData) as PlatformAdminSession;
    
    // Verify session is still valid
    const admin = await prisma.platformAdmin.findUnique({
      where: { id: session.id },
      select: { id: true },
    });
    
    if (!admin) {
      return null;
    }
    
    return session;
  } catch (error) {
    console.error("Error getting platform admin session:", error);
    return null;
  }
}

export async function setPlatformAdminSession(session: PlatformAdminSession, response?: Response) {
  try {
    // Sign session with secret to prevent tampering
    const crypto = await import('crypto');
    const secret = process.env.SESSION_SECRET || process.env.ENCRYPTION_KEY || 'default-secret-change-in-production';
    const sessionData = JSON.stringify(session);
    const signature = crypto.createHmac('sha256', secret)
      .update(sessionData)
      .digest('hex');
    const signedSession = `${sessionData}.${signature}`;
    
    // Check if we're in production (Vercel sets VERCEL=1)
    const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
    
    // If response is provided, use it (for route handlers)
    if (response && 'cookies' in response) {
      (response as any).cookies.set("platform_admin_session", signedSession, {
        httpOnly: true,
        secure: isProduction, // HTTPS only in production
        sameSite: isProduction ? "lax" : "strict", // Lax for better compatibility in production
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
        // Don't set domain - let browser use default (current domain)
      });
    } else {
      // Otherwise use cookies() directly (for server components)
      const cookieStore = cookies();
      cookieStore.set("platform_admin_session", signedSession, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "lax" : "strict",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });
    }
    
    // Log to help debug
    console.log(`Platform admin session cookie set - Production: ${isProduction}, Secure: ${isProduction}, SameSite: ${isProduction ? "lax" : "strict"}`);
  } catch (error) {
    console.error("Error setting platform admin session cookie:", error);
    throw error;
  }
}
