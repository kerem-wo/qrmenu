import Link from "next/link";
import { QrCode, Smartphone, Clock, TrendingUp, Sparkles, Zap, Shield, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen premium-bg-gradient">
      {/* Premium Header */}
      <header className="premium-glass sticky top-0 z-50 border-b border-gray-200/50">
        <div className="premium-container">
          <div className="flex items-center justify-between py-5">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg premium-shadow-md">
                  <QrCode className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-premium-glow"></div>
              </div>
              <div>
                <span className="text-2xl font-black text-gray-900 tracking-tight">QR Menü</span>
                <p className="text-xs text-gray-500 font-medium">Premium</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/restaurant/register"
                className="text-gray-700 hover:text-gray-900 font-semibold transition-colors text-sm"
              >
                Kayıt Ol
              </Link>
              <Link
                href="/admin/login"
                className="premium-btn-secondary text-sm px-6 py-2.5"
              >
                Giriş Yap
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Premium Hero Section */}
      <section className="premium-section relative">
        <div className="premium-container">
          <div className="max-w-5xl mx-auto text-center animate-premium-fade-in">
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-2 premium-badge mb-8 animate-premium-scale-in">
              <Sparkles className="w-4 h-4" />
              <span>2026 Premium Paket</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="premium-heading-1 mb-8 animate-premium-fade-in" style={{ animationDelay: '0.1s' }}>
              Dijital Menü Çözümü
              <br />
              <span className="premium-text-gradient">Geleceğin Teknolojisi</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed font-medium animate-premium-fade-in" style={{ animationDelay: '0.2s' }}>
              Restoranınız için <span className="font-bold text-gray-900">modern, hızlı ve kullanıcı dostu</span> QR kod menü sistemi. 
              Müşterileriniz telefonlarıyla menünüze <span className="font-bold text-green-600">anında erişsin</span>.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-premium-fade-in" style={{ animationDelay: '0.3s' }}>
              <Link
                href="/restaurant/register"
                className="premium-btn-primary inline-flex items-center gap-2 group"
              >
                Ücretsiz Başla
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/admin/login"
                className="premium-btn-secondary inline-flex items-center"
              >
                Giriş Yap
              </Link>
              <Link
                href="/menu/demo-restoran"
                className="premium-btn-secondary inline-flex items-center gap-2 group"
              >
                Demo Menü
                <Zap className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500 animate-premium-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="font-semibold">Güvenli</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                <span className="font-semibold">Hızlı Kurulum</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span className="font-semibold">Premium Tasarım</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Features Section */}
      <section className="premium-section relative">
        <div className="premium-container">
          <div className="text-center mb-20 animate-premium-fade-in">
            <h2 className="premium-heading-2 mb-6">Neden QR Menü?</h2>
            <p className="text-xl text-gray-600 font-medium">Modern restoranların tercihi</p>
          </div>

          <div className="premium-grid premium-grid-3">
            <div className="premium-card p-10 text-center premium-hover-lift group animate-premium-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="relative inline-flex items-center justify-center mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-xl">
                  <Smartphone className="w-10 h-10 text-white" />
                </div>
              </div>
              <h3 className="premium-heading-3 mb-4">Mobil Uyumlu</h3>
              <p className="text-gray-600 leading-relaxed">
                Tüm cihazlarda mükemmel görünüm. Müşterileriniz telefonlarıyla kolayca sipariş verebilir.
              </p>
            </div>

            <div className="premium-card p-10 text-center premium-hover-lift group animate-premium-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="relative inline-flex items-center justify-center mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-purple-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl">
                  <Clock className="w-10 h-10 text-white" />
                </div>
              </div>
              <h3 className="premium-heading-3 mb-4">Hızlı Kurulum</h3>
              <p className="text-gray-600 leading-relaxed">
                Dakikalar içinde menünüzü oluşturun ve QR kodunuzu alın. 
                Teknik bilgi gerektirmez.
              </p>
            </div>

            <div className="premium-card p-10 text-center premium-hover-lift group animate-premium-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="relative inline-flex items-center justify-center mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl flex items-center justify-center shadow-xl">
                  <TrendingUp className="w-10 h-10 text-white" />
                </div>
              </div>
              <h3 className="premium-heading-3 mb-4">Kolay Yönetim</h3>
              <p className="text-gray-600 leading-relaxed">
                Ürünlerinizi kolayca ekleyin, düzenleyin veya kaldırın. 
                Anlık güncellemeler müşterilerinize anında yansır.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Premium CTA Section */}
      <section className="premium-section relative">
        <div className="premium-container">
          <div className="max-w-4xl mx-auto">
            <div className="premium-card p-12 md:p-16 text-center relative overflow-hidden">
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent)]"></div>
              
              <div className="relative z-10 animate-premium-fade-in">
                <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Hemen Başlayın</h2>
                <p className="text-xl text-gray-300 mb-10 font-medium max-w-2xl mx-auto">
                  Restoranınız için dijital menü oluşturun ve müşterilerinize <span className="text-green-400 font-bold">modern bir deneyim</span> sunun.
                </p>
                <Link
                  href="/restaurant/register"
                  className="premium-btn-primary inline-flex items-center gap-3 group text-lg px-10 py-5"
                >
                  Ücretsiz Başla
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="border-t border-gray-200 py-12 premium-glass">
        <div className="premium-container">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-black text-gray-900">QR Menü Premium</span>
            </div>
            <p className="text-gray-600 font-medium">© 2026 QR Menü Sistemi. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
