# 🔧 Vercel Hataları Düzeltme

## ❌ Hatalar:
1. `/api/admin/login` - 500 hatası
2. `/favicon.ico` - 404 hatası (normal, kritik değil)

## ✅ Çözüm Adımları

### 1. Prisma Schema'yı PostgreSQL'e Geçirin

`prisma/schema.prisma` dosyasında:

```prisma
datasource db {
  provider = "postgresql"  // SQLite yerine PostgreSQL
  url      = env("DATABASE_URL")
}
```

### 2. Vercel Build Settings

Vercel dashboard → Settings → Build & Development Settings:

**Build Command:**
```bash
prisma generate && next build
```

**Install Command:**
```bash
npm install
```

### 3. Environment Variables Kontrolü

Vercel dashboard → Settings → Environment Variables:

✅ `DATABASE_URL` - Vercel Postgres'ten otomatik eklenmiş olmalı
✅ `NEXTAUTH_SECRET` - Güçlü secret key
✅ `NEXTAUTH_URL` - Vercel domain'iniz (https://your-project.vercel.app)

### 4. Prisma Migration

Vercel deploy olduktan sonra, Vercel CLI ile:

```bash
# Vercel CLI yükleyin
npm i -g vercel

# Environment variables'ı çekin
vercel env pull .env.local

# Migration yapın
npx prisma migrate deploy
```

VEYA Vercel dashboard'dan:
- Deployments → En son deployment → "Redeploy"

### 5. Favicon Hatası (Opsiyonel)

`public/favicon.ico` dosyası ekleyin veya `app/icon.ico` oluşturun.

## 🚨 En Yaygın Sorunlar

### Sorun 1: Prisma Client Generate Edilmemiş
**Çözüm:** Build command'a `prisma generate` ekleyin

### Sorun 2: Database Migration Yapılmamış
**Çözüm:** `npx prisma migrate deploy` çalıştırın

### Sorun 3: DATABASE_URL Yanlış
**Çözüm:** Vercel Postgres'in oluşturulduğundan emin olun

### Sorun 4: Schema Hala SQLite
**Çözüm:** `prisma/schema.prisma` → `provider = "postgresql"` yapın

## 📝 Hızlı Düzeltme

1. `prisma/schema.prisma` → `postgresql` yapın
2. GitHub'a push edin
3. Vercel otomatik redeploy yapar
4. Vercel Postgres'in oluşturulduğundan emin olun
5. Environment variables kontrol edin
