"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  ChefHat,
  Clock,
  Cloud,
  Globe,
  Menu,
  Palette,
  Phone,
  QrCode,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  X,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

const themes = [
  "default",
  "premium",
  "editorial",
  "night-luxe",
  "bento",
  "warm-cafe",
  "neo-retro",
  "glass",
  "paper",
  "paper-image",
  "swipe",
  "premium-plus",
  "pro",
  "soft-ui",
  "ultra-plus",
];

const navItems = [
  { href: "#features", label: "Özellikler" },
  { href: "#demo", label: "Canlı demo" },
  { href: "#themes", label: "Temalar" },
  { href: "#contact", label: "İletişim" },
];

const heroStats = [
  "15 hazır tema",
  "Anında yayın",
  "QR kod değişmeden güncelleme",
];

type FeatureBlock = {
  title: string;
  body: string;
  icon: LucideIcon;
  className: string;
};

const featureBlocks: FeatureBlock[] = [
  {
    title: "Menü bugün değiştiyse müşterin hemen görür.",
    body: "Fiyat, stok, ürün ve kategori güncellemeleri basılı menü beklemeden yayına çıkar.",
    icon: Clock,
    className: "lg:col-span-2 bg-[#171412]",
  },
  {
    title: "Her masa aynı QR ile çalışır.",
    body: "QR kodu yeniden bastırmadan tema ve içerik değiştir.",
    icon: QrCode,
    className: "bg-[#1d1814]",
  },
  {
    title: "Sipariş ve garson çağırma aynı akışta.",
    body: "Müşteri masadan sepet oluşturur, not bırakır, garson çağırır veya hesap ister.",
    icon: Bell,
    className: "bg-[#151716]",
  },
  {
    title: "Çok dilli menüler hazır.",
    body: "Turistik bölgeler, otel restoranları ve zincir işletmeler için dil desteği aynı altyapıda.",
    icon: Globe,
    className: "lg:col-span-2 bg-[#15171a]",
  },
  {
    title: "Yönetim paneli sade tutuldu.",
    body: "Ekip ürün ekler, görsel yükler ve kampanya düzenler. Teknik bilgi gerekmez.",
    icon: ShieldCheck,
    className: "bg-[#171512]",
  },
];

const workflow = [
  {
    verb: "Kur",
    title: "Restoran profilini ve menü yapısını ekle.",
    body: "Kategoriler, ürünler, fiyatlar ve görseller aynı panelden hazırlanır.",
    icon: ChefHat,
  },
  {
    verb: "Paylaş",
    title: "QR kodunu masalara, paketlere veya ekrana koy.",
    body: "Tek QR kodu kullanırsın. Menü adresi değişmeden içerik güncellenir.",
    icon: Smartphone,
  },
  {
    verb: "Yönet",
    title: "Yoğun servis sırasında bile değişiklik yap.",
    body: "Stokta olmayan ürünleri kapat, kampanya ekle, yeni temaya geç.",
    icon: Zap,
  },
];

const themeGallery = [
  { id: "editorial", name: "Editorial", tag: "Yeni", preview: "warm-serif" },
  { id: "night-luxe", name: "Night Luxe", tag: "Yeni", preview: "dark-copper" },
  { id: "bento", name: "Bento", tag: "Yeni", preview: "modern-grid" },
  { id: "warm-cafe", name: "Warm Cafe", tag: "Yeni", preview: "ivory-green" },
  { id: "neo-retro", name: "Neo Retro", tag: "Yeni", preview: "bold-black" },
  { id: "glass", name: "Glass", tag: "Yeni", preview: "gradient-glass" },
  { id: "premium-plus", name: "Premium+", tag: "Popüler", preview: "dark-gold" },
  { id: "ultra-plus", name: "Ultra+", tag: "Popüler", preview: "dark-violet" },
  { id: "swipe", name: "Swipe", tag: "Klasik", preview: "purple-cards" },
  { id: "paper", name: "Kağıt", tag: "Klasik", preview: "warm-paper" },
  { id: "paper-image", name: "Resimli Kağıt", tag: "Klasik", preview: "amber-warm" },
  { id: "pro", name: "Pro", tag: "Klasik", preview: "blue-clean" },
  { id: "soft-ui", name: "Soft UI", tag: "Klasik", preview: "rose-soft" },
  { id: "premium", name: "Premium", tag: "Klasik", preview: "clean-white" },
  { id: "default", name: "Varsayılan", tag: "Klasik", preview: "emerald-clean" },
];

