# 🎉 Production Hazır!

## ✅ Tamamlanan İşlemler:

- ✅ Vercel'e deploy edildi
- ✅ Database tabloları oluşturuldu
- ✅ Seed data eklendi

## 🌐 Site Bilgileri:

- **Production URL:** https://qrmenu-eight.vercel.app
- **Admin Panel:** https://qrmenu-eight.vercel.app/admin/login

## 🔑 İlk Giriş Bilgileri:

Demo admin hesabı:
- **Email:** `admin@demo.com`
- **Şifre:** `admin123`

**⚠️ ÖNEMLİ:** Production'da mutlaka şifreyi değiştirin!

## 📋 Sonraki Adımlar:

### 1. Siteyi Test Edin

1. Ana sayfayı açın: https://qrmenu-eight.vercel.app
2. Admin panele giriş yapın: https://qrmenu-eight.vercel.app/admin/login
3. Menü sayfasını test edin: https://qrmenu-eight.vercel.app/menu/demo-restoran

### 2. Admin Şifresini Değiştirin

1. Admin panele giriş yapın
2. Settings sayfasına gidin
3. Şifreyi değiştirin (şimdilik manuel olarak database'den değiştirmeniz gerekebilir)

### 3. QR Kod Oluşturun

1. Admin panel → "QR Kod" sekmesine gidin
2. QR kodu indirin
3. Restoranınızda kullanın!

### 4. Ürün ve Kategori Ekleyin

1. Admin panel → "Ürünler" ve "Kategoriler"
2. Kendi ürünlerinizi ekleyin
3. Görselleri ekleyin

## 🔧 Sorun Giderme:

### Site çalışmıyor mu?

1. Vercel dashboard → "Deployments" → En son deployment'ı kontrol edin
2. "View Function Logs" ile hataları kontrol edin
3. Environment Variables'ı kontrol edin:
   - `DATABASE_URL` var mı?
   - `NEXTAUTH_SECRET` var mı?
   - `NEXTAUTH_URL` doğru mu?

### Database hatası mı?

```bash
vercel env pull .env.local
npx prisma db push
```

## 🎯 Önemli Notlar:

1. **Environment Variables:** Vercel dashboard'da Production, Preview ve Development için ayrı ayrı ayarlanmalı
2. **Database:** Vercel Postgres kullanılıyor (Free plan)
3. **Domain:** Vercel otomatik domain verdi: `qrmenu-eight.vercel.app`   
4. **Custom Domain:** İsterseniz kendi domain'inizi ekleyebilirsiniz (Vercel Settings → Domains)

## 📞 Yardım:

Sorun yaşarsanız:
- Vercel dashboard → "Deployments" → "View Function Logs"
- Vercel dashboard → "Settings" → "Environment Variables"

## 🎉 Tebrikler!

QR Menü sisteminiz artık canlıda ve kullanıma hazır!
