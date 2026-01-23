"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Package, Heart, LogOut } from "lucide-react";
import toast from "react-hot-toast";

interface OrderItemVariant {
  variant: {
    name: string;
    price: number;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  items: Array<{
    quantity: number;
    price: number;
    notes?: string | null;
    product: {
      name: string;
    };
    variants?: OrderItemVariant[];
  }>;
}

export default function CustomerDashboard() {
  const router = useRouter();
  const [customer, setCustomer] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = localStorage.getItem("customer_session");
    if (!session) {
      router.push("/customer/login");
      return;
    }

    const customerData = JSON.parse(session);
    setCustomer(customerData);
    fetchOrders(customerData.id);
    fetchFavorites(customerData.id);
  }, []);

  const fetchOrders = async (customerId: string) => {
    try {
      const res = await fetch(`/api/customer/orders?customerId=${customerId}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async (customerId: string) => {
    try {
      const res = await fetch(`/api/customer/${customerId}`);
      if (res.ok) {
        const data = await res.json();
        setFavorites(data.favorites || []);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("customer_session");
    toast.success("Çıkış yapıldı");
    router.push("/customer/login");
  };

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    preparing: "bg-purple-100 text-purple-800",
    ready: "bg-green-100 text-green-800",
    completed: "bg-gray-100 text-gray-800",
    cancelled: "bg-red-100 text-red-800",
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen premium-bg-gradient">
      <header className="premium-glass sticky top-0 z-50 border-b border-gray-200/50">
        <div className="premium-container">
          <div className="flex justify-between items-center py-5">
            <h1 className="premium-heading-3">Hesabım</h1>
            <Button variant="outline" onClick={handleLogout} className="premium-btn-secondary text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300">
              <LogOut className="w-5 h-5 mr-2" />
              Çıkış Yap
            </Button>
          </div>
        </div>
      </header>

      <main className="premium-container py-10">
        <div className="mb-10">
          <div className="premium-card p-8 animate-premium-fade-in">
            <h2 className="premium-heading-3 mb-4">{customer?.name}</h2>
            {customer?.email && (
              <p className="text-gray-600 font-medium mb-1">{customer.email}</p>
            )}
            {customer?.phone && (
              <p className="text-gray-600 font-medium">{customer.phone}</p>
            )}
          </div>
        </div>

        <div className="premium-grid premium-grid-3 mb-10">
          <div className="premium-card p-8 text-center premium-hover-lift animate-premium-fade-in">
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="absolute inset-0 bg-blue-400 rounded-2xl blur-lg opacity-30"></div>
              <div className="relative w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <ShoppingCart className="w-7 h-7 text-white" />
              </div>
            </div>
            <p className="text-4xl font-black text-gray-900 mb-2">{orders.length}</p>
            <p className="text-sm font-bold text-gray-600 uppercase tracking-wider">Toplam Sipariş</p>
          </div>

          <div className="premium-card p-8 text-center premium-hover-lift animate-premium-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="absolute inset-0 bg-pink-400 rounded-2xl blur-lg opacity-30"></div>
              <div className="relative w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center">
                <Heart className="w-7 h-7 text-white" />
              </div>
            </div>
            <p className="text-4xl font-black text-gray-900 mb-2">{favorites.length}</p>
            <p className="text-sm font-bold text-gray-600 uppercase tracking-wider">Favoriler</p>
          </div>

          <div className="premium-card p-8 text-center premium-hover-lift animate-premium-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="absolute inset-0 bg-green-400 rounded-2xl blur-lg opacity-30"></div>
              <div className="relative w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                <Package className="w-7 h-7 text-white" />
              </div>
            </div>
            <p className="text-4xl font-black text-gray-900 mb-2">
              {orders.filter(o => o.status === "completed").length}
            </p>
            <p className="text-sm font-bold text-gray-600 uppercase tracking-wider">Tamamlanan</p>
          </div>
        </div>

        <div className="premium-card p-8 animate-premium-fade-in">
          <div className="mb-6">
            <h2 className="premium-heading-3 mb-2">Sipariş Geçmişi</h2>
            <p className="text-gray-600 font-medium">Tüm siparişlerinizi buradan görüntüleyebilirsiniz</p>
          </div>
          {orders.length === 0 ? (
            <div className="text-center py-16">
              <div className="relative inline-flex items-center justify-center mb-6">
                <div className="absolute inset-0 bg-gray-200 rounded-3xl blur-xl opacity-30"></div>
                <div className="relative w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center">
                  <ShoppingCart className="w-10 h-10 text-gray-400" />
                </div>
              </div>
              <h3 className="premium-heading-3 mb-4">Henüz sipariş vermediniz</h3>
              <p className="text-gray-600 font-medium">İlk siparişinizi vermek için menü sayfasına gidin</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order, index) => (
                <div
                  key={order.id}
                  className="premium-card p-6 premium-hover-lift animate-premium-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-bold text-gray-900 text-lg">
                        Sipariş #{order.orderNumber}
                      </p>
                      <p className="text-sm text-gray-600 font-medium">
                        {new Date(order.createdAt).toLocaleString("tr-TR")}
                      </p>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-xs font-bold ${
                      statusColors[order.status] || "bg-gray-100 text-gray-800"
                    }`}>
                      {order.status === "pending" && "Beklemede"}
                      {order.status === "confirmed" && "Onaylandı"}
                      {order.status === "preparing" && "Hazırlanıyor"}
                      {order.status === "ready" && "Hazır"}
                      {order.status === "completed" && "Tamamlandı"}
                      {order.status === "cancelled" && "İptal"}
                    </span>
                  </div>
                  <div className="space-y-2 mb-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="text-sm text-gray-700">
                        <p className="font-medium">
                          {item.product.name} x {item.quantity} - {item.price.toFixed(2)} ₺
                        </p>
                        {item.variants && item.variants.length > 0 && (
                          <p className="text-xs text-gray-500 ml-4 font-medium">
                            {item.variants.map((v, vIdx) => (
                              <span key={vIdx}>
                                {v.variant.name}
                                {v.variant.price > 0 && ` (+${v.variant.price.toFixed(2)}₺)`}
                                {vIdx < item.variants!.length - 1 && ", "}
                              </span>
                            ))}
                          </p>
                        )}
                        {item.notes && (
                          <p className="text-xs text-gray-500 ml-4 italic font-medium">
                            Not: {item.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <p className="font-black text-gray-900 text-lg">
                      Toplam: {order.total.toFixed(2)} ₺
                    </p>
                    <Link href={`/order/${order.orderNumber}`}>
                      <Button variant="outline" size="sm" className="premium-btn-secondary">
                        Detaylar
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
