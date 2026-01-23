"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, ShoppingCart, Package } from "lucide-react";
import { checkAuth } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function AnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [period, setPeriod] = useState("7");

  const fetchAnalytics = useCallback(async () => {
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
  }, [period]);

  useEffect(() => {
    checkAuth().then((session) => {
      if (!session) {
        router.push("/admin/login");
      } else {
        fetchAnalytics();
      }
    });
  }, [fetchAnalytics, router]);

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
        </div>
      </header>

      <main className="premium-container py-10">
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
                    <div className="relative">
                      <div className="absolute inset-0 bg-purple-400 rounded-2xl blur-lg opacity-30"></div>
                      <div className="relative w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                        <TrendingUp className="w-7 h-7 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="premium-card p-8 premium-hover-lift animate-premium-fade-in" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">En Çok Satan</p>
                    <p className="text-2xl font-black text-gray-900">
                      {analytics.topProducts[0]?.productName || "Yok"}
                    </p>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-orange-400 rounded-2xl blur-lg opacity-30"></div>
                    <div className="relative w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center">
                      <Package className="w-7 h-7 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Sipariş Durumları */}
            <div className="premium-card p-8 mb-10 animate-premium-fade-in">
              <h2 className="premium-heading-3 mb-6">Sipariş Durumları</h2>
              <div className="premium-grid premium-grid-4">
                {analytics.ordersByStatus.map((item: any, index: number) => (
                  <div key={item.status} className="text-center p-6 bg-gray-50 rounded-xl premium-hover-lift animate-premium-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                    <p className="text-3xl font-black text-gray-900 mb-2">{item._count}</p>
                    <p className="text-sm font-bold text-gray-600 uppercase tracking-wider capitalize">{item.status}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Premium En Çok Satan Ürünler */}
            <div className="premium-card p-8 animate-premium-fade-in">
              <h2 className="premium-heading-3 mb-6">En Çok Satan Ürünler</h2>
              <div className="space-y-3">
                {analytics.topProducts.map((item: any, index: number) => (
                  <div key={item.productId} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl premium-hover-lift animate-premium-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                    <div className="flex items-center gap-4">
                      <span className="text-xl font-black text-gray-400">#{index + 1}</span>
                      <span className="font-bold text-gray-900">{item.productName}</span>
                    </div>
                    <span className="text-gray-600 font-bold">{item.totalQuantity} adet</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
