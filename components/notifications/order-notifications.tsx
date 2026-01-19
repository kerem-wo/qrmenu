"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Order {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: string;
  items: Array<{
    quantity: number;
    product: {
      name: string;
    };
  }>;
}

export function OrderNotifications() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Order[]>([]);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const checkNotifications = async () => {
      if (!mounted) return;
      
      try {
        const url = lastOrderId
          ? `/api/notifications?lastOrderId=${lastOrderId}`
          : "/api/notifications";
        
        const res = await fetch(url);
        if (res.ok && mounted) {
          const data = await res.json();
          if (data.orders && data.orders.length > 0 && mounted) {
            setNotifications(prev => {
              const newOrders = data.orders.filter((order: Order) => 
                !prev.find(n => n.id === order.id)
              );
              
              if (newOrders.length > 0 && mounted) {
                setLastOrderId(newOrders[0].id);
                
                // Show toast for each new order
                newOrders.forEach((order: Order) => {
                  toast.success(`Yeni sipariş: #${order.orderNumber}`, {
                    duration: 5000,
                  });
                });
                
                return [...newOrders, ...prev];
              }
              
              return prev;
            });
          }
        }
      } catch (error) {
        if (mounted) {
          console.error("Error checking notifications:", error);
        }
      }
    };

    // Check immediately
    checkNotifications();

    // Check every 5 seconds
    const interval = setInterval(checkNotifications, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [lastOrderId]);

  const clearNotifications = () => {
    setNotifications([]);
    setLastOrderId(null);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="w-5 h-5" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </Button>

      {isOpen && notifications.length > 0 && (
        <div className="absolute right-0 top-12 w-80 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-semibold text-slate-900">Yeni Siparişler</h3>
            <Button variant="ghost" size="sm" onClick={clearNotifications}>
              Temizle
            </Button>
          </div>
          <div className="divide-y">
            {notifications.map((order) => (
              <div
                key={order.id}
                className="p-4 hover:bg-slate-50 cursor-pointer"
                onClick={() => {
                  router.push("/admin/orders");
                  setIsOpen(false);
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-slate-900">
                    Sipariş #{order.orderNumber}
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {order.total.toFixed(2)} ₺
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  {order.items.length} ürün • {new Date(order.createdAt).toLocaleTimeString("tr-TR")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
