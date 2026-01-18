# 🚀 Production Deployment - Hızlı Rehber

## ⚠️ KRİTİK: SQLite Production'da Çalışmaz!

**Şu anda SQLite kullanıyorsunuz - Production'a yüklemeden önce PostgreSQL veya MySQL'e geçmelisiniz!**

## 🎯 SQL Bilgisi Gerektirmeyen Çözüm: Vercel

**Vercel kullanırsanız SQL bilgisi gerektirmez!** Vercel otomatik PostgreSQL sağlar.

**Detaylı rehber için `KURULUM-SQL-YOK.md` dosyasına bakın.**

## 🎯 Hızlı Production Kurulumu

### 1. Veritabanını Değiştirin

`prisma/schema.prisma` dosyasında:

```prisma
datasource db {
  provider = "postgresql"  // SQLite yerine PostgreSQL
  url      = env("DATABASE_URL")
}
```

### 2. Production Build Test

```bash
npm run build
```

Eğer hata varsa düzeltin.

### 3. Environment Variables

Production ortamında:

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
NEXTAUTH_SECRET="güçlü-64-karakter-secret-key"
NEXTAUTH_URL="https://yourdomain.com"
NODE_ENV="production"
```

### 4. Migration

```bash
npx prisma generate
npx prisma migrate deploy
```

## 📋 Production Checklist

- [ ] **SQLite → PostgreSQL/MySQL geçişi yapıldı**
- [ ] `npm run build` başarılı
- [ ] Environment variables ayarlandı
- [ ] Database migration yapıldı
- [ ] Secret key güçlü (64+ karakter)
- [ ] HTTPS aktif
- [ ] Domain ayarlandı

## 🚨 Yüklemeden Önce Mutlaka Yapın

1. **Veritabanı değiştirin** (SQLite → PostgreSQL)
2. **Build test edin** (`npm run build`)
3. **Environment variables ayarlayın**
4. **Migration çalıştırın**

## 💡 Vercel Deployment (En Kolay)

1. GitHub'a push
2. Vercel'e bağla
3. Vercel Postgres ekle (otomatik `DATABASE_URL`)
4. Environment variables ekle
5. Deploy!

Vercel otomatik olarak PostgreSQL sağlar ve SSL ekler.

## ❌ Şu Anda Yüklerseniz Alacağınız Hatalar

1. **SQLite hatası** - Production'da SQLite çalışmaz
2. **Cookie hatası** - HTTPS olmadan secure cookies çalışmaz
3. **Database connection** - SQLite file-based, production'da sorunlu

## ✅ Production'a Hazır Hale Getirmek İçin

1. `prisma/schema.prisma` → PostgreSQL'e geç
2. `npm run build` → Test et
3. Environment variables → Ayarla
4. Deploy → Yükle

**Detaylı rehber için `PRODUCTION.md` dosyasına bakın.**
