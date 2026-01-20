# 🔧 Vercel Database URL Hatası Çözümü

## ❌ Sorun:
`.env.local` dosyasında Prisma Accelerate URL'i var, ama normal PostgreSQL URL'ine ihtiyacımız var.

## ✅ Çözüm:

### Adım 1: Vercel Dashboard'da DATABASE_URL'i Kontrol Edin

1. Tarayıcıda şu adrese gidin:
   ```
   https://vercel.com/qrmenus-projects-922d4361/qrmenu
   ```

2. **"Settings"** sekmesine tıklayın

3. Sol menüden **"Environment Variables"** seçin

4. **`DATABASE_URL`** değişkenini bulun

5. Değerini kontrol edin - şöyle görünmeli:
   ```
   postgresql://user:password@host:5432/dbname
   ```
   VEYA
   ```
   postgres://user:password@host:5432/dbname
   ```

### Adım 2: Vercel Postgres Oluşturun (Eğer Yoksa)

Eğer `DATABASE_URL` yoksa veya yanlışsa:

1. Proje sayfasında **"Storage"** sekmesine tıklayın

2. **"Create Database"** → **"Postgres"** → **"Create"**

3. ⏳ 1-2 dakika bekleyin

4. ✅ Vercel otomatik olarak `DATABASE_URL` ekler

### Adım 3: Environment Variables'ı Tekrar Çekin

Terminal'de:

```bash
vercel env pull .env.local
```

Bu komut Vercel'den güncel `DATABASE_URL`'i çeker.

### Adım 4: DATABASE_URL'i Kontrol Edin

`.env.local` dosyasını açın ve `DATABASE_URL` şöyle görünmeli:

```
DATABASE_URL="postgresql://user:password@host:5432/dbname"
```

VEYA

```
DATABASE_URL="postgres://user:password@host:5432/dbname"
```

**NOT:** `postgres://` veya `postgresql://` ile başlamalı, `db.prisma.io` ile değil!

### Adım 5: Database Tablolarını Oluşturun

```bash
npx prisma db push
```

Artık çalışmalı! ✅

## 🎯 Hızlı Kontrol

Terminal'de şu komutu çalıştırın:

```bash
vercel env pull .env.local
```

Sonra `.env.local` dosyasını açın ve `DATABASE_URL`'in `postgresql://` veya `postgres://` ile başladığından emin olun.

## 💡 İpucu

Eğer hala Prisma Accelerate URL'i görüyorsanız, Vercel dashboard'dan `DATABASE_URL`'i silin ve Vercel Postgres'i yeniden oluşturun.
