# 🗄️ Vercel Veritabanı Kurulumu

## Sorun

401 ve 500 hataları alınıyor. Bu genellikle veritabanı şemasının güncellenmemiş olmasından kaynaklanır.

## Çözüm: Veritabanı Şemasını Güncelleme

### Adım 1: Environment Variables'ı Çekin

```bash
vercel env pull .env.local
```

### Adım 2: DATABASE_URL'i Kontrol Edin

`.env.local` dosyasını açın ve `DATABASE_URL` değerini kontrol edin:

```bash
type .env.local | findstr DATABASE_URL
```

**Önemli:** `DATABASE_URL` mutlaka `postgres://` veya `postgresql://` ile başlamalı!

### Adım 3: Veritabanı Şemasını Güncelleyin

```bash
npx prisma db push
```

Bu komut:
- ✅ Yeni tabloları oluşturur (Campaign, Customer, ProductVariant, OrderItemVariant)
- ✅ Mevcut tablolara yeni kolonlar ekler (stock, orderNumber, discount, vb.)
- ✅ İlişkileri günceller

### Adım 4: Seed Verilerini Yükleyin (Opsiyonel)

Eğer demo veriler yoksa:

```bash
npm run db:seed
```

Bu komut:
- ✅ Demo restoran oluşturur
- ✅ Admin kullanıcı oluşturur (`admin@demo.com` / `admin123`)
- ✅ Örnek kategoriler ve ürünler ekler

## Test

1. Admin panel: `https://your-site.vercel.app/admin/login`
2. Giriş bilgileri:
   - Email: `admin@demo.com`
   - Şifre: `admin123`

## Sorun Devam Ederse

### Hata: "DATABASE_URL must start with postgres://"

**Çözüm:**
1. Vercel Dashboard → Settings → Environment Variables
2. `DATABASE_URL` değerini kontrol edin
3. PostgreSQL URL'i olmalı: `postgres://user:password@host:port/database`
4. Eğer Prisma Accelerate URL'i varsa, PostgreSQL URL'ine değiştirin

### Hata: "Table does not exist"

**Çözüm:**
```bash
npx prisma db push
```

### Hata: "Prisma Client not found"

**Çözüm:**
```bash
npx prisma generate
```

## Özet Komutlar

```bash
# 1. Environment variables'ı çek
vercel env pull .env.local

# 2. DATABASE_URL'i kontrol et
type .env.local | findstr DATABASE_URL

# 3. Veritabanı şemasını güncelle
npx prisma db push

# 4. (Opsiyonel) Demo verileri yükle
npm run db:seed
```
