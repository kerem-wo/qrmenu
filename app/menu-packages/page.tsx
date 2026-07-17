"use client";

import Link from "next/link";
import { ArrowLeft, Smartphone, Sparkles, Eye, Check, Star, Coffee, Utensils, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";

type MenuPackage = {
  id: string;
  name: string;
  description: string;
  theme: string;
  image: string;
  features: string[];
  popular?: boolean;
  isNew?: boolean;
};

const packages: MenuPackage[] = [
  {
    id: "editorial",
    name: "Editorial — Minimal Sıcak",
    description: "Restoran-dergi hissi veren sade, sıcak tonlu tasarım. Serif başlıklar, cömert boşluklar, iyi tipografi. Fine-dining ve tasarım-odaklı işletmeler için.",
    theme: "editorial",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80",
    features: ["Serif tipografi", "Minimal düzen", "Sıcak beyaz zemin", "Editorial ruh"],
    isNew: true,
  },
  {
    id: "night-luxe",
    name: "Night Luxe — Koyu Bakır",
    description: "Steakhouse, kokteyl bar ve gece mekanları için premium koyu tema. Bakır aksanlar, cam efektli kartlar, prestij hissi.",
    theme: "night-luxe",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80",
    features: ["Koyu zemin", "Bakır aksan", "Cam efekt kartlar", "Serif başlık"],
    isNew: true,
  },
  {
    id: "bento",
    name: "Bento — Modern Izgara",
    description: "Apple/Notion tarzı ferah ızgara. Yuvarlak kenarlı beyaz kartlar, cömert boşluklar, teknoloji-cafe hissi.",
    theme: "bento",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80",
    features: ["Modern ızgara", "3xl köşeler", "Kalkan hover", "Apple estetiği"],
    isNew: true,
  },
  {
    id: "warm-cafe",
    name: "Warm Café — Fildişi & Yeşil",
    description: "Butik kafe ve pastane için sıcak fildişi zemin, derin orman yeşili aksan. Sakin, güven veren atmosfer.",
    theme: "warm-cafe",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80",
    features: ["Fildişi zemin", "Orman yeşili", "Sakin renkler", "Kafe dostu"],
    isNew: true,
  },
  {
    id: "neo-retro",
    name: "Neo Retro — Cesur 80'ler",
    description: "Sert siyah kenarlıklar, sert gölgeler, neon pembe aksan. Burger yeri, food truck, gençlik odaklı mekan için.",
    theme: "neo-retro",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80",
    features: ["Sert kenarlık", "Neon pembe", "Sert gölge", "Cesur tipografi"],
    isNew: true,
  },
  {
    id: "glass",
    name: "Glass — Cam Efekti",
    description: "Renkli gradient zemin üzerine cam-morphism. Butik otel restoranı, cocktail lounge, moda kafe için oynak ve modern.",
    theme: "glass",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80",
    features: ["Cam kartlar", "Renkli gradient", "İndigo-mor aksan", "Blur estetiği"],
    isNew: true,
  },
  {
    id: "premium",
    name: "Premium Menü",
    description: "Basit ve hızlı kullanımlı dijital menü arayüzü. Modern restoranlar için optimize edilmiş, kullanıcı dostu tasarım.",
    theme: "premium",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
    features: ["Mobil uyumlu", "Hızlı yükleme", "Kolay yönetim", "Modern arayüz"],
  },
  {
    id: "paper",
    name: "Kağıt Menü",
    description: "Klasik restoranlar için modern QR menü şablonu. Kağıt menü hissi veren, okunabilir ve profesyonel tasarım.",
    theme: "paper",
    image: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=800&q=80",
    features: ["Klasik tasarım", "Okunabilir düzen", "Profesyonel görünüm", "Minimalist"],
  },
  {
    id: "paper-image",
    name: "Resimli Kağıt Menü",
    description: "Kafeler ve kahve dükkanları için ideal yapı. Ürün görselleriyle zenginleştirilmiş, görsel odaklı menü tasarımı.",
    theme: "paper-image",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80",
    features: ["Görsel odaklı", "Kafe dostu", "Çekici tasarım", "Ürün fotoğrafları"],
  },
  {
    id: "swipe",
    name: "Modern Swipe Menu",
    description: "Hızlı sipariş odaklı sade QR menü tasarımı. Swipe hareketleriyle kolay navigasyon, modern ve akıcı kullanıcı deneyimi.",
    theme: "swipe",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
    features: ["Swipe navigasyon", "Hızlı sipariş", "Modern arayüz", "Akıcı animasyonlar"],
  },
  {
    id: "premium-plus",
    name: "Premium+ QR Menu",
    description: "Premium restoranlara özel şık görünüm. Lüks tasarım, özel animasyonlar ve üst düzey kullanıcı deneyimi sunar.",
    theme: "premium-plus",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80",
    features: ["Lüks tasarım", "Özel animasyonlar", "Premium deneyim", "VIP görünüm"],
    popular: true,
  },
  {
    id: "pro",
    name: "Pro QR Menu",
    description: "Profesyonel görünümlü QR menü. İşletmeler için gelişmiş özellikler, detaylı raporlama ve özelleştirilebilir yapı.",
    theme: "pro",
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80",
    features: ["Profesyonel", "Gelişmiş özellikler", "Özelleştirilebilir", "İş odaklı"],
  },
  {
    id: "soft-ui",
    name: "Soft UI Menü",
    description: "Soft UI tasarımlı, modern ve dikkat çekici menü. Yumuşak renkler, yuvarlak köşeler ve kullanıcı dostu arayüz.",
    theme: "soft-ui",
    image: "https://images.unsplash.com/photo-1556910103-2c727e08c622?auto=format&fit=crop&w=800&q=80",
    features: ["Soft UI", "Modern tasarım", "Kullanıcı dostu", "Yumuşak renkler"],
  },
  {
    id: "ultra-plus",
    name: "Ultra+ Menü",
    description: "Ultra+ restoranlara özel şık görünüm. En lüks tasarım, özel özellikler ve VIP müşteri deneyimi sunar.",
    theme: "ultra-plus",
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80",
    features: ["Ultra lüks", "Özel özellikler", "VIP deneyim", "Premium animasyonlar"],
  },
];

export default function MenuPackagesPage() {
  return (
    <div className="min-h-screen premium-bg-gradient">
      {/* Header */}
      <header className="premium-glass sticky top-0 z-50 border-b border-gray-200/50">
        <div className="premium-container">
          <div className="flex items-center justify-between py-5">
            <Link href="/" className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg premium-shadow-md">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-premium-glow"></div>
              </div>
              <div>
                <span className="text-2xl font-black text-gray-900 tracking-tight">Rivo QR</span>
              </div>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 font-semibold transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Ana Sayfa
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="premium-section relative">
        <div className="premium-container">
          <div className="max-w-4xl mx-auto text-center animate-premium-fade-in">
            <h1 className="premium-heading-1 mb-6">Menü Paketleri</h1>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
              T.C. Ticaret Bakanlığı yönetmeliğine uygun, mobil uyumlu 14 farklı Rivo QR tasarımını keşfedin.
            </p>
          </div>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="premium-section relative">
        <div className="premium-container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <div
                key={pkg.id}
                className="premium-card p-6 premium-hover-lift group relative overflow-hidden animate-premium-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {pkg.popular && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-green-500 to-blue-600 text-white text-xs font-bold rounded-full shadow-lg">
                      <Sparkles className="w-3 h-3" />
                      Popüler
                    </span>
                  </div>
                )}
                {pkg.isNew && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-[#FF6F00] to-[#FF8F33] text-white text-xs font-bold rounded-full shadow-lg">
                      <Sparkles className="w-3 h-3" />
                      Yeni
                    </span>
                  </div>
                )}

                {/* Theme Preview - Custom Design for Each Theme */}
                <div className="relative h-64 w-full mb-4 rounded-2xl overflow-hidden bg-white border-2 border-gray-200 shadow-lg">
                  {pkg.theme === "premium" && (
                    <div className="h-full bg-gradient-to-br from-green-50 to-blue-50 p-4">
                      <div className="bg-white rounded-xl p-3 shadow-sm mb-2">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-black text-gray-900 text-sm">Premium Menü</h4>
                          <div className="w-8 h-8 bg-green-500 rounded-lg"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-2 flex items-center gap-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-400 rounded-lg"></div>
                        <div className="flex-1">
                          <div className="h-2 bg-gray-300 rounded w-2/3 mb-1"></div>
                          <div className="h-2 bg-gray-200 rounded w-1/3"></div>
                        </div>
                        <div className="w-6 h-6 bg-green-500 rounded-full"></div>
                      </div>
                    </div>
                  )}
                  
                  {pkg.theme === "paper" && (
                    <div className="h-full bg-[#f5f1e8] p-4" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)' }}>
                      <div className="bg-white rounded-none p-3 shadow-md mb-2 border-l-4 border-amber-600">
                        <h4 className="font-bold text-gray-900 text-sm mb-1">Kağıt Menü</h4>
                        <div className="h-px bg-gray-300 my-2"></div>
                        <div className="space-y-1.5">
                          <div className="h-1.5 bg-gray-400 rounded w-full"></div>
                          <div className="h-1.5 bg-gray-400 rounded w-3/4"></div>
                        </div>
                      </div>
                      <div className="bg-white rounded-none p-2 border-l-4 border-amber-500">
                        <div className="flex justify-between items-center">
                          <div className="h-1.5 bg-gray-400 rounded w-1/2"></div>
                          <div className="h-1.5 bg-gray-500 rounded w-12"></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {pkg.theme === "paper-image" && (
                    <div className="h-full bg-gradient-to-br from-amber-50 to-orange-50 p-4">
                      <div className="bg-white rounded-xl p-2 shadow-md mb-2">
                        <div className="w-full h-16 bg-gradient-to-br from-amber-200 to-orange-200 rounded-lg mb-2"></div>
                        <h4 className="font-bold text-gray-900 text-xs mb-1">Resimli Kağıt</h4>
                        <div className="h-1 bg-gray-300 rounded w-2/3"></div>
                      </div>
                      <div className="bg-white rounded-lg p-2 flex gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-300 to-orange-300 rounded"></div>
                        <div className="flex-1">
                          <div className="h-1.5 bg-gray-400 rounded w-full mb-1"></div>
                          <div className="h-1 bg-gray-300 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {pkg.theme === "swipe" && (
                    <div className="h-full bg-gradient-to-br from-purple-50 to-pink-50 p-4">
                      <div className="bg-white rounded-2xl p-3 shadow-lg mb-2">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <div className="w-2 h-2 bg-purple-300 rounded-full"></div>
                          <div className="w-2 h-2 bg-purple-300 rounded-full"></div>
                        </div>
                        <h4 className="font-black text-gray-900 text-sm mb-2">Swipe Menu</h4>
                        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-2">
                          <div className="h-2 bg-purple-400 rounded w-3/4 mb-1"></div>
                          <div className="h-2 bg-pink-300 rounded w-1/2"></div>
                        </div>
                      </div>
                      <div className="bg-white rounded-xl p-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-purple-500 rounded-lg"></div>
                          <div className="h-1.5 bg-gray-400 rounded w-16"></div>
                        </div>
                        <div className="w-6 h-6 bg-purple-500 rounded-full"></div>
                      </div>
                    </div>
                  )}
                  
                  {pkg.theme === "premium-plus" && (
                    <div className="h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
                      <div className="bg-gradient-to-br from-amber-500/20 to-yellow-500/20 backdrop-blur-sm rounded-2xl p-3 border border-amber-500/30 mb-2">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-black text-white text-sm">Premium+</h4>
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        </div>
                        <div className="space-y-2">
                          <div className="h-1.5 bg-amber-400/30 rounded w-full"></div>
                          <div className="h-1.5 bg-amber-400/20 rounded w-3/4"></div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 rounded-xl p-2 border border-amber-500/20">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-400 rounded-lg"></div>
                          <div className="flex-1">
                            <div className="h-1.5 bg-amber-400/40 rounded w-2/3 mb-1"></div>
                            <div className="h-1 bg-amber-400/30 rounded w-1/3"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {pkg.theme === "pro" && (
                    <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
                      <div className="bg-white rounded-lg p-3 shadow-md border-l-4 border-blue-600 mb-2">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-gray-900 text-sm">Pro Menu</h4>
                          <div className="w-6 h-6 bg-blue-600 rounded"></div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="h-8 bg-blue-100 rounded"></div>
                          <div className="h-8 bg-indigo-100 rounded"></div>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-2 border border-blue-200">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-600 rounded"></div>
                          <div className="flex-1">
                            <div className="h-1.5 bg-gray-400 rounded w-full mb-1"></div>
                            <div className="h-1 bg-gray-300 rounded w-2/3"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  
                  {pkg.theme === "soft-ui" && (
                    <div className="h-full bg-gradient-to-br from-rose-50 to-pink-50 p-4">
                      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-4 shadow-lg mb-2 border border-rose-200/50">
                        <h4 className="font-bold text-gray-800 text-sm mb-2">Soft UI</h4>
                        <div className="space-y-2">
                          <div className="bg-gradient-to-r from-rose-100 to-pink-100 rounded-2xl p-2">
                            <div className="h-1.5 bg-rose-400/50 rounded-full w-3/4"></div>
                          </div>
                          <div className="bg-gradient-to-r from-pink-100 to-rose-100 rounded-2xl p-2">
                            <div className="h-1.5 bg-pink-400/50 rounded-full w-2/3"></div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 border border-rose-200/50">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-rose-300 to-pink-300 rounded-2xl"></div>
                          <div className="flex-1">
                            <div className="h-1.5 bg-rose-300/50 rounded-full w-full mb-1"></div>
                            <div className="h-1 bg-pink-300/50 rounded-full w-1/2"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {pkg.theme === "editorial" && (
                    <div className="h-full bg-[#faf7f2] p-5">
                      <div className="mb-3">
                        <div className="text-lg text-neutral-900" style={{ fontFamily: 'ui-serif, Georgia, serif' }}>Editorial</div>
                        <div className="text-[10px] italic text-neutral-500 mt-0.5">bir dergi hissi</div>
                      </div>
                      <div className="bg-white rounded-xl border border-neutral-200/70 shadow-sm p-3 mb-2 flex gap-3">
                        <div className="w-14 h-14 bg-gradient-to-br from-neutral-200 to-neutral-300 rounded-lg"></div>
                        <div className="flex-1">
                          <div className="text-sm text-neutral-900 mb-1" style={{ fontFamily: 'ui-serif, Georgia, serif' }}>Signature Dish</div>
                          <div className="h-1 bg-neutral-200 rounded w-3/4 mb-1"></div>
                          <div className="h-1 bg-neutral-200 rounded w-1/2"></div>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-neutral-900 text-white text-[10px] font-bold flex items-center justify-center">₺85</div>
                      </div>
                      <div className="bg-white rounded-xl border border-neutral-200/70 shadow-sm p-3 flex gap-3">
                        <div className="w-14 h-14 bg-gradient-to-br from-neutral-200 to-neutral-300 rounded-lg"></div>
                        <div className="flex-1">
                          <div className="text-sm text-neutral-900" style={{ fontFamily: 'ui-serif, Georgia, serif' }}>Chef Pick</div>
                          <div className="h-1 bg-neutral-200 rounded w-2/3 mt-1"></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {pkg.theme === "night-luxe" && (
                    <div className="h-full bg-[#0d0d0f] p-5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#d4a574]/10 blur-2xl"></div>
                      <div className="relative">
                        <div className="mb-3">
                          <div className="text-lg text-white" style={{ fontFamily: 'ui-serif, Georgia, serif' }}>Night Luxe</div>
                          <div className="text-[10px] text-neutral-500 mt-0.5">bakır aksanla premium</div>
                        </div>
                        <div className="bg-neutral-900/70 backdrop-blur-md rounded-xl border border-white/[0.06] shadow-2xl p-3 mb-2 flex gap-3">
                          <div className="w-14 h-14 bg-gradient-to-br from-neutral-800 to-neutral-700 rounded-lg"></div>
                          <div className="flex-1">
                            <div className="text-sm text-white mb-1" style={{ fontFamily: 'ui-serif, Georgia, serif' }}>Dry-Aged Ribeye</div>
                            <div className="h-1 bg-white/10 rounded w-3/4 mb-1"></div>
                            <div className="h-1 bg-white/10 rounded w-1/2"></div>
                          </div>
                          <div className="w-9 h-9 rounded-full bg-[#d4a574] text-neutral-950 text-[10px] font-bold flex items-center justify-center">₺620</div>
                        </div>
                        <div className="bg-neutral-900/70 backdrop-blur-md rounded-xl border border-white/[0.06] p-3 flex items-center gap-2">
                          <div className="h-1 bg-[#d4a574]/60 rounded w-1/3"></div>
                          <div className="ml-auto text-[9px] font-semibold text-[#d4a574] uppercase tracking-wider">Wine List</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {pkg.theme === "bento" && (
                    <div className="h-full bg-[#f5f5f7] p-4">
                      <div className="grid grid-cols-2 gap-3 h-full">
                        <div className="bg-white rounded-3xl border border-neutral-200/60 p-3 shadow-sm">
                          <div className="w-full h-14 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl mb-2"></div>
                          <div className="text-[10px] font-bold text-neutral-900">Bento Bowl</div>
                          <div className="h-1 bg-neutral-200 rounded w-1/2 mt-1"></div>
                        </div>
                        <div className="flex flex-col gap-3">
                          <div className="bg-white rounded-3xl border border-neutral-200/60 p-3 shadow-sm flex-1">
                            <div className="text-[10px] font-bold text-neutral-900">Miso</div>
                            <div className="mt-1 text-[9px] font-mono text-neutral-500">₺42</div>
                          </div>
                          <div className="bg-white rounded-3xl border border-neutral-200/60 p-3 shadow-sm flex-1">
                            <div className="w-8 h-8 rounded-2xl bg-neutral-900 flex items-center justify-center text-white text-[10px] font-bold">+</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {pkg.theme === "warm-cafe" && (
                    <div className="h-full bg-[#fefdf9] p-5">
                      <div className="mb-3">
                        <div className="text-sm font-bold text-[#2d3a2e]">Café Menu</div>
                        <div className="w-8 h-0.5 bg-[#4a7c59] mt-1"></div>
                      </div>
                      <div className="bg-white rounded-2xl border border-[#4a7c59]/15 shadow-sm p-3 mb-2 flex gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#4a7c59]/20 to-[#4a7c59]/40 rounded-xl"></div>
                        <div className="flex-1">
                          <div className="text-[11px] font-semibold text-[#2d3a2e]">Flat White</div>
                          <div className="h-1 bg-[#4a7c59]/20 rounded w-2/3 mt-1"></div>
                        </div>
                        <div className="text-[10px] font-bold text-[#4a7c59]">₺55</div>
                      </div>
                      <div className="bg-white rounded-2xl border border-[#4a7c59]/15 shadow-sm p-3 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#4a7c59] text-white text-[9px] font-bold flex items-center justify-center">+</div>
                        <div className="h-1 bg-[#4a7c59]/20 rounded w-1/2"></div>
                      </div>
                    </div>
                  )}

                  {pkg.theme === "neo-retro" && (
                    <div className="h-full bg-[#f4ede3] p-4">
                      <div className="text-xs font-black text-black mb-3 uppercase tracking-wider">Neo Retro</div>
                      <div className="bg-white border-2 border-black rounded-none shadow-[4px_4px_0_0_#000] p-3 mb-3 flex gap-2">
                        <div className="w-12 h-12 border-2 border-black bg-gradient-to-br from-[#ff3d7f] to-[#ff5591]"></div>
                        <div className="flex-1">
                          <div className="text-[11px] font-black text-black">DOUBLE CHEESE</div>
                          <div className="h-1 bg-black w-2/3 mt-1"></div>
                          <div className="mt-1 text-[10px] font-black text-[#ff3d7f]">₺185</div>
                        </div>
                      </div>
                      <div className="inline-block bg-[#ff3d7f] text-white text-[9px] font-black px-2 py-1 border-2 border-black shadow-[2px_2px_0_0_#000]">+ SEPETE</div>
                    </div>
                  )}

                  {pkg.theme === "glass" && (
                    <div className="h-full bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-4 relative overflow-hidden">
                      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-purple-300/40 blur-xl"></div>
                      <div className="relative">
                        <div className="text-xs font-bold text-neutral-900 mb-3">Glass Menu</div>
                        <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl shadow-xl p-3 mb-2 flex gap-2">
                          <div className="w-11 h-11 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl"></div>
                          <div className="flex-1">
                            <div className="text-[11px] font-semibold text-neutral-900">Aurora Latte</div>
                            <div className="h-1 bg-white/60 rounded w-2/3 mt-1"></div>
                          </div>
                          <div className="text-[10px] font-bold text-neutral-900">₺68</div>
                        </div>
                        <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl p-2 text-center text-[9px] font-semibold bg-gradient-to-r from-indigo-500/80 to-purple-500/80 text-white">+ Ekle</div>
                      </div>
                    </div>
                  )}

                  {pkg.theme === "ultra-plus" && (
                    <div className="h-full bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 p-4">
                      <div className="bg-gradient-to-br from-violet-500/30 to-purple-500/30 backdrop-blur-md rounded-2xl p-3 border border-violet-400/30 mb-2 shadow-2xl">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-black text-white text-sm">Ultra+</h4>
                          <div className="flex gap-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-1.5 bg-violet-400/40 rounded-full w-full"></div>
                          <div className="h-1.5 bg-purple-400/30 rounded-full w-3/4"></div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-xl p-2 border border-violet-400/20">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-violet-400 to-purple-400 rounded-xl shadow-lg"></div>
                          <div className="flex-1">
                            <div className="h-1.5 bg-violet-400/50 rounded-full w-2/3 mb-1"></div>
                            <div className="h-1 bg-purple-400/40 rounded-full w-1/3"></div>
                          </div>
                          <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-amber-400 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-xl">
                      <Eye className="w-6 h-6 text-gray-900" />
                    </div>
                  </div>
                </div>

                {/* Package Info */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">{pkg.name}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{pkg.description}</p>
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    {pkg.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="pt-4 flex gap-2">
                    <Link
                      href={`/menu/demo-restoran?theme=${pkg.theme}`}
                      target="_blank"
                      className="flex-1 premium-btn-secondary text-sm py-2.5 inline-flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Önizle
                    </Link>
                    <Link
                      href={`/restaurant/register?theme=${pkg.theme}`}
                      className="flex-1 premium-btn-primary text-sm py-2.5 inline-flex items-center justify-center gap-2"
                    >
                      Seç
                      <ArrowLeft className="w-4 h-4 rotate-180" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="premium-section relative">
        <div className="premium-container">
          <div className="max-w-4xl mx-auto">
            <div className="premium-card p-12 md:p-16 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent)]"></div>
              
              <div className="relative z-10 animate-premium-fade-in">
                <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Tasarımınızı Seçin</h2>
                <p className="text-xl text-gray-300 mb-10 font-medium max-w-2xl mx-auto">
                  Restoranınıza en uygun menü tasarımını seçin ve <span className="text-green-400 font-bold">hemen başlayın</span>.
                </p>
                <Link
                  href="/restaurant/register"
                  className="premium-btn-primary inline-flex items-center gap-3 group text-lg px-10 py-5"
                >
                  Ücretsiz Başla
                  <ArrowLeft className="w-6 h-6 rotate-180 group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 premium-glass">
        <div className="premium-container">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-black text-gray-900">Rivo QR</span>
            </div>
            <p className="text-gray-600 font-medium">
              © 2026 Rivo QR. Tüm hakları saklıdır.
            </p>
            <p className="text-gray-600 font-medium mt-2">
              Developed By{" "}
              <a
                href="https://softwareoffuture.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 underline font-semibold"
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
