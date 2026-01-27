# 🔧 Vercel Environment Variables Kurulumu - PayTR

## ⚠️ ÖNEMLİ: Doğru Format

Vercel'de environment variable eklerken **her biri için ayrı key-value çifti** oluşturmalısınız!

## ✅ Doğru Kurulum (3 Ayrı Variable)

### 1. PAYTR_MERCHANT_ID
```
Key: PAYTR_MERCHANT_ID
Value: your_merchant_id_here
Environments: Production, Preview, Development (hepsini seçin)
```

### 2. PAYTR_MERCHANT_KEY
```
Key: PAYTR_MERCHANT_KEY
Value: your_merchant_key_here
Environments: Production, Preview, Development (hepsini seçin)
```

### 3. PAYTR_MERCHANT_SALT
```
Key: PAYTR_MERCHANT_SALT
Value: your_merchant_salt_here
Environments: Production, Preview, Development (hepsini seçin)
```

### 4. NEXT_PUBLIC_BASE_URL (Opsiyonel ama önerilir)
```
Key: NEXT_PUBLIC_BASE_URL
Value: https://your-domain.vercel.app (veya production domain)
Environments: Production, Preview, Development
```

### 5. NODE_ENV (Otomatik ayarlanır, genelde eklemenize gerek yok)
```
Key: NODE_ENV
Value: production (Production için)
Value: development (Development için - genelde otomatik)
```

## ❌ YANLIŞ Format (Yapmayın!)

**YANLIŞ:**
```
Key: PAYTR_MERCHANT_ID
Value: PAYTR_MERCHANT_KEY
PAYTR_MERCHANT_SALT
```

Bu şekilde çalışmaz! Her biri ayrı variable olmalı.

## 📝 Adım Adım Vercel Kurulumu

### 1. Vercel Dashboard'a Gidin
- https://vercel.com/dashboard
- Projenize tıklayın

### 2. Settings'e Gidin
- Sol menüden **Settings** seçin
- **Environment Variables** sekmesine tıklayın

### 3. Her Variable'ı Tek Tek Ekleyin

**Variable 1:**
1. **Key** kutusuna: `PAYTR_MERCHANT_ID` yazın
2. **Value** kutusuna: PayTR Merchant Panel'den aldığınız Merchant ID'yi yazın
3. **Environments** altında: Production, Preview, Development seçin
4. **Save** butonuna tıklayın

**Variable 2:**
1. **Add New** butonuna tıklayın
2. **Key** kutusuna: `PAYTR_MERCHANT_KEY` yazın
3. **Value** kutusuna: PayTR Merchant Panel'den aldığınız Merchant Key'i yazın
4. **Environments** altında: Production, Preview, Development seçin
5. **Save** butonuna tıklayın

**Variable 3:**
1. **Add New** butonuna tıklayın
2. **Key** kutusuna: `PAYTR_MERCHANT_SALT` yazın
3. **Value** kutusuna: PayTR Merchant Panel'den aldığınız Merchant Salt'ı yazın
4. **Environments** altında: Production, Preview, Development seçin
5. **Save** butonuna tıklayın

**Variable 4 (Opsiyonel):**
1. **Add New** butonuna tıklayın
2. **Key** kutusuna: `NEXT_PUBLIC_BASE_URL` yazın
3. **Value** kutusuna: `https://your-domain.vercel.app` yazın
4. **Environments** altında: Production, Preview, Development seçin
5. **Save** butonuna tıklayın

### 4. Deploy Edin
- Environment variables eklendikten sonra yeni bir deploy yapın
- Veya mevcut deployment'ı redeploy edin

## 🧪 Test Modu vs Production Modu

### Test Modu (Otomatik)
- `NODE_ENV !== "production"` olduğunda aktif
- Vercel Preview ve Development ortamlarında otomatik aktif
- Gerçek para çekilmez (PayTR test modu)
- Test kartları kullanılır

### Production Modu
- `NODE_ENV === "production"` olduğunda aktif
- Vercel Production ortamında otomatik aktif
- Gerçek ödemeler yapılır

### Mock Mode (API Bilgileri Yoksa)
- PayTR API bilgileri yoksa otomatik aktif
- Gerçek PayTR API'sine bağlanmaz
- Simüle edilmiş ödeme formu gösterir
- Sadece frontend/backend akışını test eder

## 🔍 Kontrol

Environment variables'ları ekledikten sonra:

1. **Deploy yapın**
2. **Deployment logs'u kontrol edin:**
   - "PayTR API anahtarları yapılandırılmamış" hatası görünmemeli
3. **Test edin:**
   - Bir sipariş oluşturun
   - Ödeme sayfasına gidin
   - PayTR iframe'i açılmalı (mock mode değil)

## ⚠️ Güvenlik Notları

1. **Value'ları ASLA:**
   - Public olarak paylaşmayın
   - Git'e commit etmeyin
   - Screenshot'larda göstermeyin

2. **Her Environment için:**
   - Production: Gerçek API bilgileri
   - Preview: Test API bilgileri (eğer varsa)
   - Development: Test API bilgileri (eğer varsa)

## 📞 Sorun Giderme

### Problem: "PayTR API anahtarları yapılandırılmamış" hatası

**Çözüm:**
- Environment variables'ların doğru eklendiğinden emin olun
- Her biri için ayrı key-value çifti olduğunu kontrol edin
- Deploy yaptığınızdan emin olun
- Deployment logs'u kontrol edin

### Problem: Mock mode aktif kalıyor

**Çözüm:**
- Environment variables'ların Production environment'ında da eklendiğinden emin olun
- Deploy yaptıktan sonra birkaç dakika bekleyin
- Sunucuyu yeniden başlatın (redeploy)

---

## ✅ Kontrol Listesi

- [ ] PAYTR_MERCHANT_ID eklendi (ayrı variable)
- [ ] PAYTR_MERCHANT_KEY eklendi (ayrı variable)
- [ ] PAYTR_MERCHANT_SALT eklendi (ayrı variable)
- [ ] NEXT_PUBLIC_BASE_URL eklendi (opsiyonel)
- [ ] Tüm environments seçildi (Production, Preview, Development)
- [ ] Deploy yapıldı
- [ ] Test edildi (mock mode değil, gerçek PayTR iframe açılıyor)
