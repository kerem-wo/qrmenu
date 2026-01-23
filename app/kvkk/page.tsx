export default function KVKKPage() {
  return (
    <div className="min-h-screen premium-bg-gradient py-12 px-4">
      <div className="premium-container max-w-4xl mx-auto">
        <div className="premium-card p-8 md:p-12 animate-premium-fade-in">
          <h1 className="premium-heading-2 mb-8">
            KVKK Aydınlatma Metni
          </h1>
          
          <div className="prose prose-slate max-w-none space-y-6 text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">
                1. Veri Sorumlusu
              </h2>
              <p>
                Bu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, 
                kişisel verilerinizin işlenmesi hakkında sizleri bilgilendirmek amacıyla hazırlanmıştır.
              </p>
              <p>
                Veri Sorumlusu: QR Menü Platformu
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">
                2. İşlenen Kişisel Veriler
              </h2>
              <p>
                Platformumuzda işlenen kişisel verileriniz şunlardır:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Kimlik Bilgileri: Ad, soyad</li>
                <li>İletişim Bilgileri: E-posta adresi, telefon numarası</li>
                <li>İşletme Bilgileri: Restoran adı, adres, vergi numarası</li>
                <li>Mali Bilgiler: Sipariş bilgileri, ödeme kayıtları</li>
                <li>İşlem Güvenliği: IP adresi, çerez bilgileri</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">
                3. Kişisel Verilerin İşlenme Amaçları
              </h2>
              <p>
                Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Hizmetlerin sunulması ve geliştirilmesi</li>
                <li>Müşteri ilişkilerinin yönetilmesi</li>
                <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                <li>İş süreçlerinin yürütülmesi</li>
                <li>Güvenlik ve denetim faaliyetlerinin gerçekleştirilmesi</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">
                4. Kişisel Verilerin Aktarılması
              </h2>
              <p>
                Kişisel verileriniz, yasal yükümlülüklerin yerine getirilmesi ve hizmetlerin sunulması 
                amacıyla, yasal düzenlemelerde belirtilen sınırlar dahilinde, ilgili kamu kurum ve 
                kuruluşlarına aktarılabilir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">
                5. Kişisel Verilerin Korunması
              </h2>
              <p>
                Kişisel verileriniz, teknik ve idari güvenlik önlemleri alınarak korunmaktadır. 
                Verilerinize yetkisiz erişim, değiştirme, ifşa veya imha edilmesini önlemek için 
                gerekli tüm önlemler alınmaktadır.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">
                6. KVKK Kapsamındaki Haklarınız
              </h2>
              <p>
                KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                <li>İşlenmişse buna ilişkin bilgi talep etme</li>
                <li>İşlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
                <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
                <li>KVKK'da öngörülen şartlar çerçevesinde silinmesini veya yok edilmesini isteme</li>
                <li>Düzeltme, silme, yok etme işlemlerinin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
                <li>İşlenen verilerin münhasıran otomatik sistemler ile analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
                <li>Kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">
                7. İletişim
              </h2>
              <p>
                KVKK kapsamındaki haklarınızı kullanmak için talebinizi yazılı olarak iletebilirsiniz.
              </p>
            </section>

            <div className="mt-8 p-4 bg-gray-100 rounded-xl">
              <p className="text-sm text-gray-600 font-medium">
                <strong>Son Güncelleme:</strong> {new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
