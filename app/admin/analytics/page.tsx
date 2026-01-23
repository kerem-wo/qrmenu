"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, ShoppingCart, Package } from "lucide-react";
import { checkAuth } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function AnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [period, setPeriod] = useState("7");

  useEffect(() => {
    checkAuth().then((session) => {
      if (!session) {
        router.push("/admin/login");
        return;
      }
      fetchAnalytics();
    });
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`/api/admin/analytics?period=${period}`);
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen premium-bg-gradient">
      <header className="premium-glass sticky top-0 z-50 border-b border-gray-200/50">
        <div className="premium-container">
          <div className="flex justify-between items-center py-5">
            <h1 className="premium-heading-3">Analitik & Raporlar</h1>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="premium-input px-6 py-2.5 max-w-xs"
            >
            <option value="7">Son 7 Gün</option>
            <option value="30">Son 30 Gün</option>
            <option value="90">Son 90 Gün</option>
          </select>
        </div>

        {analytics && (
          <>
            {/* Premium İstatistik Kartları */}
            <div className="premium-grid premium-grid-4 mb-10">
              <div className="premium-card p-8 premium-hover-lift animate-premium-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Toplam Sipariş</p>
                    <p className="text-4xl font-black text-gray-900">{analytics.totalOrders}</p>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-400 rounded-2xl blur-lg opacity-30"></div>
                    <div className="relative w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                      <ShoppingCart className="w-7 h-7 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="premium-card p-8 premium-hover-lift animate-premium-fade-in" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Toplam Gelir</p>
                    <p className="text-4xl font-black text-gray-900">
                      {analytics.totalRevenue.toFixed(2)} ₺
                    </p>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-green-400 rounded-2xl blur-lg opacity-30"></div>
                    <div className="relative w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                      <DollarSign className="w-7 h-7 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="premium-card p-8 premium-hover-lift animate-premium-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Ortalama Sipariş</p>
                    <p className="text-4xl font-black text-gray-900">
                      {analytics.avgOrderValue.toFixed(2)} ₺
                    </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="card-modern">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">En Çok Satan</p>
                      <p className="text-lg font-bold text-slate-900">
                        {analytics.topProducts[0]?.productName || "Yok"}
                      </p>
                    </div>
                    <Package className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sipariş Durumları */}
            <Card className="card-modern mb-8">
              <CardHeader>
                <CardTitle>Sipariş Durumları</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  {analytics.ordersByStatus.map((item: any) => (
                    <div key={item.status} className="text-center p-4 bg-slate-50 rounded-lg">
                      <p className="text-2xl font-bold text-slate-900">{item._count}</p>
                      <p className="text-sm text-slate-600 capitalize">{item.status}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* En Çok Satan Ürünler */}
            <Card className="card-modern">
              <CardHeader>
                <CardTitle>En Çok Satan Ürünler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.topProducts.map((item: any, index: number) => (
                    <div key={item.productId} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-slate-400">#{index + 1}</span>
                        <span className="font-medium text-slate-900">{item.productName}</span>
                      </div>
                      <span className="text-slate-600">{item.totalQuantity} adet</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
