# ⚡ Vercel'e Hızlı Deploy - 3 Adım

## 🚀 Adım 1: Git'e Push

```bash
git add .
git commit -m "Yeni özellikler: Stok takibi, kampanyalar, analitik"
git push origin main
```

## 🔧 Adım 2: Vercel Dashboard Kontrolü

1. https://vercel.com → Projenizi açın
2. **Settings** → **Environment Variables**
3. `DATABASE_URL` değerini kontrol edin:
   - ✅ `postgres://` veya `postgresql://` ile başlamalı
   - ❌ `prisma+postgres://` ile başlamamalı

## 📊 Adım 3: Deploy ve Veritabanı Güncelleme

### Otomatik Deploy:
Git push sonrası Vercel otomatik deploy eder. Bekleyin.

### Veritabanı Güncellemesi:
Deploy tamamlandıktan sonra:

```bash
# Environment variables'ı çekin
vercel env pull .env.local

# Veritabanı şemasını güncelleyin
npx prisma db push
```

## ✅ Test

1. Site açılıyor mu? → `https://your-site.vercel.app`
2. Admin giriş: `admin@demo.com` / `admin123`
3. Yeni özellikler çalışıyor mu?

## 🐛 Sorun mu var?

**"DATABASE_URL must start with postgres://" hatası:**
→ Vercel Dashboard'dan `DATABASE_URL`'i PostgreSQL URL'ine güncelleyin

**"Table does not exist" hatası:**
→ `npx prisma db push` çalıştırın

**Build hatası:**
→ Local'de `npm run build` test edin
