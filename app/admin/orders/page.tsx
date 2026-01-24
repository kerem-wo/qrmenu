"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, CheckCircle, Clock, XCircle, ChefHat, ShoppingCart, Trash2 } from "lucide-react";
import { checkAuth } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  notes?: string | null;
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
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());

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

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const selectAllOrders = () => {
    setSelectedOrders(new Set(orders.map((order) => order.id)));
  };

  const clearSelection = () => {
    setSelectedOrders(new Set());
  };

  const deleteSelectedOrders = async () => {
    if (selectedOrders.size === 0) {
      toast.error("Lütfen silmek için sipariş seçin!");
      return;
    }

    if (!confirm(`${selectedOrders.size} siparişi silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      const res = await fetch("/api/admin/orders", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedOrders) }),
      });

      if (res.ok) {
        toast.success(`${selectedOrders.size} sipariş silindi`);
        setSelectedOrders(new Set());
        fetchOrders();
      } else {
        const data = await res.json();
        toast.error(data.error || "Siparişler silinirken bir hata oluştu");
      }
    } catch (error) {
      console.error("Error deleting orders:", error);
      toast.error("Bir hata oluştu");
    }
  };

  const deleteAllOrders = async () => {
    if (orders.length === 0) {
      toast.error("Silinecek sipariş yok!");
      return;
    }

    if (!confirm(`Tüm siparişleri (${orders.length} adet) silmek istediğinize emin misiniz? Bu işlem geri alınamaz!`)) {
      return;
    }

    try {
      const res = await fetch("/api/admin/orders", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: orders.map((order) => order.id) }),
      });

      if (res.ok) {
        toast.success(`Tüm siparişler (${orders.length} adet) silindi`);
        setSelectedOrders(new Set());
        fetchOrders();
      } else {
        const data = await res.json();
        toast.error(data.error || "Siparişler silinirken bir hata oluştu");
      }
    } catch (error) {
      console.error("Error deleting all orders:", error);
      toast.error("Bir hata oluştu");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;
  }

  return (
    <div className="min-h-screen premium-bg-gradient">
      <header className="premium-glass sticky top-0 z-50 border-b border-gray-200/50">
        <div className="premium-container">
          <div className="flex items-center justify-between gap-4 py-5">
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild className="premium-btn-secondary px-4 py-2">
                <Link href="/admin/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Geri
                </Link>
              </Button>
              <div>
                <h1 className="premium-heading-3">Siparişler</h1>
                {orders.length > 0 && (
                  <span className="text-sm text-gray-600 font-medium">({orders.length} sipariş)</span>
                )}
              </div>
            </div>
            {orders.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                {selectedOrders.size > 0 && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={deleteSelectedOrders}
                      className="premium-btn-secondary text-red-600 border-red-300 hover:bg-red-50 px-4 py-2"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Seçili Olanları Sil ({selectedOrders.size})
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={clearSelection}
                      className="premium-btn-secondary px-4 py-2"
                    >
                      Seçimi Temizle
                    </Button>
                  </>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={selectAllOrders}
                  className="premium-btn-secondary px-4 py-2"
                >
                  Tümünü Seç
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={deleteAllOrders}
                  className="premium-btn-secondary text-red-600 border-red-300 hover:bg-red-50 px-4 py-2"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Hepsini Temizle
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="premium-container py-10">
        {orders.length === 0 ? (
          <div className="premium-card p-16 text-center animate-premium-fade-in">
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="absolute inset-0 bg-gray-200 rounded-3xl blur-xl opacity-30"></div>
              <div className="relative w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center">
                <ShoppingCart className="w-10 h-10 text-gray-400" />
              </div>
            </div>
            <h3 className="premium-heading-3 mb-4">Henüz sipariş yok</h3>
            <p className="text-gray-600 font-medium">Müşteriler sipariş verdiğinde burada görünecek</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => {
              const StatusIcon = statusConfig[order.status]?.icon || Clock;
              const isSelected = selectedOrders.has(order.id);
              return (
                <div key={order.id} className={`premium-card p-6 ${isSelected ? 'ring-2 ring-green-500' : ''} animate-premium-fade-in`} style={{ animationDelay: `${index * 0.05}s` }}>
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleOrderSelection(order.id)}
                        className="mt-1"
                      />
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          Sipariş #{order.id.slice(0, 8)}
                        </h3>
                        <p className="text-sm text-gray-600 font-medium">
                          {new Date(order.createdAt).toLocaleString("tr-TR")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusIcon className="w-5 h-5 text-gray-400" />
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        statusConfig[order.status]?.color || "bg-gray-100 text-gray-800"
                      }`}>
                        {statusConfig[order.status]?.label || order.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="space-y-4">
                      {/* Customer Info */}
                      {(order.tableNumber || order.customerName || order.customerPhone) && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm bg-gray-50 p-4 rounded-xl mb-4">
                          {order.tableNumber && (
                            <div>
                              <span className="font-bold text-gray-600">Masa:</span> <span className="text-gray-900 font-semibold">{order.tableNumber}</span>
                            </div>
                          )}
                          {order.customerName && (
                            <div>
                              <span className="font-bold text-gray-600">İsim:</span> <span className="text-gray-900 font-semibold">{order.customerName}</span>
                            </div>
                          )}
                          {order.customerPhone && (
                            <div>
                              <span className="font-bold text-gray-600">Telefon:</span> <span className="text-gray-900 font-semibold">{order.customerPhone}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Order Items */}
                      <div className="border-t border-gray-200 pt-4 mb-4">
                        <h4 className="font-bold text-gray-900 mb-3">Ürünler:</h4>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="py-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-700 font-medium">
                                  {item.product.name} x {item.quantity}
                                </span>
                                <span className="font-bold text-gray-900">
                                  {(item.price * item.quantity).toFixed(2)} ₺
                                </span>
                              </div>
                              {item.notes ? (
                                <div className="mt-1 text-xs text-gray-500">
                                  <span className="font-bold text-gray-600">Not:</span> {item.notes}
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Total */}
                      <div className="border-t border-gray-200 pt-4 flex justify-between items-center mb-4">
                        <span className="text-lg font-bold text-gray-900">Toplam:</span>
                        <span className="text-2xl font-black text-gray-900">
                          {order.total.toFixed(2)} ₺
                        </span>
                      </div>

                      {/* Status Actions */}
                      <div className="border-t border-gray-200 pt-4 flex gap-2 flex-wrap">
                        {order.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateOrderStatus(order.id, "confirmed")}
                              className="premium-btn-primary px-4 py-2"
                            >
                              Onayla
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateOrderStatus(order.id, "cancelled")}
                              className="premium-btn-secondary px-4 py-2 hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                            >
                              İptal Et
                            </Button>
                          </>
                        )}
                        {order.status === "confirmed" && (
                          <Button
                            size="sm"
                            onClick={() => updateOrderStatus(order.id, "preparing")}
                            className="premium-btn-primary px-4 py-2"
                          >
                            Hazırlamaya Başla
                          </Button>
                        )}
                        {order.status === "preparing" && (
                          <Button
                            size="sm"
                            onClick={() => updateOrderStatus(order.id, "ready")}
                            className="premium-btn-primary px-4 py-2"
                          >
                            Hazır Olarak İşaretle
                          </Button>
                        )}
                        {order.status === "ready" && (
                          <Button
                            size="sm"
                            onClick={() => updateOrderStatus(order.id, "completed")}
                            className="premium-btn-primary px-4 py-2"
                          >
                            Tamamlandı
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
