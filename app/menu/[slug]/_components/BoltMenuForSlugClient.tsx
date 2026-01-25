"use client";

import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Globe, Leaf, Minus, Plus, Search, X } from "lucide-react";
import toast from "react-hot-toast";

type ApiCampaign = {
  id: string;
  name: string;
  code: string;
  type: "percentage" | "fixed" | string;
  value: number;
  minAmount: number | null;
  maxDiscount: number | null;
  endDate: string;
};

type ApiProduct = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  isAvailable: boolean;
  stock: number | null;
  order: number;
};

type ApiCategory = {
  id: string;
  name: string;
  description: string | null;
  products: ApiProduct[];
  order: number;
};

type ApiRestaurant = {
  id: string;
  name: string;
  description: string | null;
  logo: string | null;
};

type BoltItem = {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  shortDescription: string;
  description: string;
  priceCents: number;
  imageUrl: string;
  isVegetarian?: boolean;
};

type CartLine = {
  item: BoltItem;
  quantity: number;
  note?: string;
};

function formatTry(cents: number) {
  const value = (cents ?? 0) / 100;
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

function normalize(s: string) {
  return (s ?? "").toLocaleLowerCase("tr-TR").trim();
}

type Lang = "tr" | "en" | "de" | "ru" | "ar" | "fr" | "es";

type Strings = {
  language: string;
  loadingMenu: string;
  searchPlaceholder: string;
  mostPopular: string;
  noMatches: string;
  viewOrder: string;
  viewOrderAria: string;
  cartEmpty: string;

  vegBadge: string;
  vegetarian: string;

  addNoteLabel: string;
  addNotePlaceholder: string;
  addToOrderWithPrice: (price: string) => string;

  yourOrder: string;
  yourOrderEmpty: string;
  noteLabel: string;
  total: string;
  placeOrder: string;

  orderConfirmTitle: string;
  orderConfirmSubtitle: (hasRestaurant: boolean) => string;
  orderSummary: string;
  subtotal: string;
  discount: string;
  coupon: string;
  couponPlaceholder: string;
  apply: string;
  info: string;
  nameLabel: string;
  namePlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  tableLabel: string;
  optional: string;
  tablePlaceholder: string;
  sending: string;
  confirmOrder: string;

  couponInvalid: (fallback?: string) => string;
  couponApplied: (discountTry: number) => string;
  couponValidateError: string;
  orderSubmitError: (fallback?: string) => string;
  orderReceived: (orderNumber: string) => string;
  genericErrorTryAgain: string;
  missingRestaurant: string;
  missingName: string;
  missingPhone: string;
  invalidPhone: string;

  campaigns: string;
  tapToCopy: string;
  copyCouponTitle: string;
  codeLabel: string;
  minLabel: string;
  maxLabel: string;
  endsLabel: string;
  copy: string;
  couponCopied: (code: string) => string;
  couponCopyFailed: string;
  campaignDot: (n: number) => string;

  addItemAria: (name: string) => string;
};

const LANG_OPTIONS: Array<{ id: Lang; label: string }> = [
  { id: "tr", label: "Türkçe" },
  { id: "en", label: "English" },
  { id: "de", label: "Deutsch" },
  { id: "ru", label: "Русский" },
  { id: "ar", label: "العربية" },
  { id: "fr", label: "Français" },
  { id: "es", label: "Español" },
];

const STRINGS: Record<Lang, Strings> = {
  tr: {
    language: "Dil",
    loadingMenu: "Menü yükleniyor...",
    searchPlaceholder: "Menüde ara...",
    mostPopular: "En Popüler",
    noMatches: "Eşleşen ürün bulunamadı.",
    viewOrder: "Sepeti Gör",
    viewOrderAria: "Sepeti görüntüle",
    cartEmpty: "Sepetiniz boş!",

    vegBadge: "Veg",
    vegetarian: "Vejetaryen",

    addNoteLabel: "Not ekle",
    addNotePlaceholder: "Bilmemiz gereken bir şey var mı?",
    addToOrderWithPrice: (price) => `Sepete Ekle - ${price}`,

    yourOrder: "Siparişiniz",
    yourOrderEmpty: "Sepetiniz boş.",
    noteLabel: "Not",
    total: "Toplam",
    placeOrder: "Sipariş Ver",

    orderConfirmTitle: "Sipariş Onayı",
    orderConfirmSubtitle: (ok) => (ok ? "Bilgileri girip siparişinizi gönderin." : "Restoran bulunamadı."),
    orderSummary: "Sipariş Özeti",
    subtotal: "Ara Toplam",
    discount: "İndirim",
    coupon: "Kupon",
    couponPlaceholder: "Kupon kodu",
    apply: "Uygula",
    info: "Bilgiler",
    nameLabel: "İsim",
    namePlaceholder: "Adınız ve soyadınız",
    phoneLabel: "Telefon",
    phonePlaceholder: "05XX XXX XX XX",
    tableLabel: "Masa Numarası",
    optional: "Opsiyonel",
    tablePlaceholder: "Örn: 5, A12",
    sending: "Gönderiliyor...",
    confirmOrder: "Siparişi Onayla",

    couponInvalid: (fallback) => fallback || "Kupon geçersiz!",
    couponApplied: (d) => `Kupon uygulandı! İndirim: ${Number.isFinite(d) ? d.toFixed(2) : "0.00"} ₺`,
    couponValidateError: "Kupon doğrulanırken bir hata oluştu!",
    orderSubmitError: (fallback) => fallback || "Sipariş verilirken bir hata oluştu!",
    orderReceived: (n) => `Siparişiniz alındı! Sipariş numaranız: ${n}`,
    genericErrorTryAgain: "Bir hata oluştu! Lütfen tekrar deneyin.",
    missingRestaurant: "Restoran bilgisi bulunamadı!",
    missingName: "Lütfen isminizi girin!",
    missingPhone: "Lütfen telefon numaranızı girin!",
    invalidPhone: "Lütfen geçerli bir telefon numarası girin!",

    campaigns: "Kampanyalar",
    tapToCopy: "Tıkla: kuponu kopyala",
    copyCouponTitle: "Kupon kodunu kopyala",
    codeLabel: "KOD",
    minLabel: "Min",
    maxLabel: "Max",
    endsLabel: "Bitiş",
    copy: "Kopyala",
    couponCopied: (code) => `Kupon kopyalandı: ${code}`,
    couponCopyFailed: "Kupon kodunu kopyalayamadım.",
    campaignDot: (n) => `Kampanya ${n}`,

    addItemAria: (name) => `${name} ekle`,
  },
  en: {
    language: "Language",
    loadingMenu: "Loading menu...",
    searchPlaceholder: "Search in menu...",
    mostPopular: "Most Popular",
    noMatches: "No matches.",
    viewOrder: "View Order",
    viewOrderAria: "View order",
    cartEmpty: "Your cart is empty!",

    vegBadge: "Veg",
    vegetarian: "Vegetarian",

    addNoteLabel: "Add a note",
    addNotePlaceholder: "Anything we should know?",
    addToOrderWithPrice: (price) => `Add to Order - ${price}`,

    yourOrder: "Your order",
    yourOrderEmpty: "Your order is empty.",
    noteLabel: "Note",
    total: "Total",
    placeOrder: "Place order",

    orderConfirmTitle: "Order confirmation",
    orderConfirmSubtitle: (ok) => (ok ? "Enter your details and submit your order." : "Restaurant not found."),
    orderSummary: "Order summary",
    subtotal: "Subtotal",
    discount: "Discount",
    coupon: "Coupon",
    couponPlaceholder: "Coupon code",
    apply: "Apply",
    info: "Details",
    nameLabel: "Name",
    namePlaceholder: "Your full name",
    phoneLabel: "Phone",
    phonePlaceholder: "Phone number",
    tableLabel: "Table",
    optional: "Optional",
    tablePlaceholder: "e.g. 5, A12",
    sending: "Sending...",
    confirmOrder: "Confirm order",

    couponInvalid: (fallback) => fallback || "Invalid coupon!",
    couponApplied: (d) => `Coupon applied! Discount: ${Number.isFinite(d) ? d.toFixed(2) : "0.00"} ₺`,
    couponValidateError: "Failed to validate coupon.",
    orderSubmitError: (fallback) => fallback || "Failed to place order!",
    orderReceived: (n) => `Order received! Your order number: ${n}`,
    genericErrorTryAgain: "Something went wrong. Please try again.",
    missingRestaurant: "Restaurant information not found!",
    missingName: "Please enter your name!",
    missingPhone: "Please enter your phone number!",
    invalidPhone: "Please enter a valid phone number!",

    campaigns: "Campaigns",
    tapToCopy: "Click to copy coupon",
    copyCouponTitle: "Copy coupon code",
    codeLabel: "CODE",
    minLabel: "Min",
    maxLabel: "Max",
    endsLabel: "Ends",
    copy: "Copy",
    couponCopied: (code) => `Coupon copied: ${code}`,
    couponCopyFailed: "Couldn't copy the coupon code.",
    campaignDot: (n) => `Campaign ${n}`,

    addItemAria: (name) => `Add ${name}`,
  },
  de: {
    language: "Sprache",
    loadingMenu: "Menü wird geladen...",
    searchPlaceholder: "Im Menü suchen...",
    mostPopular: "Beliebt",
    noMatches: "Keine Treffer.",
    viewOrder: "Bestellung ansehen",
    viewOrderAria: "Bestellung ansehen",
    cartEmpty: "Ihr Warenkorb ist leer!",

    vegBadge: "Veg",
    vegetarian: "Vegetarisch",

    addNoteLabel: "Notiz hinzufügen",
    addNotePlaceholder: "Gibt es etwas zu beachten?",
    addToOrderWithPrice: (price) => `Zur Bestellung - ${price}`,

    yourOrder: "Ihre Bestellung",
    yourOrderEmpty: "Ihre Bestellung ist leer.",
    noteLabel: "Notiz",
    total: "Summe",
    placeOrder: "Bestellen",

    orderConfirmTitle: "Bestellbestätigung",
    orderConfirmSubtitle: (ok) => (ok ? "Daten eingeben und Bestellung senden." : "Restaurant nicht gefunden."),
    orderSummary: "Bestellübersicht",
    subtotal: "Zwischensumme",
    discount: "Rabatt",
    coupon: "Gutschein",
    couponPlaceholder: "Gutscheincode",
    apply: "Anwenden",
    info: "Angaben",
    nameLabel: "Name",
    namePlaceholder: "Vor- und Nachname",
    phoneLabel: "Telefon",
    phonePlaceholder: "Telefonnummer",
    tableLabel: "Tisch",
    optional: "Optional",
    tablePlaceholder: "z.B. 5, A12",
    sending: "Senden...",
    confirmOrder: "Bestellung bestätigen",

    couponInvalid: (fallback) => fallback || "Ungültiger Gutschein!",
    couponApplied: (d) => `Gutschein angewendet! Rabatt: ${Number.isFinite(d) ? d.toFixed(2) : "0.00"} ₺`,
    couponValidateError: "Gutschein konnte nicht geprüft werden.",
    orderSubmitError: (fallback) => fallback || "Bestellung fehlgeschlagen!",
    orderReceived: (n) => `Bestellung erhalten! Bestellnummer: ${n}`,
    genericErrorTryAgain: "Ein Fehler ist aufgetreten. Bitte erneut versuchen.",
    missingRestaurant: "Restaurantdaten nicht gefunden!",
    missingName: "Bitte Namen eingeben!",
    missingPhone: "Bitte Telefonnummer eingeben!",
    invalidPhone: "Bitte gültige Telefonnummer eingeben!",

    campaigns: "Aktionen",
    tapToCopy: "Klicken: Code kopieren",
    copyCouponTitle: "Gutscheincode kopieren",
    codeLabel: "CODE",
    minLabel: "Min",
    maxLabel: "Max",
    endsLabel: "Endet",
    copy: "Kopieren",
    couponCopied: (code) => `Code kopiert: ${code}`,
    couponCopyFailed: "Code konnte nicht kopiert werden.",
    campaignDot: (n) => `Aktion ${n}`,

    addItemAria: (name) => `${name} hinzufügen`,
  },
  ru: {
    language: "Язык",
    loadingMenu: "Загрузка меню...",
    searchPlaceholder: "Поиск в меню...",
    mostPopular: "Популярное",
    noMatches: "Ничего не найдено.",
    viewOrder: "Корзина",
    viewOrderAria: "Открыть корзину",
    cartEmpty: "Корзина пуста!",

    vegBadge: "Veg",
    vegetarian: "Вегетарианское",

    addNoteLabel: "Добавить заметку",
    addNotePlaceholder: "Есть пожелания?",
    addToOrderWithPrice: (price) => `Добавить - ${price}`,

    yourOrder: "Ваш заказ",
    yourOrderEmpty: "Заказ пуст.",
    noteLabel: "Примечание",
    total: "Итого",
    placeOrder: "Оформить",

    orderConfirmTitle: "Подтверждение заказа",
    orderConfirmSubtitle: (ok) => (ok ? "Введите данные и отправьте заказ." : "Ресторан не найден."),
    orderSummary: "Состав заказа",
    subtotal: "Промежуточный итог",
    discount: "Скидка",
    coupon: "Купон",
    couponPlaceholder: "Код купона",
    apply: "Применить",
    info: "Данные",
    nameLabel: "Имя",
    namePlaceholder: "Имя и фамилия",
    phoneLabel: "Телефон",
    phonePlaceholder: "Номер телефона",
    tableLabel: "Стол",
    optional: "Необязательно",
    tablePlaceholder: "например: 5, A12",
    sending: "Отправка...",
    confirmOrder: "Подтвердить",

    couponInvalid: (fallback) => fallback || "Купон недействителен!",
    couponApplied: (d) => `Купон применён! Скидка: ${Number.isFinite(d) ? d.toFixed(2) : "0.00"} ₺`,
    couponValidateError: "Не удалось проверить купон.",
    orderSubmitError: (fallback) => fallback || "Не удалось оформить заказ!",
    orderReceived: (n) => `Заказ принят! Номер заказа: ${n}`,
    genericErrorTryAgain: "Ошибка. Пожалуйста, попробуйте ещё раз.",
    missingRestaurant: "Данные ресторана не найдены!",
    missingName: "Введите имя!",
    missingPhone: "Введите телефон!",
    invalidPhone: "Введите корректный телефон!",

    campaigns: "Акции",
    tapToCopy: "Нажмите, чтобы скопировать",
    copyCouponTitle: "Скопировать код купона",
    codeLabel: "КОД",
    minLabel: "Мин",
    maxLabel: "Макс",
    endsLabel: "До",
    copy: "Копировать",
    couponCopied: (code) => `Код скопирован: ${code}`,
    couponCopyFailed: "Не удалось скопировать код.",
    campaignDot: (n) => `Акция ${n}`,

    addItemAria: (name) => `Добавить ${name}`,
  },
  ar: {
    language: "اللغة",
    loadingMenu: "جارٍ تحميل القائمة...",
    searchPlaceholder: "ابحث في القائمة...",
    mostPopular: "الأكثر طلباً",
    noMatches: "لا توجد نتائج.",
    viewOrder: "عرض الطلب",
    viewOrderAria: "عرض الطلب",
    cartEmpty: "سلة الطلب فارغة!",

    vegBadge: "Veg",
    vegetarian: "نباتي",

    addNoteLabel: "أضف ملاحظة",
    addNotePlaceholder: "هل هناك شيء يجب أن نعرفه؟",
    addToOrderWithPrice: (price) => `أضف للطلب - ${price}`,

    yourOrder: "طلبك",
    yourOrderEmpty: "طلبك فارغ.",
    noteLabel: "ملاحظة",
    total: "الإجمالي",
    placeOrder: "إرسال الطلب",

    orderConfirmTitle: "تأكيد الطلب",
    orderConfirmSubtitle: (ok) => (ok ? "أدخل معلوماتك ثم أرسل الطلب." : "لم يتم العثور على المطعم."),
    orderSummary: "ملخص الطلب",
    subtotal: "المجموع الفرعي",
    discount: "خصم",
    coupon: "كوبون",
    couponPlaceholder: "رمز الكوبون",
    apply: "تطبيق",
    info: "المعلومات",
    nameLabel: "الاسم",
    namePlaceholder: "الاسم الكامل",
    phoneLabel: "الهاتف",
    phonePlaceholder: "رقم الهاتف",
    tableLabel: "رقم الطاولة",
    optional: "اختياري",
    tablePlaceholder: "مثال: 5, A12",
    sending: "جارٍ الإرسال...",
    confirmOrder: "تأكيد الطلب",

    couponInvalid: (fallback) => fallback || "الكوبون غير صالح!",
    couponApplied: (d) => `تم تطبيق الكوبون! الخصم: ${Number.isFinite(d) ? d.toFixed(2) : "0.00"} ₺`,
    couponValidateError: "تعذر التحقق من الكوبون.",
    orderSubmitError: (fallback) => fallback || "تعذر إرسال الطلب!",
    orderReceived: (n) => `تم استلام الطلب! رقم الطلب: ${n}`,
    genericErrorTryAgain: "حدث خطأ. حاول مرة أخرى.",
    missingRestaurant: "تعذر العثور على معلومات المطعم!",
    missingName: "يرجى إدخال الاسم!",
    missingPhone: "يرجى إدخال رقم الهاتف!",
    invalidPhone: "يرجى إدخال رقم هاتف صحيح!",

    campaigns: "العروض",
    tapToCopy: "اضغط لنسخ الكوبون",
    copyCouponTitle: "نسخ رمز الكوبون",
    codeLabel: "الكود",
    minLabel: "الحد الأدنى",
    maxLabel: "الحد الأقصى",
    endsLabel: "ينتهي",
    copy: "نسخ",
    couponCopied: (code) => `تم نسخ الكود: ${code}`,
    couponCopyFailed: "تعذر نسخ الكود.",
    campaignDot: (n) => `عرض ${n}`,

    addItemAria: (name) => `أضف ${name}`,
  },
  fr: {
    language: "Langue",
    loadingMenu: "Chargement du menu...",
    searchPlaceholder: "Rechercher dans le menu...",
    mostPopular: "Les plus populaires",
    noMatches: "Aucun résultat.",
    viewOrder: "Voir la commande",
    viewOrderAria: "Voir la commande",
    cartEmpty: "Votre panier est vide !",

    vegBadge: "Veg",
    vegetarian: "Végétarien",

    addNoteLabel: "Ajouter une note",
    addNotePlaceholder: "Y a-t-il quelque chose à savoir ?",
    addToOrderWithPrice: (price) => `Ajouter - ${price}`,

    yourOrder: "Votre commande",
    yourOrderEmpty: "Votre commande est vide.",
    noteLabel: "Note",
    total: "Total",
    placeOrder: "Commander",

    orderConfirmTitle: "Confirmation de commande",
    orderConfirmSubtitle: (ok) => (ok ? "Saisissez vos informations et envoyez la commande." : "Restaurant introuvable."),
    orderSummary: "Récapitulatif",
    subtotal: "Sous-total",
    discount: "Remise",
    coupon: "Coupon",
    couponPlaceholder: "Code coupon",
    apply: "Appliquer",
    info: "Informations",
    nameLabel: "Nom",
    namePlaceholder: "Nom et prénom",
    phoneLabel: "Téléphone",
    phonePlaceholder: "Numéro de téléphone",
    tableLabel: "Table",
    optional: "Optionnel",
    tablePlaceholder: "ex : 5, A12",
    sending: "Envoi...",
    confirmOrder: "Confirmer",

    couponInvalid: (fallback) => fallback || "Coupon invalide !",
    couponApplied: (d) => `Coupon appliqué ! Remise : ${Number.isFinite(d) ? d.toFixed(2) : "0.00"} ₺`,
    couponValidateError: "Impossible de valider le coupon.",
    orderSubmitError: (fallback) => fallback || "Impossible de passer la commande !",
    orderReceived: (n) => `Commande reçue ! Numéro : ${n}`,
    genericErrorTryAgain: "Une erreur est survenue. Réessayez.",
    missingRestaurant: "Informations du restaurant introuvables !",
    missingName: "Veuillez saisir votre nom !",
    missingPhone: "Veuillez saisir votre téléphone !",
    invalidPhone: "Veuillez saisir un téléphone valide !",

    campaigns: "Offres",
    tapToCopy: "Cliquez pour copier",
    copyCouponTitle: "Copier le code",
    codeLabel: "CODE",
    minLabel: "Min",
    maxLabel: "Max",
    endsLabel: "Fin",
    copy: "Copier",
    couponCopied: (code) => `Code copié : ${code}`,
    couponCopyFailed: "Impossible de copier le code.",
    campaignDot: (n) => `Offre ${n}`,

    addItemAria: (name) => `Ajouter ${name}`,
  },
  es: {
    language: "Idioma",
    loadingMenu: "Cargando menú...",
    searchPlaceholder: "Buscar en el menú...",
    mostPopular: "Más populares",
    noMatches: "Sin resultados.",
    viewOrder: "Ver pedido",
    viewOrderAria: "Ver pedido",
    cartEmpty: "¡Tu carrito está vacío!",

    vegBadge: "Veg",
    vegetarian: "Vegetariano",

    addNoteLabel: "Añadir nota",
    addNotePlaceholder: "¿Algo que debamos saber?",
    addToOrderWithPrice: (price) => `Añadir - ${price}`,

    yourOrder: "Tu pedido",
    yourOrderEmpty: "Tu pedido está vacío.",
    noteLabel: "Nota",
    total: "Total",
    placeOrder: "Hacer pedido",

    orderConfirmTitle: "Confirmación del pedido",
    orderConfirmSubtitle: (ok) => (ok ? "Introduce tus datos y envía el pedido." : "Restaurante no encontrado."),
    orderSummary: "Resumen",
    subtotal: "Subtotal",
    discount: "Descuento",
    coupon: "Cupón",
    couponPlaceholder: "Código de cupón",
    apply: "Aplicar",
    info: "Datos",
    nameLabel: "Nombre",
    namePlaceholder: "Nombre y apellidos",
    phoneLabel: "Teléfono",
    phonePlaceholder: "Número de teléfono",
    tableLabel: "Mesa",
    optional: "Opcional",
    tablePlaceholder: "p. ej.: 5, A12",
    sending: "Enviando...",
    confirmOrder: "Confirmar",

    couponInvalid: (fallback) => fallback || "¡Cupón inválido!",
    couponApplied: (d) => `Cupón aplicado. Descuento: ${Number.isFinite(d) ? d.toFixed(2) : "0.00"} ₺`,
    couponValidateError: "No se pudo validar el cupón.",
    orderSubmitError: (fallback) => fallback || "No se pudo hacer el pedido.",
    orderReceived: (n) => `Pedido recibido. Número: ${n}`,
    genericErrorTryAgain: "Algo salió mal. Inténtalo de nuevo.",
    missingRestaurant: "¡No se encontró la información del restaurante!",
    missingName: "¡Introduce tu nombre!",
    missingPhone: "¡Introduce tu teléfono!",
    invalidPhone: "¡Introduce un teléfono válido!",

    campaigns: "Promos",
    tapToCopy: "Haz clic para copiar",
    copyCouponTitle: "Copiar código",
    codeLabel: "CÓDIGO",
    minLabel: "Mín",
    maxLabel: "Máx",
    endsLabel: "Termina",
    copy: "Copiar",
    couponCopied: (code) => `Código copiado: ${code}`,
    couponCopyFailed: "No se pudo copiar el código.",
    campaignDot: (n) => `Promo ${n}`,

    addItemAria: (name) => `Añadir ${name}`,
  },
};

function safeCentsFromTry(priceTry: number) {
  const n = Number(priceTry);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}

function tabId(raw: string) {
  return `menu-tab-${raw.toLowerCase().replaceAll(" ", "-").replaceAll("/", "-")}`;
}

export function BoltMenuForSlugClient() {
  const params = useParams();
  const slug = (params?.slug as string) || "";
  const router = useRouter();

  const [lang, setLang] = useState<Lang>("tr");

  const [restaurant, setRestaurant] = useState<ApiRestaurant | null>(null);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [campaigns, setCampaigns] = useState<ApiCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("Most Popular");
  const [selected, setSelected] = useState<BoltItem | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartLines, setCartLines] = useState<CartLine[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [orderForm, setOrderForm] = useState({
    customerName: "",
    customerPhone: "",
    tableNumber: "",
  });
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discountTry, setDiscountTry] = useState(0);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const S = STRINGS[lang];

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("qrmenu_lang");
      if (!raw) return;
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

  const popularScrollRef = useRef<HTMLDivElement | null>(null);
  const popularDragRef = useRef({
    isDown: false,
    startX: 0,
    scrollLeft: 0,
  });

  useEffect(() => {
    const fetchMenu = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/menu/${slug}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Menu fetch failed");
        const data = (await res.json()) as {
          restaurant: ApiRestaurant;
          categories: ApiCategory[];
          campaigns?: ApiCampaign[];
        };
        setRestaurant(data.restaurant);
        setCategories(data.categories ?? []);
        setCampaigns((data.campaigns ?? []).slice(0, 10));
      } catch (e) {
        console.error(e);
        setRestaurant(null);
        setCategories([]);
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchMenu();
  }, [slug]);

  const tabs = useMemo(() => {
    const dynamic = [...categories]
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((c) => ({ id: c.id, name: c.name }));
    return [{ id: "most-popular", name: "Most Popular" }, ...dynamic];
  }, [categories]);

  const items = useMemo(() => {
    const fromApi: BoltItem[] = [];
    for (const cat of categories) {
      const ps = (cat.products ?? [])
        .filter((p) => p.isAvailable && (p.stock === null || p.stock > 0))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      for (const p of ps) {
        const desc = (p.description ?? "").trim();
        const short = desc ? desc : "—";
        const looksVeg = /vegan|vejetaryen|vegetarian/i.test(`${p.name} ${p.description ?? ""}`);
        fromApi.push({
          id: p.id,
          categoryId: cat.id,
          categoryName: cat.name,
          name: p.name,
          shortDescription: short,
          description: desc || short,
          priceCents: safeCentsFromTry(p.price),
          imageUrl:
            p.image ||
            "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
          isVegetarian: looksVeg || undefined,
        });
      }
    }
    return fromApi;
  }, [categories]);

  const filteredItems = useMemo(() => {
    const q = normalize(query);
    if (!q) return items;
    return items.filter(
      (i) =>
        normalize(i.name).includes(q) ||
        normalize(i.shortDescription).includes(q) ||
        normalize(i.description).includes(q)
    );
  }, [items, query]);

  const popular = useMemo(() => {
    // DB tarafında "popüler" alanı olmadığı için ilk 10 ürünü vitrin olarak gösteriyoruz.
    return filteredItems.slice(0, 10);
  }, [filteredItems]);

  const cartTotals = useMemo(() => {
    const itemCount = cartLines.reduce((sum, l) => sum + l.quantity, 0);
    const totalCents = cartLines.reduce((sum, l) => sum + l.item.priceCents * l.quantity, 0);
    return { itemCount, totalCents };
  }, [cartLines]);

  const discountedTotalTry = useMemo(() => {
    const subtotal = cartTotals.totalCents / 100;
    return Math.max(0, subtotal - (discountTry || 0));
  }, [cartTotals.totalCents, discountTry]);

  const applyCoupon = async () => {
    const code = (couponCode || "").trim().toUpperCase();
    if (!code) {
      setDiscountTry(0);
      return;
    }
    const subtotal = cartTotals.totalCents / 100;
    setIsValidatingCoupon(true);
    try {
      const res = await fetch(`/api/campaigns/validate?code=${encodeURIComponent(code)}&amount=${subtotal}`);
      const data = await res.json();
      if (!res.ok || !data?.valid) {
        setDiscountTry(0);
        toast.error(S.couponInvalid(data?.error));
        return;
      }
      const d = Number(data.discount || 0);
      setDiscountTry(Number.isFinite(d) ? d : 0);
      toast.success(S.couponApplied(Number.isFinite(d) ? d : 0));
    } catch (e) {
      console.error(e);
      setDiscountTry(0);
      toast.error(S.couponValidateError);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const addLine = (it: BoltItem, qty: number, note?: string) => {
    const q = Math.max(1, Math.floor(qty || 1));
    setCartLines((prev) => {
      const existing = prev.find((l) => l.item.id === it.id);
      if (!existing) return [...prev, { item: it, quantity: q, note: note?.trim() || undefined }];
      return prev.map((l) =>
        l.item.id === it.id
          ? {
              ...l,
              quantity: l.quantity + q,
              note: (note?.trim() ? note.trim() : l.note) || undefined,
            }
          : l
      );
    });
  };

  const setLineQty = (id: string, qty: number) => {
    const q = Math.max(0, Math.floor(qty || 0));
    setCartLines((prev) => prev.filter((l) => l.item.id !== id || q > 0).map((l) => (l.item.id === id ? { ...l, quantity: q } : l)));
  };

  const grouped = useMemo(() => {
    const map = new Map<string, { id: string; name: string; items: BoltItem[] }>();
    for (const cat of categories) map.set(cat.id, { id: cat.id, name: cat.name, items: [] });
    for (const it of filteredItems) {
      if (!map.has(it.categoryId)) {
        map.set(it.categoryId, { id: it.categoryId, name: it.categoryName, items: [] });
      }
      map.get(it.categoryId)!.items.push(it);
    }
    const arr: Array<{ id: string; name: string; items: BoltItem[] }> = [];
    map.forEach((v) => arr.push(v));
    return arr.filter((g) => g.items.length > 0);
  }, [categories, filteredItems]);

  // Sync active tab with scroll
  useEffect(() => {
    const els = tabs
      .map((t) => document.getElementById(tabId(t.name)))
      .filter(Boolean) as HTMLElement[];

    if (els.length === 0) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];
        const name = visible?.target?.getAttribute("data-tab");
        if (name) setActiveTab(name);
      },
      { threshold: [0.2, 0.35, 0.6], rootMargin: "-20% 0px -70% 0px" }
    );
    for (const el of els) obs.observe(el);
    return () => obs.disconnect();
  }, [tabs]);

  const scrollTo = (name: string) => {
    const el = document.getElementById(tabId(name));
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveTab(name);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900 mx-auto" />
          <p className="mt-4 text-gray-600 font-medium">{S.loadingMenu}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black pb-24">
      <div className="mx-auto w-full max-w-[720px] md:max-w-[900px] lg:max-w-[1100px] px-4 pb-6 pt-4">
        {campaigns.length > 0 ? (
          <CampaignMarquee campaigns={campaigns} labels={S} />
        ) : null}
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {restaurant ? (
              <>
                <div className="text-xl font-extrabold text-gray-950">{restaurant.name}</div>
                {restaurant.description ? (
                  <div className="mt-1 text-sm text-gray-500">{restaurant.description}</div>
                ) : null}
              </>
            ) : null}
          </div>

          <div className="shrink-0">
            <label className="sr-only" htmlFor="menu-language">
              {S.language}
            </label>
            <div className="relative">
              <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <select
                id="menu-language"
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
          </div>
        </div>

        {/* Search + add product */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={S.searchPlaceholder}
            className="h-12 w-full rounded-full border-2 border-gray-200 bg-gray-50 pl-12 pr-4 text-sm font-semibold text-gray-950 placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
          />
        </div>
      </div>

      {/* Sticky tabs */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="mx-auto w-full max-w-[720px] md:max-w-[900px] lg:max-w-[1100px] px-4 py-3">
          <div className="flex gap-5 overflow-x-auto whitespace-nowrap pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tabs.map((t) => {
              const active = t.name === activeTab;
              const label = t.name === "Most Popular" ? S.mostPopular : t.name;
              return (
                <button
                  key={t.id}
                  onClick={() => scrollTo(t.name)}
                  className={[
                    "relative pb-2 text-sm font-semibold transition-colors",
                    active ? "text-gray-950" : "text-gray-500 hover:text-gray-800",
                  ].join(" ")}
                >
                  {label}
                  <span
                    className={[
                      "absolute left-0 right-0 -bottom-[1px] h-[2px] rounded-full transition-opacity",
                      active ? "bg-emerald-500 opacity-100" : "bg-transparent opacity-0",
                    ].join(" ")}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[720px] md:max-w-[900px] lg:max-w-[1100px] px-4">
        {/* Most Popular */}
        <section id={tabId("Most Popular")} data-tab="Most Popular" className="scroll-mt-24">
          <div className="mt-6 flex items-end justify-between">
            <h2 className="text-xl font-extrabold text-gray-950">{S.mostPopular}</h2>
          </div>

          <div
            ref={popularScrollRef}
            className="mt-4 -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory select-none cursor-grab active:cursor-grabbing [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            onMouseDown={(e) => {
              const el = popularScrollRef.current;
              if (!el) return;
              popularDragRef.current.isDown = true;
              popularDragRef.current.startX = e.pageX;
              popularDragRef.current.scrollLeft = el.scrollLeft;
            }}
            onMouseLeave={() => {
              popularDragRef.current.isDown = false;
            }}
            onMouseUp={() => {
              popularDragRef.current.isDown = false;
            }}
            onMouseMove={(e) => {
              const el = popularScrollRef.current;
              if (!el) return;
              if (!popularDragRef.current.isDown) return;
              e.preventDefault();
              const dx = e.pageX - popularDragRef.current.startX;
              el.scrollLeft = popularDragRef.current.scrollLeft - dx;
            }}
          >
            {popular.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelected(item)}
                className="snap-start shrink-0 w-[240px] md:w-[260px] rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden text-left"
              >
                <div className="relative h-40 w-full bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute bottom-3 right-3 rounded-full bg-white/95 px-3 py-1 text-sm font-extrabold text-gray-950 shadow">
                    {formatTry(item.priceCents)}
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-sm font-extrabold text-gray-950">{item.name}</div>
                  <div className="mt-1 text-xs text-gray-500 line-clamp-1">
                    {item.shortDescription}
                  </div>
                </div>
              </button>
            ))}
            {popular.length === 0 ? (
              <div className="px-1 py-8 text-sm text-gray-500">{S.noMatches}</div>
            ) : null}
          </div>
        </section>

        {/* Categories */}
        <div className="mt-8 space-y-10">
          {grouped.map((cat) => (
            <section
              key={cat.id}
              id={tabId(cat.name)}
              data-tab={cat.name}
              className="scroll-mt-24"
            >
              <h3 className="text-lg font-extrabold text-gray-950">{cat.name}</h3>
              <div className="mt-4 divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white">
                {cat.items.map((item) => (
                  <MenuRow key={item.id} item={item} onOpen={() => setSelected(item)} labels={S} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* Floating mini cart bar */}
      <AnimatePresence>
        {cartTotals.totalCents > 0 ? (
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="fixed inset-x-0 bottom-4 z-40 px-4"
          >
            <button
              className="mx-auto flex w-full max-w-[720px] md:max-w-[900px] lg:max-w-[1100px] items-center justify-between rounded-full bg-emerald-500 px-5 py-4 text-white shadow-lg"
              aria-label={S.viewOrderAria}
              onClick={() => setCartOpen(true)}
            >
              <span className="text-sm font-extrabold">{S.viewOrder}</span>
              <span className="text-sm font-extrabold">{formatTry(cartTotals.totalCents)}</span>
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <ProductSheet
        item={selected}
        onClose={() => setSelected(null)}
        onAdd={(it, qty, note) => addLine(it, qty, note)}
        labels={S}
      />

      <OrderSheet
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        lines={cartLines}
        onSetQty={setLineQty}
        totalCents={cartTotals.totalCents}
        onConfirm={() => {
          if (cartLines.length === 0) {
            toast.error(S.cartEmpty);
            return;
          }
          setConfirmOpen(true);
        }}
        labels={S}
      />

      <OrderConfirmSheet
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        restaurantId={restaurant?.id ?? null}
        lines={cartLines}
        subtotalTry={cartTotals.totalCents / 100}
        discountTry={discountTry}
        totalTry={discountedTotalTry}
        orderForm={orderForm}
        setOrderForm={setOrderForm}
        isSubmitting={isSubmittingOrder}
        couponCode={couponCode}
        setCouponCode={setCouponCode}
        isValidatingCoupon={isValidatingCoupon}
        onApplyCoupon={applyCoupon}
        labels={S}
        onSubmit={async () => {
          if (cartLines.length === 0) {
            toast.error(S.cartEmpty);
            return;
          }
          if (!restaurant?.id) {
            toast.error(S.missingRestaurant);
            return;
          }

          if (!orderForm.customerName.trim()) {
            toast.error(S.missingName);
            return;
          }
          if (!orderForm.customerPhone.trim()) {
            toast.error(S.missingPhone);
            return;
          }
          const phoneRegex = /^[0-9+\-\s()]+$/;
          if (!phoneRegex.test(orderForm.customerPhone.trim())) {
            toast.error(S.invalidPhone);
            return;
          }

          setIsSubmittingOrder(true);
          try {
            const res = await fetch("/api/orders", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                restaurantId: restaurant.id,
                tableNumber: orderForm.tableNumber.trim() || null,
                customerName: orderForm.customerName.trim(),
                customerPhone: orderForm.customerPhone.trim(),
                couponCode: (couponCode || "").trim() ? (couponCode || "").trim().toUpperCase() : null,
                items: cartLines.map((l) => ({
                  productId: l.item.id,
                  quantity: l.quantity,
                  price: l.item.priceCents / 100,
                  notes: l.note || null,
                })),
              }),
            });

            const data = await res.json();
            if (!res.ok) {
              toast.error(S.orderSubmitError(data?.error));
              return;
            }

            const orderNumber = data.orderNumber;
            toast.success(S.orderReceived(orderNumber));

            setCartLines([]);
            setConfirmOpen(false);
            setCartOpen(false);
            setOrderForm({ customerName: "", customerPhone: "", tableNumber: "" });
            setCouponCode("");
            setDiscountTry(0);

            router.push(`/order/${orderNumber}`);
          } catch (e) {
            console.error(e);
            toast.error(S.genericErrorTryAgain);
          } finally {
            setIsSubmittingOrder(false);
          }
        }}
      />
    </div>
  );
}

function MenuRow({ item, onOpen, labels }: { item: BoltItem; onOpen: () => void; labels: Strings }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onOpen();
      }}
      className="w-full text-left focus:outline-none"
    >
      <div className="flex gap-4 p-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <div className="text-sm font-extrabold text-gray-950">{item.name}</div>
            {item.isVegetarian ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                <Leaf className="h-3 w-3" />
                {labels.vegBadge}
              </span>
            ) : null}
          </div>
          <div className="mt-1 text-xs text-gray-500 line-clamp-2">{item.shortDescription}</div>
          <div className="mt-2 text-sm font-extrabold text-gray-950">{formatTry(item.priceCents)}</div>
        </div>

        <div className="relative h-[86px] w-[98px] shrink-0">
          <div className="h-full w-full overflow-hidden rounded-2xl bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
            className="absolute -bottom-2 -right-2 grid h-9 w-9 place-items-center rounded-full bg-white shadow-lg ring-1 ring-black/5"
            aria-label={labels.addItemAria(item.name)}
          >
            <Plus className="h-5 w-5 text-emerald-600" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductSheet({
  item,
  onClose,
  onAdd,
  labels,
}: {
  item: BoltItem | null;
  onClose: () => void;
  onAdd: (item: BoltItem, qty: number, note?: string) => void;
  labels: Strings;
}) {
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const lastItemId = useRef<string | null>(null);

  useEffect(() => {
    if (!item) return;
    if (lastItemId.current !== item.id) {
      setQty(1);
      setNote("");
      lastItemId.current = item.id;
    }
  }, [item]);

  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [item, onClose]);

  useEffect(() => {
    if (!item) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [item]);

  const totalCents = (item?.priceCents ?? 0) * qty;

  return (
    <AnimatePresence>
      {item ? (
        <>
          <motion.button
            aria-label="Close"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 420, damping: 38 }}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[720px] overflow-hidden rounded-t-3xl bg-white shadow-2xl"
          >
            <div className="relative">
              <div className="h-[240px] w-full bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
              </div>
              <button
                onClick={onClose}
                className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/90 shadow ring-1 ring-black/5"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-gray-900" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto px-5 pb-28 pt-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xl font-extrabold text-gray-950">{item.name}</div>
                  <div className="mt-2 text-sm font-extrabold text-gray-950">
                    {formatTry(item.priceCents)}
                  </div>
                </div>
                {item.isVegetarian ? (
                  <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    <Leaf className="h-4 w-4" />
                    {labels.vegetarian}
                  </span>
                ) : null}
              </div>

              <p className="mt-3 text-sm leading-relaxed text-gray-600">{item.description}</p>

              <div className="mt-6">
                <label className="text-sm font-bold text-gray-900">{labels.addNoteLabel}</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={labels.addNotePlaceholder}
                  className="mt-2 w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"
                  rows={3}
                />
              </div>
            </div>

            {/* Sticky bottom action bar */}
            <div className="absolute inset-x-0 bottom-0 border-t border-gray-100 bg-white/95 backdrop-blur">
              <div className="flex items-center gap-3 px-5 py-4">
                <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-2 py-2 shadow-sm">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="grid h-9 w-9 place-items-center rounded-full bg-gray-50 text-gray-900"
                    aria-label="Decrease quantity"
                  >
                    <span className="text-lg font-extrabold leading-none">-</span>
                  </button>
                  <div className="w-8 text-center text-sm font-extrabold text-gray-950">{qty}</div>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="grid h-9 w-9 place-items-center rounded-full bg-gray-50 text-gray-900"
                    aria-label="Increase quantity"
                  >
                    <span className="text-lg font-extrabold leading-none">+</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    onAdd(item, qty, note);
                    onClose();
                  }}
                  className="flex-1 rounded-full bg-emerald-500 px-5 py-4 text-sm font-extrabold text-white shadow-lg hover:bg-emerald-600"
                >
                  {labels.addToOrderWithPrice(formatTry(totalCents))}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function OrderSheet({
  open,
  onClose,
  lines,
  onSetQty,
  totalCents,
  onConfirm,
  labels,
}: {
  open: boolean;
  onClose: () => void;
  lines: CartLine[];
  onSetQty: (itemId: string, qty: number) => void;
  totalCents: number;
  onConfirm: () => void;
  labels: Strings;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            aria-label="Close"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 420, damping: 38 }}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[720px] overflow-hidden rounded-t-3xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="text-lg font-extrabold text-gray-950">{labels.yourOrder}</div>
              <button
                onClick={onClose}
                className="grid h-10 w-10 place-items-center rounded-full bg-gray-50 text-gray-900"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[65vh] overflow-y-auto px-5 py-4">
              {lines.length === 0 ? (
                <div className="py-10 text-center text-sm text-gray-500">{labels.yourOrderEmpty}</div>
              ) : (
                <div className="space-y-3">
                  {lines.map((l) => (
                    <div
                      key={l.item.id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-extrabold text-gray-950 line-clamp-1">
                          {l.item.name}
                        </div>
                        <div className="mt-1 text-xs font-semibold text-gray-500">
                          {formatTry(l.item.priceCents)}
                        </div>
                        {l.note ? (
                          <div className="mt-1 text-xs text-gray-500 line-clamp-2">
                            <span className="font-bold text-gray-600">{labels.noteLabel}:</span> {l.note}
                          </div>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => onSetQty(l.item.id, l.quantity - 1)}
                          className="grid h-10 w-10 place-items-center rounded-full bg-gray-50 text-gray-900"
                          aria-label="Decrease"
                        >
                          <Minus className="h-5 w-5" />
                        </button>
                        <div className="w-8 text-center text-sm font-extrabold text-gray-950">
                          {l.quantity}
                        </div>
                        <button
                          onClick={() => onSetQty(l.item.id, l.quantity + 1)}
                          className="grid h-10 w-10 place-items-center rounded-full bg-gray-50 text-gray-900"
                          aria-label="Increase"
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 bg-white/95 backdrop-blur px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-gray-600">{labels.total}</div>
                <div className="text-sm font-extrabold text-gray-950">{formatTry(totalCents)}</div>
              </div>
              <button
                onClick={onConfirm}
                className="mt-3 w-full rounded-full bg-emerald-500 px-5 py-4 text-sm font-extrabold text-white shadow-lg hover:bg-emerald-600 disabled:opacity-50"
                disabled={lines.length === 0}
              >
                {labels.placeOrder}
              </button>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function OrderConfirmSheet({
  open,
  onClose,
  restaurantId,
  lines,
  subtotalTry,
  discountTry,
  totalTry,
  orderForm,
  setOrderForm,
  isSubmitting,
  couponCode,
  setCouponCode,
  isValidatingCoupon,
  onApplyCoupon,
  onSubmit,
  labels,
}: {
  open: boolean;
  onClose: () => void;
  restaurantId: string | null;
  lines: CartLine[];
  subtotalTry: number;
  discountTry: number;
  totalTry: number;
  orderForm: { customerName: string; customerPhone: string; tableNumber: string };
  setOrderForm: React.Dispatch<
    React.SetStateAction<{ customerName: string; customerPhone: string; tableNumber: string }>
  >;
  isSubmitting: boolean;
  couponCode: string;
  setCouponCode: React.Dispatch<React.SetStateAction<string>>;
  isValidatingCoupon: boolean;
  onApplyCoupon: () => Promise<void>;
  onSubmit: () => Promise<void>;
  labels: Strings;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            aria-label="Close"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 420, damping: 38 }}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[720px] overflow-hidden rounded-t-3xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <div className="text-lg font-extrabold text-gray-950">{labels.orderConfirmTitle}</div>
                <div className="mt-1 text-xs text-gray-500">
                  {labels.orderConfirmSubtitle(Boolean(restaurantId))}
                </div>
              </div>
              <button
                onClick={onClose}
                className="grid h-10 w-10 place-items-center rounded-full bg-gray-50 text-gray-900"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[65vh] overflow-y-auto px-5 py-4 space-y-4">
              <div className="rounded-2xl border border-gray-100 bg-white p-4">
                <div className="text-sm font-extrabold text-gray-950">{labels.orderSummary}</div>
                <div className="mt-2 space-y-2 text-sm">
                  {lines.map((l) => (
                    <div key={l.item.id} className="flex justify-between gap-3">
                      <span className="text-gray-700 font-medium">
                        {l.item.name} x {l.quantity}
                      </span>
                      <span className="font-extrabold text-gray-950">
                        {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(
                          (l.item.priceCents * l.quantity) / 100
                        )}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-600">{labels.subtotal}</span>
                  <span className="text-sm font-extrabold text-gray-950">
                    {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(subtotalTry)}
                  </span>
                </div>
                {discountTry > 0 ? (
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-emerald-700">{labels.discount}</span>
                    <span className="font-extrabold text-emerald-700">
                      -{new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(discountTry)}
                    </span>
                  </div>
                ) : null}
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="font-semibold text-gray-900">{labels.total}</span>
                  <span className="font-extrabold text-gray-950">
                    {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(totalTry)}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-4 space-y-3">
                <div className="text-sm font-extrabold text-gray-950">{labels.coupon}</div>
                <div className="flex gap-2">
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder={labels.couponPlaceholder}
                    className="h-11 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm font-semibold text-gray-950 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={onApplyCoupon}
                    disabled={isValidatingCoupon}
                    className="shrink-0 rounded-2xl bg-gray-900 px-4 text-sm font-extrabold text-white hover:bg-gray-800 disabled:opacity-50"
                  >
                    {isValidatingCoupon ? "..." : labels.apply}
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-4 space-y-3">
                <div className="text-sm font-extrabold text-gray-950">{labels.info}</div>

                <div className="grid gap-2">
                  <label className="text-xs font-bold text-gray-700">
                    {labels.nameLabel} <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={orderForm.customerName}
                    onChange={(e) => setOrderForm((s) => ({ ...s, customerName: e.target.value }))}
                    className="h-11 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm font-semibold text-gray-950 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"
                    placeholder={labels.namePlaceholder}
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-xs font-bold text-gray-700">
                    {labels.phoneLabel} <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={orderForm.customerPhone}
                    onChange={(e) => setOrderForm((s) => ({ ...s, customerPhone: e.target.value }))}
                    className="h-11 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm font-semibold text-gray-950 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"
                    placeholder={labels.phonePlaceholder}
                    inputMode="tel"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-xs font-bold text-gray-700">
                    {labels.tableLabel} <span className="text-gray-400">({labels.optional})</span>
                  </label>
                  <input
                    value={orderForm.tableNumber}
                    onChange={(e) => setOrderForm((s) => ({ ...s, tableNumber: e.target.value }))}
                    className="h-11 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm font-semibold text-gray-950 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"
                    placeholder={labels.tablePlaceholder}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 bg-white/95 backdrop-blur px-5 py-4">
              <button
                onClick={onSubmit}
                disabled={isSubmitting || !restaurantId || lines.length === 0}
                className="w-full rounded-full bg-emerald-500 px-5 py-4 text-sm font-extrabold text-white shadow-lg hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500"
              >
                {isSubmitting ? labels.sending : labels.confirmOrder}
              </button>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function CampaignMarquee({ campaigns, labels }: { campaigns: ApiCampaign[]; labels: Strings }) {
  const list = campaigns.slice(0, 10);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const formatDiscount = (c: ApiCampaign) => {
    if (c.type === "percentage") return `%${c.value}`;
    if (c.type === "fixed") return `${c.value}₺`;
    return `${c.value}`;
  };

  const formatDateShort = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("tr-TR", { day: "2-digit", month: "short" });
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success(labels.couponCopied(code));
    } catch {
      toast(labels.couponCopyFailed);
    }
  };

  useEffect(() => {
    if (paused) return;
    if (list.length <= 1) return;
    const t = setInterval(() => {
      setActive((i) => (i + 1) % list.length);
    }, 4500);
    return () => clearInterval(t);
  }, [list.length, paused]);

  useEffect(() => {
    // keep active index in range if list changes
    setActive((i) => (list.length === 0 ? 0 : Math.min(i, list.length - 1)));
  }, [list.length]);

  if (list.length === 0) return null;

  const current = list[active];

  return (
    <div
      className="mb-4 overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-emerald-50"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="px-3 pt-2">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-black text-emerald-800">
            {labels.campaigns}
          </span>
          <div className="text-[11px] text-gray-500">
            {labels.tapToCopy}
          </div>
        </div>
      </div>

      <div className="px-3 pb-3 pt-2">
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.button
              key={current.id}
              type="button"
              onClick={() => copyCode(current.code)}
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -28 }}
              transition={{ type: "tween", duration: 0.28, ease: "easeOut" }}
              className="w-full rounded-2xl border border-emerald-200 bg-white/90 px-4 py-3 text-left shadow-sm hover:bg-white"
              title={labels.copyCouponTitle}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-extrabold text-gray-900 truncate">
                    {current.name}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-gray-600">
                    <span className="text-emerald-700 font-extrabold">{formatDiscount(current)}</span>
                    <span className="font-black tracking-wider text-gray-900">
                      {labels.codeLabel}: <span className="font-mono">{current.code}</span>
                    </span>
                    {current.minAmount ? <span>{labels.minLabel} {current.minAmount}₺</span> : null}
                    {current.maxDiscount ? <span>{labels.maxLabel} {current.maxDiscount}₺</span> : null}
                    <span>{labels.endsLabel} {formatDateShort(current.endDate)}</span>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-emerald-600 px-3 py-1 text-xs font-extrabold text-white">
                  {labels.copy}
                </span>
              </div>
            </motion.button>
          </AnimatePresence>
        </div>

        {list.length > 1 ? (
          <div className="mt-2 flex items-center justify-center gap-1.5">
            {list.map((c, i) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActive(i)}
                className={[
                  "h-1.5 rounded-full transition-all",
                  i === active ? "w-6 bg-emerald-500" : "w-1.5 bg-emerald-200 hover:bg-emerald-300",
                ].join(" ")}
                aria-label={labels.campaignDot(i + 1)}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

