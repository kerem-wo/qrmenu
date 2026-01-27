# 🧪 PayTR Mock Test Modu - API Bilgileri Olmadan Test

## 📋 Mock Test Modu Nedir?

PayTR API bilgileri (`PAYTR_MERCHANT_ID`, `PAYTR_MERCHANT_KEY`, `PAYTR_MERCHANT_SALT`) yapılandırılmadığında sistem otomatik olarak **Mock Test Modu**'na geçer. Bu modda:

- ✅ Gerçek PayTR API'sine bağlanmaz
- ✅ Mock token oluşturur
- ✅ Simüle edilmiş ödeme formu gösterir
- ✅ Tüm frontend akışını test edebilirsiniz
- ✅ Database'e payment kayıtları oluşturur
- ✅ Callback simülasyonu yapılır

## 🚀 Mock Test Modu Nasıl Çalışır?

### 1. Environment Variables Kontrolü

Sistem şu environment variables'ları kontrol eder:
- `PAYTR_MERCHANT_ID`
- `PAYTR_MERCHANT_KEY`
- `PAYTR_MERCHANT_SALT`

**Eğer bu değişkenler yoksa veya boşsa**, sistem otomatik olarak Mock Mode'a geçer.

### 2. Mock Mode Aktif Olduğunda

**Backend (`/api/payment/paytr/initialize`):**
- PayTR API'sine istek yapmaz
- Mock token oluşturur: `mock_token_{timestamp}_{random}`
- Payment kaydını database'e kaydeder
- Response'da `mockMode: true` döner

**Frontend:**
- Gerçek PayTR iframe'i yerine simüle edilmiş ödeme formu gösterir
- Form içinde test kart bilgileri önceden doldurulur
- "Ödemeyi Simüle Et" butonuna tıklayınca callback simülasyonu yapılır

