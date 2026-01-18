# 🚀 Vercel'e Yükleme - SQL Bilgisi Gerektirmez!

## ✅ Vercel Kullanırsanız SQL Bilgisi GEREKMEZ!

Vercel otomatik olarak PostgreSQL sağlar ve sizin hiçbir şey yapmanıza gerek yok!

## 📋 Adım Adım Vercel Deployment

### 1. GitHub'a Yükleyin

```bash
# Git repository oluşturun (eğer yoksa)
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/kullaniciadi/qr-menu.git
git push -u origin main
```

### 2. Vercel'e Giriş Yapın

1. https://vercel.com adresine gidin
2. "Sign Up" ile GitHub hesabınızla giriş yapın
3. "Add New Project" tıklayın

### 3. Projeyi Bağlayın

1. GitHub repository'nizi seçin
2. "Import" tıklayın

### 4. Vercel Postgres Ekleyin (OTOMATİK!)

1. Vercel dashboard'da projenize gidin
2. "Storage" sekmesine tıklayın
3. "Create Database" → "Postgres" seçin
4. "Create" tıklayın

**Vercel otomatik olarak:**
- ✅ PostgreSQL oluşturur
- ✅ `DATABASE_URL` environment variable'ı ekler
- ✅ Bağlantıyı yapar

### 5. Environment Variables Ekleyin

Vercel dashboard'da "Settings" → "Environment Variables":

```
NEXTAUTH_SECRET = (otomatik oluşturulan secret key)
NEXTAUTH_URL = https://your-project.vercel.app
NODE_ENV = production
```

Secret key oluşturmak için:
```bash
npm run generate-secret
```

### 6. Prisma Schema'yı Güncelleyin

`prisma/schema.prisma` dosyasında sadece şunu değiştirin:

```prisma
datasource db {
  provider = "postgresql"  // SQLite yerine PostgreSQL
  url      = env("DATABASE_URL")
}
```

### 7. Build Settings (Vercel Otomatik Yapar)

Vercel otomatik olarak:
- ✅ `npm install` çalıştırır
- ✅ `prisma generate` çalıştırır
- ✅ `npm run build` çalıştırır
- ✅ Deploy eder

### 8. Migration (İlk Deploy'dan Sonra)

Vercel deploy olduktan sonra, terminalde:

```bash
# Vercel CLI ile (opsiyonel)
npx vercel env pull .env.local
npx prisma migrate deploy
```

VEYA Vercel dashboard'dan "Deployments" → En son deployment → "Redeploy"

## 🎉 Hazır!

Artık siteniz canlıda! Vercel otomatik olarak:
- ✅ PostgreSQL sağlar
- ✅ SSL ekler (HTTPS)
- ✅ Domain verir
- ✅ Her push'ta otomatik deploy yapar

## 📝 Özet

1. GitHub'a push edin
2. Vercel'e bağlayın
3. Vercel Postgres ekleyin (1 tık)
4. Environment variables ekleyin
5. `schema.prisma`'da `postgresql` yapın
6. Deploy!

**SQL bilgisi gerektirmez - Vercel her şeyi otomatik yapar!**
