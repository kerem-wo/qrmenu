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
    
    const session = JSON.parse(sessionCookie.value) as AdminSession;
    
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
    const cookieValue = JSON.stringify(session);
    
    cookieStore.set("admin_session", cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
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