const previewGradient = (preview: string): string =>
  ({
    "warm-serif": "linear-gradient(135deg,#faf7f2 0%,#e8dfd3 100%)",
    "dark-copper": "linear-gradient(135deg,#0e0e10 0%,#2a2017 100%)",
    "modern-grid": "linear-gradient(135deg,#f6f6f7 0%,#d9dee8 100%)",
    "ivory-green": "linear-gradient(135deg,#fdfcf6 0%,#dfeee4 100%)",
    "bold-black": "linear-gradient(135deg,#f1e7dd 0%,#ff4e8a 100%)",
    "gradient-glass": "linear-gradient(135deg,#dbe4ff 0%,#f0d8ff 48%,#ffd7e6 100%)",
    "dark-gold": "linear-gradient(135deg,#17100b 0%,#463016 100%)",
    "dark-violet": "linear-gradient(135deg,#181436 0%,#4c1d95 100%)",
    "purple-cards": "linear-gradient(135deg,#fbf5ff 0%,#f7d7ec 100%)",
    "warm-paper": "linear-gradient(135deg,#f4efe5 0%,#e7d6b7 100%)",
    "amber-warm": "linear-gradient(135deg,#fff1c2 0%,#ffc28a 100%)",
    "blue-clean": "linear-gradient(135deg,#eff6ff 0%,#dce6ff 100%)",
    "rose-soft": "linear-gradient(135deg,#fff1f3 0%,#f9cdd7 100%)",
    "clean-white": "linear-gradient(135deg,#ffffff 0%,#eeeeee 100%)",
    "emerald-clean": "linear-gradient(135deg,#ecfdf5 0%,#c8f2de 100%)",
  }[preview] || "#ffffff");

const previewAccent = (preview: string): string =>
  ({
    "warm-serif": "#171717",
    "dark-copper": "#d4a574",
    "modern-grid": "#171717",
    "ivory-green": "#4a7c59",
    "bold-black": "#111111",
    "gradient-glass": "#5b5fd6",
    "dark-gold": "#f59e0b",
    "dark-violet": "#a78bfa",
    "purple-cards": "#a855f7",
    "warm-paper": "#9a5a12",
    "amber-warm": "#c76519",
    "blue-clean": "#2563eb",
    "rose-soft": "#e43f63",
    "clean-white": "#0f9f6e",
    "emerald-clean": "#0d9f72",
  }[preview] || "#171717");

