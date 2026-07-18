"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Check,
  ChefHat,
  Clock,
  Menu,
  Palette,
  QrCode,
  Smartphone,
  X,
} from "lucide-react";
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

const demoThemes = themes.slice(0, 10);

const navItems = [
  { href: "#features", label: "Özellikler" },
  { href: "#demo", label: "Canlı demo" },
  { href: "#themes", label: "Temalar" },
  { href: "#contact", label: "İletişim" },
];

const serviceEvents = [
  {
    time: "18:42",
    title: "Masa 12 menüyü açtı",
    detail: "Editorial tema, Türkçe içerik",
    icon: QrCode,
  },
  {
    time: "18:44",
    title: "Ürün notu eklendi",
    detail: "Glutensiz seçenek vurgulandı",
    icon: ChefHat,
  },
  {
    time: "18:47",
    title: "Garson çağrısı geldi",
    detail: "Panel bildirimi hazır",
    icon: Bell,
  },
];

const operations = [
  {
    title: "Fiyat ve stok değişince",
    body: "Menü yeniden basılmaz. Panelde güncellersin, müşteri aynı QR koddan yeni halini görür.",
    icon: Clock,
  },
  {
    title: "Masa ekibi yoğunken",
    body: "Garson çağırma, hesap isteme ve sipariş notu panelde tek akışta toplanır.",
    icon: Bell,
  },
  {
    title: "Mekan dili değişince",
    body: "Tema, görseller, kategoriler ve dil seçenekleri aynı menü bağlantısı üzerinde kalır.",
    icon: Palette,
  },
];

const setupFlow = [
  {
    verb: "Kur",
    title: "Restoran profilini aç.",
    body: "Logo, açıklama, masa akışı ve menü adresi hazırlanır.",
    icon: ChefHat,
  },
  {
    verb: "Doldur",
    title: "Ürünleri ve kategorileri gir.",
    body: "Fiyat, stok, görsel ve açıklama bilgileri panelden yönetilir.",
    icon: Check,
  },
  {
    verb: "Yayınla",
    title: "QR kodu masaya koy.",
    body: "Menü değişse bile QR aynı kalır. Servis kesilmez.",
    icon: QrCode,
  },
];

const themeGallery = [
  { id: "editorial", name: "Editorial", notes: "sakin restoran", tones: ["#f7f1e8", "#2a2520", "#c2885b"] },
  { id: "night-luxe", name: "Night Luxe", notes: "bar ve steakhouse", tones: ["#12110f", "#d3a16f", "#f1e4d4"] },
  { id: "bento", name: "Bento", notes: "modern kafe", tones: ["#f4f5f6", "#1d1d1f", "#d8dde6"] },
  { id: "warm-cafe", name: "Warm Cafe", notes: "butik kafe", tones: ["#fbfaf3", "#36533c", "#cbb997"] },
  { id: "neo-retro", name: "Neo Retro", notes: "food truck", tones: ["#f0e1d3", "#111111", "#ff4b86"] },
  { id: "glass", name: "Glass", notes: "otel lounge", tones: ["#dbe4ff", "#6857d8", "#ffd8e7"] },
  { id: "premium-plus", name: "Premium+", notes: "fine dining", tones: ["#17100b", "#c48745", "#f4e0be"] },
  { id: "pro", name: "Pro", notes: "zincir işletme", tones: ["#eff4ff", "#1f4d91", "#111827"] },
  { id: "paper", name: "Kağıt", notes: "klasik menü", tones: ["#f4ecdc", "#8c5b25", "#2c2118"] },
  { id: "soft-ui", name: "Soft UI", notes: "pastane", tones: ["#fff1f3", "#db5c7a", "#59313a"] },
];

