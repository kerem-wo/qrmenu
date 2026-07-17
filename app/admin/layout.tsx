"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Ticket,
  QrCode,
  BarChart3,
  Settings,
  LogOut,
  Menu as MenuIcon,
  X,
  ExternalLink,
} from "lucide-react";
import { checkAuth, clearSessionFromStorage } from "@/lib/auth-client";

const AUTH_PAGES = new Set([
  "/admin/login",
  "/admin/forgot-password",
  "/admin/reset-password",
]);

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Panel", icon: LayoutDashboard },
  { href: "/admin/products", label: "Ürünler", icon: Package },
  { href: "/admin/categories", label: "Kategoriler", icon: FolderTree },
  { href: "/admin/orders", label: "Siparişler", icon: ShoppingCart },
  { href: "/admin/campaigns", label: "Kampanyalar", icon: Ticket },
  { href: "/admin/qr", label: "QR Kod", icon: QrCode },
  { href: "/admin/analytics", label: "Analitik", icon: BarChart3 },
  { href: "/admin/settings", label: "Ayarlar", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<{ name?: string; slug?: string } | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAuthPage =
    AUTH_PAGES.has(pathname) || pathname.startsWith("/admin/reset-password/");

  useEffect(() => {
    if (isAuthPage) return;
    (async () => {
      const session = await checkAuth();
      if (!session) return;
      try {
        const res = await fetch("/api/admin/restaurant", { credentials: "include" });
        if (res.ok) setRestaurant(await res.json());
      } catch {
        // silent
      }
    })();
  }, [isAuthPage, pathname]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
      clearSessionFromStorage();
      router.push("/admin/login");
    } catch {
      router.push("/admin/login");
    }
  };

  if (isAuthPage) {
    return <div className="min-h-screen">{children}</div>;
  }

  const isActive = (href: string) =>
    pathname === href || (href !== "/admin/dashboard" && pathname.startsWith(href));

  const sidebarInner = (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="px-6 py-6 border-b border-neutral-200/70">
        <Link href="/admin/dashboard" className="flex items-baseline gap-0">
          <span className="text-2xl font-black tracking-tight" style={{ color: "#FF6F00" }}>
            Rivo
          </span>
          <span className="text-2xl font-black tracking-tight text-neutral-900"> QR</span>
        </Link>
        {restaurant?.name && (
          <div className="mt-2 text-xs font-medium text-neutral-500 truncate">
            {restaurant.name}
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-3 mb-2">
          Yönetim
        </div>
        <ul className="space-y-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={[
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                    active
                      ? "bg-[#FF6F00]/10 text-[#FF6F00]"
                      : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900",
                  ].join(" ")}
                >
                  <Icon className={`h-4 w-4 ${active ? "text-[#FF6F00]" : "text-neutral-400"}`} />
                  <span>{label}</span>
                  {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#FF6F00]" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-neutral-200/70 p-3 space-y-1">
        {restaurant?.slug && (
          <Link
            href={`/menu/${restaurant.slug}`}
            target="_blank"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
          >
            <ExternalLink className="h-4 w-4 text-neutral-400" />
            <span>Menüyü aç</span>
          </Link>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-4 w-4 text-neutral-400" />
          <span>Çıkış</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between bg-white/85 backdrop-blur-md border-b border-neutral-200/70 px-4 py-3">
        <Link href="/admin/dashboard" className="flex items-baseline gap-0">
          <span className="text-lg font-black" style={{ color: "#FF6F00" }}>
            Rivo
          </span>
          <span className="text-lg font-black text-neutral-900"> QR</span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
          aria-label="Menüyü aç"
        >
          <MenuIcon className="h-5 w-5 text-neutral-700" />
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-neutral-200/70 z-30">
        {sidebarInner}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-end p-3 border-b border-neutral-200/70">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-lg hover:bg-neutral-100"
                aria-label="Menüyü kapat"
              >
                <X className="h-5 w-5 text-neutral-700" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{sidebarInner}</div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="lg:pl-64">{children}</main>
    </div>
  );
}
