import { cookies } from "next/headers";
import { prisma } from "./prisma";

export interface AdminSession {
  id: string;
  email: string;
  restaurantId: string;
}

export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get("admin_session");
    
    if (!sessionCookie) {
      if (process.env.NODE_ENV === "development") {
        console.log("No admin_session cookie found");
      }
      return null;
    }
    
    // Verify signature
    const crypto = await import('crypto');
    const secret = process.env.SESSION_SECRET || process.env.ENCRYPTION_KEY || 'default-secret-change-in-production';
    const [sessionData, signature] = sessionCookie.value.split('.');
    
    if (!signature) {
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

export async function setAdminSession(session: AdminSession) {
  try {
    const cookieStore = cookies();
    
    // Sign session with secret to prevent tampering
    const crypto = await import('crypto');
    const secret = process.env.SESSION_SECRET || process.env.ENCRYPTION_KEY || 'default-secret-change-in-production';
    const sessionData = JSON.stringify(session);
    const signature = crypto.createHmac('sha256', secret)
      .update(sessionData)
      .digest('hex');
    const signedSession = `${sessionData}.${signature}`;
    
    cookieStore.set("admin_session", signedSession, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "strict", // CSRF protection
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
    
    // Log in development to help debug
    if (process.env.NODE_ENV === "development") {
      console.log("Session cookie set successfully");
    }
  } catch (error: any) {
    console.error("Error setting admin session cookie:", error?.message || error);
    // Don't throw - let caller decide what to do
    // In production, this might fail due to cookie settings
    throw error;
  }
}

export async function clearAdminSession() {
  const cookieStore = cookies();
  cookieStore.delete("admin_session");
}
