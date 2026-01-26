import Link from "next/link";
import Image from "next/image";
import { QrCode, ArrowRight, Star, CheckCircle, MessageSquare } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
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
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-4 leading-tight">
              Restoranlarda Yeni Dönem:
              <br />
              <span className="text-[#FF6F00]">QR ile Hızlı ve Kolay</span>
            </h1>
            <p className="text-base md:text-lg text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">
              T.C. Ticaret Bakanlığı Yönetmeliği'ne uygun, modern ve kolay kullanımlı QR Menü programı ile menülerinizi hızla dijitale taşıyın!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link
                href="/restaurant/register"
                className="bg-[#FF6F00] text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-[#E55F00] transition-colors inline-flex items-center gap-2"
              >
                Hemen Başla
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/menu-packages"
                className="bg-white text-[#FF6F00] border-2 border-[#FF6F00] px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-[#FF6F00] hover:text-white transition-colors inline-flex items-center gap-2"
              >
                Neden Gerekli?
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-3">
              Dijital çözümlerle işinizi kolaylaştıracak
              <br />
              <span className="text-[#FF6F00]">yenilikçi yazılımlar!</span>
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              Hızlı erişim, müşteri memnuniyeti ve profesyonellik için modern araçlarımızı keşfedin.
              <br />
              İşte sizin için sunduklarımız:
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5 max-w-5xl mx-auto">
            {/* QR Menü Yazılımı */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 hover:border-[#FF6F00] hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-[#FF6F00] rounded-lg flex items-center justify-center mb-3">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-2">QR Menü Yazılımı</h3>
              <p className="text-gray-600 mb-3 leading-relaxed text-sm">
                Modern restoranlar ve kafeler için dijital menü çözümü! QR kod ile menünüzü hızlı ve kolay bir şekilde müşterilerinize sunun. Basılı menülere olan ihtiyacı ortadan kaldırarak hem maliyetlerinizi azaltın hem de güncellemeleri anında yapma özgürlüğü kazanın.
              </p>
              <Link
                href="/menu-packages"
                className="text-[#FF6F00] font-bold text-sm inline-flex items-center gap-1 hover:gap-2 transition-all"
              >
                İncele
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* QR Menu & Yorum Tasarımları */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 hover:border-[#FF6F00] hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-[#FF6F00] rounded-lg flex items-center justify-center mb-3">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-2">QR Menu & Yorum Tasarımları</h3>
              <p className="text-gray-600 mb-3 leading-relaxed text-sm">
                Müşterilerinizin deneyimlerini kolayca paylaşmasını sağlayın! QR kod ile doğrudan yorum sayfasına yönlendirme yaparak işletmeniz hakkında geri bildirim almayı hızlandırın. Bu çözümle müşteri memnuniyetini artırabilir ve dijital itibarınızı güçlendirebilirsiniz.
              </p>
              <Link
                href="/menu-packages"
                className="text-[#FF6F00] font-bold text-sm inline-flex items-center gap-1 hover:gap-2 transition-all"
              >
                İncele
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-3">
              Mutlu Kullanıcılar
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              Yenilikçi yazılımlarımızla kullanıcılarımızın işlerini
              <br />
              nasıl kolaylaştırdığını görmek için gerçek yorumlara göz atın.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5 max-w-5xl mx-auto">
            {/* Testimonial 1 */}
            <div className="bg-white rounded-lg p-5 shadow-sm">
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#FF6F00] text-[#FF6F00]" />
                ))}
              </div>
              <p className="text-gray-700 mb-3 leading-relaxed text-sm">
                "QR Menü yazılımı restoranımıza çok yakıştı. Menüdeki değişiklikleri anında yapabiliyoruz ve müşterilerimiz de menüye hızlıca erişebiliyor. Hem zamandan hem de maliyetten tasarruf ettik."
              </p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#FF6F00] rounded-full flex items-center justify-center text-white font-bold text-xs">
                  SS
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Soner S.</p>
                  <p className="text-xs text-gray-600">Yiyin & İçin Espiye</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white rounded-lg p-5 shadow-sm">
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#FF6F00] text-[#FF6F00]" />
                ))}
              </div>
              <p className="text-gray-700 mb-3 leading-relaxed text-sm">
                "Google yorum sayımızı arttırmak için talep ettik. Müşterilerimiz masa üzerinde ki pleksilerden qr okutuarak direkt Google işletme hesabımıza yorum bırakabiliyorlar. Biz çok sevdik."
              </p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#FF6F00] rounded-full flex items-center justify-center text-white font-bold text-xs">
                  SB
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Saime B.</p>
                  <p className="text-xs text-gray-600">Denizim Beach Club</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-3">
              Daha Profesyonel
              <br />
              ve Güçlü Öneriler.
            </h2>
            <Link
              href="/restaurant/register"
              className="text-[#FF6F00] font-bold text-sm hover:text-[#E55F00] transition-colors inline-flex items-center gap-2"
            >
              Bizi Tanıyın.
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
            {/* 99+ Mutlu Müşteri */}
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black text-[#FF6F00] mb-2">99+</div>
              <h3 className="text-lg md:text-xl font-black text-gray-900 mb-3">Mutlu Müşteri</h3>
              <div className="space-y-1.5 text-left max-w-xs mx-auto">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-[#FF6F00] mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-gray-600">Gizli maliyet yok, sürpriz yok.</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-[#FF6F00] mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-gray-600">Güvenli ödeme.</p>
                </div>
              </div>
            </div>

            {/* 100% Müşteri Memnuniyeti */}
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black text-[#FF6F00] mb-2">100%</div>
              <h3 className="text-lg md:text-xl font-black text-gray-900 mb-3">Müşteri Memnuniyeti</h3>
              <div className="space-y-1.5 text-left max-w-xs mx-auto">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-[#FF6F00] mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-gray-600">Anında İade.</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-[#FF6F00] mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-gray-600">1 yıl ücretsiz destek.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-6 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Image
                src="/logo.png"
                alt="Rivo QR"
                width={24}
                height={24}
                className="h-6 w-auto"
              />
              <span className="text-sm font-black text-gray-900">Rivo QR</span>
            </div>
            <p className="text-xs text-gray-600">
              © 2026 Rivo QR. Tüm hakları saklıdır.
            </p>
            <p className="text-xs text-gray-600 mt-1">
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
