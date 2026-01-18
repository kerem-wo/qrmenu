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
    
    if (!sessionCookie) return null;
    
    const session = JSON.parse(sessionCookie.value) as AdminSession;
    
    // Verify session is still valid
    const admin = await prisma.admin.findUnique({
      where: { id: session.id },
    });
    
    if (!admin) return null;
    
    return session;
  } catch {
    return null;
  }
}

export async function setAdminSession(session: AdminSession) {
  const cookieStore = cookies();
  cookieStore.set("admin_session", JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearAdminSession() {
  const cookieStore = cookies();
  cookieStore.delete("admin_session");
}
