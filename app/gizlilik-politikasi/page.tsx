export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-6">
            Gizlilik Politikası
          </h1>
          
          <div className="prose prose-slate max-w-none space-y-6 text-slate-700">
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">
                1. Gizlilik Politikası Hakkında
              </h2>
              <p>
                Bu Gizlilik Politikası, QR Menü Platformu ("Platform", "Biz", "Bizim") tarafından 
                sunulan hizmetler kapsamında toplanan, kullanılan ve korunan kişisel bilgileriniz 
                hakkında sizleri bilgilendirmek amacıyla hazırlanmıştır.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">
                2. Toplanan Bilgiler
              </h2>
              <p>
                Platformumuzu kullanırken aşağıdaki bilgileri toplayabiliriz:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Hesap Bilgileri:</strong> E-posta adresi, şifre, restoran bilgileri</li>
                <li><strong>İşlem Bilgileri:</strong> Sipariş geçmişi, ödeme bilgileri</li>
                <li><strong>Teknik Bilgiler:</strong> IP adresi, tarayıcı türü, cihaz bilgileri</li>
                <li><strong>Kullanım Bilgileri:</strong> Platform kullanım verileri, tercihler</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">
                3. Bilgilerin Kullanımı
              </h2>
              <p>
                Toplanan bilgileriniz aşağıdaki amaçlarla kullanılmaktadır:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Hizmetlerin sunulması ve iyileştirilmesi</li>
                <li>Müşteri desteği sağlanması</li>
                <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                <li>Güvenlik ve dolandırıcılık önleme</li>
                <li>İstatistiksel analizler ve raporlama</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">
                4. Bilgilerin Paylaşılması
              </h2>
              <p>
                Kişisel bilgileriniz, aşağıdaki durumlar dışında üçüncü taraflarla paylaşılmaz:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Yasal zorunluluklar gereği</li>
                <li>Hizmet sağlayıcılarımızla (sınırlı ve güvenli şekilde)</li>
                <li>İş ortaklarımızla (açık rızanızla)</li>
                <li>Acil durumlarda güvenlik amaçlı</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">
                5. Çerezler (Cookies)
              </h2>
              <p>
                Platformumuz, hizmetlerimizi iyileştirmek ve kullanıcı deneyimini geliştirmek için 
                çerezler kullanmaktadır. Çerezler hakkında detaylı bilgi için Çerez Politikamızı inceleyebilirsiniz.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">
                6. Veri Güvenliği
              </h2>
              <p>
                Bilgilerinizin güvenliği bizim için önceliklidir. Verilerinizi korumak için teknik ve 
                idari güvenlik önlemleri alınmaktadır. Ancak, internet üzerinden veri aktarımının %100 
                güvenli olmadığını unutmayın.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">
                7. Veri Saklama Süresi
              </h2>
              <p>
                Kişisel verileriniz, yasal saklama süreleri ve hizmet sunumu için gerekli süre boyunca 
                saklanmaktadır. Bu süre sona erdiğinde, verileriniz güvenli bir şekilde silinir veya anonimleştirilir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">
                8. Haklarınız
              </h2>
              <p>
                KVKK kapsamında, kişisel verilerinizle ilgili olarak bilgi talep etme, düzeltme, 
                silme ve itiraz etme haklarınıza sahipsiniz. Bu haklarınızı kullanmak için bizimle iletişime geçebilirsiniz.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">
                9. Değişiklikler
              </h2>
              <p>
                Bu Gizlilik Politikası, yasal düzenlemelerdeki değişiklikler veya hizmetlerimizdeki 
                güncellemeler nedeniyle değiştirilebilir. Önemli değişikliklerde sizleri bilgilendireceğiz.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">
                10. İletişim
              </h2>
              <p>
                Gizlilik Politikamız hakkında sorularınız için bizimle iletişime geçebilirsiniz.
              </p>
            </section>

            <div className="mt-8 p-4 bg-slate-100 rounded-lg">
              <p className="text-sm text-slate-600">
                <strong>Son Güncelleme:</strong> {new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
