"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Clock, CheckCircle, ChefHat, XCircle } from "lucide-react";

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
    etaMinMinutes: number;
    etaMaxMinutes: number;
    breakdown?: {
      aheadMinMinutes: number;
      aheadMaxMinutes: number;
      currentMinMinutes: number;
      currentMaxMinutes: number;
    };
  };
}

type Lang = "tr" | "en" | "de" | "ru" | "ar" | "fr" | "es";

const LANG_OPTIONS: Array<{ id: Lang; label: string }> = [
  { id: "tr", label: "Türkçe" },
  { id: "en", label: "English" },
  { id: "de", label: "Deutsch" },
  { id: "ru", label: "Русский" },
  { id: "ar", label: "العربية" },
  { id: "fr", label: "Français" },
  { id: "es", label: "Español" },
];

const LOCALE: Record<Lang, string> = {
  tr: "tr-TR",
  en: "en-US",
  de: "de-DE",
  ru: "ru-RU",
  ar: "ar-SA",
  fr: "fr-FR",
  es: "es-ES",
};

type Strings = {
  loading: string;
  notFoundTitle: string;
  notFoundDesc: string;
  orderTitle: (n: string) => string;
  etaQueued: (min: number, max: number) => string;
  etaOnly: (min: number, max: number) => string;
  etaBreakdown: (aheadMin: number, aheadMax: number, curMin: number, curMax: number) => string;
  etaBreakdownCurrent: (curMin: number, curMax: number) => string;
  orderInfo: string;
  table: string;
  name: string;
  phone: string;
  orderDetails: string;
  total: string;
  note: string;
  noteAutoRefresh: string;
  status: Record<
    string,
    { label: string; description: string }
  >;
};

