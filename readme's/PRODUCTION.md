# 🚀 Production Deployment Rehberi

## ⚠️ ÖNEMLİ: Production'a Yüklemeden Önce

### 1. Veritabanı Değişikliği GEREKLİ

**SQLite production için uygun değil!** PostgreSQL veya MySQL kullanmalısınız.

#### Prisma Schema Güncelleme

`prisma/schema.prisma` dosyasını güncelleyin:

```prisma
datasource db {
  provider = "postgresql"  // SQLite yerine PostgreSQL
  url      = env("DATABASE_URL")
}
```

veya MySQL için:

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

### 2. Environment Variables (Production)

Production ortamında `.env` dosyası:

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
NEXTAUTH_SECRET="güçlü-production-secret-key-en-az-64-karakter"
NEXTAUTH_URL="https://yourdomain.com"
NODE_ENV="production"
```

### 3. Build Kontrolü

Production build'i test edin:

```bash
npm run build
```

Eğer build hatası varsa düzeltin.

### 4. Deployment Platformları

#### Vercel (Önerilen)
- ✅ Otomatik PostgreSQL desteği
- ✅ Environment variables kolay yönetim
- ✅ Otomatik SSL
- ✅ Kolay deployment

#### Railway
- ✅ PostgreSQL desteği
- ✅ Kolay kurulum

#### DigitalOcean App Platform
- ✅ Managed database
- ✅ Kolay scaling

### 5. Production Checklist

- [ ] Veritabanı PostgreSQL/MySQL'e geçirildi
- [ ] `prisma generate` çalıştırıldı
- [ ] `prisma migrate deploy` çalıştırıldı (production migration)
- [ ] Environment variables ayarlandı
- [ ] Secret key güçlü ve güvenli
- [ ] `npm run build` başarılı
- [ ] SSL sertifikası aktif
- [ ] Domain ayarlandı
- [ ] Admin hesabı oluşturuldu

## 🔧 Production Kurulum Adımları

### Adım 1: Veritabanı Hazırlama

```bash
# PostgreSQL için
DATABASE_URL="postgresql://user:pass@host:5432/db" npx prisma generate
DATABASE_URL="postgresql://user:pass@host:5432/db" npx prisma migrate deploy
```

### Adım 2: Build

```bash
npm run build
```

### Adım 3: Environment Variables

Platform'unuzda (Vercel, Railway, vs.) şu değişkenleri ayarlayın:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `NODE_ENV=production`

### Adım 4: Deploy

Platform'unuzun deployment talimatlarını takip edin.

## 🐛 Potansiyel Sorunlar ve Çözümleri

### Sorun 1: SQLite Hatası
**Hata:** `SQLite can't be used in production`
**Çözüm:** PostgreSQL veya MySQL'e geçin

### Sorun 2: Cookie Secure Flag
**Hata:** Cookies çalışmıyor
**Çözüm:** `NEXTAUTH_URL` HTTPS olmalı, kod zaten doğru

### Sorun 3: Database Connection
**Hata:** Veritabanı bağlantı hatası
**Çözüm:** `DATABASE_URL` formatını kontrol edin

### Sorun 4: Build Hatası
**Hata:** TypeScript veya import hataları
**Çözüm:** `npm run build` çalıştırıp hataları düzeltin

## 📝 Vercel Deployment (Önerilen)

1. GitHub'a push edin
2. Vercel'e bağlayın
3. Environment variables ekleyin:
   - `DATABASE_URL` (Vercel Postgres)
   - `NEXTAUTH_SECRET` (güçlü key)
   - `NEXTAUTH_URL` (vercel domain)
4. Deploy edin

Vercel otomatik olarak:
- ✅ Build yapar
- ✅ PostgreSQL sağlar
- ✅ SSL ekler
- ✅ Domain verir

## 🔒 Güvenlik Kontrol Listesi

- [ ] Secret key güçlü (64+ karakter)
- [ ] HTTPS aktif
- [ ] Environment variables güvenli
- [ ] Admin şifreleri güçlü
- [ ] Database credentials güvenli
- [ ] `.env` dosyası Git'e commit edilmedi

## 📊 Performance İpuçları

- ✅ Production build kullanın (`npm run build`)
- ✅ Database connection pooling aktif
- ✅ Image optimization aktif (Next.js Image)
- ✅ Static assets CDN'de

## 🆘 Destek

Sorun yaşarsanız:
1. Build loglarını kontrol edin
2. Runtime loglarını kontrol edin
3. Database connection'ı test edin
4. Environment variables'ı kontrol edin
