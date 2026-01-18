import Link from "next/link";
import { QrCode, Smartphone, Clock, TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">QR Menü</span>
            </div>
            <Link
              href="/admin/login"
              className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
              Giriş Yap
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-2xl mb-8">
            <QrCode className="w-8 h-8 text-slate-900" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Dijital Menü Çözümü
          </h1>
          
          <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Restoranınız için modern, hızlı ve kullanıcı dostu QR kod menü sistemi. 
            Müşterileriniz telefonlarıyla menünüze anında erişsin.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/admin/login"
              className="btn-primary inline-flex items-center justify-center"
            >
              Admin Paneline Giriş
            </Link>
            <Link
              href="/menu/demo-restoran"
              className="btn-secondary inline-flex items-center justify-center"
            >
              Demo Menüyü Görüntüle
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Neden QR Menü?</h2>
            <p className="text-slate-600 text-lg">Modern restoranların tercihi</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card-modern p-8 text-center">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Smartphone className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Mobil Uyumlu</h3>
              <p className="text-slate-600">
                Tüm cihazlarda mükemmel görünüm. Müşterileriniz telefonlarıyla kolayca sipariş verebilir.
              </p>
            </div>

            <div className="card-modern p-8 text-center">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Clock className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Hızlı Kurulum</h3>
              <p className="text-slate-600">
                Dakikalar içinde menünüzü oluşturun ve QR kodunuzu alın. 
                Teknik bilgi gerektirmez.
              </p>
            </div>

            <div className="card-modern p-8 text-center">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Kolay Yönetim</h3>
              <p className="text-slate-600">
                Ürünlerinizi kolayca ekleyin, düzenleyin veya kaldırın. 
                Anlık güncellemeler müşterilerinize anında yansır.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="card-modern p-12 text-center bg-slate-900 text-white">
            <h2 className="text-3xl font-bold mb-4">Hemen Başlayın</h2>
            <p className="text-slate-300 mb-8 text-lg">
              Restoranınız için dijital menü oluşturun ve müşterilerinize modern bir deneyim sunun.
            </p>
            <Link
              href="/admin/login"
              className="inline-flex items-center justify-center bg-white text-slate-900 px-8 py-4 rounded-lg font-semibold hover:bg-slate-100 transition-colors"
            >
              Ücretsiz Başla
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 px-6">
        <div className="container mx-auto text-center text-slate-600">
          <p>© 2024 QR Menü Sistemi. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
}
