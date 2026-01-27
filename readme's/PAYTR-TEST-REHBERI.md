 # 🧪 PayTR Test Rehberi

## 📋 Test Öncesi Hazırlık

### 1. PayTR Merchant Panel'den API Bilgilerini Alın

PayTR onayı aldıktan sonra:

1. **PayTR Merchant Panel'e Giriş Yapın:**
   - https://www.paytr.com adresine gidin
   - Merchant Panel'e giriş yapın

2. **API Bilgilerini Alın:**
   - Sol menüden **"Ayarlar"** → **"API Bilgileri"** veya **"Bilgilerim"** seçin
   - Şu bilgileri kopyalayın:
     - **Merchant ID** (`merchant_id`)
     - **Merchant Key** (`merchant_key`)
     - **Merchant Salt** (`merchant_salt`)

### 2. Environment Variables Ekleyin

`.env` dosyanıza şu değişkenleri ekleyin:

```env
# PayTR API Bilgileri
PAYTR_MERCHANT_ID=your_merchant_id
PAYTR_MERCHANT_KEY=your_merchant_key
PAYTR_MERCHANT_SALT=your_merchant_salt

# Base URL (Test için localhost, Production için domain)
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Node Environment (Test için development, Production için production)
NODE_ENV=development
```

**⚠️ ÖNEMLİ:** 
- `.env` dosyasını Git'e commit etmeyin! (Zaten `.gitignore`'da olmalı)
- Production'da `NODE_ENV=production` olarak ayarlayın

### 3. Vercel'de Environment Variables (Production için)

Production'da Vercel Dashboard'dan:
1. Projenize gidin
2. **Settings** → **Environment Variables**
3. PayTR bilgilerini ekleyin
4. `NODE_ENV=production` olarak ayarlayın

---

## 🧪 Test Modu Nasıl Çalışır?

PayTR entegrasyonumuz otomatik olarak test modunu algılar:

- **Test Modu:** `NODE_ENV !== "production"` olduğunda aktif
- **Production Modu:** `NODE_ENV === "production"` olduğunda aktif

Test modunda:
- ✅ Gerçek para çekilmez
- ✅ Test kartları kullanılır
- ✅ PayTR test ortamına bağlanır
- ✅ İşlemler gerçek değil, simüle edilir

---

## 💳 PayTR Test Kartları

PayTR iFrame API kullanıldığında test kartları otomatik olarak gelir. Ancak manuel test için:

### Visa Test Kartı:
```
Kart Numarası: 4355 0843 5508 4358
CVV: 000
Son Kullanma: 12/30
Ad-Soyad: Herhangi bir isim
```

### Mastercard Test Kartı:
```
Kart Numarası: 5406 6754 0667 5403
CVV: 000
Son Kullanma: 12/30
Ad-Soyad: Herhangi bir isim
```

### Diğer Test Kartı:
```
Kart Numarası: 9792 0303 9444 0796
CVV: 000
Son Kullanma: 12/30
Ad-Soyad: Herhangi bir isim
```

**Not:** iFrame API kullanıldığında test kartları otomatik olarak formda görünecektir.

---

## 🚀 Test Senaryoları

### Senaryo 1: Sipariş Ödemesi Testi

1. **Sipariş Oluşturun:**
   - Menüden ürün seçin
   - Siparişi tamamlayın
   - Sipariş numarasını alın

2. **Ödeme Sayfasına Gidin:**
   - `/order/[orderNumber]` sayfasına gidin
   - "Ödeme Yap" butonuna tıklayın

3. **PayTR iframe'i Açılır:**
   - PayTR ödeme formu iframe içinde açılır
   - Test kart bilgileri otomatik gelir (veya manuel girin)

4. **Ödeme Yapın:**
   - Test kartı bilgilerini girin
   - 3D Secure adımlarını tamamlayın
   - Ödeme başarılı olmalı

5. **Callback Kontrolü:**
   - Ödeme sonrası `/order/[orderNumber]?payment=success` sayfasına yönlendirilmelisiniz
   - Sipariş durumu "Ödendi" olarak görünmeli

### Senaryo 2: Bayilik/Abonelik Ödemesi Testi

1. **Restoran Kaydı Yapın:**
   - `/restaurant/register` sayfasından kayıt yapın
   - Gerekli belgeleri yükleyin

2. **Tema ve Paket Seçin:**
   - `/restaurant/register/package` sayfasına yönlendirilirsiniz
   - Bir tema seçin (örn: Premium)
   - Paket tipi seçin (Aylık/Yıllık)

3. **Ödemeye Geç:**
   - "Ödemeye Geç" butonuna tıklayın
   - PayTR iframe'i açılır

