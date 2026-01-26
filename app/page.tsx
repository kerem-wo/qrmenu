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
                "QR Menü yazılımı restoranımıza çok yakıştı. Menüdeki değişiklikleri anında yapabiliyoruz ve müşterilerimiz de menüye hızlıca erişebiliyor. Hem zamandan hem de maliyetten tasarruf ettik."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#FF6F00] to-[#E55F00] rounded-full flex items-center justify-center text-white font-bold">
                  SS
                </div>
                <div>
                  <p className="font-bold text-gray-900">Soner S.</p>
                  <p className="text-sm text-gray-600">Yiyin & İçin Espiye</p>
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
                "Google yorum sayımızı arttırmak için talep ettik. Müşterilerimiz masa üzerinde ki pleksilerden qr okutuarak direkt Google işletme hesabımıza yorum bırakabiliyorlar. Biz çok sevdik."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#FF6F00] to-[#E55F00] rounded-full flex items-center justify-center text-white font-bold">
                  SB
                </div>
                <div>
                  <p className="font-bold text-gray-900">Saime B.</p>
                  <p className="text-sm text-gray-600">Denizim Beach Club</p>
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

      {/* Menu Packages Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Menü Paketleri</h2>
            <p className="text-xl text-gray-600 font-medium mb-8 max-w-3xl mx-auto">
              T.C. Ticaret Bakanlığı yönetmeliğine uygun, mobil uyumlu 8 farklı Rivo QR tasarımı
            </p>
            <Link
              href="/menu-packages"
              className="bg-[#FF6F00] text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-[#E55F00] transition-colors inline-flex items-center gap-2 shadow-lg"
            >
              Tüm Paketleri İncele
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Package Preview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { 
                name: "Premium Menü", 
                theme: "premium", 
                popular: false,
                image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80",
                description: "Modern ve hızlı"
              },
              { 
                name: "Kağıt Menü", 
                theme: "paper", 
                popular: false,
                image: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=400&q=80",
                description: "Klasik ve profesyonel"
              },
              { 
                name: "Modern Swipe", 
                theme: "swipe", 
                popular: false,
                image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80",
                description: "Swipe navigasyon"
              },
              { 
                name: "Premium+", 
                theme: "premium-plus", 
                popular: true,
                image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=400&q=80",
                description: "Lüks tasarım"
              },
            ].map((pkg, index) => (
              <Link
                key={pkg.theme}
                href={`/restaurant/register?theme=${pkg.theme}`}
                className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-[#FF6F00] hover:shadow-xl transition-all group relative overflow-hidden"
              >
                {pkg.popular && (
                  <div className="absolute top-3 right-3 z-10">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#FF6F00] text-white text-xs font-bold rounded-full">
                      <Sparkles className="w-3 h-3" />
                      Popüler
                    </span>
                  </div>
                )}
                <div className="relative h-32 w-full mb-4 rounded-xl overflow-hidden bg-gray-100">
                  <img
                    src={pkg.image}
                    alt={pkg.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-2">{pkg.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{pkg.description}</p>
                <div className="text-sm font-semibold text-[#FF6F00] group-hover:text-[#E55F00] transition-colors">
                  Seç →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Neden Rivo QR?</h2>
            <p className="text-xl text-gray-600 font-medium">Modern restoranların tercihi</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-10 text-center hover:border-[#FF6F00] hover:shadow-xl transition-all group">
              <div className="relative inline-flex items-center justify-center mb-8">
                <div className="absolute inset-0 bg-[#FF6F00]/20 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-[#FF6F00] to-[#E55F00] rounded-3xl flex items-center justify-center shadow-xl">
                  <Smartphone className="w-10 h-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">Mobil Uyumlu</h3>
              <p className="text-gray-600 leading-relaxed">
                Tüm cihazlarda mükemmel görünüm. Müşterileriniz telefonlarıyla kolayca sipariş verebilir.
              </p>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-2xl p-10 text-center hover:border-[#FF6F00] hover:shadow-xl transition-all group">
              <div className="relative inline-flex items-center justify-center mb-8">
                <div className="absolute inset-0 bg-[#FF6F00]/20 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-[#FF6F00] to-[#E55F00] rounded-3xl flex items-center justify-center shadow-xl">
                  <Clock className="w-10 h-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">Hızlı Kurulum</h3>
              <p className="text-gray-600 leading-relaxed">
                Dakikalar içinde menünüzü oluşturun ve QR kodunuzu alın. 
                Teknik bilgi gerektirmez.
              </p>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-2xl p-10 text-center hover:border-[#FF6F00] hover:shadow-xl transition-all group">
              <div className="relative inline-flex items-center justify-center mb-8">
                <div className="absolute inset-0 bg-[#FF6F00]/20 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-[#FF6F00] to-[#E55F00] rounded-3xl flex items-center justify-center shadow-xl">
                  <TrendingUp className="w-10 h-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">Kolay Yönetim</h3>
              <p className="text-gray-600 leading-relaxed">
                Ürünlerinizi kolayca ekleyin, düzenleyin veya kaldırın. 
                Anlık güncellemeler müşterilerinize anında yansır.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,111,0,0.1),transparent)]"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Hemen Başlayın</h2>
          <p className="text-xl text-gray-300 mb-10 font-medium max-w-2xl mx-auto">
            Restoranınız için dijital menü oluşturun ve müşterilerinize <span className="text-[#FF6F00] font-bold">modern bir deneyim</span> sunun.
          </p>
          <Link
            href="/restaurant/register"
            className="bg-[#FF6F00] text-white px-10 py-5 rounded-lg font-bold text-lg hover:bg-[#E55F00] transition-colors inline-flex items-center gap-3 shadow-lg"
          >
            Ücretsiz Başla
            <ArrowRight className="w-6 h-6" />
          </Link>
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