**Callback (`/api/payment/paytr/callback`):**
- Mock hash kontrolü yapılır (`mock_hash_` ile başlayan hash'ler kabul edilir)
- Payment durumu güncellenir
- Sipariş/Restoran durumu güncellenir

## 📝 Test Senaryoları

### Senaryo 1: Sipariş Ödemesi Mock Test

1. **Sipariş Oluşturun:**
   ```
   - Menüden ürün seçin
   - Siparişi tamamlayın
   - Sipariş numarasını alın
   ```

2. **Ödeme Sayfasına Gidin:**
   ```
   - /order/[orderNumber] sayfasına gidin
   - "Ödeme Yap" butonuna tıklayın
   ```

3. **Mock Ödeme Formu Açılır:**
   ```
   - Sarı uyarı kutusu görünür: "🧪 Mock Test Modu"
   - Test ödeme formu gösterilir
   - Kart bilgileri önceden doldurulmuş
   ```

4. **Ödemeyi Simüle Edin:**
   ```
   - "Ödemeyi Simüle Et" butonuna tıklayın
   - 2 saniye bekleme (simüle edilmiş işlem)
   - Sayfa otomatik yenilenir
   - Sipariş durumu "Ödendi" olarak görünür
   ```

### Senaryo 2: Bayilik Ödemesi Mock Test

1. **Restoran Kaydı Yapın:**
   ```
   - /restaurant/register sayfasından kayıt yapın
   - Gerekli belgeleri yükleyin
   ```

2. **Tema ve Paket Seçin:**
   ```
   - /restaurant/register/package sayfasına yönlendirilirsiniz
   - Bir tema seçin
   - Paket tipi seçin (Aylık/Yıllık)
   ```

3. **Mock Ödeme Formu:**
   ```
   - "Ödemeye Geç" butonuna tıklayın
   - Mock ödeme formu açılır
   - "Ödemeyi Simüle Et" butonuna tıklayın
   ```

4. **Başarı Sayfası:**
   ```
   - /restaurant/register/success sayfasına yönlendirilirsiniz
   - Restoran durumu "approved" olur
   - Paket bilgileri kaydedilir
   ```

## 🔍 Mock Mode Kontrolü

### Backend'de Kontrol:

```typescript
import { isPayTRConfigured } from "@/lib/paytr";

if (!isPayTRConfigured()) {
  // Mock mode aktif
  console.log("PayTR API bilgileri yok - Mock mode aktif");
}
```

### Frontend'de Kontrol:

```javascript
const response = await fetch("/api/payment/paytr/initialize", {...});
const data = await response.json();

if (data.mockMode) {
  // Mock mode aktif
  showMockPaymentForm(data.paymentId, amount);
} else {
  // Gerçek PayTR iframe
  showPayTRIframe(data.token, data.iframeUrl);
}
```

## ⚠️ Önemli Notlar

1. **Mock Mode Sadece Development İçin:**
   - Production'da PayTR API bilgileri mutlaka olmalı
   - Mock mode production'da çalışmaz

2. **Database Kayıtları:**
   - Mock mode'da da payment kayıtları database'e yazılır
   - `metadata.mockMode: true` olarak işaretlenir
   - Gerçek ödeme kayıtlarından ayırt edilebilir

3. **Hash Doğrulama:**
   - Mock mode'da hash doğrulaması atlanır
   - `mock_hash_` ile başlayan hash'ler kabul edilir

4. **Gerçek Para Çekilmez:**
   - Mock mode'da hiçbir gerçek ödeme yapılmaz
   - Sadece frontend ve backend akışı test edilir

## 🎯 Mock Mode vs Gerçek PayTR

| Özellik | Mock Mode | Gerçek PayTR |
|---------|-----------|--------------|
| API Bağlantısı | ❌ Yok | ✅ Var |
| Token | Mock token | Gerçek PayTR token |
| Ödeme Formu | Simüle edilmiş | PayTR iframe |
| Para Çekilir mi? | ❌ Hayır | ✅ Evet (test modunda hayır) |
| Hash Doğrulama | Atlanır | Yapılır |
| Database Kayıtları | ✅ Oluşturulur | ✅ Oluşturulur |

## 🚀 Production'a Geçiş

Mock mode'dan gerçek PayTR'ye geçmek için:

1. **Environment Variables Ekleyin:**
   ```env
   PAYTR_MERCHANT_ID=your_merchant_id
   PAYTR_MERCHANT_KEY=your_merchant_key
   PAYTR_MERCHANT_SALT=your_merchant_salt
   ```

2. **Sunucuyu Yeniden Başlatın:**
   ```bash
   npm run dev  # Development
   # veya
   # Vercel otomatik deploy
   ```

3. **Test Edin:**
   - Mock mode artık aktif olmayacak
   - Gerçek PayTR iframe'i açılacak
   - Test kartları ile gerçek test yapabilirsiniz

## 📞 Sorun Giderme

### Problem: Mock mode aktif olmuyor

**Çözüm:**
- `.env` dosyasında PayTR değişkenlerinin olmadığından emin olun
- Sunucuyu yeniden başlatın (`npm run dev`)

### Problem: Mock ödeme formu açılmıyor

**Çözüm:**
- Browser console'da hata mesajlarını kontrol edin
- Network tab'ında API response'unu kontrol edin
- `mockMode: true` döndüğünden emin olun

### Problem: Callback çalışmıyor

**Çözüm:**
- Mock callback'te hash `mock_hash_` ile başlamalı
- Payment kaydının database'de olduğundan emin olun
- Browser console'da hata mesajlarını kontrol edin

---

## ✅ Mock Test Kontrol Listesi

- [ ] PayTR API bilgileri `.env` dosyasında YOK
- [ ] Mock mode otomatik aktif
- [ ] Sipariş ödemesi mock formu açılıyor
- [ ] Bayilik ödemesi mock formu açılıyor
- [ ] Mock ödeme simülasyonu çalışıyor
- [ ] Callback başarılı
- [ ] Database kayıtları oluşturuluyor
- [ ] Sipariş/Restoran durumu güncelleniyor
