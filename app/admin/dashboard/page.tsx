"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Package, ShoppingCart, Users, Settings } from "lucide-react";
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/admin/settings">
                <Settings className="w-4 h-4 mr-2" />
                Ayarlar
              </Link>
            </Button>
            <Button variant="outline" onClick={() => router.push("/")}>
              Çıkış
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Ürün</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.products}</div>
              <p className="text-xs text-muted-foreground">Aktif ürün sayısı</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Sipariş</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.orders}</div>
              <p className="text-xs text-muted-foreground">Toplam siparişler</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kategoriler</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.categories}</div>
              <p className="text-xs text-muted-foreground">Menü kategorileri</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Ürün Yönetimi</CardTitle>
              <CardDescription>Ürün ekle, düzenle veya sil</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/admin/products">
                  <Plus className="w-4 h-4 mr-2" />
                  Ürünleri Yönet
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kategori Yönetimi</CardTitle>
              <CardDescription>Menü kategorilerini düzenle</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin/categories">
                  <Plus className="w-4 h-4 mr-2" />
                  Kategorileri Yönet
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Siparişler</CardTitle>
              <CardDescription>Gelen siparişleri görüntüle ve yönet</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin/orders">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Siparişleri Görüntüle
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>QR Kod</CardTitle>
              <CardDescription>Menünüzün QR kodunu indirin</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin/qr">
                  <Package className="w-4 h-4 mr-2" />
                  QR Kod Oluştur
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
