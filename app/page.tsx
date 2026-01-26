import Link from "next/link";
import Image from "next/image";
import { QrCode, Smartphone, Clock, TrendingUp, Sparkles, Zap, Shield, ArrowRight, Star, CheckCircle, MessageSquare } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Rivo QR"
                width={40}
                height={40}
                className="h-10 w-auto"
              />
              <span className="text-xl font-black text-gray-900">Rivo QR</span>
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
                className="bg-[#FF6F00] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#E55F00] transition-colors text-sm"
              >
                Giriş Yap
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
              Restoranlarda Yeni Dönem:
              <br />
              <span className="text-[#FF6F00]">QR ile Hızlı ve Kolay</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed font-medium">
              T.C. Ticaret Bakanlığı Yönetmeliği'ne uygun, modern ve kolay kullanımlı QR Menü programı ile menülerinizi hızla dijitale taşıyın!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/restaurant/register"
                className="bg-[#FF6F00] text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-[#E55F00] transition-colors inline-flex items-center gap-2 shadow-lg"
              >
                Hemen Başla
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/menu-packages"
                className="bg-white text-[#FF6F00] border-2 border-[#FF6F00] px-8 py-4 rounded-lg font-bold text-lg hover:bg-[#FF6F00] hover:text-white transition-colors inline-flex items-center gap-2"
              >
                Neden Gerekli?
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              Dijital çözümlerle işinizi kolaylaştıracak
              <br />
              <span className="text-[#FF6F00]">yenilikçi yazılımlar!</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hızlı erişim, müşteri memnuniyeti ve profesyonellik için modern araçlarımızı keşfedin.
              <br />
              İşte sizin için sunduklarımız:
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* QR Menü Yazılımı */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-[#FF6F00] hover:shadow-xl transition-all group">
              <div className="w-16 h-16 bg-gradient-to-br from-[#FF6F00] to-[#E55F00] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <QrCode className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">QR Menü Yazılımı</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Modern restoranlar ve kafeler için dijital menü çözümü! QR kod ile menünüzü hızlı ve kolay bir şekilde müşterilerinize sunun. Basılı menülere olan ihtiyacı ortadan kaldırarak hem maliyetlerinizi azaltın hem de güncellemeleri anında yapma özgürlüğü kazanın.
              </p>
              <Link
                href="/menu-packages"
                className="text-[#FF6F00] font-bold inline-flex items-center gap-2 hover:gap-3 transition-all"
              >
                İncele
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* QR Menu & Yorum Tasarımları */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-[#FF6F00] hover:shadow-xl transition-all group">
              <div className="w-16 h-16 bg-gradient-to-br from-[#FF6F00] to-[#E55F00] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">QR Menu & Yorum Tasarımları</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Müşterilerinizin deneyimlerini kolayca paylaşmasını sağlayın! QR kod ile doğrudan yorum sayfasına yönlendirme yaparak işletmeniz hakkında geri bildirim almayı hızlandırın. Bu çözümle müşteri memnuniyetini artırabilir ve dijital itibarınızı güçlendirebilirsiniz.
              </p>
              <Link
                href="/menu-packages"
                className="text-[#FF6F00] font-bold inline-flex items-center gap-2 hover:gap-3 transition-all"
              >
                İncele
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              Mutlu Kullanıcılar
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Yenilikçi yazılımlarımızla kullanıcılarımızın işlerini
              <br />
              nasıl kolaylaştırdığını görmek için gerçek yorumlara göz atın.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Testimonial 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-[#FF6F00] text-[#FF6F00]" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed italic">
                "Rivo QR sistemi sayesinde restoranımızın menü yönetimi çok daha pratik hale geldi. Müşterilerimiz QR kod okutarak anında menüye erişebiliyor ve siparişlerini hızlıca verebiliyorlar. Hem işletmemiz hem de müşterilerimiz için harika bir deneyim!"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#FF6F00] to-[#E55F00] rounded-full flex items-center justify-center text-white font-bold">
                  MA
                </div>
                <div>
                  <p className="font-bold text-gray-900">Mehmet A.</p>
                  <p className="text-sm text-gray-600">Lezzet Durağı Restaurant</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-[#FF6F00] text-[#FF6F00]" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed italic">
                "Dijital menü sistemine geçiş yapmak bizim için en doğru karardı. Müşteri geri bildirimlerini kolayca toplayabiliyoruz ve menü güncellemelerini anında yapabiliyoruz. Rivo QR ekibine teşekkürler!"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#FF6F00] to-[#E55F00] rounded-full flex items-center justify-center text-white font-bold">
                  AK
                </div>
                <div>
                  <p className="font-bold text-gray-900">Ayşe K.</p>
                  <p className="text-sm text-gray-600">Café Modern</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {/* 99+ Mutlu Müşteri */}
            <div className="text-center">
              <div className="text-6xl font-black text-[#FF6F00] mb-4">99+</div>
              <h3 className="text-2xl font-black text-gray-900 mb-6">Mutlu Müşteri</h3>
              <div className="space-y-3 text-left max-w-sm mx-auto">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#FF6F00] mt-0.5 flex-shrink-0" />
                  <p className="text-gray-600">Gizli maliyet yok, sürpriz yok.</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#FF6F00] mt-0.5 flex-shrink-0" />
                  <p className="text-gray-600">Güvenli ödeme.</p>
                </div>
              </div>
            </div>

            {/* 100% Müşteri Memnuniyeti */}
            <div className="text-center">
              <div className="text-6xl font-black text-[#FF6F00] mb-4">100%</div>
              <h3 className="text-2xl font-black text-gray-900 mb-6">Müşteri Memnuniyeti</h3>
              <div className="space-y-3 text-left max-w-sm mx-auto">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#FF6F00] mt-0.5 flex-shrink-0" />
                  <p className="text-gray-600">Anında İade.</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#FF6F00] mt-0.5 flex-shrink-0" />
                  <p className="text-gray-600">1 yıl ücretsiz destek.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Image
                src="/logo.png"
                alt="Rivo QR"
                width={32}
                height={32}
                className="h-8 w-auto"
              />
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
                className="text-[#FF6F00] hover:text-[#E55F00] underline font-semibold"
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
