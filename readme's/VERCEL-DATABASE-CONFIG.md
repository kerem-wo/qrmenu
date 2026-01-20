# 🔧 Vercel Database Configuration - Hata Çözümü

## ❌ Sorun:
Vercel modal'ında:
- Custom Prefix: "STORAGE" yazılmış → Bu `STORAGE_URL` oluşturur
- Hata: "POSTGRES_URL already exists"
- Prisma `DATABASE_URL` bekliyor!

## ✅ Çözüm:

### Adım 1: Custom Prefix'i Boş Bırakın

1. Vercel modal'ında **"Custom Prefix"** alanını **BOŞ BIRAKIN**
2. "STORAGE" yazısını silin
3. Alan tamamen boş olmalı

**Neden?** Custom Prefix boş olursa, Vercel otomatik olarak `DATABASE_URL` oluşturur (Prisma'nın beklediği isim).

### Adım 2: Mevcut POSTGRES_URL'i Silin (Gerekirse)

Eğer hata devam ederse:

1. Vercel dashboard → **"Settings"** → **"Environment Variables"**
2. `POSTGRES_URL` değişkenini bulun
3. Yanındaki **"..."** menüsüne tıklayın
4. **"Delete"** seçin

### Adım 3: Database'i Bağlayın

1. Custom Prefix boş olduğundan emin olun
2. Environments: **Development, Preview, Production** (hepsini seçin)
3. **"Connect"** butonuna tıklayın

### Adım 4: Environment Variables'ı Tekrar Çekin

Terminal'de:

```bash
vercel env pull .env.local
```

### Adım 5: Database Tablolarını Oluşturun

```bash
npx prisma db push
```

Artık çalışmalı! ✅

## 🎯 Özet:

**Custom Prefix = BOŞ** → Vercel `DATABASE_URL` oluşturur → Prisma çalışır! ✅

**Custom Prefix = "STORAGE"** → Vercel `STORAGE_URL` oluşturur → Prisma çalışmaz! ❌

## 💡 İpucu:

Vercel Postgres bağlandıktan sonra, Environment Variables'da şunları görmelisiniz:
- ✅ `DATABASE_URL` (otomatik oluşturulur)
- ✅ `POSTGRES_URL` (bazen de oluşturulur, ama Prisma `DATABASE_URL` kullanır)
