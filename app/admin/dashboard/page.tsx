"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Package, ShoppingCart, Users, Settings, ExternalLink, Copy, QrCode, TrendingUp, Bell, Receipt, X } from "lucide-react";
import { checkAuth, clearSessionFromStorage } from "@/lib/auth-client";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    categories: 0,
  });
  const [tableRequests, setTableRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const session = await checkAuth();
      if (!session) {
        router.push("/admin/login");
        return;
      }

      // Load restaurant info
      const restaurantRes = await fetch("/api/admin/restaurant");
      if (restaurantRes.ok) {
        const restaurantData = await restaurantRes.json();
        setRestaurant(restaurantData);
      }

      // Load stats
      const [productsRes, categoriesRes, ordersRes] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/admin/categories"),
        fetch("/api/admin/orders"),
      ]);

      if (productsRes.ok) {
        const products = await productsRes.json();
        setStats((prev) => ({ ...prev, products: products.length }));
      }

      if (categoriesRes.ok) {
        const categories = await categoriesRes.json();
        setStats((prev) => ({ ...prev, categories: categories.length }));
      }

      if (ordersRes.ok) {
        const orders = await ordersRes.json();
        setStats((prev) => ({ ...prev, orders: orders.length }));
      }

      // Load table requests
      const requestsRes = await fetch("/api/table-requests");
      if (requestsRes.ok) {
        const requests = await requestsRes.json();
        setTableRequests(requests);
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
      toast.error("Veriler yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const markRequestAsRead = async (requestId: string) => {
    try {
      const res = await fetch(`/api/table-requests/${requestId}`, {
        method: "PATCH",
      });
      if (res.ok) {
        setTableRequests((prev) => prev.filter((r) => r.id !== requestId));
        toast.success("İstek okundu olarak işaretlendi");
      }
    } catch (error) {
      console.error("Error marking request as read:", error);
      toast.error("Bir hata oluştu");
    }
  };

  useEffect(() => {
    // Poll for new table requests every 5 seconds
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/table-requests");
        if (res.ok) {
          const requests = await res.json();
          const newRequests = requests.filter(
            (r: any) => !tableRequests.find((tr) => tr.id === r.id)
          );
          if (newRequests.length > 0) {
            setTableRequests((prev) => [...newRequests, ...prev]);
            newRequests.forEach((req: any) => {
              toast.success(
                req.type === "waiter"
                  ? "Yeni garson çağrısı!"
                  : "Yeni hesap isteği!",
                { duration: 5000 }
              );
            });
          }
        }
      } catch (error) {
        console.error("Error polling table requests:", error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [tableRequests]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      clearSessionFromStorage();
      router.push("/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;
  }

  return (
    <div className="min-h-screen premium-bg-gradient">
      {/* Premium Header */}
      <header className="premium-glass sticky top-0 z-50 border-b border-gray-200/50">
        <div className="premium-container">
          <div className="flex justify-between items-center py-5">
            <div>
              <h1 className="premium-heading-3 text-gray-900">
                {restaurant?.name || 'Admin Panel'}
              </h1>
              {restaurant?.slug && (
                <p className="text-sm text-gray-600 mt-2 font-medium">
                  Menü Linki: <span className="font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded-lg">/menu/{restaurant.slug}</span>
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" asChild className="premium-btn-secondary text-sm px-5 py-2.5">
                <Link href="/admin/settings">
                  <Settings className="w-4 h-4 mr-2" />
                  Ayarlar
                </Link>
              </Button>
              <Button variant="outline" onClick={handleLogout} className="premium-btn-secondary text-sm px-5 py-2.5">
                Çıkış
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="premium-container py-10">
        {/* Table Requests Alerts */}
        {tableRequests.length > 0 && (
          <div className="mb-6 space-y-3">
            {tableRequests.map((request) => (
              <div
                key={request.id}
                className="premium-card p-5 border-l-4 border-orange-500 bg-orange-50 animate-premium-fade-in"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {request.type === "waiter" ? (
                      <Bell className="w-6 h-6 text-orange-600 mt-1" />
                    ) : (
                      <Receipt className="w-6 h-6 text-orange-600 mt-1" />
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">
                        {request.type === "waiter" ? "Garson Çağrısı" : "Hesap İsteği"}
                      </h3>
                      {request.tableNumber && (
                        <p className="text-sm text-gray-600 mb-2">
                          Masa: {request.tableNumber}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        {new Date(request.createdAt).toLocaleString("tr-TR")}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => markRequestAsRead(request.id)}
                    className="ml-4 p-2 hover:bg-orange-100 rounded-full transition-colors"
                    title="Okundu olarak işaretle"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Premium Stats Cards */}
        <div className="premium-grid premium-grid-3 mb-10">
          <div className="premium-card p-8 premium-hover-lift animate-premium-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider">Toplam Ürün</h3>
              <div className="relative">
                <div className="absolute inset-0 bg-blue-400 rounded-2xl blur-lg opacity-30"></div>
                <div className="relative w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Package className="h-7 w-7 text-white" />
                </div>
              </div>
            </div>
            <div className="text-5xl font-black text-gray-900 mb-2">{stats.products}</div>
            <p className="text-sm text-gray-500 font-medium">Aktif ürün sayısı</p>
          </div>

          <div className="premium-card p-8 premium-hover-lift animate-premium-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider">Toplam Sipariş</h3>
              <div className="relative">
                <div className="absolute inset-0 bg-green-400 rounded-2xl blur-lg opacity-30"></div>
                <div className="relative w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <ShoppingCart className="h-7 w-7 text-white" />
                </div>
              </div>
            </div>
            <div className="text-5xl font-black text-gray-900 mb-2">{stats.orders}</div>
            <p className="text-sm text-gray-500 font-medium">Toplam siparişler</p>
          </div>

          <div className="premium-card p-8 premium-hover-lift animate-premium-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider">Kategoriler</h3>
              <div className="relative">
                <div className="absolute inset-0 bg-purple-400 rounded-2xl blur-lg opacity-30"></div>
                <div className="relative w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Users className="h-7 w-7 text-white" />
                </div>
              </div>
            </div>
            <div className="text-5xl font-black text-gray-900 mb-2">{stats.categories}</div>
            <p className="text-sm text-gray-500 font-medium">Menü kategorileri</p>
          </div>
        </div>

        {/* Premium Restaurant Links Section */}
        {restaurant && (
          <div className="premium-card p-8 mb-10 animate-premium-fade-in">
            <div className="mb-6">
              <h2 className="premium-heading-3 mb-2">Restoran Linkleri</h2>
              <p className="text-gray-600 font-medium">
                Müşterileriniz bu linkleri kullanarak menünüze erişebilir
              </p>
            </div>
            <div className="premium-grid premium-grid-2 gap-6 mb-6">
              {/* Menü Linki */}
              <div className="premium-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Menü Linki</h3>
                  <ExternalLink className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={typeof window !== "undefined" ? `${window.location.origin}/menu/${restaurant.slug}` : `/menu/${restaurant.slug}`}
                    readOnly
                    className="premium-input text-sm font-mono flex-1"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const menuUrl = typeof window !== "undefined" ? `${window.location.origin}/menu/${restaurant.slug}` : `/menu/${restaurant.slug}`;
                      navigator.clipboard.writeText(menuUrl);
                      toast.success("Menü linki kopyalandı!");
                    }}
                    className="premium-btn-secondary px-4 py-2"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    asChild
                    className="premium-btn-secondary px-4 py-2"
                  >
                    <Link href={`/menu/${restaurant.slug}`} target="_blank">
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Admin Panel Linki */}
              <div className="premium-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Admin Panel Linki</h3>
                  <Settings className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={typeof window !== "undefined" ? `${window.location.origin}/admin/login` : `/admin/login`}
                    readOnly
                    className="premium-input text-sm font-mono flex-1"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const adminUrl = typeof window !== "undefined" ? `${window.location.origin}/admin/login` : `/admin/login`;
                      navigator.clipboard.writeText(adminUrl);
                      toast.success("Admin panel linki kopyalandı!");
                    }}
                    className="premium-btn-secondary px-4 py-2"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* QR Kod Hızlı Erişim */}
            <Button asChild className="premium-btn-primary w-full">
              <Link href="/admin/qr">
                <QrCode className="w-5 h-5 mr-2" />
                QR Kod Oluştur ve İndir
              </Link>
            </Button>
          </div>
        )}

        {/* Premium Quick Actions */}
        <div className="premium-grid premium-grid-2">
          <div className="premium-card p-8 premium-hover-lift group">
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-400 rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                  <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="premium-heading-3">Ürün Yönetimi</h3>
              </div>
              <p className="text-gray-600 font-medium">Ürün ekle, düzenle veya sil</p>
            </div>
            <Button asChild className="premium-btn-primary w-full">
              <Link href="/admin/products">
                <Plus className="w-5 h-5 mr-2" />
                Ürünleri Yönet
              </Link>
            </Button>
          </div>

          <div className="premium-card p-8 premium-hover-lift group">
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-purple-400 rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                  <div className="relative w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="premium-heading-3">Kategori Yönetimi</h3>
              </div>
              <p className="text-gray-600 font-medium">Menü kategorilerini düzenle</p>
            </div>
            <Button asChild className="premium-btn-secondary w-full">
              <Link href="/admin/categories">
                <Plus className="w-5 h-5 mr-2" />
                Kategorileri Yönet
              </Link>
            </Button>
          </div>

          <div className="premium-card p-8 premium-hover-lift group">
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-400 rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                  <div className="relative w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="premium-heading-3">Siparişler</h3>
              </div>
              <p className="text-gray-600 font-medium">Gelen siparişleri görüntüle ve yönet</p>
            </div>
            <Button asChild className="premium-btn-secondary w-full">
              <Link href="/admin/orders">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Siparişleri Görüntüle
              </Link>
            </Button>
          </div>

          <div className="premium-card p-8 premium-hover-lift group">
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-400 rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                  <div className="relative w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <QrCode className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="premium-heading-3">QR Kod</h3>
              </div>
              <p className="text-gray-600 font-medium">Menünüzün QR kodunu indirin</p>
            </div>
            <Button asChild className="premium-btn-secondary w-full">
              <Link href="/admin/qr">
                <Package className="w-5 h-5 mr-2" />
                QR Kod Oluştur
              </Link>
            </Button>
          </div>

          <div className="premium-card p-8 premium-hover-lift group">
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-pink-400 rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                  <div className="relative w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="premium-heading-3">Kampanyalar</h3>
              </div>
              <p className="text-gray-600 font-medium">Kupon kodları ve indirimler oluştur</p>
            </div>
            <Button asChild className="premium-btn-secondary w-full">
              <Link href="/admin/campaigns">
                <Plus className="w-5 h-5 mr-2" />
                Kampanyaları Yönet
              </Link>
            </Button>
          </div>

          <div className="premium-card p-8 premium-hover-lift group">
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-orange-400 rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                  <div className="relative w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="premium-heading-3">Analitik & Raporlar</h3>
              </div>
              <p className="text-gray-600 font-medium">Satış istatistikleri ve raporlar</p>
            </div>
            <Button asChild className="premium-btn-secondary w-full">
              <Link href="/admin/analytics">
                <Users className="w-5 h-5 mr-2" />
                Raporları Görüntüle
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
