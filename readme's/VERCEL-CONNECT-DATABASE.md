# 🔗 Vercel Database'i Projeye Bağlama

## ❌ Sorun:
`vercel env pull` çalıştırıldığında `DATABASE_URL` silindi. Bu, database'in henüz projeye bağlanmadığı anlamına geliyor.

## ✅ Çözüm: Database'i Projeye Bağlayın

### Yöntem 1: Vercel Dashboard'dan (ÖNERİLEN)

1. Vercel dashboard'da database sayfasında (şu anda olduğunuz sayfa)
2. Sağ üstte **"Connect Project"** butonuna tıklayın
3. Açılan modal'da:
   - **Project:** "qrmenu" seçin
   - **Environments:** Development, Preview, Production (hepsini seçin)
   - **Custom Prefix:** BOŞ BIRAKIN (böylece `DATABASE_URL` oluşturulur)
4. **"Connect"** butonuna tıklayın
5. ⏳ Birkaç saniye bekleyin

### Yöntem 2: Manuel Environment Variable Ekleme

1. Vercel dashboard → Projeniz ("qrmenu") → **"Settings"** → **"Environment Variables"**
2. **"Add New"** butonuna tıklayın
3. Şu bilgileri girin:
   - **Name:** `DATABASE_URL`
   - **Value:** Database sayfasındaki `DATABASE_URL` değerini kopyalayın (Copy Snippet butonu ile)
   - **Environments:** Development, Preview, Production (hepsini seçin)
4. **"Add"** butonuna tıklayın

### Adım 3: Environment Variables'ı Tekrar Çekin

Terminal'de:

```bash
vercel env pull .env.local
```

Artık `DATABASE_URL` görünmeli!

### Adım 4: Database Tablolarını Oluşturun

```bash
npx prisma db push
```

Artık çalışmalı! ✅

## 🎯 Hızlı Kontrol

`.env.local` dosyasını açın ve `DATABASE_URL` satırının olduğundan emin olun:

```
DATABASE_URL="postgres://..."
```

## 💡 İpucu

"Connect Project" butonu database'i projeye bağlar ve otomatik olarak `DATABASE_URL` environment variable'ını oluşturur. Bu en kolay yöntemdir!
