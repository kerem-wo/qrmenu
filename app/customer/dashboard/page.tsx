"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Package, Heart, LogOut } from "lucide-react";
import toast from "react-hot-toast";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  items: Array<{
    quantity: number;
    price: number;
    product: {
      name: string;
    };
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
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900">Hesabım</h1>
          <Button variant="outline" onClick={handleLogout} className="text-red-600 hover:text-red-700">
            <LogOut className="w-4 h-4 mr-2" />
            Çıkış Yap
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <Card className="card-modern">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-2">{customer?.name}</h2>
              {customer?.email && (
                <p className="text-slate-600">{customer.email}</p>
              )}
              {customer?.phone && (
                <p className="text-slate-600">{customer.phone}</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="card-modern">
            <CardContent className="p-6 text-center">
              <ShoppingCart className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-900">{orders.length}</p>
              <p className="text-sm text-slate-600">Toplam Sipariş</p>
            </CardContent>
          </Card>

          <Card className="card-modern">
            <CardContent className="p-6 text-center">
              <Heart className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-900">{favorites.length}</p>
              <p className="text-sm text-slate-600">Favoriler</p>
            </CardContent>
          </Card>

          <Card className="card-modern">
            <CardContent className="p-6 text-center">
              <Package className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-900">
                {orders.filter(o => o.status === "completed").length}
              </p>
              <p className="text-sm text-slate-600">Tamamlanan</p>
            </CardContent>
          </Card>
        </div>

        <Card className="card-modern">
          <CardHeader>
            <CardTitle>Sipariş Geçmişi</CardTitle>
            <CardDescription>Tüm siparişlerinizi buradan görüntüleyebilirsiniz</CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 mb-4">Henüz sipariş vermediniz</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-slate-900">
                          Sipariş #{order.orderNumber}
                        </p>
                        <p className="text-sm text-slate-600">
                          {new Date(order.createdAt).toLocaleString("tr-TR")}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        statusColors[order.status] || "bg-slate-100 text-slate-800"
                      }`}>
                        {order.status === "pending" && "Beklemede"}
                        {order.status === "confirmed" && "Onaylandı"}
                        {order.status === "preparing" && "Hazırlanıyor"}
                        {order.status === "ready" && "Hazır"}
                        {order.status === "completed" && "Tamamlandı"}
                        {order.status === "cancelled" && "İptal"}
                      </span>
                    </div>
                    <div className="space-y-1 mb-3">
                      {order.items.map((item, idx) => (
                        <p key={idx} className="text-sm text-slate-700">
                          {item.product.name} x {item.quantity} - {item.price.toFixed(2)} ₺
                        </p>
                      ))}
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-slate-900">
                        Toplam: {order.total.toFixed(2)} ₺
                      </p>
                      <Link href={`/order/${order.orderNumber}`}>
                        <Button variant="outline" size="sm">
                          Detaylar
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
