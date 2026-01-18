# 🚨 Vercel 500 Hatası Çözümü

## Sorun: `/api/admin/login` 500 hatası

Bu hata genellikle şu nedenlerden kaynaklanır:

### ✅ ÇÖZÜLDÜ: Prisma Schema PostgreSQL'e Geçirildi

`prisma/schema.prisma` dosyası artık PostgreSQL kullanıyor:
```prisma
datasource db {
  provider = "postgresql"  // ✅ Düzeltildi!
  url      = env("DATABASE_URL")
}
```

## 🔧 Yapılması Gerekenler

### 1. GitHub'a Push Edin

```bash
git add .
git commit -m "Switch to PostgreSQL for Vercel"
git push origin main
```

### 2. Vercel Postgres Oluşturun

Vercel dashboard → Storage → "Create Database" → "Postgres" → "Create"

**Vercel otomatik olarak `DATABASE_URL` ekler!**

### 3. Environment Variables Kontrolü

Vercel dashboard → Settings → Environment Variables:

✅ `DATABASE_URL` - Vercel Postgres'ten otomatik eklenmiş olmalı
✅ `NEXTAUTH_SECRET` - Ekleyin (npm run generate-secret ile oluşturun)
✅ `NEXTAUTH_URL` - Vercel domain'iniz (https://your-project.vercel.app)

### 4. Database Migration (İlk Deploy'dan Sonra)

Vercel deploy olduktan sonra, Vercel dashboard'dan:

**Seçenek 1: Vercel CLI ile**
```bash
npx vercel env pull .env.local
npx prisma db push
```

**Seçenek 2: Vercel Dashboard'dan**
- Deployments → En son deployment → "Redeploy"

**Seçenek 3: Vercel Function Logs'tan**
- Deployments → En son deployment → "View Function Logs"
- Hata varsa görebilirsiniz

## 🔍 Hata Loglarını Kontrol

Vercel dashboard → Deployments → En son deployment → "View Function Logs"

Burada gerçek hata mesajını görebilirsiniz.

## 📞 Yaygın Hata Mesajları

### "Prisma Client not initialized"
→ Build command'a `prisma generate` eklenmiş ✅

### "Can't reach database server"
→ Vercel Postgres oluşturulmamış veya `DATABASE_URL` yanlış

### "Table does not exist"
→ Database migration yapılmamış: `npx prisma db push`

### "Invalid DATABASE_URL"
→ Vercel Postgres oluşturulmamış

## ✅ Favicon Hatası (404)

Favicon hatası kritik değil ama düzeltildi:
- `app/icon.svg` dosyası eklendi
- Next.js otomatik olarak favicon olarak kullanır

## 🎯 Hızlı Kontrol Listesi

- [x] Prisma schema PostgreSQL'e geçirildi
- [ ] GitHub'a push edildi
- [ ] Vercel Postgres oluşturuldu
- [ ] Environment variables eklendi
- [ ] Database migration yapıldı (`prisma db push`)
- [ ] Site test edildi

## 💡 İpucu

Vercel'de ilk deploy'dan sonra mutlaka `prisma db push` çalıştırın veya Vercel dashboard'dan "Redeploy" yapın. Bu, database tablolarını oluşturur.
