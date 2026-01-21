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
    
    if (!sessionCookie) {
      return null;
    }
    
    const session = JSON.parse(sessionCookie.value) as PlatformAdminSession;
    
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

export async function setPlatformAdminSession(session: PlatformAdminSession) {
  const cookieStore = cookies();
  cookieStore.set("platform_admin_session", JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}