4. **Ödeme Yapın:**
   - Test kartı ile ödeme yapın
   - Başarılı ödeme sonrası `/restaurant/register/success` sayfasına yönlendirilmelisiniz

5. **Restoran Durumu:**
   - Restoran durumu "approved" olmalı
   - Paket bilgileri kaydedilmiş olmalı

### Senaryo 3: Başarısız Ödeme Testi

1. **Geçersiz Kart Bilgileri:**
   - Test kartı yerine geçersiz kart bilgileri girin
   - Ödeme başarısız olmalı

2. **Hata Sayfası:**
   - `/order/error?message=...` sayfasına yönlendirilmelisiniz
   - Hata mesajı görünmeli

3. **Sipariş Durumu:**
   - Sipariş durumu "failed" olarak kalmalı
   - Tekrar ödeme yapılabilmeli

---

## 🔍 Test Kontrol Listesi

### ✅ Sipariş Ödemesi:
- [ ] Sipariş oluşturuldu
- [ ] Ödeme butonu görünüyor
- [ ] PayTR iframe açılıyor
- [ ] Test kartı ile ödeme yapılabiliyor
- [ ] Callback çalışıyor
- [ ] Sipariş durumu "paid" olarak güncelleniyor
- [ ] Başarı sayfasına yönlendiriliyor

### ✅ Bayilik Ödemesi:
- [ ] Restoran kaydı yapılabiliyor
- [ ] Tema ve paket seçilebiliyor
- [ ] PayTR iframe açılıyor
- [ ] Test kartı ile ödeme yapılabiliyor
- [ ] Restoran durumu "approved" oluyor
- [ ] Paket bilgileri kaydediliyor

### ✅ Hata Yönetimi:
- [ ] Başarısız ödeme durumunda hata sayfası gösteriliyor
- [ ] Payment kaydı "failed" olarak güncelleniyor
- [ ] Sipariş durumu "failed" olarak kalıyor
- [ ] Tekrar ödeme yapılabiliyor

### ✅ Güvenlik:
- [ ] Hash doğrulama çalışıyor
- [ ] Callback hash kontrolü yapılıyor
- [ ] Geçersiz hash reddediliyor

---

## 🐛 Sorun Giderme

### Problem: "PayTR API anahtarları yapılandırılmamış" Hatası

**Çözüm:**
- `.env` dosyasında `PAYTR_MERCHANT_ID`, `PAYTR_MERCHANT_KEY`, `PAYTR_MERCHANT_SALT` değişkenlerinin olduğundan emin olun
- Sunucuyu yeniden başlatın (`npm run dev`)

### Problem: "Hash doğrulama başarısız" Hatası

**Çözüm:**
- Merchant Salt değerinin doğru olduğundan emin olun
- PayTR Merchant Panel'den salt değerini tekrar kontrol edin
- Callback URL'in doğru olduğundan emin olun

### Problem: iframe Açılmıyor

**Çözüm:**
- `NEXT_PUBLIC_BASE_URL` değişkeninin doğru olduğundan emin olun
- Callback URL'in erişilebilir olduğundan emin olun
- Browser console'da hata mesajlarını kontrol edin

### Problem: Callback Çalışmıyor

**Çözüm:**
- PayTR Merchant Panel'de callback URL'in doğru ayarlandığından emin olun
- Callback URL: `https://your-domain.com/api/payment/paytr/callback`
- Localhost test için ngrok veya benzeri bir tunnel kullanın

---

## 📞 PayTR Destek

- **PayTR Dokümantasyon:** https://dev.paytr.com
- **PayTR Destek:** https://www.paytr.com/iletisim
- **PayTR Merchant Panel:** https://www.paytr.com

---

## ✅ Production'a Geçiş

Testler başarılı olduktan sonra:

1. **Environment Variables Güncelleyin:**
   ```env
   NODE_ENV=production
   NEXT_PUBLIC_BASE_URL=https://your-domain.com
   ```

2. **PayTR Merchant Panel'de:**
   - Test modunu kapatın
   - Production API bilgilerini kullanın (genellikle aynı bilgiler)

3. **Vercel'de:**
   - Production environment variables'ları güncelleyin
   - Deploy edin

4. **Son Kontrol:**
   - Canlı ortamda küçük bir test ödemesi yapın
   - Callback'in çalıştığını doğrulayın

---

## 📝 Notlar

- PayTR test modu otomatik olarak aktif olur (`NODE_ENV !== "production"`)
- Test kartları ile gerçek para çekilmez
- Production'da gerçek kart bilgileri kullanılır
- Callback URL'in her zaman erişilebilir olması gerekir
