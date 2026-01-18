"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, Clock, XCircle, ChefHat } from "lucide-react";
import { checkAuth } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    name: string;
  };
}

interface Order {
  id: string;
  tableNumber: string | null;
  customerName: string | null;
  customerPhone: string | null;
  status: string;
  total: number;
  items: OrderItem[];
  createdAt: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Beklemede", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  confirmed: { label: "Onaylandı", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
  preparing: { label: "Hazırlanıyor", color: "bg-purple-100 text-purple-800", icon: ChefHat },
  ready: { label: "Hazır", color: "bg-green-100 text-green-800", icon: CheckCircle },
  completed: { label: "Tamamlandı", color: "bg-gray-100 text-gray-800", icon: CheckCircle },
  cancelled: { label: "İptal", color: "bg-red-100 text-red-800", icon: XCircle },
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth().then((session) => {
      if (!session) {
        router.push("/admin/login");
        return;
      }
      fetchOrders();
    });
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else {
        toast.error("Siparişler yüklenirken bir hata oluştu");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast.success("Sipariş durumu güncellendi");
        fetchOrders();
      } else {
        toast.error("Güncelleme başarısız");
      }
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Bir hata oluştu");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" asChild className="text-slate-600 hover:text-slate-900">
            <Link href="/admin/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Geri
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">Siparişler</h1>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {orders.length === 0 ? (
          <Card className="card-modern">
            <CardContent className="py-16 text-center">
              <ShoppingCart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">Henüz sipariş yok.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const StatusIcon = statusConfig[order.status]?.icon || Clock;
              return (
                <Card key={order.id} className="card-modern">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg font-semibold text-slate-900">
                          Sipariş #{order.id.slice(0, 8)}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {new Date(order.createdAt).toLocaleString("tr-TR")}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusIcon className="w-5 h-5 text-slate-400" />
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          statusConfig[order.status]?.color || "bg-slate-100 text-slate-800"
                        }`}>
                          {statusConfig[order.status]?.label || order.status}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Customer Info */}
                      {(order.tableNumber || order.customerName || order.customerPhone) && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm bg-slate-50 p-4 rounded-lg">
                          {order.tableNumber && (
                            <div>
                              <span className="font-medium text-slate-600">Masa:</span> <span className="text-slate-900">{order.tableNumber}</span>
                            </div>
                          )}
                          {order.customerName && (
                            <div>
                              <span className="font-medium text-slate-600">İsim:</span> <span className="text-slate-900">{order.customerName}</span>
                            </div>
                          )}
                          {order.customerPhone && (
                            <div>
                              <span className="font-medium text-slate-600">Telefon:</span> <span className="text-slate-900">{order.customerPhone}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Order Items */}
                      <div className="border-t border-slate-200 pt-4">
                        <h4 className="font-semibold text-slate-900 mb-2">Ürünler:</h4>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm py-2">
                              <span className="text-slate-700">
                                {item.product.name} x {item.quantity}
                              </span>
                              <span className="font-medium text-slate-900">
                                {(item.price * item.quantity).toFixed(2)} ₺
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Total */}
                      <div className="border-t border-slate-200 pt-4 flex justify-between items-center">
                        <span className="text-lg font-semibold text-slate-900">Toplam:</span>
                        <span className="text-xl font-bold text-slate-900">
                          {order.total.toFixed(2)} ₺
                        </span>
                      </div>

                      {/* Status Actions */}
                      <div className="border-t border-slate-200 pt-4 flex gap-2 flex-wrap">
                        {order.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateOrderStatus(order.id, "confirmed")}
                              className="bg-slate-900 hover:bg-slate-800"
                            >
                              Onayla
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateOrderStatus(order.id, "cancelled")}
                              className="border-slate-300 hover:bg-red-50 hover:border-red-300"
                            >
                              İptal Et
                            </Button>
                          </>
                        )}
                        {order.status === "confirmed" && (
                          <Button
                            size="sm"
                            onClick={() => updateOrderStatus(order.id, "preparing")}
                            className="bg-slate-900 hover:bg-slate-800"
                          >
                            Hazırlamaya Başla
                          </Button>
                        )}
                        {order.status === "preparing" && (
                          <Button
                            size="sm"
                            onClick={() => updateOrderStatus(order.id, "ready")}
                            className="bg-slate-900 hover:bg-slate-800"
                          >
                            Hazır Olarak İşaretle
                          </Button>
                        )}
                        {order.status === "ready" && (
                          <Button
                            size="sm"
                            onClick={() => updateOrderStatus(order.id, "completed")}
                            className="bg-slate-900 hover:bg-slate-800"
                          >
                            Tamamlandı
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
