# 📋 Vercel Environment Variables Import Rehberi

## 🚀 Hızlı Import (Vercel Dashboard)

Vercel Dashboard'da environment variables eklerken, her birini **ayrı ayrı** eklemeniz gerekiyor.

## ✅ Doğru Format (Vercel Dashboard)

### Adım 1: Settings → Environment Variables

### Adım 2: Her Variable'ı Tek Tek Ekleyin

#### 1. PAYTR_MERCHANT_ID
```
Key: PAYTR_MERCHANT_ID
Value: [PayTR'den aldığınız Merchant ID]
Environments: ☑ Production ☑ Preview ☑ Development
```

#### 2. PAYTR_MERCHANT_KEY
```
Key: PAYTR_MERCHANT_KEY
Value: [PayTR'den aldığınız Merchant Key]
Environments: ☑ Production ☑ Preview ☑ Development
```

#### 3. PAYTR_MERCHANT_SALT
```
Key: PAYTR_MERCHANT_SALT
Value: [PayTR'den aldığınız Merchant Salt]
Environments: ☑ Production ☑ Preview ☑ Development
```

#### 4. NEXT_PUBLIC_BASE_URL
```
Key: NEXT_PUBLIC_BASE_URL
Value: https://your-project.vercel.app
Environments: ☑ Production ☑ Preview ☑ Development
```

#### 5. NEXTAUTH_SECRET (Eğer yoksa)
```
Key: NEXTAUTH_SECRET
Value: [npm run generate-secret ile oluşturun]
Environments: ☑ Production ☑ Preview ☑ Development
```

#### 6. NEXTAUTH_URL (Eğer yoksa)
```
Key: NEXTAUTH_URL
Value: https://your-project.vercel.app
Environments: ☑ Production ☑ Preview ☑ Development
```

#### 7. NODE_ENV (Genelde otomatik, ama kontrol edin)
```
Key: NODE_ENV
Value: production
Environments: ☑ Production
```

## 📝 Vercel CLI ile Import (Alternatif)

Eğer Vercel CLI kullanıyorsanız:

```bash
# .env dosyasını Vercel'e push edin
npx vercel env pull .env.local

# Veya manuel olarak ekleyin
npx vercel env add PAYTR_MERCHANT_ID production preview development
npx vercel env add PAYTR_MERCHANT_KEY production preview development
npx vercel env add PAYTR_MERCHANT_SALT production preview development
npx vercel env add NEXT_PUBLIC_BASE_URL production preview development
```

## ⚠️ ÖNEMLİ: Her Biri Ayrı Variable!

**YANLIŞ:**
```
Key: PAYTR_MERCHANT_ID
Value: PAYTR_MERCHANT_KEY
PAYTR_MERCHANT_SALT
```

**DOĞRU:**
```
Variable 1:
Key: PAYTR_MERCHANT_ID
Value: abc123

Variable 2:
Key: PAYTR_MERCHANT_KEY
Value: xyz789

Variable 3:
Key: PAYTR_MERCHANT_SALT
Value: salt456
```

## 🔍 Kontrol

Environment variables ekledikten sonra:

1. **Deploy yapın** (otomatik veya manuel)
2. **Deployment logs'u kontrol edin:**
   - "PayTR API anahtarları yapılandırılmamış" hatası görünmemeli
3. **Test edin:**
   - Bir sipariş oluşturun
   - Ödeme sayfasına gidin
   - PayTR iframe'i açılmalı (mock mode değil)

## 📞 Sorun Giderme

### Problem: "PayTR API anahtarları yapılandırılmamış"

**Çözüm:**
- Her variable'ın ayrı ayrı eklendiğinden emin olun
- Environments'ların seçildiğinden emin olun
- Deploy yaptığınızdan emin olun
- Deployment logs'u kontrol edin

### Problem: Mock mode aktif kalıyor

**Çözüm:**
- Environment variables'ların Production environment'ında da eklendiğinden emin olun
- Deploy yaptıktan sonra birkaç dakika bekleyin
- Redeploy yapın
