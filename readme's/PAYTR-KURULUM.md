# 💳 PayTR Ödeme Entegrasyonu Kurulum Rehberi

## 📋 Adım Adım PayTR Kurulumu

### 1. PayTR Hesabı Oluşturma

1. **PayTR Web Sitesine Gidin:**
   - https://www.paytr.com adresine gidin
   - "Üye Ol" veya "Kayıt Ol" butonuna tıklayın

2. **Hesap Oluşturun:**
   - İşletme bilgilerinizi girin
   - Gerekli belgeleri yükleyin
   - Hesap onayını bekleyin

3. **Merchant Panel'e Giriş:**
   - Onay sonrası Merchant Panel'e giriş yapın
   - https://www.paytr.com adresinden giriş yapın

### 2. API Bilgilerini Alın

1. **Merchant Panel'de:**
   - Sol menüden **"Ayarlar"** → **"API Bilgileri"** veya **"Bilgilerim"** seçin
   - Şu bilgileri kopyalayın:
     - **Merchant ID** (`merchant_id`)
     - **Merchant Key** (`merchant_key`)
     - **Merchant Salt** (`merchant_salt`)

2. **Bu Bilgileri Güvenli Tutun:**
   - ⚠️ Bu bilgileri kimseyle paylaşmayın
   - ⚠️ Git'e commit etmeyin
   - ⚠️ Public olarak paylaşmayın

### 3. Environment Variables Ayarlama

#### Local Development (.env dosyası):

`.env` dosyanıza şu değişkenleri ekleyin:

```env
# PayTR API Bilgileri
PAYTR_MERCHANT_ID=your_merchant_id
PAYTR_MERCHANT_KEY=your_merchant_key
PAYTR_MERCHANT_SALT=your_merchant_salt

# Base URL (Local için localhost, Production için domain)
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Node Environment (Development için development, Production için production)
NODE_ENV=development
```

#### Vercel Production:

1. **Vercel Dashboard'a Gidin:**
   - https://vercel.com/dashboard
   - Projenize gidin

2. **Environment Variables Ekleyin:**
   - **Settings** → **Environment Variables**
   - Şu değişkenleri ekleyin:
     ```
     PAYTR_MERCHANT_ID=your_merchant_id
     PAYTR_MERCHANT_KEY=your_merchant_key
     PAYTR_MERCHANT_SALT=your_merchant_salt
     NEXT_PUBLIC_BASE_URL=https://your-domain.com
     NODE_ENV=production
     ```

3. **Deploy Edin:**
   - Değişiklikleri deploy edin
   - Environment variables otomatik olarak yüklenecek

### 4. Test Modu

PayTR entegrasyonumuz otomatik olarak test modunu algılar:

- **Test Modu:** `NODE_ENV !== "production"` olduğunda aktif
- **Production Modu:** `NODE_ENV === "production"` olduğunda aktif

Test modunda:
- ✅ Gerçek para çekilmez
- ✅ Test kartları kullanılır
- ✅ PayTR test ortamına bağlanır

### 5. Callback URL Ayarlama

PayTR Merchant Panel'de:

1. **Ayarlar** → **API Ayarları** veya **Callback URL**
2. Callback URL'i ayarlayın:
   ```
   https://your-domain.com/api/payment/paytr/callback
   ```
3. Fail URL'i ayarlayın:
   ```
   https://your-domain.com/order/error
   ```

**Local Test için:**
- ngrok veya benzeri bir tunnel kullanın
- Tunnel URL'ini PayTR callback URL olarak ayarlayın

### 6. Test Etme

Detaylı test rehberi için: [PAYTR-TEST-REHBERI.md](./PAYTR-TEST-REHBERI.md)

**Hızlı Test:**
1. Bir sipariş oluşturun
2. Ödeme sayfasına gidin
3. "Ödeme Yap" butonuna tıklayın
4. PayTR iframe'i açılmalı
5. Test kartı ile ödeme yapın

---

## 🔒 Güvenlik Notları

1. **API Bilgilerini ASLA:**
   - ❌ Frontend kodunda kullanmayın
   - ❌ Git'e commit etmeyin
   - ❌ Public olarak paylaşmayın
   - ❌ Log dosyalarında yazdırmayın

2. **Environment Variables:**
   - ✅ Sadece backend'de kullanılır
   - ✅ `.env` dosyasında saklanır
   - ✅ `.gitignore`'da olmalı

3. **Hash Doğrulama:**
   - ✅ Tüm callback'lerde hash doğrulaması yapılır
   - ✅ Geçersiz hash reddedilir

---

## 📞 Yardım

- **PayTR Dokümantasyon:** https://dev.paytr.com
- **PayTR Destek:** https://www.paytr.com/iletisim
- **PayTR Merchant Panel:** https://www.paytr.com

---

## ✅ Kontrol Listesi

- [ ] PayTR hesabı oluşturuldu
- [ ] Merchant Panel'e giriş yapıldı
- [ ] API bilgileri alındı (Merchant ID, Key, Salt)
- [ ] `.env` dosyasına eklendi
- [ ] Vercel'de environment variables eklendi
- [ ] Callback URL ayarlandı
- [ ] Test modu test edildi
- [ ] Production'a geçiş hazır

---

## 🚀 Production'a Geçiş

1. **Environment Variables Güncelleyin:**
   ```env
   NODE_ENV=production
   NEXT_PUBLIC_BASE_URL=https://your-domain.com
   ```

2. **PayTR Merchant Panel'de:**
   - Test modunu kapatın (eğer varsa)
   - Production API bilgilerini kullanın

3. **Vercel'de:**
   - Production environment variables'ları güncelleyin
   - Deploy edin

4. **Son Kontrol:**
   - Canlı ortamda küçük bir test ödemesi yapın
   - Callback'in çalıştığını doğrulayın
