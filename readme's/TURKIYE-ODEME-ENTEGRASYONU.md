# 🇹🇷 Türkiye için Ödeme Entegrasyonu Rehberi

## ⚠️ Stripe Durumu

Stripe şu anda **Türkiye'de aktif olarak hizmet vermemektedir**. Bu nedenle Türkiye'deki restoranlar için alternatif ödeme çözümleri kullanılmalıdır.

## 🎯 Önerilen Ödeme Çözümleri

### 1. İyzico (En Popüler) ⭐ ÖNERİLEN

**Avantajlar:**
- ✅ Türkiye'nin en büyük ödeme gateway'i
- ✅ Kolay entegrasyon
- ✅ Kredi kartı, havale/EFT, mobil ödeme desteği
- ✅ 3D Secure desteği
- ✅ Detaylı raporlama
- ✅ Ücretsiz test ortamı

**Ücretlendirme:**
- Komisyon: %2.9 + 0.25₺ (Kredi kartı)
- Kurulum ücreti: Yok
- Aylık sabit ücret: Yok

**Kayıt:** https://www.iyzico.com

---

### 2. PayTR

**Avantajlar:**
- ✅ Hızlı kurulum
- ✅ Düşük komisyon oranları
- ✅ Taksit desteği
- ✅ Mobil ödeme

**Ücretlendirme:**
- Komisyon: %2.5 + 0.25₺
- Kurulum ücreti: Yok

**Kayıt:** https://www.paytr.com

---

### 3. Paymes

**Avantajlar:**
- ✅ Modern API
- ✅ Kolay entegrasyon
- ✅ Detaylı dokümantasyon

**Ücretlendirme:**
- Komisyon: %2.9 + 0.25₺

**Kayıt:** https://www.paymes.com.tr

---

### 4. PayU

**Avantajlar:**
- ✅ Uluslararası şirket
- ✅ Çoklu ödeme yöntemi
- ✅ Güvenilir altyapı

**Kayıt:** https://www.payu.com.tr

---

## 🚀 İyzico Entegrasyonu (Önerilen)

### Adım 1: İyzico Hesabı Oluşturma

1. **Kayıt Olun:**
   - https://www.iyzico.com adresine gidin
   - "Ücretsiz Başla" butonuna tıklayın
   - İşletme bilgilerinizi girin

2. **Hesap Doğrulama:**
   - E-posta doğrulaması yapın
   - İşletme belgelerinizi yükleyin
   - Banka hesabı bilgilerinizi ekleyin

### Adım 2: API Key'leri Alma

1. **İyzico Panel'e Giriş:**
   - https://merchant.iyzipay.com adresine girin
   - Hesabınızla giriş yapın

2. **API Bilgilerini Alın:**
   - Sol menüden **"Ayarlar"** → **"API Bilgileri"** seçin
   - **API Key:** `sandbox-...` veya `production-...`
   - **Secret Key:** `sandbox-...` veya `production-...`

### Adım 3: Test Ortamı

İyzico'da test ortamı otomatik olarak aktif:
- Test API Key'leri `sandbox-` ile başlar
- Gerçek para çekilmez
- Test kartları kullanılır

**Test Kartları:**
```
Kart Numarası: 5528 7909 1064 5455
Son Kullanma: 12/25
CVC: 123
Kart Sahibi: Test Kullanıcı
```

---

## 💻 Kod Entegrasyonu

### İyzico Paketi Kurulumu

```bash
npm install iyzipay
```

### Environment Variables

`.env.local` dosyasına ekleyin:

```env
IYZICO_API_KEY=sandbox-...
IYZICO_SECRET_KEY=sandbox-...
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com
```

Vercel'de de aynı şekilde ekleyin.

### API Route Örneği

`app/api/payment/iyzico/route.ts` dosyası oluşturun:

