import { cookies } from "next/headers";
import { prisma } from "./prisma";

export interface AdminSession {
  id: string;
  email: string;
  restaurantId: string;
}

export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("admin_session");
    
    console.log('getAdminSession - Cookie found:', !!sessionCookie);
    if (!sessionCookie) {
      // Log all cookies for debugging
      const allCookies = cookieStore.getAll();
      console.log('getAdminSession - All cookies:', allCookies.map(c => c.name).join(', '));
      return null;
    }
    
    console.log('getAdminSession - Cookie value length:', sessionCookie.value.length);
    
    // Verify signature
    const crypto = await import('crypto');
    const secret = process.env.SESSION_SECRET || process.env.ENCRYPTION_KEY || 'default-secret-change-in-production';
    
    // Split cookie value - last part is signature, everything before is sessionData
    const lastDotIndex = sessionCookie.value.lastIndexOf('.');
    if (lastDotIndex === -1) {
      // No signature found, try legacy format
      try {
        const session = JSON.parse(sessionCookie.value) as AdminSession;
        const admin = await prisma.admin.findUnique({
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
        const session = JSON.parse(sessionCookie.value) as AdminSession;
        const admin = await prisma.admin.findUnique({
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
      console.error(`Session signature length mismatch - received: ${signature.length}, expected: ${expectedSignature.length}`);
      return null;
    }
    
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      console.error("Session signature verification failed - possible tampering");
      return null;
    }
    
    const session = JSON.parse(sessionData) as AdminSession;
    
    // Verify session is still valid
    const admin = await prisma.admin.findUnique({
      where: { id: session.id },
      select: { id: true },
    });
    
    if (!admin) {
      if (process.env.NODE_ENV === "development") {
        console.log("Admin not found for session:", session.id);
      }
      return null;
    }
    
    return session;
  } catch (error: any) {
    console.error("Error getting admin session:", error?.message || error);
    return null;
  }
}

export async function setAdminSession(session: AdminSession, response?: any) {
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
    
    // If response is provided (NextResponse from route handler), use it
    if (response && response.cookies) {
      response.cookies.set("admin_session", signedSession, {
        httpOnly: true,
        secure: isProduction, // HTTPS only in production
        sameSite: isProduction ? "lax" : "strict", // Lax for better compatibility in production
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
        // Don't set domain - let browser use default (current domain)
      });
    } else {
      // Otherwise use cookies() directly (for server components)
      const cookieStore = await cookies();
      cookieStore.set("admin_session", signedSession, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "lax" : "strict",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });
    }
    
    // Log to help debug
    console.log(`Admin session cookie set - Production: ${isProduction}, Secure: ${isProduction}, SameSite: ${isProduction ? "lax" : "strict"}`);
  } catch (error: any) {
    console.error("Error setting admin session cookie:", error?.message || error);
    throw error;
  }
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
}