const STRINGS: Record<Lang, Strings> = {
  tr: {
    loading: "Sipariş bilgileri yükleniyor...",
    notFoundTitle: "Sipariş Bulunamadı",
    notFoundDesc: "Sipariş numarasını kontrol edin.",
    orderTitle: (n) => `Sipariş #${n}`,
    etaQueued: (min, max) => `Sıraya alındınız. Tahmini süre: ${min}-${max} dakika`,
    etaOnly: (min, max) => `Tahmini süre: ${min}-${max} dakika`,
    etaBreakdown: (aMin, aMax, cMin, cMax) =>
      `Önünüzdeki siparişler: ${aMin}-${aMax} dk • Sizin siparişiniz: ${cMin}-${cMax} dk`,
    etaBreakdownCurrent: (cMin, cMax) => `Sizin siparişiniz: ${cMin}-${cMax} dk`,
    orderInfo: "Sipariş Bilgileri",
    table: "Masa",
    name: "İsim",
    phone: "Telefon",
    orderDetails: "Sipariş Detayları",
    total: "Toplam",
    note: "Not",
    noteAutoRefresh: "Bu sayfa otomatik olarak güncellenir. Sipariş durumunuz değiştiğinde burada görebilirsiniz.",
    status: {
      pending: { label: "Beklemede", description: "Siparişiniz alındı, onay bekliyor" },
      confirmed: { label: "Onaylandı", description: "Siparişiniz onaylandı" },
      preparing: { label: "Hazırlanıyor", description: "Siparişiniz hazırlanıyor" },
      ready: { label: "Hazır", description: "Siparişiniz hazır!" },
      completed: { label: "Tamamlandı", description: "Sipariş tamamlandı" },
      cancelled: { label: "İptal", description: "Sipariş iptal edildi" },
    },
  },
  en: {
    loading: "Loading order details...",
    notFoundTitle: "Order not found",
    notFoundDesc: "Please check the order number.",
    orderTitle: (n) => `Order #${n}`,
    etaQueued: (min, max) => `You're in the queue. ETA: ${min}-${max} minutes`,
    etaOnly: (min, max) => `ETA: ${min}-${max} minutes`,
    etaBreakdown: (aMin, aMax, cMin, cMax) =>
      `Ahead orders: ${aMin}-${aMax} min • Your order: ${cMin}-${cMax} min`,
    etaBreakdownCurrent: (cMin, cMax) => `Your order: ${cMin}-${cMax} min`,
    orderInfo: "Order info",
    table: "Table",
    name: "Name",
    phone: "Phone",
    orderDetails: "Order details",
    total: "Total",
    note: "Note",
    noteAutoRefresh: "This page refreshes automatically. You'll see status updates here.",
    status: {
      pending: { label: "Pending", description: "We received your order, waiting for confirmation" },
      confirmed: { label: "Confirmed", description: "Your order is confirmed" },
      preparing: { label: "Preparing", description: "Your order is being prepared" },
      ready: { label: "Ready", description: "Your order is ready!" },
      completed: { label: "Completed", description: "Order completed" },
      cancelled: { label: "Cancelled", description: "Order cancelled" },
    },
  },
  de: {
    loading: "Bestelldaten werden geladen...",
    notFoundTitle: "Bestellung nicht gefunden",
    notFoundDesc: "Bitte Bestellnummer prüfen.",
    orderTitle: (n) => `Bestellung #${n}`,
    etaQueued: (min, max) => `Sie sind in der Warteschlange. ETA: ${min}-${max} Minuten`,
    etaOnly: (min, max) => `ETA: ${min}-${max} Minuten`,
    etaBreakdown: (aMin, aMax, cMin, cMax) =>
      `Vor Ihnen: ${aMin}-${aMax} Min • Ihre Bestellung: ${cMin}-${cMax} Min`,
    etaBreakdownCurrent: (cMin, cMax) => `Ihre Bestellung: ${cMin}-${cMax} Min`,
    orderInfo: "Bestellinfos",
    table: "Tisch",
    name: "Name",
    phone: "Telefon",
    orderDetails: "Bestelldetails",
    total: "Summe",
    note: "Hinweis",
    noteAutoRefresh: "Diese Seite aktualisiert sich automatisch. Statusänderungen sehen Sie hier.",
    status: {
      pending: { label: "Ausstehend", description: "Bestellung erhalten, wartet auf Bestätigung" },
      confirmed: { label: "Bestätigt", description: "Bestellung bestätigt" },
      preparing: { label: "In Vorbereitung", description: "Bestellung wird zubereitet" },
      ready: { label: "Fertig", description: "Bestellung ist fertig!" },
      completed: { label: "Abgeschlossen", description: "Bestellung abgeschlossen" },
      cancelled: { label: "Storniert", description: "Bestellung storniert" },
    },
  },
  ru: {
    loading: "Загрузка заказа...",
    notFoundTitle: "Заказ не найден",
    notFoundDesc: "Проверьте номер заказа.",
    orderTitle: (n) => `Заказ #${n}`,
    etaQueued: (min, max) => `Вы в очереди. Ожидание: ${min}-${max} мин`,
    etaOnly: (min, max) => `Ожидание: ${min}-${max} мин`,
    etaBreakdown: (aMin, aMax, cMin, cMax) =>
      `Перед вами: ${aMin}-${aMax} мин • Ваш заказ: ${cMin}-${cMax} мин`,
    etaBreakdownCurrent: (cMin, cMax) => `Ваш заказ: ${cMin}-${cMax} мин`,
    orderInfo: "Информация",
    table: "Стол",
    name: "Имя",
    phone: "Телефон",
    orderDetails: "Детали",
    total: "Итого",
    note: "Примечание",
    noteAutoRefresh: "Страница обновляется автоматически. Статус будет отображаться здесь.",
    status: {
      pending: { label: "Ожидание", description: "Заказ получен, ожидает подтверждения" },
      confirmed: { label: "Подтверждён", description: "Заказ подтверждён" },
      preparing: { label: "Готовится", description: "Заказ готовится" },
      ready: { label: "Готов", description: "Заказ готов!" },
      completed: { label: "Завершён", description: "Заказ завершён" },
      cancelled: { label: "Отменён", description: "Заказ отменён" },
    },
  },
  ar: {
    loading: "جارٍ تحميل تفاصيل الطلب...",
    notFoundTitle: "لم يتم العثور على الطلب",
    notFoundDesc: "تحقق من رقم الطلب.",
    orderTitle: (n) => `الطلب #${n}`,
    etaQueued: (min, max) => `أنت في قائمة الانتظار. الوقت المتوقع: ${min}-${max} دقيقة`,
    etaOnly: (min, max) => `الوقت المتوقع: ${min}-${max} دقيقة`,
    etaBreakdown: (aMin, aMax, cMin, cMax) =>
      `طلبات قبلك: ${aMin}-${aMax} دقيقة • طلبك: ${cMin}-${cMax} دقيقة`,
    etaBreakdownCurrent: (cMin, cMax) => `طلبك: ${cMin}-${cMax} دقيقة`,
    orderInfo: "معلومات الطلب",
    table: "الطاولة",
    name: "الاسم",
    phone: "الهاتف",
    orderDetails: "تفاصيل الطلب",
    total: "الإجمالي",
    note: "ملاحظة",
    noteAutoRefresh: "يتم تحديث هذه الصفحة تلقائياً. سترى تغييرات الحالة هنا.",
    status: {
      pending: { label: "قيد الانتظار", description: "تم استلام طلبك، بانتظار التأكيد" },
      confirmed: { label: "تم التأكيد", description: "تم تأكيد طلبك" },
      preparing: { label: "قيد التحضير", description: "يتم تحضير طلبك" },
      ready: { label: "جاهز", description: "طلبك جاهز!" },
      completed: { label: "مكتمل", description: "اكتمل الطلب" },
      cancelled: { label: "ملغي", description: "تم إلغاء الطلب" },
    },
  },
  fr: {
    loading: "Chargement de la commande...",
    notFoundTitle: "Commande introuvable",
    notFoundDesc: "Vérifiez le numéro de commande.",
    orderTitle: (n) => `Commande #${n}`,
    etaQueued: (min, max) => `Vous êtes dans la file. Durée estimée : ${min}-${max} min`,
    etaOnly: (min, max) => `Durée estimée : ${min}-${max} min`,
    etaBreakdown: (aMin, aMax, cMin, cMax) =>
      `Avant vous : ${aMin}-${aMax} min • Votre commande : ${cMin}-${cMax} min`,
    etaBreakdownCurrent: (cMin, cMax) => `Votre commande : ${cMin}-${cMax} min`,
    orderInfo: "Infos commande",
    table: "Table",
    name: "Nom",
    phone: "Téléphone",
    orderDetails: "Détails",
    total: "Total",
    note: "Note",
    noteAutoRefresh: "Cette page se met à jour automatiquement. Les changements s'affichent ici.",
    status: {
      pending: { label: "En attente", description: "Commande reçue, en attente de confirmation" },
      confirmed: { label: "Confirmée", description: "Commande confirmée" },
      preparing: { label: "Préparation", description: "Votre commande est en préparation" },
      ready: { label: "Prête", description: "Votre commande est prête !" },
      completed: { label: "Terminée", description: "Commande terminée" },
      cancelled: { label: "Annulée", description: "Commande annulée" },
    },
  },
  es: {
    loading: "Cargando pedido...",
    notFoundTitle: "Pedido no encontrado",
    notFoundDesc: "Revisa el número de pedido.",
    orderTitle: (n) => `Pedido #${n}`,
    etaQueued: (min, max) => `Estás en la cola. Tiempo estimado: ${min}-${max} min`,
    etaOnly: (min, max) => `Tiempo estimado: ${min}-${max} min`,
    etaBreakdown: (aMin, aMax, cMin, cMax) =>
      `Delante: ${aMin}-${aMax} min • Tu pedido: ${cMin}-${cMax} min`,
    etaBreakdownCurrent: (cMin, cMax) => `Tu pedido: ${cMin}-${cMax} min`,
    orderInfo: "Info del pedido",
    table: "Mesa",
    name: "Nombre",
    phone: "Teléfono",
    orderDetails: "Detalles",
    total: "Total",
    note: "Nota",
    noteAutoRefresh: "Esta página se actualiza automáticamente. Verás el estado aquí.",
    status: {
      pending: { label: "Pendiente", description: "Recibimos tu pedido, esperando confirmación" },
      confirmed: { label: "Confirmado", description: "Tu pedido está confirmado" },
      preparing: { label: "Preparando", description: "Tu pedido se está preparando" },
      ready: { label: "Listo", description: "¡Tu pedido está listo!" },
      completed: { label: "Completado", description: "Pedido completado" },
      cancelled: { label: "Cancelado", description: "Pedido cancelado" },
    },
  },
};