```typescript
import { NextResponse } from "next/server";
import Iyzipay from "iyzipay";

const iyzipay = new Iyzipay({
  apiKey: process.env.IYZICO_API_KEY!,
  secretKey: process.env.IYZICO_SECRET_KEY!,
  uri: process.env.IYZICO_BASE_URL!,
});

export async function POST(request: Request) {
  try {
    const { amount, orderId, orderNumber, customerName, customerPhone } = await request.json();

    const request = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: orderId,
      price: amount.toFixed(2),
      paidPrice: amount.toFixed(2),
      currency: Iyzipay.CURRENCY.TRY,
      basketId: orderNumber,
      paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
      callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/iyzico/callback`,
      enabledInstallments: [2, 3, 6, 9],
      buyer: {
        id: orderId,
        name: customerName,
        surname: customerName,
        gsmNumber: customerPhone,
        email: `${orderId}@temp.com`,
        identityNumber: "11111111111",
        registrationAddress: "Test",
        ip: "127.0.0.1",
        city: "Istanbul",
        country: "Turkey",
      },
      shippingAddress: {
        contactName: customerName,
        city: "Istanbul",
        country: "Turkey",
        address: "Test",
      },
      billingAddress: {
        contactName: customerName,
        city: "Istanbul",
        country: "Turkey",
        address: "Test",
      },
      basketItems: [
        {
          id: orderNumber,
          name: `Sipariş #${orderNumber}`,
          category1: "Sipariş",
          itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
          price: amount.toFixed(2),
        },
      ],
    };

    iyzipay.checkoutFormInitialize.create(request, (err, result) => {
      if (err) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
      return NextResponse.json({ 
        checkoutFormContent: result.checkoutFormContent,
        paymentPageUrl: result.paymentPageUrl 
      });
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Ödeme başlatılamadı" },
      { status: 500 }
    );
  }
}
```

---

## 🔄 Alternatif: Stripe'ı Devre Dışı Bırakma

Eğer şimdilik ödeme entegrasyonu yapmak istemiyorsanız, sistem zaten çalışır durumda:

1. **Stripe Key'leri eklemeden kullanın:**
   - Sistem otomatik olarak ödeme olmadan sipariş alır
   - Müşteriler sipariş verebilir
   - Ödeme "pending" durumunda kalır

2. **Manuel ödeme takibi:**
   - Admin panelden siparişleri görüntüleyin
   - Müşteri ile iletişime geçip ödemeyi alın
   - Admin panelden ödeme durumunu "paid" olarak güncelleyin

---

## 📊 Karşılaştırma Tablosu

| Özellik | İyzico | PayTR | Paymes | PayU |
|---------|--------|-------|--------|------|
| Komisyon | %2.9 + 0.25₺ | %2.5 + 0.25₺ | %2.9 + 0.25₺ | %2.9 + 0.25₺ |
| Kurulum | Ücretsiz | Ücretsiz | Ücretsiz | Ücretsiz |
| 3D Secure | ✅ | ✅ | ✅ | ✅ |
| Taksit | ✅ | ✅ | ✅ | ✅ |
| Havale/EFT | ✅ | ✅ | ❌ | ✅ |
| Mobil Ödeme | ✅ | ✅ | ✅ | ✅ |
| Dokümantasyon | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## ✅ Öneri

**İyzico** en popüler ve güvenilir seçenek olduğu için önerilir:
- En iyi dokümantasyon
- En fazla örnek kod
- En iyi müşteri desteği
- En yaygın kullanım

---

## 📞 Yardım

- **İyzico Dokümantasyon:** https://dev.iyzipay.com
- **İyzico Destek:** https://www.iyzico.com/iletisim
- **PayTR Dokümantasyon:** https://www.paytr.com/dokumantasyon
- **Paymes Dokümantasyon:** https://www.paymes.com.tr/dokumantasyon

---

## 🎯 Sonuç

Türkiye'deki restoranlar için:
1. **İyzico** entegrasyonu yapılabilir (en önerilen)
2. Veya şimdilik ödeme olmadan sistem kullanılabilir
3. Manuel ödeme takibi yapılabilir

Hangi ödeme gateway'ini tercih edersiniz? İyzico entegrasyonu için kod hazırlayabilirim.
