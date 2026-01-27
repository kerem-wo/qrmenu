"use client";

export interface AdminSession {
  id: string;
  email: string;
  restaurantId: string;
}

export function getSessionFromStorage(): AdminSession | null {
  if (typeof window === "undefined") return null;
  
  try {
    const session = localStorage.getItem("admin_session");
    if (!session) return null;
    return JSON.parse(session) as AdminSession;
  } catch {
    return null;
  }
}

export function setSessionInStorage(session: AdminSession) {
  if (typeof window === "undefined") return;
  localStorage.setItem("admin_session", JSON.stringify(session));
}

export function clearSessionFromStorage() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("admin_session");
}

export async function checkAuth(): Promise<AdminSession | null> {
  try {
    const res = await fetch("/api/admin/me", {
      credentials: 'include',
    });
    if (res.ok) {
      const session = await res.json();
      setSessionInStorage(session);
      return session;
    }
    clearSessionFromStorage();
    return null;
  } catch {
    clearSessionFromStorage();
    return null;
  }
}
