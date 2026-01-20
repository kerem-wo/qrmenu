# 🔐 Stripe Ödeme Entegrasyonu Kurulum Rehberi

## 📋 Adım Adım Stripe Kurulumu

### 1. Stripe Hesabı Oluşturma

1. **Stripe Web Sitesine Gidin:**
   - https://stripe.com adresine gidin
   - Sağ üst köşedeki "Sign in" veya "Start now" butonuna tıklayın

2. **Hesap Oluşturun:**
   - E-posta adresinizi girin
   - Şifre oluşturun
   - Ülke seçin (Türkiye için "Turkey" seçin)
   - Hesap türünü seçin (Business/Individual)

3. **E-posta Doğrulama:**
   - E-posta adresinize gelen doğrulama linkine tıklayın

### 2. Stripe Dashboard'a Giriş

1. **Dashboard'a Giriş:**
   - https://dashboard.stripe.com adresine gidin
   - Oluşturduğunuz hesapla giriş yapın

2. **Test Modu:**
   - İlk başta "Test mode" aktif olacak (sağ üst köşede görünür)
   - Test modunda gerçek para çekilmez, sadece test işlemleri yapılır

### 3. API Key'leri Alma

#### Test Modu Key'leri (Geliştirme için):

1. **Dashboard'da:**
   - Sol menüden **"Developers"** → **"API keys"** seçin
   - Veya direkt link: https://dashboard.stripe.com/test/apikeys

2. **Publishable Key'i Kopyalayın:**
   - **"Publishable key"** altındaki **"Reveal test key"** butonuna tıklayın
   - `pk_test_...` ile başlayan key'i kopyalayın
   - Bu key'i `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` olarak kullanacaksınız

3. **Secret Key'i Kopyalayın:**
   - **"Secret key"** altındaki **"Reveal test key"** butonuna tıklayın
   - `sk_test_...` ile başlayan key'i kopyalayın
   - Bu key'i `STRIPE_SECRET_KEY` olarak kullanacaksınız

#### Production Modu Key'leri (Canlı Sistem için):

1. **Test Modunu Kapatın:**
   - Sağ üst köşedeki "Test mode" toggle'ını kapatın
   - Production moduna geçin

2. **Production Key'leri Alın:**
   - Aynı sayfada production key'leri göreceksiniz
   - `pk_live_...` ile başlayan publishable key
   - `sk_live_...` ile başlayan secret key

### 4. Vercel'de Environment Variables Ayarlama

#### Vercel Dashboard'dan:

1. **Projenize Gidin:**
   - https://vercel.com/dashboard
   - Projenizi seçin

2. **Settings'e Gidin:**
   - Proje sayfasında **"Settings"** sekmesine tıklayın
   - Sol menüden **"Environment Variables"** seçin

3. **Environment Variables Ekleyin:**

   **Test Modu için (Development/Preview):**
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_...
   STRIPE_SECRET_KEY = sk_test_...
   STRIPE_WEBHOOK_SECRET = whsec_... (Webhook için - sonraki adımda)
   ```

   **Production Modu için:**
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_live_...
   STRIPE_SECRET_KEY = sk_live_...
   STRIPE_WEBHOOK_SECRET = whsec_... (Webhook için)
   ```

4. **Environment Seçimi:**
   - Her variable için hangi environment'larda kullanılacağını seçin:
     - ✅ **Production** (Canlı sistem)
     - ✅ **Preview** (Pull request'ler)
     - ✅ **Development** (Local development)

5. **Kaydedin:**
   - "Save" butonuna tıklayın
   - Yeni bir deployment başlatın (değişikliklerin aktif olması için)

### 5. Webhook Secret Alma (Ödeme Durumu Takibi için)

1. **Webhook Endpoint Oluşturun:**
   - Stripe Dashboard'da **"Developers"** → **"Webhooks"** seçin
   - **"Add endpoint"** butonuna tıklayın

2. **Endpoint URL'i Girin:**
   ```
   https://your-domain.vercel.app/api/payment/webhook
   ```
   - Vercel deployment URL'inizi kullanın

3. **Event Seçin:**
   - **"Select events to listen to"** bölümünden:
     - ✅ `payment_intent.succeeded`
     - ✅ `payment_intent.payment_failed`

4. **Webhook Secret'i Kopyalayın:**
   - Endpoint oluşturulduktan sonra
   - **"Signing secret"** altındaki `whsec_...` ile başlayan key'i kopyalayın
   - Bu key'i `STRIPE_WEBHOOK_SECRET` olarak Vercel'e ekleyin

### 6. Local Development için (.env.local)

Projenizin root dizininde `.env.local` dosyası oluşturun:

```env
# Stripe Test Keys (Development için)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**⚠️ ÖNEMLİ:** `.env.local` dosyasını Git'e commit etmeyin! (Zaten `.gitignore`'da olmalı)

### 7. Test Ödeme Yapma

#### Test Kartları (Test Modunda):

Stripe test modunda gerçek kart bilgileri kullanmadan test yapabilirsiniz:

**Başarılı Ödeme:**
```
Kart Numarası: 4242 4242 4242 4242
Son Kullanma: Herhangi bir gelecek tarih (örn: 12/25)
CVC: Herhangi bir 3 haneli sayı (örn: 123)
ZIP: Herhangi bir 5 haneli sayı (örn: 12345)
```

**Ödeme Başarısız:**
```
Kart Numarası: 4000 0000 0000 0002
```

**3D Secure Test:**
```
Kart Numarası: 4000 0025 0000 3155
```

### 8. Production'a Geçiş

1. **Stripe Hesabını Aktifleştirin:**
   - Stripe Dashboard'da hesap bilgilerinizi tamamlayın
   - Banka hesabı bilgilerinizi ekleyin
   - Gerekli belgeleri yükleyin

2. **Production Key'leri Kullanın:**
   - Vercel'de production environment variable'larını güncelleyin
   - `pk_live_...` ve `sk_live_...` key'lerini kullanın

3. **Webhook'u Güncelleyin:**
   - Production webhook endpoint'i oluşturun
   - Production webhook secret'i ekleyin

## 🔒 Güvenlik Notları

1. **Secret Key'i ASLA:**
   - ❌ Frontend kodunda kullanmayın
   - ❌ Git'e commit etmeyin
   - ❌ Public olarak paylaşmayın

2. **Publishable Key:**
   - ✅ Frontend'de kullanılabilir (public)
   - ✅ Git'e commit edilebilir (güvenli)

3. **Webhook Secret:**
   - ✅ Sadece backend'de kullanılır
   - ✅ Git'e commit etmeyin

## 📞 Yardım

- **Stripe Dokümantasyon:** https://stripe.com/docs
- **Stripe Test Kartları:** https://stripe.com/docs/testing
- **Stripe Support:** Dashboard'dan "Support" sekmesinden ulaşabilirsiniz

## ✅ Kontrol Listesi

- [ ] Stripe hesabı oluşturuldu
- [ ] Test mode API key'leri alındı
- [ ] Vercel'de environment variables eklendi
- [ ] Local `.env.local` dosyası oluşturuldu
- [ ] Webhook endpoint oluşturuldu
- [ ] Test ödemesi yapıldı
- [ ] Production key'leri hazır (canlıya geçerken)

---

**Not:** İlk başta test modunda başlamanızı öneririm. Test modunda gerçek para çekilmez ve tüm özellikleri test edebilirsiniz.
