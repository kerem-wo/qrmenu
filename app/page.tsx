"use client";

import Link from "next/link";
import Image from "next/image";
import { QrCode, Smartphone, Zap, Globe, ArrowRight, Check, Menu, Phone, Cloud, Clock } from "lucide-react";
import { useEffect, useState } from "react";

// Tüm menü temaları
const themes = ["default", "premium", "paper", "paper-image", "swipe", "premium-plus", "pro", "soft-ui", "ultra-plus"];

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Tema değişimi için interval
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTheme((prev) => (prev + 1) % themes.length);
    }, 5000); // 5 saniye

    return () => clearInterval(interval);
  }, []);

  // Gerçek restoran logoları (placeholder yerine gerçek logo URL'leri)
  const restaurantLogos = [
    "https://logo.clearbit.com/mcdonalds.com",
    "https://logo.clearbit.com/starbucks.com",
    "https://logo.clearbit.com/burgerking.com",
    "https://logo.clearbit.com/kfc.com",
    "https://logo.clearbit.com/pizzahut.com",
    "https://logo.clearbit.com/dominos.com",
    "https://logo.clearbit.com/subway.com",
    "https://logo.clearbit.com/tacobell.com",
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top Navigation - Glassmorphism */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/50 shadow-2xl" 
          : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Rivo QR"
                width={40}
                height={40}
                className="h-10 w-auto"
              />
              <span className="text-xl font-bold text-white">Rivo QR</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                Özellikler
              </Link>
              <Link href="/menu/demo-restoran" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                Demo Menü
              </Link>
              <Link href="#contact" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                İletişim
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <Link
                href="/admin/login"
                className="hidden md:block text-sm font-medium text-gray-300 hover:text-white transition-colors px-4 py-2 border border-gray-700 rounded-xl hover:border-gray-600"
              >
                Giriş Yap
              </Link>
              <Link
                href="/restaurant/register"
                className="bg-[#FF6F00] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#FF8F33] transition-all shadow-lg shadow-[#FF6F00]/20 hover:shadow-xl hover:shadow-[#FF6F00]/30 transform hover:-translate-y-0.5"
              >
                Ücretsiz Başla
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 lg:pt-48 lg:pb-40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,111,0,0.15),transparent_70%)]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-8 leading-tight tracking-tight">
                Yeni Nesil
                <br />
                <span className="bg-gradient-to-r from-[#FF6F00] to-[#FF8F33] bg-clip-text text-transparent">
                  Dijital QR Menü
                </span>
                <br />
                Deneyimi
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed max-w-2xl">
                Menülerinizi gerçek zamanlı yönetin, QR kod ile müşterilerinize hızlı, temassız ve modern bir deneyim sunun.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/restaurant/register"
                  className="bg-[#FF6F00] text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-[#FF8F33] transition-all shadow-xl shadow-[#FF6F00]/30 hover:shadow-2xl hover:shadow-[#FF6F00]/40 transform hover:-translate-y-1 inline-flex items-center justify-center gap-2"
                >
                  Ücretsiz Başla
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/menu/demo-restoran"
                  className="bg-white/10 backdrop-blur-sm text-white border border-white/20 px-8 py-4 rounded-xl text-base font-semibold hover:bg-white/20 transition-all inline-flex items-center justify-center gap-2"
                >
                  Demo Menüyü Gör
                </Link>
              </div>
            </div>
            <div className="relative lg:block hidden">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF6F00]/30 to-transparent rounded-[2rem] blur-3xl transform rotate-6 animate-pulse"></div>
                {/* iPad Mockup - Portrait (Dikey) */}
                <div className="relative bg-gray-900 rounded-[2rem] p-3 shadow-2xl border border-gray-800" style={{ width: '480px', height: '640px' }}>
                  {/* iPad Home Indicator */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-700 rounded-full"></div>
                  {/* iPad Screen */}
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-[1.5rem] overflow-hidden w-full h-full border border-gray-700 relative">
                    {/* Gerçek Demo Menü - iframe - Tablet'e uygun - Tema değişimi */}
                    <iframe
                      key={themes[currentTheme]}
                      src={`/menu/demo-restoran?theme=${themes[currentTheme]}`}
                      className="absolute inset-0 border-0 transition-opacity duration-500"
                      style={{ 
                        width: '100%',
                        height: '100%',
                        transform: 'scale(1)',
                        transformOrigin: 'top left',
                        pointerEvents: 'none',
                        zoom: '0.75'
                      }}
                      title="Demo Menu"
                      scrolling="no"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reference Logo Section - Scrolling Banner */}
      <section className="py-16 bg-gray-900/50 border-y border-gray-800/50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-gray-300 mb-12">
            Dijital dönüşümünü bizimle yapan işletmeler
          </h2>
          <div className="relative">
            <div className="flex gap-8 animate-marquee whitespace-nowrap">
              {/* İlk set */}
              {restaurantLogos.map((logo, index) => (
                <div
                  key={`first-${index}`}
                  className="flex-shrink-0 w-32 h-16 bg-white rounded-xl flex items-center justify-center border border-gray-700/50 hover:border-[#FF6F00]/50 transition-all group"
                >
                  <img
                    src={logo}
                    alt={`Restaurant ${index + 1}`}
                    className="h-10 w-auto opacity-60 group-hover:opacity-100 transition-opacity max-w-full"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      if (target.parentElement) {
                        target.parentElement.innerHTML = '<span class="text-gray-500 text-xs font-medium">Logo</span>';
                      }
                    }}
                  />
                </div>
              ))}
              {/* İkinci set (sonsuz döngü için) */}
              {restaurantLogos.map((logo, index) => (
                <div
                  key={`second-${index}`}
                  className="flex-shrink-0 w-32 h-16 bg-white rounded-xl flex items-center justify-center border border-gray-700/50 hover:border-[#FF6F00]/50 transition-all group"
                >
                  <img
                    src={logo}
                    alt={`Restaurant ${index + 1}`}
                    className="h-10 w-auto opacity-60 group-hover:opacity-100 transition-opacity max-w-full"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      if (target.parentElement) {
                        target.parentElement.innerHTML = '<span class="text-gray-500 text-xs font-medium">Logo</span>';
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Advanced Blocks */}
      <section id="features" className="py-24 md:py-32 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Güçlü Özellikler
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Enterprise seviyesinde özellikler, modern teknoloji
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Gerçek Zamanlı Menü Yönetimi */}
            <div className="group bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800/50 hover:border-[#FF6F00]/50 hover:shadow-xl hover:shadow-[#FF6F00]/10 transition-all">
              <div className="w-14 h-14 bg-[#FF6F00]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#FF6F00]/20 transition-colors border border-[#FF6F00]/20">
                <Clock className="w-7 h-7 text-[#FF6F00]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Gerçek Zamanlı Menü Yönetimi</h3>
              <p className="text-gray-400 leading-relaxed">
                Değişiklikleriniz anında yayına alınır. Fiyat, stok ve ürün güncellemeleri saniyeler içinde müşterilerinize ulaşır.
              </p>
            </div>

            {/* Anında QR Kod Güncelleme */}
            <div className="group bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800/50 hover:border-[#FF6F00]/50 hover:shadow-xl hover:shadow-[#FF6F00]/10 transition-all">
              <div className="w-14 h-14 bg-[#FF6F00]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#FF6F00]/20 transition-colors border border-[#FF6F00]/20">
                <QrCode className="w-7 h-7 text-[#FF6F00]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Anında QR Kod Güncelleme</h3>
              <p className="text-gray-400 leading-relaxed">
                QR kodunuz değişmez, menü içeriğiniz güncellenir. Tek bir QR kod ile sınırsız güncelleme yapabilirsiniz.
              </p>
            </div>

            {/* Çoklu Dil ve Kategori Desteği */}
            <div className="group bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800/50 hover:border-[#FF6F00]/50 hover:shadow-xl hover:shadow-[#FF6F00]/10 transition-all">
              <div className="w-14 h-14 bg-[#FF6F00]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#FF6F00]/20 transition-colors border border-[#FF6F00]/20">
                <Globe className="w-7 h-7 text-[#FF6F00]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Çoklu Dil ve Kategori Desteği</h3>
              <p className="text-gray-400 leading-relaxed">
                Sınırsız dil ve kategori desteği. Uluslararası müşterilerinize kendi dillerinde menü sunun.
              </p>
            </div>

            {/* Mobil, Tablet ve Tüm Cihazlarla Uyum */}
            <div className="group bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800/50 hover:border-[#FF6F00]/50 hover:shadow-xl hover:shadow-[#FF6F00]/10 transition-all">
              <div className="w-14 h-14 bg-[#FF6F00]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#FF6F00]/20 transition-colors border border-[#FF6F00]/20">
                <Smartphone className="w-7 h-7 text-[#FF6F00]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Mobil, Tablet ve Tüm Cihazlarla Uyum</h3>
              <p className="text-gray-400 leading-relaxed">
                Responsive tasarım ile her cihazda mükemmel deneyim. iOS, Android, tablet ve masaüstünde aynı kalite.
              </p>
            </div>

            {/* Garson Çağırma & Hızlı İletişim */}
            <div className="group bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800/50 hover:border-[#FF6F00]/50 hover:shadow-xl hover:shadow-[#FF6F00]/10 transition-all">
              <div className="w-14 h-14 bg-[#FF6F00]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#FF6F00]/20 transition-colors border border-[#FF6F00]/20">
                <Phone className="w-7 h-7 text-[#FF6F00]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Garson Çağırma & Hızlı İletişim</h3>
              <p className="text-gray-400 leading-relaxed">
                Müşterileriniz masadan direkt garson çağırabilir, hesap isteyebilir. Anında bildirim alın, hızlı yanıt verin.
              </p>
            </div>

            {/* Bulut Tabanlı Altyapı */}
            <div className="group bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800/50 hover:border-[#FF6F00]/50 hover:shadow-xl hover:shadow-[#FF6F00]/10 transition-all">
              <div className="w-14 h-14 bg-[#FF6F00]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#FF6F00]/20 transition-colors border border-[#FF6F00]/20">
                <Cloud className="w-7 h-7 text-[#FF6F00]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Bulut Tabanlı Altyapı</h3>
              <p className="text-gray-400 leading-relaxed">
                Yüksek performanslı bulut altyapısı. 99.9% uptime garantisi ile kesintisiz hizmet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Timeline */}
      <section className="py-24 md:py-32 bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Nasıl Çalışır?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Üç basit adımda dijital menünüze kavuşun
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto relative">
            {/* Timeline Line */}
            <div className="hidden md:block absolute top-20 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FF6F00]/50 via-[#FF6F00]/30 to-transparent"></div>

            {/* Step 1 */}
            <div className="relative text-center">
              <div className="w-20 h-20 bg-[#FF6F00] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[#FF6F00]/30 relative z-10">
                <span className="text-3xl font-black text-white">1</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Menünü Oluştur</h3>
              <p className="text-gray-400 leading-relaxed">
                Ürünlerinizi, kategorilerinizi ve fiyatlarınızı kolayca ekleyin. Görseller yükleyin ve menünüzü özelleştirin.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative text-center">
              <div className="w-20 h-20 bg-[#FF6F00] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[#FF6F00]/30 relative z-10">
                <span className="text-3xl font-black text-white">2</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">QR Kodunu Paylaş</h3>
              <p className="text-gray-400 leading-relaxed">
                Benzersiz QR kodunuzu alın. Masalara yerleştirin veya dijital ekranlarda gösterin. Müşteriler anında erişir.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative text-center">
              <div className="w-20 h-20 bg-[#FF6F00] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[#FF6F00]/30 relative z-10">
                <span className="text-3xl font-black text-white">3</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Anında Yayına Al</h3>
              <p className="text-gray-400 leading-relaxed">
                Fiyat değişiklikleri, yeni ürünler veya stok durumları. Tüm güncellemeler anında menüye yansır.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="py-24 md:py-32 bg-gradient-to-br from-[#FF6F00]/10 via-[#FF6F00]/5 to-transparent border-y border-[#FF6F00]/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Dijital Menünüzü Bugün Oluşturun
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Ücretsiz başlayın, dakikalar içinde menünüzü yayına alın.
          </p>
          <Link
            href="/restaurant/register"
            className="inline-flex items-center gap-2 bg-[#FF6F00] text-white px-10 py-5 rounded-xl text-lg font-semibold hover:bg-[#FF8F33] transition-all shadow-2xl shadow-[#FF6F00]/40 hover:shadow-[#FF6F00]/50 transform hover:-translate-y-1"
          >
            Ücretsiz Başla
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>

      {/* Footer - Ultra Minimal */}
      <footer id="contact" className="border-t border-gray-800/50 py-12 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image
                  src="/logo.png"
                  alt="Rivo QR"
                  width={32}
                  height={32}
                  className="h-8 w-auto"
                />
                <span className="text-lg font-bold text-white">Rivo QR</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Profesyonel dijital QR menü çözümü.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-4">Ürün</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="#features" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                    Özellikler
                  </Link>
                </li>
                <li>
                  <Link href="/menu/demo-restoran" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                    Demo Menü
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-4">Şirket</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/gizlilik-politikasi" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                    Gizlilik Politikası
                  </Link>
                </li>
                <li>
                  <Link href="/kvkk" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                    Kullanım Şartları
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-4">Destek</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="https://softwareoffuture.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    İletişim
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800/50">
            <p className="text-xs text-gray-600 text-center">
              © 2026 Rivo QR. Tüm hakları saklıdır.{" "}
              <span className="text-gray-700">Developed by{" "}
                <a
                  href="https://softwareoffuture.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#FF6F00] hover:text-[#FF8F33] font-semibold"
                >
                  Software Of Future
                </a>
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