export default function OrderTrackingPage() {
  const params = useParams();
  const orderNumber = params?.orderNumber as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<Lang>("tr");

  const S = STRINGS[lang];
  const locale = LOCALE[lang];

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("qrmenu_lang");
      const found = LANG_OPTIONS.find((o) => o.id === raw);
      if (found) setLang(found.id);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("qrmenu_lang", lang);
    } catch {
      // ignore
    }
  }, [lang]);

  const statusConfig = useMemo(() => {
    const base = S.status;
    return {
      pending: {
        label: base.pending?.label || "pending",
        description: base.pending?.description || "",
        color: "bg-yellow-100 text-yellow-800",
        icon: Clock,
      },
      confirmed: {
        label: base.confirmed?.label || "confirmed",
        description: base.confirmed?.description || "",
        color: "bg-blue-100 text-blue-800",
        icon: CheckCircle,
      },
      preparing: {
        label: base.preparing?.label || "preparing",
        description: base.preparing?.description || "",
        color: "bg-purple-100 text-purple-800",
        icon: ChefHat,
      },
      ready: {
        label: base.ready?.label || "ready",
        description: base.ready?.description || "",
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
      },
      completed: {
        label: base.completed?.label || "completed",
        description: base.completed?.description || "",
        color: "bg-gray-100 text-gray-800",
        icon: CheckCircle,
      },
      cancelled: {
        label: base.cancelled?.label || "cancelled",
        description: base.cancelled?.description || "",
        color: "bg-red-100 text-red-800",
        icon: XCircle,
      },
    } as Record<string, { label: string; color: string; icon: any; description: string }>;
  }, [S]);

  useEffect(() => {
    if (orderNumber) {
      fetchOrder();
      // Her 5 saniyede bir güncelle
      const interval = setInterval(fetchOrder, 5000);
      return () => clearInterval(interval);
    }
  }, [orderNumber, lang]);

  const fetchOrder = async () => {
    if (!orderNumber) return;
    
    try {
      const res = await fetch(`/api/orders/${orderNumber}?lang=${encodeURIComponent(lang)}`);
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
          <p className="mt-4 text-gray-600 font-medium">{S.loading}</p>
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
          <h2 className="premium-heading-3 mb-4">{S.notFoundTitle}</h2>
          <p className="text-gray-600 font-medium">{S.notFoundDesc}</p>
        </div>
      </div>
    );
  }

  const StatusIcon = statusConfig[order.status]?.icon || Clock;
  const queue = order.queue;
  const showEta = order.status === "pending" || order.status === "confirmed" || order.status === "preparing";

  return (
    <div className="min-h-screen premium-bg-gradient py-6 sm:py-8 px-4">
      <div className="premium-container max-w-2xl mx-auto">
        <div className="premium-card p-6 sm:p-8 md:p-10 animate-premium-fade-in">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-2">
                {S.orderTitle(order.orderNumber)}
              </h1>
              <p className="text-sm text-gray-600 font-medium">
                {new Date(order.createdAt).toLocaleString(locale)}
              </p>
            </div>
            <div className="flex items-center gap-2 self-start">
              <div className="relative">
                <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value as Lang)}
                  className="h-10 rounded-full border border-gray-200 bg-white pl-9 pr-4 text-sm font-semibold text-gray-900 shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"
                >
                  {LANG_OPTIONS.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <StatusIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
              <span
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-sm font-bold ${
                  statusConfig[order.status]?.color || "bg-gray-100 text-gray-800"
                }`}
              >
                {statusConfig[order.status]?.label || order.status}
              </span>
            </div>
          </div>
          <p className="text-gray-600 font-medium mb-6 sm:mb-8 pb-5 sm:pb-6 border-b border-gray-200">
            {statusConfig[order.status]?.description}
          </p>
          {showEta && queue ? (
            <div className="mb-6 sm:mb-8 -mt-2 sm:-mt-4">
              {queue.ahead > 0 && (order.status === "pending" || order.status === "confirmed") ? (
                <div className="bg-amber-50 p-4 sm:p-5 rounded-xl border border-amber-200">
                  <p className="text-sm sm:text-base text-amber-900 font-semibold">
                    <span className="font-bold">{S.etaQueued(queue.etaMinMinutes, queue.etaMaxMinutes)}</span>
                  </p>
                  {queue.breakdown ? (
                    <p className="mt-1 text-xs text-amber-800/80">
                      {S.etaBreakdown(
                        queue.breakdown.aheadMinMinutes,
                        queue.breakdown.aheadMaxMinutes,
                        queue.breakdown.currentMinMinutes,
                        queue.breakdown.currentMaxMinutes
                      )}
                    </p>
                  ) : null}
                </div>
              ) : (
                <div className="bg-emerald-50 p-4 sm:p-5 rounded-xl border border-emerald-200">
                  <p className="text-sm sm:text-base text-emerald-900 font-semibold">
                    {S.etaOnly(queue.etaMinMinutes, queue.etaMaxMinutes)}
                  </p>
                  {queue.breakdown ? (
                    <p className="mt-1 text-xs text-emerald-800/80">
                      {S.etaBreakdownCurrent(queue.breakdown.currentMinMinutes, queue.breakdown.currentMaxMinutes)}
                    </p>
                  ) : null}
                </div>
              )}
            </div>
          ) : null}
          <div className="space-y-6">
            {/* Müşteri Bilgileri */}
            {(order.tableNumber || order.customerName || order.customerPhone) && (
              <div className="bg-gray-50 p-4 sm:p-6 rounded-xl">
                <h3 className="font-bold text-gray-900 mb-4">{S.orderInfo}</h3>
                <div className="grid gap-2 text-sm sm:grid-cols-3">
                  {order.tableNumber && (
                    <p className="min-w-0">
                      <span className="font-bold text-gray-600">{S.table}:</span>{" "}
                      <span className="text-gray-900 font-semibold break-words">{order.tableNumber}</span>
                    </p>
                  )}
                  {order.customerName && (
                    <p className="min-w-0">
                      <span className="font-bold text-gray-600">{S.name}:</span>{" "}
                      <span className="text-gray-900 font-semibold break-words">{order.customerName}</span>
                    </p>
                  )}
                  {order.customerPhone && (
                    <p className="min-w-0">
                      <span className="font-bold text-gray-600">{S.phone}:</span>{" "}
                      <span className="text-gray-900 font-semibold break-words">{order.customerPhone}</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Sipariş Ürünleri */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4">{S.orderDetails}</h3>
              <div className="space-y-1">
                {order.items.map((item) => (
                  <div key={item.id} className="py-3 border-b border-gray-200">
                    <div className="flex items-start justify-between gap-4 text-sm">
                      <span className="text-gray-700 font-medium min-w-0 break-words">
                        {item.product.name} x {item.quantity}
                      </span>
                      <span className="font-bold text-gray-900 whitespace-nowrap">
                        {(item.price * item.quantity).toFixed(2)} ₺
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Toplam */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex justify-between items-center gap-4">
                <span className="text-lg sm:text-xl font-bold text-gray-900">{S.total}:</span>
                <span className="text-2xl sm:text-3xl font-black text-gray-900 whitespace-nowrap">
                  {order.total.toFixed(2)} ₺
                </span>
              </div>
            </div>

            {/* Durum Açıklaması */}
            <div className="bg-blue-50 p-4 sm:p-6 rounded-xl border border-blue-200">
              <p className="text-sm text-blue-900 font-medium leading-relaxed">
                <strong>{S.note}:</strong> {S.noteAutoRefresh}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
