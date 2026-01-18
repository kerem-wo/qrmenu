# 🚀 Vercel'e Güncellenmiş Projeyi Deploy Etme

## 📋 Ön Hazırlık

### 1. Değişiklikleri Git'e Commit Edin

```bash
git add .
git commit -m "Yeni özellikler eklendi: Stok takibi, kampanyalar, analitik, sipariş takibi"
git push origin main
```

### 2. Vercel Dashboard'a Gidin

1. https://vercel.com adresine gidin
2. Projenizi seçin (qrmenu)
3. Settings > Environment Variables bölümüne gidin

## 🔧 Vercel Environment Variables Kontrolü

Vercel Dashboard'da şu değişkenlerin olduğundan emin olun:

### Gerekli Environment Variables:

```
DATABASE_URL=postgres://... (PostgreSQL connection string)
NEXTAUTH_SECRET=... (Rastgele secret key)
NEXTAUTH_URL=https://your-site.vercel.app
```

**Önemli:** `DATABASE_URL` mutlaka `postgres://` veya `postgresql://` ile başlamalı!

## 🗄️ Veritabanı Güncellemesi

### Yöntem 1: Vercel Dashboard'dan (Önerilen)

1. Vercel Dashboard > Projeniz > Settings > Environment Variables
2. `DATABASE_URL` değerini kontrol edin (PostgreSQL olmalı)
3. Deployments sekmesine gidin
4. En son deployment'ın yanındaki "..." menüsünden "Redeploy" seçin

### Yöntem 2: Terminalden (Manuel)

```bash
# Vercel'e giriş yapın
vercel login

# Environment variables'ı çekin
vercel env pull .env.local

# DATABASE_URL'i kontrol edin
type .env.local | findstr DATABASE_URL

# Eğer Prisma Accelerate URL'i varsa, Vercel Dashboard'dan düzeltin
# Sonra tekrar çekin:
vercel env pull .env.local

# Veritabanı şemasını güncelleyin
npx prisma db push

# Production'a deploy edin
vercel --prod
```

## 🔄 Otomatik Deploy (Git Push ile)

GitHub'a push yaptığınızda Vercel otomatik deploy eder:

```bash
git add .
git commit -m "Yeni özellikler eklendi"
git push origin main
```

Vercel otomatik olarak:
1. ✅ Kodunuzu çeker
2. ✅ `npm install` çalıştırır
3. ✅ `prisma generate` çalıştırır (vercel.json'dan)
4. ✅ `next build` çalıştırır
5. ✅ Deploy eder

**Ancak:** Veritabanı şeması güncellemesi için manuel `prisma db push` gerekebilir!

## 📊 Veritabanı Şeması Güncellemesi

Yeni özellikler için veritabanı şeması güncellendi. Şunları yapın:

### Vercel Dashboard'dan:

1. **Deployments** sekmesine gidin
2. En son deployment'ı bulun
3. **"..."** menüsünden **"Redeploy"** seçin
4. **"Use existing Build Cache"** seçeneğini kapatın
5. Deploy edin

### Terminalden (Alternatif):

```bash
# Vercel CLI ile
vercel --prod

# Veya Vercel Dashboard'dan "Redeploy" butonuna tıklayın
```

### Veritabanı Tablolarını Oluşturma:

Deploy sonrası, Vercel'deki deployment loglarını kontrol edin. Eğer veritabanı hatası varsa:

**Çözüm:** Vercel Dashboard > Projeniz > Settings > Environment Variables'da `DATABASE_URL`'i kontrol edin ve PostgreSQL URL'i olduğundan emin olun.

Sonra terminalden:

```bash
# Environment variables'ı çekin
vercel env pull .env.local

# Veritabanı şemasını güncelleyin
npx prisma db push
```

## ✅ Deploy Sonrası Kontroller

1. **Site çalışıyor mu?**
   - Ana sayfa: `https://your-site.vercel.app`
   - Admin panel: `https://your-site.vercel.app/admin/login`

2. **Admin giriş yapabiliyor musunuz?**
   - Email: `admin@demo.com`
   - Şifre: `admin123`

3. **Veritabanı bağlantısı çalışıyor mu?**
   - Admin panelde ürünler görünüyor mu?
   - Yeni ürün ekleyebiliyor musunuz?

4. **Yeni özellikler çalışıyor mu?**
   - `/admin/analytics` sayfası açılıyor mu?
   - `/admin/campaigns` sayfası açılıyor mu?
   - Menü sayfasında arama/filtreleme çalışıyor mu?

## 🐛 Sorun Giderme

### Hata: "Prisma schema validation - P1012"

**Sebep:** `DATABASE_URL` Prisma Accelerate URL'i veya yanlış format.

**Çözüm:**
1. Vercel Dashboard > Settings > Environment Variables
2. `DATABASE_URL` değerini kontrol edin
3. PostgreSQL URL'i olmalı: `postgres://user:password@host:port/database`
4. Eğer Prisma Accelerate URL'i varsa, PostgreSQL URL'ine değiştirin

### Hata: "Table does not exist"

**Sebep:** Veritabanı şeması güncellenmemiş.

**Çözüm:**
```bash
vercel env pull .env.local
npx prisma db push
```

### Hata: "Build failed"

**Sebep:** Yeni paketler eksik veya build hatası.

**Çözüm:**
1. Local'de test edin: `npm run build`
2. Hataları düzeltin
3. Tekrar push edin: `git push origin main`

## 📝 Özet Adımlar

1. ✅ Git'e commit ve push yapın
2. ✅ Vercel Dashboard'da `DATABASE_URL` kontrolü yapın
3. ✅ Otomatik deploy bekleyin veya manuel redeploy yapın
4. ✅ Deploy sonrası veritabanı şemasını güncelleyin (`npx prisma db push`)
5. ✅ Siteyi test edin

## 🎉 Başarılı Deploy Sonrası

- ✅ Site URL: Vercel Dashboard'da görebilirsiniz
- ✅ Admin Panel: `https://your-site.vercel.app/admin/login`
- ✅ Demo Menü: `https://your-site.vercel.app/menu/demo-restoran`

**Not:** İlk deploy'dan sonra seed verilerini yüklemek için Vercel Dashboard'dan "Functions" sekmesine gidip bir API endpoint'i çağırabilirsiniz veya local'den seed çalıştırıp veritabanına bağlanabilirsiniz.
