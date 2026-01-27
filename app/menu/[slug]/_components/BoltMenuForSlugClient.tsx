"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Globe, Leaf, Minus, Plus, Search, X, Bell, Receipt, Menu } from "lucide-react";
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
  enableTakeaway?: boolean;
  theme?: string;
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
  stock: number | null; // null = sınırsız
};

type CartLine = {
  item: BoltItem;
  quantity: number;
  note?: string;
};

type OrderType = "restaurant" | "takeaway";

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

  orderTypeTitle: string;
  orderTypeRestaurant: string;
  orderTypeTakeaway: string;

  stockLabel: string;
  stockUnlimited: string;
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

    orderTypeTitle: "Sipariş türü",
    orderTypeRestaurant: "Restoran siparişi",
    orderTypeTakeaway: "Gel al",

    stockLabel: "Stok",
    stockUnlimited: "Sınırsız",
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

    orderTypeTitle: "Order type",
    orderTypeRestaurant: "Restaurant order",
    orderTypeTakeaway: "Takeaway",

    stockLabel: "Stock",
    stockUnlimited: "Unlimited",
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

    orderTypeTitle: "Bestellart",
    orderTypeRestaurant: "Im Restaurant",
    orderTypeTakeaway: "Zum Mitnehmen",

    stockLabel: "Bestand",
    stockUnlimited: "Unbegrenzt",
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

    orderTypeTitle: "Тип заказа",
    orderTypeRestaurant: "В ресторане",
    orderTypeTakeaway: "С собой",

    stockLabel: "Наличие",
    stockUnlimited: "Без ограничений",
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

    orderTypeTitle: "نوع الطلب",
    orderTypeRestaurant: "طلب داخل المطعم",
    orderTypeTakeaway: "استلام",

    stockLabel: "المخزون",
    stockUnlimited: "غير محدود",
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

    orderTypeTitle: "Type de commande",
    orderTypeRestaurant: "Sur place",
    orderTypeTakeaway: "À emporter",

    stockLabel: "Stock",
    stockUnlimited: "Illimité",
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

    orderTypeTitle: "Tipo de pedido",
    orderTypeRestaurant: "En el restaurante",
    orderTypeTakeaway: "Para llevar",

    stockLabel: "Stock",
    stockUnlimited: "Ilimitado",
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
  const searchParams = useSearchParams();
  const slug = (params?.slug as string) || "";
  const router = useRouter();

  const [lang, setLang] = useState<Lang>("tr");
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const orderNumber = searchParams.get("orderNumber");

  // Ensure body overflow is restored on mount/unmount
  useEffect(() => {
    // Restore body overflow when component mounts (in case it was locked)
    document.body.style.overflow = "";
    
    return () => {
      // Ensure body overflow is restored on unmount
      document.body.style.overflow = "";
    };
  }, []);

  const [restaurant, setRestaurant] = useState<ApiRestaurant | null>(null);
  
  // Get theme from URL param (for preview) - URL param has priority, then restaurant data
  const theme = searchParams.get("theme") || restaurant?.theme || "default";
  
  // Check for payment success
  useEffect(() => {
    if (searchParams.get("payment") === "success") {
      setShowPaymentSuccess(true);
      // Remove payment parameter from URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("payment");
      if (orderNumber) {
        newUrl.searchParams.delete("orderNumber");
      }
      window.history.replaceState({}, "", newUrl.toString());
      
      // Hide message after 5 seconds
      setTimeout(() => {
        setShowPaymentSuccess(false);
      }, 5000);
    }
  }, [searchParams, orderNumber]);
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
  const [orderType, setOrderType] = useState<OrderType>("restaurant");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discountTry, setDiscountTry] = useState(0);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isRequestingWaiter, setIsRequestingWaiter] = useState(false);
  const [isRequestingBill, setIsRequestingBill] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestType, setRequestType] = useState<"waiter" | "bill" | null>(null);
  const [requestTableNumber, setRequestTableNumber] = useState("");
  const [requestNote, setRequestNote] = useState("");

  const S = STRINGS[lang];
  const enableTakeaway = restaurant?.enableTakeaway ?? true;

  const openRequestModal = (type: "waiter" | "bill") => {
    setRequestType(type);
    setRequestTableNumber(orderForm.tableNumber || "");
    setRequestNote("");
    setRequestModalOpen(true);
  };

  const handleSubmitRequest = async () => {
    if (!restaurant?.id || !requestType) {
      toast.error("Restoran bilgisi bulunamadı");
      return;
    }

    if (!requestTableNumber.trim()) {
      toast.error("Lütfen masa numarası girin");
      return;
    }

    if (requestType === "waiter") {
      setIsRequestingWaiter(true);
    } else {
      setIsRequestingBill(true);
    }

    try {
      const res = await fetch("/api/table-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: restaurant.id,
          type: requestType,
          tableNumber: requestTableNumber.trim() || null,
          note: requestNote.trim() || null,
        }),
      });
      if (res.ok) {
        toast.success(
          requestType === "waiter" ? "Garson çağrıldı!" : "Hesap istendi!"
        );
        setRequestModalOpen(false);
        setRequestTableNumber("");
        setRequestNote("");
        setRequestType(null);
      } else {
        toast.error(
          requestType === "waiter"
            ? "Garson çağrılırken bir hata oluştu"
            : "Hesap istenirken bir hata oluştu"
        );
      }
    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error("Bir hata oluştu");
    } finally {
      setIsRequestingWaiter(false);
      setIsRequestingBill(false);
    }
  };

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

  useEffect(() => {
    if (!enableTakeaway) {
      setOrderType("restaurant");
    }
  }, [enableTakeaway]);

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
        const res = await fetch(`/api/menu/${slug}?lang=${encodeURIComponent(lang)}`, { cache: "no-store" });
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
  }, [slug, lang]);

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
          stock: p.stock ?? null,
        });
      }
    }
    return fromApi;
  }, [categories]);

  // When language changes, refresh any already-selected/cart items
  useEffect(() => {
    if (items.length === 0) return;
    const byId = new Map(items.map((i) => [i.id, i] as const));

    setSelected((prev) => {
      if (!prev) return prev;
      return byId.get(prev.id) ?? prev;
    });

    setCartLines((prev) =>
      prev.map((l) => ({
        ...l,
        item: byId.get(l.item.id) ?? l.item,
      }))
    );
  }, [items]);

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

  // Theme-specific layout renderer
  const renderThemeLayout = () => {
    if (theme === "paper") {
      // KAĞIT MENÜ: Demo sayfası gibi - çok basit, sade liste, görsel yok
      return (
        <>
          {/* Most Popular - Kağıt Stili (Basit Liste) */}
          {popular.length > 0 && (
            <section id={tabId("Most Popular")} data-tab="Most Popular" className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-amber-900 mt-8 mb-4">
                {S.mostPopular}
              </h2>
              <div className="space-y-0 bg-white border-l-4 border-amber-600">
                {popular.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => setSelected(item)}
                    className="w-full text-left py-3 px-4 hover:bg-amber-50/50 transition-colors border-b border-amber-100 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="text-base font-semibold text-gray-900">{item.name}</div>
                        {item.shortDescription && (
                          <div className="mt-0.5 text-sm text-gray-600 line-clamp-1">{item.shortDescription}</div>
                        )}
                      </div>
                      <div className="ml-4 shrink-0">
                        <div className="text-base font-bold text-amber-700">{formatTry(item.priceCents)}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Categories - Kağıt Stili (Basit Liste) */}
          <div className="mt-10 space-y-10">
            {grouped.map((cat) => (
              <section key={cat.id} id={tabId(cat.name)} data-tab={cat.name} className="scroll-mt-24">
                <h3 className="text-2xl font-bold text-amber-900 mb-4">
                  {cat.name}
                </h3>
                <div className="bg-white border-l-4 border-amber-600">
                  {cat.items.map((item, idx) => (
                    <button
                      key={item.id}
                      onClick={() => setSelected(item)}
                      className="w-full text-left py-3 px-4 hover:bg-amber-50/50 transition-colors border-b border-amber-100 last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="text-base font-semibold text-gray-900">{item.name}</div>
                          {item.shortDescription && (
                            <div className="mt-0.5 text-sm text-gray-600 line-clamp-2">{item.shortDescription}</div>
                          )}
                        </div>
                        <div className="ml-4 shrink-0">
                          <div className="text-base font-bold text-amber-700">{formatTry(item.priceCents)}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      );
    }

    if (theme === "swipe") {
      // SWIPE MENÜ: Büyük kartlar, swipe odaklı
      return (
        <>
          <section id={tabId("Most Popular")} data-tab="Most Popular" className="scroll-mt-24">
            <h2 className="text-2xl font-black text-gray-950 mt-6 mb-6">{S.mostPopular}</h2>
            <div
              ref={popularScrollRef}
              className="mt-4 -mx-4 flex gap-6 overflow-x-auto px-4 pb-2 snap-x snap-mandatory select-none cursor-grab active:cursor-grabbing [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              onMouseDown={(e) => {
                const el = popularScrollRef.current;
                if (!el) return;
                popularDragRef.current.isDown = true;
                popularDragRef.current.startX = e.pageX;
                popularDragRef.current.scrollLeft = el.scrollLeft;
              }}
              onMouseLeave={() => { popularDragRef.current.isDown = false; }}
              onMouseUp={() => { popularDragRef.current.isDown = false; }}
              onMouseMove={(e) => {
                const el = popularScrollRef.current;
                if (!el || !popularDragRef.current.isDown) return;
                e.preventDefault();
                const dx = e.pageX - popularDragRef.current.startX;
                el.scrollLeft = popularDragRef.current.scrollLeft - dx;
              }}
            >
              {popular.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelected(item)}
                  className="snap-start shrink-0 w-[280px] md:w-[320px] overflow-hidden text-left bg-white rounded-3xl shadow-xl border-2 border-purple-200 hover:scale-[1.02] hover:shadow-2xl transition-all duration-300"
                >
                  <div className="relative h-48 w-full bg-gray-100">
                    <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover rounded-t-3xl" loading="lazy" />
                    <div className="absolute bottom-3 right-3 rounded-full px-4 py-1.5 text-sm font-extrabold bg-purple-500 text-white shadow-xl">
                      {formatTry(item.priceCents)}
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="text-base font-extrabold text-gray-950">{item.name}</div>
                    <div className="mt-1 text-sm text-gray-500 line-clamp-1">{item.shortDescription}</div>
                    <div className="mt-2 text-xs font-semibold text-gray-500">
                      {S.stockLabel}: {item.stock === null ? S.stockUnlimited : item.stock}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <div className="mt-10 space-y-12">
            {grouped.map((cat) => (
              <section key={cat.id} id={tabId(cat.name)} data-tab={cat.name} className="scroll-mt-24">
                <h3 className="text-xl font-black text-gray-950 mb-6">{cat.name}</h3>
                <div className="divide-y divide-purple-200 rounded-2xl border border-purple-200 bg-white">
                  {cat.items.map((item) => (
                    <MenuRow key={item.id} item={item} onOpen={() => setSelected(item)} labels={S} theme="swipe" />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      );
    }

    if (theme === "premium-plus") {
      // PREMIUM PLUS: Lüks, gradient, koyu tema
      return (
        <>
          <section id={tabId("Most Popular")} data-tab="Most Popular" className="scroll-mt-24">
            <h2 className="text-2xl font-black text-white mt-6 mb-6">{S.mostPopular}</h2>
            <div
              ref={popularScrollRef}
              className="mt-4 -mx-4 flex gap-5 overflow-x-auto px-4 pb-2 snap-x snap-mandatory select-none cursor-grab active:cursor-grabbing [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              onMouseDown={(e) => {
                const el = popularScrollRef.current;
                if (!el) return;
                popularDragRef.current.isDown = true;
                popularDragRef.current.startX = e.pageX;
                popularDragRef.current.scrollLeft = el.scrollLeft;
              }}
              onMouseLeave={() => { popularDragRef.current.isDown = false; }}
              onMouseUp={() => { popularDragRef.current.isDown = false; }}
              onMouseMove={(e) => {
                const el = popularScrollRef.current;
                if (!el || !popularDragRef.current.isDown) return;
                e.preventDefault();
                const dx = e.pageX - popularDragRef.current.startX;
                el.scrollLeft = popularDragRef.current.scrollLeft - dx;
              }}
            >
              {popular.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelected(item)}
                  className="snap-start shrink-0 w-[260px] md:w-[300px] overflow-hidden text-left bg-gradient-to-br from-amber-500/20 via-yellow-500/20 to-amber-600/20 backdrop-blur-md rounded-2xl border-2 border-amber-500/40 shadow-2xl hover:border-amber-400/60 transition-all"
                >
                  <div className="relative h-44 w-full bg-gray-100">
                    <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover rounded-t-2xl" loading="lazy" />
                    <div className="absolute bottom-3 right-3 rounded-full px-3 py-1 text-sm font-extrabold bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-2xl">
                      {formatTry(item.priceCents)}
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="text-base font-extrabold text-white">{item.name}</div>
                    <div className="mt-1 text-sm text-gray-300 line-clamp-1">{item.shortDescription}</div>
                    <div className="mt-2 text-xs font-semibold text-gray-400">
                      {S.stockLabel}: {item.stock === null ? S.stockUnlimited : item.stock}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <div className="mt-10 space-y-12">
            {grouped.map((cat) => (
              <section key={cat.id} id={tabId(cat.name)} data-tab={cat.name} className="scroll-mt-24">
                <h3 className="text-xl font-black text-white mb-6">{cat.name}</h3>
                <div className="divide-y divide-amber-500/20 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 backdrop-blur-sm">
                  {cat.items.map((item) => (
                    <MenuRow key={item.id} item={item} onOpen={() => setSelected(item)} labels={S} theme="premium-plus" />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      );
    }

    if (theme === "pro") {
      // PRO QR MENÜ: demo6.wenqr.com - Kapak görseli, kategoriler görsel kartlar, grid layout
      return (
        <>
          {/* Header Image */}
          {restaurant?.logo && (
            <div className="mt-6 mb-8 -mx-4">
              <img 
                src={restaurant.logo} 
                alt={restaurant.name || ""} 
                className="w-full h-48 md:h-64 object-cover"
                loading="lazy"
              />
            </div>
          )}

          {/* Categories Grid - Görsel Kartlar */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
            {tabs.filter(t => t.name !== "Most Popular").map((cat) => (
              <button
                key={cat.id}
                onClick={() => scrollTo(cat.name)}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all p-4 text-center border border-blue-200 hover:border-blue-400"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{cat.name.charAt(0)}</span>
                </div>
                <div className="text-sm font-bold text-gray-900">{cat.name}</div>
              </button>
            ))}
          </div>

          {/* Most Popular */}
          {popular.length > 0 && (
            <section id={tabId("Most Popular")} data-tab="Most Popular" className="scroll-mt-24 mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{S.mostPopular}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {popular.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelected(item)}
                    className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden border border-blue-200 text-left"
                  >
                    <div className="relative h-48 w-full bg-gray-100">
                      <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
                      <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-blue-600 text-white text-sm font-bold rounded">
                        {formatTry(item.priceCents)}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="text-base font-bold text-gray-900 mb-1">{item.name}</div>
                      {item.shortDescription && (
                        <div className="text-sm text-gray-600 line-clamp-2 mb-2">{item.shortDescription}</div>
                      )}
                      <div className="text-xs text-gray-500">
                        {S.stockLabel}: {item.stock === null ? S.stockUnlimited : item.stock}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Categories - Grid Layout */}
          <div className="space-y-12">
            {grouped.map((cat) => (
              <section key={cat.id} id={tabId(cat.name)} data-tab={cat.name} className="scroll-mt-24">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">{cat.name}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cat.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelected(item)}
                      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden border border-blue-200 text-left"
                    >
                      <div className="relative h-48 w-full bg-gray-100">
                        <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
                        <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-blue-600 text-white text-sm font-bold rounded">
                          {formatTry(item.priceCents)}
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="text-base font-bold text-gray-900 mb-1">{item.name}</div>
                        {item.shortDescription && (
                          <div className="text-sm text-gray-600 line-clamp-2 mb-2">{item.shortDescription}</div>
                        )}
                        <div className="text-xs text-gray-500">
                          {S.stockLabel}: {item.stock === null ? S.stockUnlimited : item.stock}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      );
    }

    if (theme === "premium-plus") {
      // PREMIUM+ QR MENÜ: demo5.wenqr.com - Kategoriler grid, görsel kartlar
      return (
        <>
          {/* Categories Grid - Görsel Kartlar */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10 mt-6">
            {tabs.filter(t => t.name !== "Most Popular").map((cat) => (
              <button
                key={cat.id}
                onClick={() => scrollTo(cat.name)}
                className="bg-gradient-to-br from-amber-500/20 to-yellow-500/20 backdrop-blur-sm rounded-2xl border-2 border-amber-500/40 hover:border-amber-400/60 transition-all p-4 text-center shadow-lg"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl mx-auto mb-3 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{cat.name.charAt(0)}</span>
                </div>
                <div className="text-sm font-bold text-white">{cat.name}</div>
              </button>
            ))}
          </div>

          {/* Most Popular */}
          {popular.length > 0 && (
            <section id={tabId("Most Popular")} data-tab="Most Popular" className="scroll-mt-24 mb-10">
              <h2 className="text-2xl font-black text-white mb-6">{S.mostPopular}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {popular.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelected(item)}
                    className="bg-gradient-to-br from-amber-500/20 via-yellow-500/20 to-amber-600/20 backdrop-blur-md rounded-2xl border-2 border-amber-500/40 shadow-2xl hover:border-amber-400/60 transition-all overflow-hidden text-left"
                  >
                    <div className="relative h-44 w-full bg-gray-100">
                      <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover rounded-t-2xl" loading="lazy" />
                      <div className="absolute bottom-3 right-3 rounded-full px-3 py-1 text-sm font-extrabold bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-2xl">
                        {formatTry(item.priceCents)}
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="text-base font-extrabold text-white">{item.name}</div>
                      <div className="mt-1 text-sm text-gray-300 line-clamp-1">{item.shortDescription}</div>
                      <div className="mt-2 text-xs font-semibold text-gray-400">
                        {S.stockLabel}: {item.stock === null ? S.stockUnlimited : item.stock}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Categories - Grid Layout */}
          <div className="space-y-12">
            {grouped.map((cat) => (
              <section key={cat.id} id={tabId(cat.name)} data-tab={cat.name} className="scroll-mt-24">
                <h3 className="text-xl font-black text-white mb-6">{cat.name}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cat.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelected(item)}
                      className="bg-gradient-to-br from-amber-500/20 via-yellow-500/20 to-amber-600/20 backdrop-blur-md rounded-2xl border-2 border-amber-500/40 shadow-2xl hover:border-amber-400/60 transition-all overflow-hidden text-left"
                    >
                      <div className="relative h-44 w-full bg-gray-100">
                        <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover rounded-t-2xl" loading="lazy" />
                        <div className="absolute bottom-3 right-3 rounded-full px-3 py-1 text-sm font-extrabold bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-2xl">
                          {formatTry(item.priceCents)}
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="text-base font-extrabold text-white">{item.name}</div>
                        <div className="mt-1 text-sm text-gray-300 line-clamp-1">{item.shortDescription}</div>
                        <div className="mt-2 text-xs font-semibold text-gray-400">
                          {S.stockLabel}: {item.stock === null ? S.stockUnlimited : item.stock}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      );
    }

    if (theme === "swipe") {
      // MODERN SWIPE MENÜ: demo4.wenqr.com - Dark mode toggle, grid layout
      return (
        <>
          {/* Dark Mode Toggle */}
          <div className="mt-6 mb-4 flex justify-end">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                darkMode 
                  ? "bg-gray-800 text-white hover:bg-gray-700" 
                  : "bg-white text-gray-900 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>
          </div>

          {/* Most Popular */}
          {popular.length > 0 && (
            <section id={tabId("Most Popular")} data-tab="Most Popular" className="scroll-mt-24 mb-10">
              <h2 className={`text-2xl font-black mb-6 ${darkMode ? "text-white" : "text-gray-950"}`}>
                {S.mostPopular}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {popular.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelected(item)}
                    className={`rounded-3xl shadow-xl border-2 hover:scale-[1.02] hover:shadow-2xl transition-all overflow-hidden text-left ${
                      darkMode 
                        ? "bg-gray-800 border-purple-600/50" 
                        : "bg-white border-purple-200"
                    }`}
                  >
                    <div className="relative h-48 w-full bg-gray-100">
                      <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover rounded-t-3xl" loading="lazy" />
                      <div className={`absolute bottom-3 right-3 rounded-full px-4 py-1.5 text-sm font-extrabold shadow-xl ${
                        darkMode ? "bg-purple-600 text-white" : "bg-purple-500 text-white"
                      }`}>
                        {formatTry(item.priceCents)}
                      </div>
                    </div>
                    <div className="p-5">
                      <div className={`text-base font-extrabold ${darkMode ? "text-white" : "text-gray-950"}`}>
                        {item.name}
                      </div>
                      <div className={`mt-1 text-sm line-clamp-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {item.shortDescription}
                      </div>
                      <div className={`mt-2 text-xs font-semibold ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                        {S.stockLabel}: {item.stock === null ? S.stockUnlimited : item.stock}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Categories - Grid Layout */}
          <div className="space-y-12">
            {grouped.map((cat) => (
              <section key={cat.id} id={tabId(cat.name)} data-tab={cat.name} className="scroll-mt-24">
                <h3 className={`text-xl font-black mb-6 ${darkMode ? "text-white" : "text-gray-950"}`}>
                  {cat.name}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cat.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelected(item)}
                      className={`rounded-3xl shadow-xl border-2 hover:scale-[1.02] hover:shadow-2xl transition-all overflow-hidden text-left ${
                        darkMode 
                          ? "bg-gray-800 border-purple-600/50" 
                          : "bg-white border-purple-200"
                      }`}
                    >
                      <div className="relative h-48 w-full bg-gray-100">
                        <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover rounded-t-3xl" loading="lazy" />
                        <div className={`absolute bottom-3 right-3 rounded-full px-4 py-1.5 text-sm font-extrabold shadow-xl ${
                          darkMode ? "bg-purple-600 text-white" : "bg-purple-500 text-white"
                        }`}>
                          {formatTry(item.priceCents)}
                        </div>
                      </div>
                      <div className="p-5">
                        <div className={`text-base font-extrabold ${darkMode ? "text-white" : "text-gray-950"}`}>
                          {item.name}
                        </div>
                        <div className={`mt-1 text-sm line-clamp-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          {item.shortDescription}
                        </div>
                        <div className={`mt-2 text-xs font-semibold ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                          {S.stockLabel}: {item.stock === null ? S.stockUnlimited : item.stock}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      );
    }

    if (theme === "paper-image") {
      // RESİMLİ KAĞIT MENÜ: demo3.wenqr.com - Grid layout, görseller
      return (
        <>
          {/* Dark Mode Toggle */}
          <div className="mt-6 mb-4 flex justify-end">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                darkMode 
                  ? "bg-gray-800 text-white hover:bg-gray-700" 
                  : "bg-white text-gray-900 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>
          </div>

          {/* Most Popular */}
          {popular.length > 0 && (
            <section id={tabId("Most Popular")} data-tab="Most Popular" className="scroll-mt-24 mb-10">
              <h2 className={`text-2xl font-bold mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}>
                {S.mostPopular}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {popular.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelected(item)}
                    className={`rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden text-left border ${
                      darkMode 
                        ? "bg-gray-800 border-amber-600/50" 
                        : "bg-white border-amber-200"
                    }`}
                  >
                    <div className="relative h-48 w-full bg-gray-100">
                      <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
                    </div>
                    <div className="p-4">
                      <div className={`text-base font-bold mb-1 ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {item.name}
                      </div>
                      <div className={`text-lg font-bold mt-2 ${darkMode ? "text-amber-400" : "text-amber-700"}`}>
                        {formatTry(item.priceCents)}
                      </div>
                      <div className={`mt-2 text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {S.stockLabel}: {item.stock === null ? S.stockUnlimited : item.stock}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Categories - Grid Layout */}
          <div className="space-y-12">
            {grouped.map((cat) => (
              <section key={cat.id} id={tabId(cat.name)} data-tab={cat.name} className="scroll-mt-24">
                <h3 className={`text-2xl font-bold mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {cat.name}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cat.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelected(item)}
                      className={`rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden text-left border ${
                        darkMode 
                          ? "bg-gray-800 border-amber-600/50" 
                          : "bg-white border-amber-200"
                      }`}
                    >
                      <div className="relative h-48 w-full bg-gray-100">
                        <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
                      </div>
                      <div className="p-4">
                        <div className={`text-base font-bold mb-1 ${darkMode ? "text-white" : "text-gray-900"}`}>
                          {item.name}
                        </div>
                        <div className={`text-lg font-bold mt-2 ${darkMode ? "text-amber-400" : "text-amber-700"}`}>
                          {formatTry(item.priceCents)}
                        </div>
                        <div className={`mt-2 text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          {S.stockLabel}: {item.stock === null ? S.stockUnlimited : item.stock}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      );
    }

    // DEFAULT LAYOUT (premium, soft-ui, ultra-plus, default)
    return (
      <>
        <section id={tabId("Most Popular")} data-tab="Most Popular" className="scroll-mt-24">
          <div className="mt-6 flex items-end justify-between">
            <h2 className={`text-xl font-extrabold ${
              theme === "premium-plus" || theme === "ultra-plus" ? "text-white" : "text-gray-950"
            }`}>{S.mostPopular}</h2>
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
            onMouseLeave={() => { popularDragRef.current.isDown = false; }}
            onMouseUp={() => { popularDragRef.current.isDown = false; }}
            onMouseMove={(e) => {
              const el = popularScrollRef.current;
              if (!el || !popularDragRef.current.isDown) return;
              e.preventDefault();
              const dx = e.pageX - popularDragRef.current.startX;
              el.scrollLeft = popularDragRef.current.scrollLeft - dx;
            }}
          >
            {popular.map((item) => {
              const cardSize = getPopularCardSize();
              const imageHeight = getPopularImageHeight();
              return (
                <button
                  key={item.id}
                  onClick={() => setSelected(item)}
                  className={`snap-start shrink-0 ${cardSize} overflow-hidden text-left ${getCardClasses()}`}
                >
                  <div className={`relative ${imageHeight} w-full bg-gray-100 ${
                    theme === "paper" ? "border-b border-amber-200" : ""
                  }`}>
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className={`h-full w-full object-cover ${
                        theme === "swipe" ? "rounded-t-3xl" : 
                        theme === "soft-ui" ? "rounded-t-[2rem]" :
                        theme === "paper" ? "" : "rounded-t-xl"
                      }`}
                      loading="lazy"
                    />
                    <div className={`absolute bottom-3 right-3 px-3 py-1 text-sm font-extrabold shadow-lg ${
                      theme === "paper"
                        ? "rounded-none bg-amber-600 text-white"
                        : theme === "swipe"
                        ? "rounded-full bg-purple-500 text-white"
                        : theme === "premium-plus"
                        ? "rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white"
                        : theme === "ultra-plus"
                        ? "rounded-full bg-gradient-to-r from-violet-500 to-purple-500 text-white"
                        : theme === "soft-ui"
                        ? "rounded-full bg-rose-400 text-white"
                        : "rounded-full bg-white/95 text-gray-950"
                    }`}>
                      {formatTry(item.priceCents)}
                    </div>
                  </div>
                  <div className={`${
                    theme === "paper" ? "p-3" : 
                    theme === "swipe" ? "p-5" :
                    theme === "premium-plus" || theme === "ultra-plus" ? "p-5" :
                    "p-4"
                  }`}>
                    <div className={`${
                      theme === "paper" ? "text-sm" :
                      theme === "swipe" || theme === "premium-plus" || theme === "ultra-plus" ? "text-base" :
                      "text-sm"
                    } font-extrabold ${
                      theme === "premium-plus" || theme === "ultra-plus" ? "text-white" : "text-gray-950"
                    }`}>{item.name}</div>
                    <div className={`mt-1 ${
                      theme === "swipe" ? "text-sm" : "text-xs"
                    } line-clamp-1 ${
                      theme === "premium-plus" || theme === "ultra-plus" ? "text-gray-300" : "text-gray-500"
                    }`}>
                      {item.shortDescription}
                    </div>
                    <div className={`mt-2 text-xs font-semibold ${
                      theme === "premium-plus" || theme === "ultra-plus" ? "text-gray-400" : "text-gray-500"
                    }`}>
                      {S.stockLabel}: {item.stock === null ? S.stockUnlimited : item.stock}
                    </div>
                  </div>
                </button>
              );
            })}
            {popular.length === 0 ? (
              <div className={`px-1 py-8 text-sm ${getDescColor()}`}>{S.noMatches}</div>
            ) : null}
          </div>
        </section>

        <div className="mt-8 space-y-10">
          {grouped.map((cat) => (
            <section
              key={cat.id}
              id={tabId(cat.name)}
              data-tab={cat.name}
              className="scroll-mt-24"
            >
              <h3 className={`text-lg font-extrabold ${
                theme === "premium-plus" || theme === "ultra-plus" ? "text-white" : "text-gray-950"
              }`}>{cat.name}</h3>
              <div className={`mt-4 ${getCardClasses()}`}>
                {cat.items.map((item) => (
                  <MenuRow key={item.id} item={item} onOpen={() => setSelected(item)} labels={S} theme={theme} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </>
    );
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

  // Theme-based styling
  const getThemeClasses = () => {
    const base = "min-h-screen pb-24";
    switch (theme) {
      case "paper":
        return `${base} text-gray-900`;
      case "paper-image":
        return `${base} bg-gradient-to-br from-amber-50 to-orange-50 text-gray-900`;
      case "swipe":
        return `${base} bg-gradient-to-br from-purple-50 to-pink-50 text-gray-900`;
      case "premium-plus":
        return `${base} bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white`;
      case "pro":
        return `${base} bg-gradient-to-br from-blue-50 to-indigo-50 text-gray-900`;
      case "soft-ui":
        return `${base} bg-gradient-to-br from-rose-50 to-pink-50 text-gray-900`;
      case "ultra-plus":
        return `${base} bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 text-white`;
      case "premium":
      default:
        return `${base} bg-white text-black`;
    }
  };

  const getCardClasses = () => {
    switch (theme) {
      case "paper":
        // Kağıt: Minimal, köşesiz, sol border, gölge yok
        return "bg-white rounded-none border-l-4 border-amber-600 shadow-none hover:shadow-md transition-shadow";
      case "paper-image":
        // Resimli Kağıt: Yuvarlak köşeler, hafif gölge
        return "bg-white rounded-xl shadow-md border border-amber-200 hover:shadow-lg transition-shadow";
      case "swipe":
        // Swipe: Büyük yuvarlak köşeler, belirgin gölge, hover efekti
        return "bg-white rounded-3xl shadow-xl border-2 border-purple-200 hover:scale-[1.02] hover:shadow-2xl transition-all duration-300";
      case "premium-plus":
        // Premium Plus: Gradient arka plan, blur, lüks görünüm
        return "bg-gradient-to-br from-amber-500/20 via-yellow-500/20 to-amber-600/20 backdrop-blur-md rounded-2xl border-2 border-amber-500/40 shadow-2xl hover:border-amber-400/60 transition-all";
      case "pro":
        // Pro: Profesyonel, sol border, minimal gölge
        return "bg-white rounded-lg shadow-sm border-l-4 border-blue-600 hover:shadow-md transition-shadow";
      case "soft-ui":
        // Soft UI: Yumuşak, büyük köşeler, blur, hafif border
        return "bg-white/90 backdrop-blur-md rounded-[2rem] shadow-lg border border-rose-200/60 hover:bg-white hover:shadow-xl transition-all";
      case "ultra-plus":
        // Ultra Plus: Koyu gradient, blur, lüks border
        return "bg-gradient-to-br from-violet-500/25 via-purple-500/25 to-indigo-500/25 backdrop-blur-lg rounded-2xl border-2 border-violet-400/40 shadow-2xl hover:border-violet-300/60 transition-all";
      case "premium":
      default:
        // Premium: Standart, temiz, modern
        return "bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow";
    }
  };

  const getPopularCardSize = () => {
    switch (theme) {
      case "paper":
        return "w-[220px] md:w-[240px]";
      case "swipe":
        return "w-[280px] md:w-[320px]";
      case "premium-plus":
      case "ultra-plus":
        return "w-[260px] md:w-[300px]";
      case "soft-ui":
        return "w-[250px] md:w-[280px]";
      default:
        return "w-[240px] md:w-[260px]";
    }
  };

  const getPopularImageHeight = () => {
    switch (theme) {
      case "swipe":
        return "h-48";
      case "premium-plus":
      case "ultra-plus":
        return "h-44";
      case "paper":
        return "h-32";
      default:
        return "h-40";
    }
  };

  const getButtonClasses = () => {
    switch (theme) {
      case "paper":
        return "bg-amber-600 hover:bg-amber-700 text-white";
      case "paper-image":
        return "bg-amber-500 hover:bg-amber-600 text-white";
      case "swipe":
        return "bg-purple-500 hover:bg-purple-600 text-white";
      case "premium-plus":
        return "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white";
      case "pro":
        return "bg-blue-600 hover:bg-blue-700 text-white";
      case "soft-ui":
        return "bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white";
      case "ultra-plus":
        return "bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white";
      case "premium":
      default:
        return "bg-emerald-600 hover:bg-emerald-700 text-white";
    }
  };

  const getTabActiveClasses = () => {
    switch (theme) {
      case "paper":
        return "bg-amber-600";
      case "paper-image":
        return "bg-amber-500";
      case "swipe":
        return "bg-purple-500";
      case "premium-plus":
        return "bg-amber-400";
      case "pro":
        return "bg-blue-600";
      case "soft-ui":
        return "bg-rose-400";
      case "ultra-plus":
        return "bg-violet-400";
      case "premium":
      default:
        return "bg-emerald-500";
    }
  };

  const getSearchInputClasses = () => {
    const base = "h-12 w-full rounded-full border-2 pl-12 pr-4 text-sm font-semibold placeholder:text-gray-400 focus:outline-none focus:ring-4";
    switch (theme) {
      case "paper":
        return `${base} border-amber-300 bg-white focus:border-amber-600 focus:ring-amber-500/10 text-gray-950`;
      case "paper-image":
        return `${base} border-amber-200 bg-white focus:border-amber-500 focus:ring-amber-500/10 text-gray-950`;
      case "swipe":
        return `${base} border-purple-200 bg-white focus:border-purple-500 focus:ring-purple-500/10 text-gray-950`;
      case "premium-plus":
        return `${base} border-amber-500/30 bg-gray-800/50 focus:border-amber-400 focus:ring-amber-400/20 text-white placeholder:text-gray-400`;
      case "pro":
        return `${base} border-blue-200 bg-white focus:border-blue-600 focus:ring-blue-500/10 text-gray-950`;
      case "soft-ui":
        return `${base} border-rose-200/50 bg-white/80 backdrop-blur-sm focus:border-rose-400 focus:ring-rose-400/20 text-gray-950`;
      case "ultra-plus":
        return `${base} border-violet-400/30 bg-gray-800/50 focus:border-violet-400 focus:ring-violet-400/20 text-white placeholder:text-gray-400`;
      case "premium":
      default:
        return `${base} border-gray-200 bg-gray-50 focus:border-emerald-500 focus:bg-white focus:ring-emerald-500/10 text-gray-950`;
    }
  };

  const getStickyTabsClasses = () => {
    switch (theme) {
      case "paper":
        return "bg-[#f5f1e8]/98 backdrop-blur-sm border-b-2 border-amber-400";
      case "paper-image":
        return "bg-gradient-to-br from-amber-50/95 to-orange-50/95 backdrop-blur border-b border-amber-200";
      case "swipe":
        return "bg-gradient-to-br from-purple-50/95 to-pink-50/95 backdrop-blur border-b border-purple-200";
      case "premium-plus":
        return "bg-gray-900/90 backdrop-blur border-b border-gray-700";
      case "pro":
        return "bg-gradient-to-br from-blue-50/95 to-indigo-50/95 backdrop-blur border-b border-blue-200";
      case "soft-ui":
        return "bg-gradient-to-br from-rose-50/95 to-pink-50/95 backdrop-blur border-b border-rose-200/50";
      case "ultra-plus":
        return "bg-violet-900/90 backdrop-blur border-b border-violet-700";
      case "premium":
      default:
        return "bg-white/90 backdrop-blur border-b border-gray-100";
    }
  };

  const getTextColor = () => {
    if (theme === "premium-plus" || theme === "ultra-plus") {
      return "text-white";
    }
    return "text-gray-950";
  };

  const getDescColor = () => {
    if (theme === "premium-plus" || theme === "ultra-plus") {
      return "text-gray-300";
    }
    return "text-gray-500";
  };

  return (
    <>
      {showPaymentSuccess && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md mx-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 shadow-lg">
            <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-green-800 font-semibold">Ödeme Başarılı!</p>
              <p className="text-green-700 text-sm">
                {orderNumber ? `Sipariş #${orderNumber} ödendi.` : "Ödemeniz başarıyla tamamlandı."}
              </p>
            </div>
          </div>
        </div>
      )}
    <div className={getThemeClasses()} style={
      theme === "paper" 
        ? { 
            background: "#f5f1e8",
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)"
          }
        : undefined
    }>
      <div className="mx-auto w-full max-w-[720px] md:max-w-[900px] lg:max-w-[1100px] px-4 pb-6 pt-4">
        {campaigns.length > 0 ? (
          <CampaignMarquee campaigns={campaigns} labels={S} />
        ) : null}
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {restaurant ? (
              <>
                <div className={`text-xl font-extrabold ${
                  theme === "paper"
                    ? "text-amber-900"
                    : theme === "premium-plus" || theme === "ultra-plus" 
                    ? "text-white" 
                    : "text-gray-950"
                }`}>{restaurant.name}</div>
                {restaurant.description ? (
                  <div className={`mt-1 text-sm ${
                    theme === "paper"
                      ? "text-amber-800"
                      : theme === "premium-plus" || theme === "ultra-plus" 
                      ? "text-gray-300" 
                      : "text-gray-500"
                  }`}>{restaurant.description}</div>
                ) : null}
              </>
            ) : null}
          </div>

          <div className="shrink-0 flex items-center gap-2">
            {/* Mobile: Garson Çağır & Hesap İste Butonları */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => openRequestModal("waiter")}
                disabled={isRequestingWaiter}
                className={`flex items-center justify-center w-10 h-10 rounded-full text-white shadow-lg transition-all disabled:opacity-50 ${
                  theme === "premium-plus" || theme === "ultra-plus"
                    ? "bg-amber-500 hover:bg-amber-600"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
                title="Garson Çağır"
              >
                <Bell className="w-5 h-5" />
              </button>
              <button
                onClick={() => openRequestModal("bill")}
                disabled={isRequestingBill}
                className={`flex items-center justify-center w-10 h-10 rounded-full text-white shadow-lg transition-all disabled:opacity-50 ${
                  theme === "premium-plus" || theme === "ultra-plus"
                    ? "bg-amber-500 hover:bg-amber-600"
                    : "bg-green-500 hover:bg-green-600"
                }`}
                title="Hesap İste"
              >
                <Receipt className="w-5 h-5" />
              </button>
            </div>

            {/* Language Selector */}
            <div>
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
        </div>

        {/* Search + add product */}
        <div className="relative">
          <Search className={`pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 ${
            theme === "premium-plus" || theme === "ultra-plus" ? "text-gray-400" : "text-gray-400"
          }`} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={S.searchPlaceholder}
            className={getSearchInputClasses()}
          />
        </div>
      </div>

      {/* Sticky tabs */}
      <div className={`sticky top-0 z-30 ${getStickyTabsClasses()}`}>
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
                    active 
                      ? (theme === "premium-plus" || theme === "ultra-plus" ? "text-white" : "text-gray-950")
                      : (theme === "premium-plus" || theme === "ultra-plus" ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-800"),
                  ].join(" ")}
                >
                  {label}
                  <span
                    className={[
                      "absolute left-0 right-0 -bottom-[1px] h-[2px] rounded-full transition-opacity",
                      active ? `${getTabActiveClasses()} opacity-100` : "bg-transparent opacity-0",
                    ].join(" ")}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[720px] md:max-w-[900px] lg:max-w-[1100px] px-4">
        {/* Render theme-specific layouts */}
        {renderThemeLayout()}
      </div>


      {/* Desktop Floating action buttons - Garson Çağır & Hesap İste */}
      <div className="hidden md:flex fixed right-4 top-20 z-40 flex-col gap-3">
        <button
          onClick={() => openRequestModal("waiter")}
          disabled={isRequestingWaiter}
          className={`flex items-center gap-2 rounded-full px-4 py-3 text-white shadow-lg transition-all hover:scale-105 disabled:opacity-50 ${
            theme === "premium-plus" || theme === "ultra-plus"
              ? "bg-amber-500 hover:bg-amber-600"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
          title="Garson Çağır"
        >
          <Bell className="w-5 h-5" />
          <span className="text-sm font-bold">Garson Çağır</span>
        </button>
        <button
          onClick={() => openRequestModal("bill")}
          disabled={isRequestingBill}
          className={`flex items-center gap-2 rounded-full px-4 py-3 text-white shadow-lg transition-all hover:scale-105 disabled:opacity-50 ${
            theme === "premium-plus" || theme === "ultra-plus"
              ? "bg-amber-500 hover:bg-amber-600"
              : "bg-green-500 hover:bg-green-600"
          }`}
          title="Hesap İste"
        >
          <Receipt className="w-5 h-5" />
          <span className="text-sm font-bold">Hesap İste</span>
        </button>
      </div>

      {/* Request Modal */}
      <AnimatePresence>
        {requestModalOpen && requestType && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setRequestModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md rounded-2xl shadow-2xl ${
                theme === "premium-plus" || theme === "ultra-plus"
                  ? "bg-gray-800"
                  : "bg-white"
              }`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-xl font-bold ${
                    theme === "premium-plus" || theme === "ultra-plus" ? "text-white" : "text-gray-900"
                  }`}>
                    {requestType === "waiter" ? "Garson Çağır" : "Hesap İste"}
                  </h2>
                  <button
                    onClick={() => setRequestModalOpen(false)}
                    className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
                      theme === "premium-plus" || theme === "ultra-plus" ? "hover:bg-gray-700" : ""
                    }`}
                  >
                    <X className={`w-5 h-5 ${
                      theme === "premium-plus" || theme === "ultra-plus" ? "text-white" : "text-gray-600"
                    }`} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-bold mb-2 ${
                      theme === "premium-plus" || theme === "ultra-plus" ? "text-white" : "text-gray-700"
                    }`}>
                      Masa Numarası *
                    </label>
                    <input
                      type="text"
                      value={requestTableNumber}
                      onChange={(e) => setRequestTableNumber(e.target.value)}
                      placeholder="Örn: 5, A12"
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-4 ${
                        theme === "premium-plus" || theme === "ultra-plus"
                          ? "bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-amber-400 focus:ring-amber-400/20"
                          : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                      }`}
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-bold mb-2 ${
                      theme === "premium-plus" || theme === "ultra-plus" ? "text-white" : "text-gray-700"
                    }`}>
                      Not (Opsiyonel)
                    </label>
                    <textarea
                      value={requestNote}
                      onChange={(e) => setRequestNote(e.target.value)}
                      placeholder="Eklemek istediğiniz bir not var mı?"
                      rows={3}
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-4 resize-none ${
                        theme === "premium-plus" || theme === "ultra-plus"
                          ? "bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-amber-400 focus:ring-amber-400/20"
                          : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                      }`}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setRequestModalOpen(false)}
                      className={`flex-1 px-4 py-3 rounded-xl font-bold transition-colors ${
                        theme === "premium-plus" || theme === "ultra-plus"
                          ? "bg-gray-700 text-white hover:bg-gray-600"
                          : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                      }`}
                    >
                      İptal
                    </button>
                    <button
                      onClick={handleSubmitRequest}
                      disabled={!requestTableNumber.trim() || isRequestingWaiter || isRequestingBill}
                      className={`flex-1 px-4 py-3 rounded-xl font-bold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        requestType === "waiter"
                          ? theme === "premium-plus" || theme === "ultra-plus"
                            ? "bg-amber-500 hover:bg-amber-600"
                            : "bg-blue-500 hover:bg-blue-600"
                          : theme === "premium-plus" || theme === "ultra-plus"
                            ? "bg-amber-500 hover:bg-amber-600"
                            : "bg-green-500 hover:bg-green-600"
                      }`}
                    >
                      {(isRequestingWaiter || isRequestingBill) ? "Gönderiliyor..." : "Gönder"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              className={`mx-auto flex w-full max-w-[720px] md:max-w-[900px] lg:max-w-[1100px] items-center justify-between rounded-full px-5 py-4 text-white shadow-lg ${getButtonClasses()}`}
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
        theme={theme}
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
        enableTakeaway={enableTakeaway}
        orderType={orderType}
        setOrderType={setOrderType}
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
                orderType,
                tableNumber: orderType === "takeaway" ? null : (orderForm.tableNumber.trim() || null),
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
            setOrderType("restaurant");
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
    </>
  );
}

function MenuRow({ item, onOpen, labels, theme = "default" }: { item: BoltItem; onOpen: () => void; labels: Strings; theme?: string }) {
  const getRowClasses = () => {
    switch (theme) {
      case "paper":
        // Kağıt: Köşesiz, sol border, minimal padding, hover efekti yok
        return "bg-white rounded-none border-l-4 border-amber-600 shadow-none hover:shadow-md transition-shadow";
      case "paper-image":
        // Resimli Kağıt: Yuvarlak, hafif border
        return "bg-white rounded-xl shadow-md border border-amber-200 hover:shadow-lg transition-shadow";
      case "swipe":
        // Swipe: Büyük köşeler, belirgin gölge, hover scale
        return "bg-white rounded-3xl shadow-xl border-2 border-purple-200 hover:scale-[1.01] hover:shadow-2xl transition-all duration-300";
      case "premium-plus":
        // Premium Plus: Gradient, blur, lüks border
        return "bg-gradient-to-br from-amber-500/20 via-yellow-500/20 to-amber-600/20 backdrop-blur-md rounded-2xl border-2 border-amber-500/40 hover:border-amber-400/60 transition-all";
      case "pro":
        // Pro: Sol border, minimal
        return "bg-white rounded-lg shadow-sm border-l-4 border-blue-600 hover:shadow-md transition-shadow";
      case "soft-ui":
        // Soft UI: Yumuşak, büyük köşeler, blur
        return "bg-white/90 backdrop-blur-md rounded-[2rem] shadow-lg border border-rose-200/60 hover:bg-white hover:shadow-xl transition-all";
      case "ultra-plus":
        // Ultra Plus: Koyu gradient, blur, lüks
        return "bg-gradient-to-br from-violet-500/25 via-purple-500/25 to-indigo-500/25 backdrop-blur-lg rounded-2xl border-2 border-violet-400/40 hover:border-violet-300/60 transition-all";
      case "premium":
      default:
        // Premium: Standart, temiz
        return "bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow";
    }
  };

  const getRowPadding = () => {
    switch (theme) {
      case "paper":
        return "p-3"; // Minimal padding
      case "swipe":
      case "premium-plus":
      case "ultra-plus":
        return "p-5"; // Daha fazla padding, lüks
      case "soft-ui":
        return "p-4"; // Orta padding
      default:
        return "p-4"; // Standart
    }
  };

  const getImageSize = () => {
    switch (theme) {
      case "paper":
        return "h-[70px] w-[80px]"; // Küçük, minimal
      case "swipe":
        return "h-[100px] w-[110px]"; // Büyük, swipe için
      case "premium-plus":
      case "ultra-plus":
        return "h-[96px] w-[108px]"; // Lüks, büyük
      default:
        return "h-[86px] w-[98px]"; // Standart
    }
  };

  const getImageRadius = () => {
    switch (theme) {
      case "paper":
        return "rounded-none"; // Köşesiz
      case "swipe":
        return "rounded-3xl"; // Büyük köşeler
      case "soft-ui":
        return "rounded-[2rem]"; // Yumuşak köşeler
      default:
        return "rounded-2xl"; // Standart
    }
  };

  const getButtonClasses = () => {
    switch (theme) {
      case "paper":
        return "bg-amber-600 text-white shadow-md";
      case "paper-image":
        return "bg-amber-500 text-white shadow-md";
      case "swipe":
        return "bg-purple-500 text-white shadow-xl";
      case "premium-plus":
        return "bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-2xl";
      case "pro":
        return "bg-blue-600 text-white shadow-md";
      case "soft-ui":
        return "bg-rose-400 text-white shadow-lg";
      case "ultra-plus":
        return "bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-2xl";
      case "premium":
      default:
        return "bg-emerald-600 text-white shadow-lg";
    }
  };

  const getTextColor = () => {
    if (theme === "premium-plus" || theme === "ultra-plus") {
      return "text-white";
    }
    return "text-gray-950";
  };

  const getDescColor = () => {
    if (theme === "premium-plus" || theme === "ultra-plus") {
      return "text-gray-300";
    }
    return "text-gray-500";
  };

  const imageSize = getImageSize();
  const imageRadius = getImageRadius();
  const rowPadding = getRowPadding();
  const buttonClasses = getButtonClasses();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onOpen();
      }}
      className={`w-full text-left focus:outline-none ${getRowClasses()} ${
        theme === "paper" ? "mb-0" : "mb-2"
      }`}
    >
      <div className={`flex gap-4 ${rowPadding}`}>
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <div className={`${
              theme === "swipe" || theme === "premium-plus" || theme === "ultra-plus" ? "text-base" : "text-sm"
            } font-extrabold ${getTextColor()}`}>{item.name}</div>
            {item.isVegetarian ? (
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                theme === "paper"
                  ? "bg-amber-50 text-amber-700"
                  : theme === "swipe"
                  ? "bg-purple-50 text-purple-700"
                  : theme === "premium-plus" || theme === "ultra-plus"
                  ? "bg-amber-500/30 text-amber-200"
                  : "bg-emerald-50 text-emerald-700"
              }`}>
                <Leaf className="h-3 w-3" />
                {labels.vegBadge}
              </span>
            ) : null}
          </div>
          <div className={`mt-1 ${
            theme === "swipe" ? "text-sm" : "text-xs"
          } ${getDescColor()} line-clamp-2`}>{item.shortDescription}</div>
          <div className={`mt-2 ${
            theme === "swipe" || theme === "premium-plus" || theme === "ultra-plus" ? "text-base" : "text-sm"
          } font-extrabold ${getTextColor()}`}>{formatTry(item.priceCents)}</div>
          <div className={`mt-1 text-xs font-semibold ${getDescColor()}`}>
            {labels.stockLabel}: {item.stock === null ? labels.stockUnlimited : item.stock}
          </div>
        </div>

        <div className={`relative ${imageSize} shrink-0`}>
          <div className={`h-full w-full overflow-hidden ${imageRadius} bg-gray-100`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
            className={`absolute -bottom-2 -right-2 grid h-9 w-9 place-items-center rounded-full ${buttonClasses} ring-1 ring-black/5 hover:scale-110 transition-transform`}
            aria-label={labels.addItemAria(item.name)}
          >
            <Plus className="h-5 w-5" />
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
  theme = "default",
}: {
  item: BoltItem | null;
  onClose: () => void;
  onAdd: (item: BoltItem, qty: number, note?: string) => void;
  labels: Strings;
  theme?: string;
}) {
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const lastItemId = useRef<string | null>(null);

  const getButtonClasses = () => {
    switch (theme) {
      case "paper":
        return "bg-amber-600 hover:bg-amber-700 text-white";
      case "paper-image":
        return "bg-amber-500 hover:bg-amber-600 text-white";
      case "swipe":
        return "bg-purple-500 hover:bg-purple-600 text-white";
      case "premium-plus":
        return "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white";
      case "pro":
        return "bg-blue-600 hover:bg-blue-700 text-white";
      case "soft-ui":
        return "bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white";
      case "ultra-plus":
        return "bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white";
      case "premium":
      default:
        return "bg-emerald-600 hover:bg-emerald-700 text-white";
    }
  };

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
                  <div className={`text-xl font-extrabold ${
                    theme === "premium-plus" || theme === "ultra-plus" ? "text-white" : "text-gray-950"
                  }`}>{item.name}</div>
                  <div className={`mt-2 text-sm font-extrabold ${
                    theme === "premium-plus" || theme === "ultra-plus" ? "text-white" : "text-gray-950"
                  }`}>
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

              <p className={`mt-3 text-sm leading-relaxed ${
                theme === "premium-plus" || theme === "ultra-plus" ? "text-gray-300" : "text-gray-600"
              }`}>{item.description}</p>

              <div className="mt-6">
                <label className={`text-sm font-bold ${
                  theme === "premium-plus" || theme === "ultra-plus" ? "text-white" : "text-gray-900"
                }`}>{labels.addNoteLabel}</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={labels.addNotePlaceholder}
                  className={`mt-2 w-full resize-none px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-4 ${
                    theme === "paper"
                      ? "rounded-none border border-amber-300 bg-white focus:border-amber-600 focus:ring-amber-500/10 text-gray-900"
                      : theme === "paper-image"
                      ? "rounded-xl border border-amber-200 bg-white focus:border-amber-500 focus:ring-amber-500/10 text-gray-900"
                      : theme === "swipe"
                      ? "rounded-2xl border border-purple-200 bg-white focus:border-purple-500 focus:ring-purple-500/10 text-gray-900"
                      : theme === "premium-plus"
                      ? "rounded-2xl border border-amber-500/30 bg-gray-800/50 focus:border-amber-400 focus:ring-amber-400/20 text-white"
                      : theme === "pro"
                      ? "rounded-lg border border-blue-200 bg-white focus:border-blue-600 focus:ring-blue-500/10 text-gray-900"
                      : theme === "soft-ui"
                      ? "rounded-3xl border border-rose-200/50 bg-white/80 backdrop-blur-sm focus:border-rose-400 focus:ring-rose-400/20 text-gray-900"
                      : theme === "ultra-plus"
                      ? "rounded-2xl border border-violet-400/30 bg-gray-800/50 focus:border-violet-400 focus:ring-violet-400/20 text-white"
                      : "rounded-2xl border border-gray-200 bg-gray-50 focus:border-emerald-500 focus:ring-emerald-500/10 text-gray-900"
                  }`}
                  rows={3}
                />
              </div>
            </div>

            {/* Sticky bottom action bar */}
            <div className={`absolute inset-x-0 bottom-0 border-t backdrop-blur ${
              theme === "paper"
                ? "border-amber-200 bg-white/95"
                : theme === "paper-image"
                ? "border-amber-200 bg-white/95"
                : theme === "swipe"
                ? "border-purple-200 bg-white/95"
                : theme === "premium-plus"
                ? "border-amber-500/30 bg-gray-800/95"
                : theme === "pro"
                ? "border-blue-200 bg-white/95"
                : theme === "soft-ui"
                ? "border-rose-200/50 bg-white/95 backdrop-blur-sm"
                : theme === "ultra-plus"
                ? "border-violet-400/30 bg-violet-900/95"
                : "border-gray-100 bg-white/95"
            }`}>
              <div className="flex items-center gap-3 px-5 py-4">
                <div className={`flex items-center gap-2 rounded-full border px-2 py-2 shadow-sm ${
                  theme === "paper"
                    ? "border-amber-200 bg-white"
                    : theme === "paper-image"
                    ? "border-amber-200 bg-white"
                    : theme === "swipe"
                    ? "border-purple-200 bg-white"
                    : theme === "premium-plus"
                    ? "border-amber-500/30 bg-gray-800/50"
                    : theme === "pro"
                    ? "border-blue-200 bg-white"
                    : theme === "soft-ui"
                    ? "border-rose-200/50 bg-white/80 backdrop-blur-sm"
                    : theme === "ultra-plus"
                    ? "border-violet-400/30 bg-gray-800/50"
                    : "border-gray-200 bg-white"
                }`}>
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className={`grid h-9 w-9 place-items-center rounded-full ${
                      theme === "premium-plus" || theme === "ultra-plus"
                        ? "bg-gray-700 text-white"
                        : "bg-gray-50 text-gray-900"
                    }`}
                    aria-label="Decrease quantity"
                  >
                    <span className="text-lg font-extrabold leading-none">-</span>
                  </button>
                  <div className={`w-8 text-center text-sm font-extrabold ${
                    theme === "premium-plus" || theme === "ultra-plus" ? "text-white" : "text-gray-950"
                  }`}>{qty}</div>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className={`grid h-9 w-9 place-items-center rounded-full ${
                      theme === "premium-plus" || theme === "ultra-plus"
                        ? "bg-gray-700 text-white"
                        : "bg-gray-50 text-gray-900"
                    }`}
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
                  className={`flex-1 rounded-full px-5 py-4 text-sm font-extrabold text-white shadow-lg ${getButtonClasses()}`}
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
  enableTakeaway,
  orderType,
  setOrderType,
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
  enableTakeaway: boolean;
  orderType: OrderType;
  setOrderType: React.Dispatch<React.SetStateAction<OrderType>>;
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
              {enableTakeaway ? (
                <div className="rounded-2xl border border-gray-100 bg-white p-4 space-y-3">
                  <div className="text-sm font-extrabold text-gray-950">{labels.orderTypeTitle}</div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setOrderType("restaurant")}
                      className={[
                        "h-11 rounded-2xl border px-4 text-sm font-extrabold transition-colors",
                        orderType === "restaurant"
                          ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                          : "border-gray-200 bg-gray-50 text-gray-900 hover:bg-gray-100",
                      ].join(" ")}
                    >
                      {labels.orderTypeRestaurant}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOrderType("takeaway");
                        setOrderForm((s) => ({ ...s, tableNumber: "" }));
                      }}
                      className={[
                        "h-11 rounded-2xl border px-4 text-sm font-extrabold transition-colors",
                        orderType === "takeaway"
                          ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                          : "border-gray-200 bg-gray-50 text-gray-900 hover:bg-gray-100",
                      ].join(" ")}
                    >
                      {labels.orderTypeTakeaway}
                    </button>
                  </div>
                </div>
              ) : null}

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

                {orderType === "restaurant" ? (
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
                ) : null}
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

