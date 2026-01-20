"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Package, ShoppingCart, Users, Settings, ExternalLink, Copy, QrCode } from "lucide-react";
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
    } catch (error) {
      console.error("Error loading dashboard:", error);
      toast.error("Veriler yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {restaurant?.name || 'Admin Panel'}
            </h1>
            {restaurant?.slug && (
              <p className="text-sm text-slate-600 mt-1">
                Menü Linki: <span className="font-mono text-slate-900">/menu/{restaurant.slug}</span>
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild className="border-slate-300">
              <Link href="/admin/settings">
                <Settings className="w-4 h-4 mr-2" />
                Ayarlar
              </Link>
            </Button>
            <Button variant="outline" onClick={handleLogout} className="border-slate-300">
              Çıkış
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="card-modern">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Toplam Ürün</CardTitle>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.products}</div>
              <p className="text-xs text-slate-600 mt-1">Aktif ürün sayısı</p>
            </CardContent>
          </Card>

          <Card className="card-modern">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Toplam Sipariş</CardTitle>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.orders}</div>
              <p className="text-xs text-slate-600 mt-1">Toplam siparişler</p>
            </CardContent>
          </Card>

          <Card className="card-modern">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Kategoriler</CardTitle>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.categories}</div>
              <p className="text-xs text-slate-600 mt-1">Menü kategorileri</p>
            </CardContent>
          </Card>
        </div>

        {/* Restaurant Links Section */}
        {restaurant && (
          <Card className="card-modern mb-8">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">Restoran Linkleri</CardTitle>
              <CardDescription className="text-slate-600">
                Müşterileriniz bu linkleri kullanarak menünüze erişebilir
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Menü Linki */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-slate-900 text-sm">Menü Linki</h3>
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={typeof window !== "undefined" ? `${window.location.origin}/menu/${restaurant.slug}` : `/menu/${restaurant.slug}`}
                      readOnly
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm font-mono focus:outline-none"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const menuUrl = typeof window !== "undefined" ? `${window.location.origin}/menu/${restaurant.slug}` : `/menu/${restaurant.slug}`;
                        navigator.clipboard.writeText(menuUrl);
                        toast.success("Menü linki kopyalandı!");
                      }}
                      className="border-slate-300"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      className="border-slate-300"
                    >
                      <Link href={`/menu/${restaurant.slug}`} target="_blank">
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Admin Panel Linki */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-slate-900 text-sm">Admin Panel Linki</h3>
                    <Settings className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={typeof window !== "undefined" ? `${window.location.origin}/admin/login` : `/admin/login`}
                      readOnly
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm font-mono focus:outline-none"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const adminUrl = typeof window !== "undefined" ? `${window.location.origin}/admin/login` : `/admin/login`;
                        navigator.clipboard.writeText(adminUrl);
                        toast.success("Admin panel linki kopyalandı!");
                      }}
                      className="border-slate-300"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* QR Kod Hızlı Erişim */}
              <div className="flex gap-3 pt-2">
                <Button asChild variant="outline" className="flex-1 border-slate-300">
                  <Link href="/admin/qr">
                    <QrCode className="w-4 h-4 mr-2" />
                    QR Kod Oluştur ve İndir
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="card-modern">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">Ürün Yönetimi</CardTitle>
              <CardDescription className="text-slate-600">Ürün ekle, düzenle veya sil</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-slate-900 hover:bg-slate-800">
                <Link href="/admin/products">
                  <Plus className="w-4 h-4 mr-2" />
                  Ürünleri Yönet
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="card-modern">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">Kategori Yönetimi</CardTitle>
              <CardDescription className="text-slate-600">Menü kategorilerini düzenle</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full border-slate-300">
                <Link href="/admin/categories">
                  <Plus className="w-4 h-4 mr-2" />
                  Kategorileri Yönet
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="card-modern">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">Siparişler</CardTitle>
              <CardDescription className="text-slate-600">Gelen siparişleri görüntüle ve yönet</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full border-slate-300">
                <Link href="/admin/orders">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Siparişleri Görüntüle
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="card-modern">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">QR Kod</CardTitle>
              <CardDescription className="text-slate-600">Menünüzün QR kodunu indirin</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full border-slate-300">
                <Link href="/admin/qr">
                  <Package className="w-4 h-4 mr-2" />
                  QR Kod Oluştur
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="card-modern">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">Kampanyalar</CardTitle>
              <CardDescription className="text-slate-600">Kupon kodları ve indirimler oluştur</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full border-slate-300">
                <Link href="/admin/campaigns">
                  <Plus className="w-4 h-4 mr-2" />
                  Kampanyaları Yönet
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="card-modern">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">Analitik & Raporlar</CardTitle>
              <CardDescription className="text-slate-600">Satış istatistikleri ve raporlar</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full border-slate-300">
                <Link href="/admin/analytics">
                  <Users className="w-4 h-4 mr-2" />
                  Raporları Görüntüle
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