export default function Home() {
  const [currentTheme, setCurrentTheme] = useState(2);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) return;

    const interval = window.setInterval(() => {
      setCurrentTheme((prev) => (prev + 1) % demoThemes.length);
    }, 6200);

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
    <div className="min-h-screen overflow-x-hidden bg-[#f4efe7] text-[#171614]">
      <Link
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-md focus:bg-[#171614] focus:px-4 focus:py-3 focus:text-sm focus:font-bold focus:text-white"
      >
        İçeriğe geç
      </Link>

      <header className="fixed inset-x-0 top-0 z-50 border-b border-[#171614]/10 bg-[#f4efe7]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="Rivo QR ana sayfa">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-[#171614] text-[#f47a22]">
              <QrCode className="h-5 w-5" strokeWidth={2.35} />
            </span>
            <span className="text-lg font-black">
              Rivo <span className="text-[#e66b1b]">QR</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex" aria-label="Ana menü">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-bold text-[#171614]/50 transition-colors hover:text-[#171614] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e66b1b]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/admin/login"
              className="rounded-full border border-[#171614]/20 px-5 py-2.5 text-sm font-bold text-[#171614] transition-colors hover:bg-[#171614]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e66b1b]"
            >
              Giriş yap
            </Link>
            <Link
              href="/restaurant/register"
              className="inline-flex items-center gap-2 rounded-full bg-[#171614] px-5 py-2.5 text-sm font-black text-white transition-transform hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e66b1b]"
            >
              Restoranını ekle
              <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="grid h-11 w-11 place-items-center rounded-full border border-[#171614]/20 text-[#171614] md:hidden"
            aria-label={mobileOpen ? "Menüyü kapat" : "Menüyü aç"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen ? (
          <div className="border-t border-[#171614]/10 bg-[#f4efe7] px-4 pb-5 pt-3 md:hidden">
            <nav className="grid gap-1" aria-label="Mobil menü">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-3 py-3 text-base font-bold text-[#171614]/80 hover:bg-[#171614]/5 hover:text-[#171614]"
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Link
                  href="/admin/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full border border-[#171614]/20 px-4 py-3 text-center text-sm font-bold"
                >
                  Giriş yap
                </Link>
                <Link
                  href="/restaurant/register"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full bg-[#171614] px-4 py-3 text-center text-sm font-black text-white"
                >
                  Başla
                </Link>
              </div>
            </nav>
          </div>
        ) : null}
      </header>

      <main id="main-content">
        <section className="relative min-h-[100dvh] pt-28 sm:pt-32 lg:pt-36">
          <div className="pointer-events-none absolute inset-0 rivo-paper-grain opacity-70" />
          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-16 sm:px-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,0.78fr)] lg:px-8 lg:pb-20">
            <div className="flex max-w-3xl flex-col justify-center">
              <p className="border-l-2 border-[#e66b1b] pl-4 text-sm font-black text-[#171614]/70">
                Dijital menü yönetimi
              </p>
              <h1 className="mt-8 max-w-[11ch] text-6xl font-black leading-[0.88] text-[#171614] sm:text-7xl lg:text-8xl">
                Menü değişir.
                <span className="block text-[#e66b1b]">QR aynı kalır.</span>
              </h1>
              <p className="mt-8 max-w-[54ch] text-lg font-medium leading-8 text-[#554d45] sm:text-xl">
                Rivo QR, ürünleri, fiyatları, temaları ve sipariş akışını tek panelde tutar. Müşteri telefondan görür, ekip panelden yönetir.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/restaurant/register"
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#171614] px-7 text-base font-black text-white transition-transform hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e66b1b]"
                >
                  Restoranını ekle
                  <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
                </Link>
                <Link
                  href="/menu/demo-restoran"
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-[#171614]/20 px-7 text-base font-black text-[#171614] transition-colors hover:bg-[#171614]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e66b1b]"
                >
                  Demo menüye bak
                  <Smartphone className="h-5 w-5" />
                </Link>
              </div>

              <dl className="mt-12 grid max-w-2xl grid-cols-1 border-y border-[#171614]/10 sm:grid-cols-3">
                {[
                  ["15", "tema seçeneği"],
                  ["1", "değişmeyen QR"],
                  ["3", "panelden yönetilen akış"],
                ].map(([value, label]) => (
                  <div key={label} className="border-b border-[#171614]/10 py-5 sm:border-b-0 sm:border-r sm:border-[#171614]/10 sm:last:border-r-0">
                    <dt className="text-sm font-bold text-[#171614]/50">{label}</dt>
                    <dd className="mt-1 font-mono text-3xl font-black text-[#171614]">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative lg:pt-8">
              <div className="mx-auto max-w-[460px] border-y border-[#171614]/10 py-5">
                <div className="flex items-center justify-between gap-4 border-b border-[#171614]/10 pb-4">
                  <span className="text-sm font-black text-[#171614]">Servis akışı</span>
                  <span className="rounded-full bg-[#171614] px-3 py-1.5 font-mono text-[11px] font-black uppercase text-[#f4efe7]">
                    canlı panel
                  </span>
                </div>

                <div className="mt-6 grid gap-3">
                  {serviceEvents.map((event) => {
                    const Icon = event.icon;

                    return (
                      <div
                        key={event.title}
                        className="grid grid-cols-[48px_1fr] gap-4 rounded-md border border-[#171614]/10 bg-[#fffaf2]/50 p-4"
                      >
                        <div>
                          <div className="grid h-10 w-10 place-items-center rounded-md bg-[#171614] text-[#f47a22]">
                            <Icon className="h-4 w-4" strokeWidth={2.35} />
                          </div>
                          <div className="mt-3 font-mono text-[11px] font-black text-[#171614]/40">{event.time}</div>
                        </div>
                        <div>
                          <p className="text-base font-black leading-snug">{event.title}</p>
                          <p className="mt-1 text-sm font-semibold leading-6 text-[#5f574f]">{event.detail}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 grid grid-cols-[1fr_auto] gap-5 border-t border-[#171614]/10 pt-5">
                  <div>
                    <p className="text-sm font-black text-[#171614]">Masadaki QR değişmeden kalır.</p>
                    <p className="mt-2 text-sm leading-6 text-[#5f574f]">
                      İçerik, fiyat, tema ve dil panelden yenilenir; misafir aynı adresten güncel menüyü açar.
                    </p>
                  </div>
                  <div className="grid h-24 w-24 place-items-center rounded-md bg-[#171614] text-[#f47a22]">
                    <QrCode className="h-12 w-12" strokeWidth={2} />
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-px overflow-hidden rounded-md border border-[#171614]/10 bg-[#171614]/10">
                  {[
                    ["Panel", "tek ekran"],
                    ["Tema", "15 seçenek"],
                    ["QR", "sabit link"],
                  ].map(([label, value]) => (
                    <div key={label} className="bg-[#f4efe7] px-3 py-4">
                      <div className="text-xs font-black text-[#171614]/40">{label}</div>
                      <div className="mt-1 text-sm font-black text-[#171614]">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="border-t border-[#171614]/10 py-20 sm:py-24 lg:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.72fr_1fr] lg:px-8">
            <div>
              <p className="text-sm font-black text-[#e66b1b]">Operasyon tarafı</p>
              <h2 className="mt-5 max-w-[12ch] text-4xl font-black leading-tight sm:text-5xl">
                Basılı menünün yükünü kaldırır.
              </h2>
              <p className="mt-5 max-w-[48ch] text-lg leading-8 text-[#5f574f]">
                Rivo QR gösterişli bir vitrin değil, servis içinde her gün kullanılan araç olacak şekilde sade tutuldu.
              </p>
            </div>

            <div className="border-y border-[#171614]/10">
              {operations.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.title} className="grid gap-5 border-b border-[#171614]/10 py-7 last:border-b-0 sm:grid-cols-[64px_1fr]">
                    <div className="grid h-12 w-12 place-items-center rounded-md bg-[#171614] text-[#f47a22]">
                      <Icon className="h-5 w-5" strokeWidth={2.2} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black">{item.title}</h3>
                      <p className="mt-2 max-w-[62ch] text-base leading-7 text-[#5f574f]">{item.body}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="demo" className="py-20 sm:py-24 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 border-y border-[#171614]/10 py-12 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <p className="text-sm font-black text-[#e66b1b]">Ürün kanıtı</p>
                <h2 className="mt-5 max-w-[12ch] text-4xl font-black leading-tight sm:text-5xl">
                  Sayfadaki demo gerçek menüden gelir.
                </h2>
                <p className="mt-5 max-w-[54ch] text-lg leading-8 text-[#5f574f]">
                  Sağdaki alan statik bir mockup değil. Demo restoran menüsü doğrudan yüklenir, tema seçimi aynı URL yapısıyla çalışır.
                </p>
              </div>

              <div className="grid gap-5 lg:grid-cols-[minmax(0,360px)_1fr] lg:items-start">
                <div className="mx-auto w-full max-w-[360px] rounded-[24px] bg-[#171614] p-2 shadow-[0_18px_48px_rgba(23,22,20,0.18)]">
                  <div className="overflow-hidden rounded-[18px] bg-white">
                    <iframe
                      key={themes[currentTheme]}
                      src={`/menu/demo-restoran?theme=${themes[currentTheme]}`}
                      className="h-[620px] w-full border-0 bg-white"
                      title="Rivo QR canlı menü önizlemesi"
                      loading="lazy"
                      style={{ pointerEvents: "none" }}
                    />
                  </div>
                </div>

                <div className="grid content-start gap-3">
                  {demoThemes.map((theme, index) => (
                    <button
                      key={theme}
                      type="button"
                      onClick={() => setCurrentTheme(index)}
                      aria-pressed={currentTheme === index}
                      className={[
                        "grid grid-cols-[1fr_auto] items-center rounded-md border px-4 py-3 text-left transition-colors",
                        currentTheme === index
                          ? "border-[#171614] bg-[#171614] text-white"
                          : "border-[#171614]/10 bg-[#fffaf2]/40 text-[#171614] hover:border-[#171614]/30",
                      ].join(" ")}
                    >
                      <span className="text-sm font-black">{theme}</span>
                      <span className="font-mono text-xs opacity-70">/?theme={theme}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="themes" className="py-20 sm:py-24 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-sm font-black text-[#e66b1b]">Tema dili</p>
              <h2 className="mt-5 text-4xl font-black sm:text-5xl">
                Her mekan aynı şablona sıkışmaz.
              </h2>
              <p className="mt-5 max-w-[62ch] text-lg leading-8 text-[#5f574f]">
                Temalar görsel karakteri değiştirir, panel mantığı aynı kalır. İşletme ekibi yeniden öğrenmez.
              </p>
            </div>

            <div className="mt-12 grid gap-px overflow-hidden rounded-md border border-[#171614]/10 bg-[#171614]/10 md:grid-cols-2 lg:grid-cols-5">
              {themeGallery.map((theme) => (
                <Link
                  key={theme.id}
                  href={`/menu/demo-restoran?theme=${theme.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-[#f4efe7] p-5 transition-colors hover:bg-[#fffaf2]"
                >
                  <div className="flex gap-1">
                    {theme.tones.map((tone) => (
                      <span
                        key={tone}
                        className="h-10 flex-1 rounded-sm border border-[#171614]/10"
                        style={{ backgroundColor: tone }}
                      />
                    ))}
                  </div>
                  <div className="mt-5 flex items-end justify-between gap-4">
                    <div>
                      <div className="text-lg font-black">{theme.name}</div>
                      <div className="mt-1 text-sm font-semibold text-[#5f574f]">{theme.notes}</div>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-[#e66b1b] transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-24 lg:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
            <div>
              <p className="text-sm font-black text-[#e66b1b]">Kurulum</p>
              <h2 className="mt-5 max-w-[12ch] text-4xl font-black leading-tight sm:text-5xl">
                İlk gün kullanılacak kadar sade.
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {setupFlow.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.verb} className="rounded-md border border-[#171614]/10 bg-[#fffaf2]/50 p-5">
                    <Icon className="h-5 w-5 text-[#e66b1b]" strokeWidth={2.2} />
                    <div className="mt-8 text-2xl font-black">{item.verb}</div>
                    <h3 className="mt-3 text-lg font-black leading-snug">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-[#5f574f]">{item.body}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-y border-[#171614]/10 py-16">
          <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_auto] lg:px-8">
            <div>
              <h2 className="max-w-[18ch] text-4xl font-black leading-tight sm:text-5xl">
                Menüyü yayına al. Servis akışını hafiflet.
              </h2>
              <p className="mt-5 max-w-[58ch] text-lg leading-8 text-[#5f574f]">
                QR kodu masaya koyduktan sonra içerik, tema ve sipariş akışı panelden yönetilmeye devam eder.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link
                href="/restaurant/register"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#171614] px-7 text-base font-black text-white transition-transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Ücretsiz başla
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/menu/demo-restoran"
                className="inline-flex h-14 items-center justify-center rounded-full border border-[#171614]/20 px-7 text-base font-black text-[#171614] transition-colors hover:bg-[#171614]/5"
              >
                Demo menü
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer id="contact" className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
            <div>
              <Link href="/" className="flex items-center gap-3" aria-label="Rivo QR ana sayfa">
                <span className="grid h-10 w-10 place-items-center rounded-md bg-[#171614] text-[#f47a22]">
                  <QrCode className="h-5 w-5" />
                </span>
                <span className="text-lg font-black">
                  Rivo <span className="text-[#e66b1b]">QR</span>
                </span>
              </Link>
              <p className="mt-5 max-w-[34ch] text-sm leading-6 text-[#5f574f]">
                Restoranlar için dijital QR menü ve sipariş altyapısı.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-black">Ürün</h3>
              <div className="mt-4 grid gap-3">
                <Link href="#features" className="text-sm font-semibold text-[#5f574f] hover:text-[#171614]">
                  Özellikler
                </Link>
                <Link href="/menu/demo-restoran" className="text-sm font-semibold text-[#5f574f] hover:text-[#171614]">
                  Demo menü
                </Link>
                <Link href="/menu-packages" className="text-sm font-semibold text-[#5f574f] hover:text-[#171614]">
                  Paketler
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black">Şirket</h3>
              <div className="mt-4 grid gap-3">
                <Link href="/gizlilik-politikasi" className="text-sm font-semibold text-[#5f574f] hover:text-[#171614]">
                  Gizlilik Politikası
                </Link>
                <Link href="/kvkk" className="text-sm font-semibold text-[#5f574f] hover:text-[#171614]">
                  Kullanım Şartları
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black">Destek</h3>
              <div className="mt-4 grid gap-3">
                <a
                  href="https://softwareoffuture.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-[#5f574f] hover:text-[#171614]"
                >
                  İletişim
                </a>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-[#171614]/10 pt-6 text-xs font-semibold text-[#5f574f] sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 Rivo QR. Tüm hakları saklıdır.</p>
            <p>
              Developed by{" "}
              <a
                href="https://softwareoffuture.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#e66b1b] hover:text-[#171614]"
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