export default function Home() {
  const [currentTheme, setCurrentTheme] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) return;

    const interval = window.setInterval(() => {
      setCurrentTheme((prev) => (prev + 1) % themes.length);
    }, 5200);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [mobileOpen]);

  return (
    <div className="rivo-page min-h-screen overflow-x-hidden bg-[#100f0e] text-[#f7f1e8]">
      <Link
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-lg focus:bg-[#f97316] focus:px-4 focus:py-3 focus:text-sm focus:font-bold focus:text-[#100f0e]"
      >
        İçeriğe geç
      </Link>

      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#100f0e]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-3" aria-label="Rivo QR ana sayfa">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#f97316] text-[#100f0e] shadow-[0_16px_40px_rgba(249,115,22,0.28)] transition-transform duration-300 group-hover:-translate-y-0.5">
              <QrCode className="h-5 w-5" strokeWidth={2.4} />
            </span>
            <span className="text-lg font-black tracking-tight text-white">
              Rivo <span className="text-[#f97316]">QR</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex" aria-label="Ana menü">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-semibold text-white/70 transition-colors duration-200 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f97316]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/admin/login"
              className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold text-white/80 transition-all duration-200 hover:border-white/30 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f97316]"
            >
              Giriş yap
            </Link>
            <Link
              href="/restaurant/register"
              className="inline-flex items-center gap-2 rounded-full bg-[#f97316] px-5 py-2.5 text-sm font-black text-[#120f0c] shadow-[0_14px_36px_rgba(249,115,22,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#fb8c2e] active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f97316]"
            >
              Ücretsiz başla
              <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="grid h-11 w-11 place-items-center rounded-full border border-white/20 text-white md:hidden"
            aria-label={mobileOpen ? "Menüyü kapat" : "Menüyü aç"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen ? (
          <div className="border-t border-white/10 bg-[#100f0e]/95 px-4 pb-5 pt-3 backdrop-blur-xl md:hidden">
            <nav className="grid gap-1" aria-label="Mobil menü">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-3 text-base font-bold text-white/80 hover:bg-white/10 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Link
                  href="/admin/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full border border-white/20 px-4 py-3 text-center text-sm font-bold text-white"
                >
                  Giriş yap
                </Link>
                <Link
                  href="/restaurant/register"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full bg-[#f97316] px-4 py-3 text-center text-sm font-black text-[#120f0c]"
                >
                  Başla
                </Link>
              </div>
            </nav>
          </div>
        ) : null}
      </header>

      <main id="main-content">
        <section className="relative isolate min-h-[100dvh] overflow-hidden pt-28 sm:pt-32 lg:pt-36">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(249,115,22,0.18),transparent_31%),radial-gradient(circle_at_18%_78%,rgba(255,255,255,0.06),transparent_30%)]" />
          <div className="pointer-events-none absolute inset-0 rivo-noise opacity-[0.16]" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:pb-20">
            <div className="rivo-animate-in max-w-3xl">
              <div className="mb-7 inline-flex max-w-full items-center rounded-full border border-[#f97316]/40 bg-[#f97316]/10 px-4 py-2 text-sm font-bold text-[#ffd2ad]">
                Rivo QR restoran menüsü
              </div>
              <h1 className="max-w-[18ch] text-5xl font-black leading-[0.96] tracking-tight text-white sm:text-6xl lg:text-6xl 2xl:text-7xl">
                <span className="block">Restoranına</span>
                <span className="block">yakışan QR menü.</span>
              </h1>
              <p className="mt-7 max-w-[59ch] text-lg leading-8 text-[#d8cab8] sm:text-xl">
                Rivo QR, menünü canlı tutar: ürünler, fiyatlar, kampanyalar ve sipariş akışı tek panelden yönetilir.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/restaurant/register"
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#f97316] px-7 text-base font-black text-[#120f0c] shadow-[0_18px_48px_rgba(249,115,22,0.32)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#fb8c2e] active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f97316]"
                >
                  Ücretsiz başla
                  <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
                </Link>
                <Link
                  href="/menu/demo-restoran"
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-7 text-base font-black text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/10 active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f97316]"
                >
                  Demo menüyü gör
                  <Smartphone className="h-5 w-5" />
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap gap-3">
                {heroStats.map((stat) => (
                  <span
                    key={stat}
                    className="rounded-full border border-white/10 bg-white/[0.055] px-4 py-2 text-sm font-semibold text-white/75"
                  >
                    {stat}
                  </span>
                ))}
              </div>
            </div>

            <div className="rivo-animate-in relative" style={{ animationDelay: "120ms" }}>
              <div className="relative aspect-[1.18/1] overflow-hidden rounded-lg border border-white/10 bg-[#171412] shadow-[0_30px_120px_rgba(0,0,0,0.42)]">
                <Image
                  src="/rivo-qr-restaurant-hero.png"
                  alt="Restoran masasında QR kod ve telefonda dijital menü görünümü"
                  fill
                  priority
                  sizes="(min-width: 1024px) 54vw, 100vw"
                  className="object-cover"
                />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-white/10 bg-white/[0.055] p-4">
                  <QrCode className="h-5 w-5 text-[#f97316]" />
                  <div className="mt-2 text-sm font-bold text-white">Tara</div>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.055] p-4">
                  <Smartphone className="h-5 w-5 text-[#f97316]" />
                  <div className="mt-2 text-sm font-bold text-white">Seç</div>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.055] p-4">
                  <ShoppingBag className="h-5 w-5 text-[#f97316]" />
                  <div className="mt-2 text-sm font-bold text-white">Sipariş ver</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="relative py-20 sm:py-24 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h2 className="text-balance text-4xl font-black tracking-tight text-white sm:text-5xl">
                Servis sırasında beklemeyen menü altyapısı.
              </h2>
              <p className="mt-5 max-w-[62ch] text-lg leading-8 text-[#cbbfaf]">
                Restoran ekibinin her gün yaptığı işleri hızlandıran sade bir panel ve müşteriye temiz bir mobil deneyim.
              </p>
            </div>

            <div className="mt-12 grid auto-rows-[minmax(220px,auto)] grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {featureBlocks.map((feature) => {
                const Icon = feature.icon;
                return (
                  <article
                    key={feature.title}
                    className={[
                      "group relative overflow-hidden rounded-lg border border-white/10 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.20)] transition-all duration-300 hover:-translate-y-1 hover:border-[#f97316]/50",
                      feature.className,
                    ].join(" ")}
                  >
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(249,115,22,0.16),transparent_35%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="relative flex h-full flex-col">
                      <div className="grid h-12 w-12 place-items-center rounded-lg border border-[#f97316]/25 bg-[#f97316]/10 text-[#f97316]">
                        <Icon className="h-6 w-6" strokeWidth={2.2} />
                      </div>
                      <h3 className="mt-8 max-w-[18ch] text-2xl font-black leading-tight tracking-tight text-white">
                        {feature.title}
                      </h3>
                      <p className="mt-4 max-w-[56ch] text-base leading-7 text-[#cabba9]">
                        {feature.body}
                      </p>
                      <div className="mt-auto pt-8 text-sm font-bold text-[#f97316]">
                        Rivo QR panelinde hazır
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="demo" className="relative overflow-hidden py-20 sm:py-24 lg:py-28">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8">
            <div className="lg:pt-10">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.055] px-4 py-2 text-sm font-bold text-white/70">
                <Palette className="h-4 w-4 text-[#f97316]" />
                Tema canlı değişir
              </div>
              <h2 className="max-w-[12ch] text-balance text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl">
                Gerçek menüyü sayfanın içinde göster.
              </h2>
              <p className="mt-5 max-w-[56ch] text-lg leading-8 text-[#cbbfaf]">
                Demo alanı, müşterinin göreceği mobil menüyü doğrudan yükler. Tasarım sadece vitrin değil, çalışan ürünün kendisi.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-white/10 bg-white/[0.055] p-5">
                  <ShoppingBag className="h-5 w-5 text-[#f97316]" />
                  <div className="mt-4 text-sm font-black text-white">Sepet akışı</div>
                  <p className="mt-2 text-sm leading-6 text-white/60">
                    Ürün, not, kupon ve sipariş özeti aynı ekranda ilerler.
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.055] p-5">
                  <Phone className="h-5 w-5 text-[#f97316]" />
                  <div className="mt-4 text-sm font-black text-white">Masa iletişimi</div>
                  <p className="mt-2 text-sm leading-6 text-white/60">
                    Garson çağırma ve hesap isteme panel bildirimlerine bağlanır.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-3 rounded-[32px] bg-[#f97316]/20 blur-3xl" />
              <div className="relative mx-auto max-w-[500px] rounded-[32px] border border-white/10 bg-[#090807] p-3 shadow-[0_34px_120px_rgba(0,0,0,0.48)]">
                <div className="overflow-hidden rounded-[24px] border border-white/10 bg-white">
                  <iframe
                    key={themes[currentTheme]}
                    src={`/menu/demo-restoran?theme=${themes[currentTheme]}`}
                    className="h-[690px] w-full border-0 bg-white"
                    title="Rivo QR demo menü"
                    loading="lazy"
                    style={{
                      pointerEvents: "none",
                    }}
                  />
                </div>
              </div>

              <div className="mx-auto mt-5 flex max-w-[500px] flex-wrap items-center justify-center gap-2">
                {themes.slice(0, 8).map((theme, index) => (
                  <button
                    key={theme}
                    type="button"
                    onClick={() => setCurrentTheme(index)}
                    className={[
                      "rounded-full border px-3 py-2 text-xs font-bold transition-all duration-200",
                      currentTheme === index
                        ? "border-[#f97316] bg-[#f97316] text-[#120f0c]"
                        : "border-white/10 bg-white/[0.055] text-white/60 hover:border-white/30 hover:text-white",
                    ].join(" ")}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="themes" className="relative py-20 sm:py-24 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h2 className="text-balance text-4xl font-black tracking-tight text-white sm:text-5xl">
                Her mekanın karakterine uygun vitrin.
              </h2>
              <p className="mt-5 max-w-[62ch] text-lg leading-8 text-[#cbbfaf]">
                Fine dining, kafe, bar, food truck veya paket servis. Temayı seç, menü aynı altyapıyla yayınlansın.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
              {themeGallery.map((theme, index) => (
                <Link
                  key={theme.id}
                  href={`/menu/demo-restoran?theme=${theme.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={[
                    "group overflow-hidden rounded-lg border border-white/10 bg-white/[0.055] transition-all duration-300 hover:-translate-y-1 hover:border-[#f97316]/50",
                    index === 0 ? "md:col-span-2 md:row-span-2" : "",
                  ].join(" ")}
                >
                  <div
                    className={index === 0 ? "h-64 md:h-full" : "h-32"}
                    style={{ background: previewGradient(theme.preview) }}
                  >
                    <div className="flex h-full flex-col justify-end p-4">
                      <div
                        className="h-2 w-2/3 rounded-full opacity-45"
                        style={{ backgroundColor: previewAccent(theme.preview) }}
                      />
                      <div
                        className="mt-2 h-2 w-1/2 rounded-full opacity-25"
                        style={{ backgroundColor: previewAccent(theme.preview) }}
                      />
                      <div
                        className="mt-4 h-9 w-9 rounded-lg"
                        style={{ backgroundColor: previewAccent(theme.preview) }}
                      />
                    </div>
                  </div>
                  <div className="flex min-h-[92px] flex-col justify-between p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-base font-black text-white">{theme.name}</div>
                      <span className="rounded-md border border-white/10 bg-white/[0.06] px-2 py-1 text-[11px] font-bold text-white/70">
                        {theme.tag}
                      </span>
                    </div>
                    <div className="mt-3 text-xs font-semibold text-[#f97316] opacity-75 group-hover:opacity-100">
                      Önizle
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-10">
              <Link
                href="/menu-packages"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.055] px-5 py-3 text-sm font-black text-white transition-all duration-200 hover:border-[#f97316]/50 hover:text-[#f97316]"
              >
                Tüm paketleri karşılaştır
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="relative py-20 sm:py-24 lg:py-28">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
            <div className="rounded-lg border border-white/10 bg-[#171412] p-8 sm:p-10 lg:p-12">
              <div className="grid h-14 w-14 place-items-center rounded-lg bg-[#f97316] text-[#120f0c]">
                <Cloud className="h-7 w-7" />
              </div>
              <h2 className="mt-10 max-w-[12ch] text-balance text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl">
                Panel sade, operasyon hızlı.
              </h2>
              <p className="mt-5 max-w-[58ch] text-lg leading-8 text-[#cbbfaf]">
                Rivo QR, restoranın günlük temposuna göre tasarlandı. Menü yönetimi, tema seçimi ve sipariş akışı tek yerde kalır.
              </p>
              <Link
                href="/restaurant/register"
                className="mt-9 inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#f97316] px-7 text-base font-black text-[#120f0c] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#fb8c2e]"
              >
                Restoranını ekle
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>

            <div className="grid gap-4">
              {workflow.map((item) => {
                const Icon = item.icon;
                return (
                  <article
                    key={item.verb}
                    className="rounded-lg border border-white/10 bg-white/[0.055] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#f97316]/50"
                  >
                    <div className="flex items-start gap-5">
                      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-[#f97316]/25 bg-[#f97316]/10 text-[#f97316]">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="text-2xl font-black text-white">{item.verb}</div>
                        <h3 className="mt-2 text-lg font-black leading-snug text-white/90">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-white/60">{item.body}</p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden py-20 sm:py-24 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-lg border border-[#f97316]/30 bg-[#f97316] p-8 text-[#120f0c] sm:p-10 lg:p-14">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_12%,rgba(255,255,255,0.42),transparent_30%)]" />
              <div className="relative grid items-end gap-8 lg:grid-cols-[1fr_auto]">
                <div>
                  <h2 className="max-w-[14ch] text-balance text-4xl font-black leading-tight tracking-tight sm:text-5xl">
                    Bugün yayına alın, yarın masada kullanın.
                  </h2>
                  <p className="mt-5 max-w-[62ch] text-lg font-semibold leading-8 text-[#2d190b]">
                    Rivo QR ile menünü hızlıca kur, QR kodunu paylaş ve servis sırasında menünü özgürce yönet.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                  <Link
                    href="/restaurant/register"
                    className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#120f0c] px-7 text-base font-black text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#251a11]"
                  >
                    Ücretsiz başla
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link
                    href="/menu/demo-restoran"
                    className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-[#120f0c]/20 bg-white/30 px-7 text-base font-black text-[#120f0c] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/40"
                  >
                    Demo menü
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer id="contact" className="border-t border-white/10 bg-[#0b0a09] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
            <div>
              <Link href="/" className="flex items-center gap-3" aria-label="Rivo QR ana sayfa">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#f97316] text-[#100f0e]">
                  <QrCode className="h-5 w-5" />
                </span>
                <span className="text-lg font-black tracking-tight text-white">
                  Rivo <span className="text-[#f97316]">QR</span>
                </span>
              </Link>
              <p className="mt-5 max-w-[34ch] text-sm leading-6 text-white/50">
                Restoranlar için modern dijital QR menü ve sipariş altyapısı.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-black text-white">Ürün</h3>
              <div className="mt-4 grid gap-3">
                <Link href="#features" className="text-sm font-semibold text-white/50 hover:text-white">
                  Özellikler
                </Link>
                <Link href="/menu/demo-restoran" className="text-sm font-semibold text-white/50 hover:text-white">
                  Demo menü
                </Link>
                <Link href="/menu-packages" className="text-sm font-semibold text-white/50 hover:text-white">
                  Paketler
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black text-white">Şirket</h3>
              <div className="mt-4 grid gap-3">
                <Link href="/gizlilik-politikasi" className="text-sm font-semibold text-white/50 hover:text-white">
                  Gizlilik Politikası
                </Link>
                <Link href="/kvkk" className="text-sm font-semibold text-white/50 hover:text-white">
                  Kullanım Şartları
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black text-white">Destek</h3>
              <div className="mt-4 grid gap-3">
                <a
                  href="https://softwareoffuture.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-white/50 hover:text-white"
                >
                  İletişim
                </a>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs font-semibold text-white/40 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © 2026 Rivo QR. Tüm hakları saklıdır.
            </p>
            <p>
              Developed by{" "}
              <a
                href="https://softwareoffuture.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#f97316] hover:text-[#fb8c2e]"
              >
                Software Of Future
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
