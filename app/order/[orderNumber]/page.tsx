"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle, ChefHat, XCircle } from "lucide-react";

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
  orderNumber: string;
  tableNumber: string | null;
  customerName: string | null;
  customerPhone: string | null;
  status: string;
  total: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
  queue?: {
    ahead: number;
    avgPrepMinMinutes: number;
    avgPrepMaxMinutes: number;
    etaMinMinutes: number;
    etaMaxMinutes: number;
  };
}

const statusConfig: Record<string, { label: string; color: string; icon: any; description: string }> = {
  pending: { 
    label: "Beklemede", 
    color: "bg-yellow-100 text-yellow-800", 
    icon: Clock,
    description: "Siparişiniz alındı, onay bekliyor"
  },
  confirmed: { 
    label: "Onaylandı", 
    color: "bg-blue-100 text-blue-800", 
    icon: CheckCircle,
    description: "Siparişiniz onaylandı"
  },
  preparing: { 
    label: "Hazırlanıyor", 
    color: "bg-purple-100 text-purple-800", 
    icon: ChefHat,
    description: "Siparişiniz hazırlanıyor"
  },
  ready: { 
    label: "Hazır", 
    color: "bg-green-100 text-green-800", 
    icon: CheckCircle,
    description: "Siparişiniz hazır!"
  },
  completed: { 
    label: "Tamamlandı", 
    color: "bg-gray-100 text-gray-800", 
    icon: CheckCircle,
    description: "Sipariş tamamlandı"
  },
  cancelled: { 
    label: "İptal", 
    color: "bg-red-100 text-red-800", 
    icon: XCircle,
    description: "Sipariş iptal edildi"
  },
};

export default function OrderTrackingPage() {
  const params = useParams();
  const orderNumber = params?.orderNumber as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderNumber) {
      fetchOrder();
      // Her 5 saniyede bir güncelle
      const interval = setInterval(fetchOrder, 5000);
      return () => clearInterval(interval);
    }
  }, [orderNumber]);

  const fetchOrder = async () => {
    if (!orderNumber) return;
    
    try {
      const res = await fetch(`/api/orders/${orderNumber}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      } else {
        console.error("Sipariş bulunamadı");
      }
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center premium-bg-gradient">
        <div className="text-center">
          <div className="premium-spinner mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Sipariş bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center premium-bg-gradient p-4">
        <div className="premium-card p-12 text-center max-w-md animate-premium-scale-in">
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="absolute inset-0 bg-red-200 rounded-3xl blur-xl opacity-30"></div>
            <div className="relative w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
          </div>
          <h2 className="premium-heading-3 mb-4">Sipariş Bulunamadı</h2>
          <p className="text-gray-600 font-medium">Sipariş numarasını kontrol edin.</p>
        </div>
      </div>
    );
  }

  const StatusIcon = statusConfig[order.status]?.icon || Clock;
  const queue = order.queue;
  const showEta = order.status === "pending" || order.status === "confirmed" || order.status === "preparing";

  return (
    <div className="min-h-screen premium-bg-gradient py-8 px-4">
      <div className="premium-container max-w-2xl mx-auto">
        <div className="premium-card p-10 animate-premium-fade-in">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="premium-heading-2 mb-2">
                Sipariş #{order.orderNumber}
              </h1>
              <p className="text-sm text-gray-600 font-medium">
                {new Date(order.createdAt).toLocaleString("tr-TR")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <StatusIcon className="w-6 h-6 text-gray-400" />
              <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                statusConfig[order.status]?.color || "bg-gray-100 text-gray-800"
              }`}>
                {statusConfig[order.status]?.label || order.status}
              </span>
            </div>
          </div>
          <p className="text-gray-600 font-medium mb-8 pb-6 border-b border-gray-200">
            {statusConfig[order.status]?.description}
          </p>
          {showEta && queue ? (
            <div className="mb-8 -mt-4">
              {queue.ahead > 0 && (order.status === "pending" || order.status === "confirmed") ? (
                <div className="bg-amber-50 p-5 rounded-xl border border-amber-200">
                  <p className="text-sm text-amber-900 font-semibold">
                    Sıraya alındınız.
                    <span className="font-bold">
                      {" "}
                      Tahmini süre: {queue.etaMinMinutes}-{queue.etaMaxMinutes} dakika
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-amber-800/80">
                    Ortalama hazırlanma süresi (kahve): {queue.avgPrepMinMinutes}-{queue.avgPrepMaxMinutes} dakika.
                  </p>
                </div>
              ) : (
                <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-200">
                  <p className="text-sm text-emerald-900 font-semibold">
                    Tahmini süre: {queue.etaMinMinutes}-{queue.etaMaxMinutes} dakika
                  </p>
                  <p className="mt-1 text-xs text-emerald-800/80">
                    Ortalama hazırlanma süresi (kahve): {queue.avgPrepMinMinutes}-{queue.avgPrepMaxMinutes} dakika.
                  </p>
                </div>
              )}
            </div>
          ) : null}
          <div className="space-y-6">
            {/* Müşteri Bilgileri */}
            {(order.tableNumber || order.customerName || order.customerPhone) && (
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="font-bold text-gray-900 mb-4">Sipariş Bilgileri</h3>
                <div className="space-y-2 text-sm">
                  {order.tableNumber && (
                    <p><span className="font-bold text-gray-600">Masa:</span> <span className="text-gray-900 font-semibold">{order.tableNumber}</span></p>
                  )}
                  {order.customerName && (
                    <p><span className="font-bold text-gray-600">İsim:</span> <span className="text-gray-900 font-semibold">{order.customerName}</span></p>
                  )}
                  {order.customerPhone && (
                    <p><span className="font-bold text-gray-600">Telefon:</span> <span className="text-gray-900 font-semibold">{order.customerPhone}</span></p>
                  )}
                </div>
              </div>
            )}

            {/* Sipariş Ürünleri */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Sipariş Detayları</h3>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm py-3 border-b border-gray-200">
                    <span className="text-gray-700 font-medium">
                      {item.product.name} x {item.quantity}
                    </span>
                    <span className="font-bold text-gray-900">
                      {(item.price * item.quantity).toFixed(2)} ₺
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Toplam */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-gray-900">Toplam:</span>
                <span className="text-3xl font-black text-gray-900">
                  {order.total.toFixed(2)} ₺
                </span>
              </div>
            </div>

            {/* Durum Açıklaması */}
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
              <p className="text-sm text-blue-900 font-medium">
                <strong>Not:</strong> Bu sayfa otomatik olarak güncellenir. Sipariş durumunuz değiştiğinde burada görebilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
