# 🔄 Vercel Veritabanı Migration Rehberi

## Sorun
`resetToken` ve `resetTokenExpiry` alanları Prisma schema'da tanımlı ama veritabanında yok. Bu yüzden şifre sıfırlama özelliği çalışmıyor.

## Çözüm: Veritabanı Migration

### Yöntem 1: Vercel CLI ile (Önerilen) ⭐

1. **Vercel CLI'yi yükleyin** (eğer yoksa):
   ```bash
   npm install -g vercel
   ```

2. **Vercel'e giriş yapın**:
   ```bash
   vercel login
   ```

3. **Environment variables'ı çekin**:
   ```bash
   cd "c:\Users\kerem\Desktop\QR MENÜ"
   vercel env pull .env.local
   ```
   Bu komut Vercel'deki tüm environment variables'ı `.env.local` dosyasına indirir.

4. **Veritabanı migration'ını çalıştırın**:
   ```bash
   npx prisma db push
   ```
   
   Veya migration script'i kullanın:
   ```bash
   node scripts/migrate-db.js
   ```

5. **Değişiklikleri kontrol edin**:
   ```bash
   npx prisma studio
   ```
   Bu komut Prisma Studio'yu açar ve Admin tablosunda `resetToken` ve `resetTokenExpiry` alanlarının eklendiğini görebilirsiniz.

### Yöntem 2: Vercel Dashboard'dan

1. **Vercel Dashboard'a gidin**: https://vercel.com/dashboard
2. **Projenizi seçin**: `qrmenu`
3. **Settings → Environment Variables** bölümüne gidin
4. **DATABASE_URL** değişkenini kopyalayın
5. **Lokal .env.local dosyanıza ekleyin**:
   ```env
   DATABASE_URL="postgresql://..."
   ```
6. **Migration'ı çalıştırın**:
   ```bash
   npx prisma db push
   ```

### Yöntem 3: Vercel Postgres Dashboard'dan (Eğer Vercel Postgres kullanıyorsanız)

1. **Vercel Dashboard → Storage → Postgres** bölümüne gidin
2. **"Open in Prisma Data Platform"** veya **"Query"** butonuna tıklayın
3. **SQL Editor'de şu komutu çalıştırın**:
   ```sql
   ALTER TABLE "Admin" 
   ADD COLUMN IF NOT EXISTS "resetToken" TEXT UNIQUE,
   ADD COLUMN IF NOT EXISTS "resetTokenExpiry" TIMESTAMP;
   ```

## ✅ Migration Sonrası Kontrol

Migration başarılı olduktan sonra:

1. **API'yi test edin**:
   - `/admin/forgot-password` sayfasına gidin
   - E-posta adresinizi girin
   - Artık 500 hatası almamalısınız

2. **Prisma Studio ile kontrol edin**:
   ```bash
   npx prisma studio
   ```
   Admin tablosunda `resetToken` ve `resetTokenExpiry` sütunlarını görebilmelisiniz.

## 🔍 Sorun Giderme

### "DATABASE_URL not found" hatası
- `.env.local` dosyasının proje kök dizininde olduğundan emin olun
- `vercel env pull .env.local` komutunu tekrar çalıştırın

### "Connection refused" hatası
- DATABASE_URL'in doğru olduğundan emin olun
- Vercel Postgres database'inin aktif olduğunu kontrol edin

### "Permission denied" hatası
- Vercel'de database erişim izinlerinizi kontrol edin
- Database'in public access'e açık olduğundan emin olun

## 📝 Notlar

- `prisma db push` komutu schema'yı veritabanına senkronize eder
- Bu komut mevcut verileri silmez, sadece yeni alanlar ekler
- Production veritabanında dikkatli olun!
