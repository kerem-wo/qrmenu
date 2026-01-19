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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-4 text-slate-600">Sipariş bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="card-modern max-w-md">
          <CardContent className="py-12 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Sipariş Bulunamadı</h2>
            <p className="text-slate-600">Sipariş numarasını kontrol edin.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const StatusIcon = statusConfig[order.status]?.icon || Clock;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <Card className="card-modern">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold text-slate-900">
                  Sipariş #{order.orderNumber}
                </CardTitle>
                <CardDescription className="text-sm mt-1">
                  {new Date(order.createdAt).toLocaleString("tr-TR")}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <StatusIcon className="w-6 h-6" />
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  statusConfig[order.status]?.color || "bg-slate-100 text-slate-800"
                }`}>
                  {statusConfig[order.status]?.label || order.status}
                </span>
              </div>
            </div>
            <p className="text-slate-600 mt-2">
              {statusConfig[order.status]?.description}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Müşteri Bilgileri */}
            {(order.tableNumber || order.customerName || order.customerPhone) && (
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-semibold text-slate-900 mb-2">Sipariş Bilgileri</h3>
                <div className="space-y-1 text-sm">
                  {order.tableNumber && (
                    <p><span className="font-medium text-slate-600">Masa:</span> {order.tableNumber}</p>
                  )}
                  {order.customerName && (
                    <p><span className="font-medium text-slate-600">İsim:</span> {order.customerName}</p>
                  )}
                  {order.customerPhone && (
                    <p><span className="font-medium text-slate-600">Telefon:</span> {order.customerPhone}</p>
                  )}
                </div>
              </div>
            )}

            {/* Sipariş Ürünleri */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Sipariş Detayları</h3>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm py-2 border-b border-slate-200">
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

            {/* Toplam */}
            <div className="border-t border-slate-200 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-slate-900">Toplam:</span>
                <span className="text-2xl font-bold text-slate-900">
                  {order.total.toFixed(2)} ₺
                </span>
              </div>
            </div>

            {/* Durum Açıklaması */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">
                <strong>Not:</strong> Bu sayfa otomatik olarak güncellenir. Sipariş durumunuz değiştiğinde burada görebilirsiniz.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
