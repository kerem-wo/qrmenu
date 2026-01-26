import Link from "next/link";
import Image from "next/image";
import { QrCode, Smartphone, Zap, Globe, ArrowRight, Check, Sparkles, Menu, Phone, TrendingUp, Shield, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation - Sticky */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Rivo QR"
                width={36}
                height={36}
                className="h-9 w-auto"
              />
              <span className="text-lg font-bold text-gray-900">Rivo QR</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                Özellikler
              </Link>
              <Link href="#pricing" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                Paketler
              </Link>
              <Link href="/menu/demo-restoran" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                Demo Menü
              </Link>
              <Link href="#contact" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                İletişim
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <Link
                href="/admin/login"
                className="hidden md:block text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors px-4 py-2 border border-gray-200 rounded-xl hover:border-gray-300"
              >
                Giriş Yap
              </Link>
              <Link
                href="/restaurant/register"
                className="bg-[#FF6F00] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#E55F00] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Ücretsiz Başla
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 md:py-32 lg:py-40 bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,111,0,0.08),transparent_50%)]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-6 leading-tight tracking-tight">
                Restoranınız İçin
                <br />
                <span className="text-[#FF6F00]">Profesyonel Dijital QR Menü</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed max-w-2xl">
                Menülerinizi saniyeler içinde yönetin, QR kod ile müşterilerinize modern ve temassız bir deneyim sunun.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/restaurant/register"
                  className="bg-[#FF6F00] text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-[#E55F00] transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 inline-flex items-center justify-center gap-2"
                >
                  Ücretsiz Başla
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/menu/demo-restoran"
                  className="bg-white text-gray-900 border-2 border-gray-200 px-8 py-4 rounded-xl text-base font-semibold hover:border-gray-300 transition-all inline-flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                >
                  Demo Menüyü İncele
                </Link>
              </div>
            </div>
            <div className="relative lg:block hidden">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF6F00]/20 to-transparent rounded-3xl blur-3xl transform rotate-6"></div>
                <div className="relative bg-gray-900 rounded-[2.5rem] p-3 shadow-2xl">
                  <div className="bg-white rounded-[2rem] overflow-hidden aspect-[9/19]">
                    <div className="h-full bg-gradient-to-br from-gray-50 to-white p-4 overflow-y-auto">
                      <div className="space-y-4">
                        <div className="h-40 bg-gradient-to-br from-[#FF6F00]/10 to-[#FF6F00]/5 rounded-2xl flex items-center justify-center">
                          <QrCode className="w-16 h-16 text-[#FF6F00]/30" />
                        </div>
                        <div className="space-y-3">
                          <div className="h-6 bg-gray-200 rounded-lg w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded-lg w-1/2"></div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="h-32 bg-gray-100 rounded-xl"></div>
                          <div className="h-32 bg-gray-100 rounded-xl"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded-lg w-full"></div>
                          <div className="h-4 bg-gray-200 rounded-lg w-2/3"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Güçlü Özellikler
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Restoranınızı dijitalleştirmek için ihtiyacınız olan her şey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Mobil Uyumlu Menü Deneyimi */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-[#FF6F00]/30 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 bg-[#FF6F00]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#FF6F00]/20 transition-colors">
                <Smartphone className="w-7 h-7 text-[#FF6F00]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Mobil Uyumlu Menü Deneyimi</h3>
              <p className="text-gray-600 leading-relaxed">
                Tüm cihazlarda mükemmel görünüm. Müşterileriniz telefonlarıyla kolayca menünüze erişir ve sipariş verir.
              </p>
            </div>

            {/* Anında QR Kod Oluşturma */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-[#FF6F00]/30 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 bg-[#FF6F00]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#FF6F00]/20 transition-colors">
                <QrCode className="w-7 h-7 text-[#FF6F00]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Anında QR Kod Oluşturma</h3>
              <p className="text-gray-600 leading-relaxed">
                Benzersiz QR kodunuzu saniyeler içinde oluşturun. Yazdırın veya dijital ekranlarda gösterin.
              </p>
            </div>

            {/* Kolay Menü ve Fiyat Güncelleme */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-[#FF6F00]/30 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 bg-[#FF6F00]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#FF6F00]/20 transition-colors">
                <Zap className="w-7 h-7 text-[#FF6F00]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Kolay Menü ve Fiyat Güncelleme</h3>
              <p className="text-gray-600 leading-relaxed">
                Fiyatları, ürünleri ve açıklamaları anında güncelleyin. Değişiklikler müşterilerinize hemen yansır.
              </p>
            </div>

            {/* Çoklu Dil Desteği */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-[#FF6F00]/30 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 bg-[#FF6F00]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#FF6F00]/20 transition-colors">
                <Globe className="w-7 h-7 text-[#FF6F00]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Çoklu Dil Desteği</h3>
              <p className="text-gray-600 leading-relaxed">
                Uluslararası müşterilerinize hizmet verin. Otomatik çeviri ve çoklu dil menü desteği.
              </p>
            </div>

            {/* Kategori & Ürün Yönetimi */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-[#FF6F00]/30 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 bg-[#FF6F00]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#FF6F00]/20 transition-colors">
                <Menu className="w-7 h-7 text-[#FF6F00]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Kategori & Ürün Yönetimi</h3>
              <p className="text-gray-600 leading-relaxed">
                Sınırsız kategori ve ürün ekleyin. Görseller, açıklamalar ve fiyatları kolayca yönetin.
              </p>
            </div>

            {/* Garson Çağırma ve İletişim */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-[#FF6F00]/30 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 bg-[#FF6F00]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#FF6F00]/20 transition-colors">
                <Phone className="w-7 h-7 text-[#FF6F00]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Garson Çağırma ve İletişim</h3>
              <p className="text-gray-600 leading-relaxed">
                Müşterileriniz masadan direkt garson çağırabilir veya hesap isteyebilir. Anında bildirim alın.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 md:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Nasıl Çalışır?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Üç basit adımda dijital menünüze kavuşun
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-[#FF6F00] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl font-black text-white">1</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Menünü Oluştur</h3>
              <p className="text-gray-600 leading-relaxed">
                Ürünlerinizi, kategorilerinizi ve fiyatlarınızı kolayca ekleyin. Görseller yükleyin ve menünüzü özelleştirin.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-[#FF6F00] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl font-black text-white">2</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">QR Kodunu Paylaş</h3>
              <p className="text-gray-600 leading-relaxed">
                Benzersiz QR kodunuzu alın. Masalara yerleştirin veya dijital ekranlarda gösterin. Müşteriler anında erişir.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-[#FF6F00] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl font-black text-white">3</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Anında Güncelle</h3>
              <p className="text-gray-600 leading-relaxed">
                Fiyat değişiklikleri, yeni ürünler veya stok durumları. Tüm güncellemeler anında menüye yansır.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Paketler
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              İşletmenizin ihtiyacına uygun planı seçin
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Başlangıç */}
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-100 hover:border-gray-200 transition-all">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Başlangıç</h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl font-black text-gray-900">Ücretsiz</span>
                </div>
                <p className="text-gray-600">Küçük işletmeler için</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-[#FF6F00] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">50 ürüne kadar</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-[#FF6F00] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">QR kod oluşturma</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-[#FF6F00] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Temel analitik</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-[#FF6F00] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">E-posta desteği</span>
                </li>
              </ul>
              <Link
                href="/restaurant/register"
                className="block w-full bg-gray-100 text-gray-900 text-center py-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Hemen Başla
              </Link>
            </div>

            {/* Profesyonel - Featured */}
            <div className="bg-white rounded-2xl p-8 border-2 border-[#FF6F00] hover:shadow-2xl transition-all relative scale-105">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                <span className="bg-[#FF6F00] text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                  Öne Çıkan
                </span>
              </div>
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Profesyonel</h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl font-black text-gray-900">₺99</span>
                  <span className="text-gray-600">/ay</span>
                </div>
                <p className="text-gray-600">Büyüyen restoranlar için</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-[#FF6F00] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Sınırsız ürün</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-[#FF6F00] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Gelişmiş analitik</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-[#FF6F00] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Çoklu dil desteği</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-[#FF6F00] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Öncelikli destek</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-[#FF6F00] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Garson çağırma özelliği</span>
                </li>
              </ul>
              <Link
                href="/restaurant/register"
                className="block w-full bg-[#FF6F00] text-white text-center py-4 rounded-xl font-semibold hover:bg-[#E55F00] transition-colors shadow-xl"
              >
                Hemen Başla
              </Link>
            </div>

            {/* Kurumsal */}
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-100 hover:border-gray-200 transition-all">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Kurumsal</h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl font-black text-gray-900">₺299</span>
                  <span className="text-gray-600">/ay</span>
                </div>
                <p className="text-gray-600">Zincir işletmeler için</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-[#FF6F00] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Profesyonel'in tümü</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-[#FF6F00] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Çoklu lokasyon</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-[#FF6F00] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Özel markalama</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-[#FF6F00] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">API erişimi</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-[#FF6F00] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Özel destek</span>
                </li>
              </ul>
              <Link
                href="/restaurant/register"
                className="block w-full bg-gray-100 text-gray-900 text-center py-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Hemen Başla
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Social Proof */}
      <section className="py-24 md:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Yüzlerce işletme tarafından güveniliyor
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Restoranlar, kafeler ve zincir işletmeler Rivo QR ile dijitalleşiyor
            </p>
          </div>

          {/* Logo Placeholder Area */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 opacity-40">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-xl flex items-center justify-center">
                <span className="text-gray-400 text-sm font-medium">Logo</span>
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Sparkles key={i} className="w-5 h-5 fill-[#FF6F00] text-[#FF6F00]" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "Rivo QR sayesinde menü yönetimimiz çok kolaylaştı. Müşterilerimiz QR kod okutarak anında menüye erişiyor ve siparişlerini hızlıca veriyorlar."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#FF6F00] rounded-full flex items-center justify-center text-white font-bold">
                  MA
                </div>
                <div>
                  <p className="font-bold text-gray-900">Mehmet Aydın</p>
                  <p className="text-sm text-gray-600">Lezzet Durağı Restaurant</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Sparkles key={i} className="w-5 h-5 fill-[#FF6F00] text-[#FF6F00]" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "Dijital menü sistemine geçiş yapmak bizim için en doğru karardı. Fiyat güncellemelerini anında yapabiliyoruz ve müşteri geri bildirimlerini kolayca toplayabiliyoruz."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#FF6F00] rounded-full flex items-center justify-center text-white font-bold">
                  AK
                </div>
                <div>
                  <p className="font-bold text-gray-900">Ayşe Kaya</p>
                  <p className="text-sm text-gray-600">Café Modern</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t border-gray-100 py-16 bg-white">
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
                <span className="text-lg font-bold text-gray-900">Rivo QR</span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Profesyonel dijital QR menü çözümü. Restoranınızı dijitalleştirin.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Ürün</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    Özellikler
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    Paketler
                  </Link>
                </li>
                <li>
                  <Link href="/menu/demo-restoran" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    Demo Menü
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Şirket</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/gizlilik-politikasi" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    Gizlilik Politikası
                  </Link>
                </li>
                <li>
                  <Link href="/kvkk" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    Kullanım Şartları
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Destek</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="https://softwareoffuture.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    İletişim
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-100">
            <p className="text-sm text-gray-600 text-center">
              © 2026 Rivo QR. Tüm hakları saklıdır.{" "}
              <span className="text-gray-400">Developed by{" "}
                <a
                  href="https://softwareoffuture.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#FF6F00] hover:text-[#E55F00] font-semibold"
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
