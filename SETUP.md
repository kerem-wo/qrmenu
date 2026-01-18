# Kurulum Talimatları

## 1. .env Dosyası Oluşturun

### Otomatik Oluşturma (Önerilen)

Secret key otomatik oluşturulur ve `.env` dosyasına eklenir:

```bash
npm run setup-env
```

veya

```bash
node setup-env.js
```

Bu komut otomatik olarak:
- ✅ Secret key oluşturur
- ✅ `.env` dosyasını oluşturur
- ✅ Tüm gerekli değişkenleri ekler

### Manuel Oluşturma

Eğer manuel oluşturmak isterseniz, proje kök dizininde `.env` dosyası oluşturun:

```
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="buraya-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

Secret key oluşturmak için:
```bash
npm run generate-secret
```

## 2. Bağımlılıkları Yükleyin

```bash
npm install
```

## 3. Veritabanını Hazırlayın

```bash
npx prisma generate
npx prisma db push
```

## 4. Demo Verileri Yükleyin (Opsiyonel)

```bash
npm run db:seed
```

Bu komut şunları oluşturur:
- Demo restoran: `demo-restoran`
- Admin kullanıcı: `admin@demo.com` / `admin123`
- Örnek kategoriler ve ürünler

## 5. Sunucuyu Başlatın

```bash
npm run dev
```

## 6. Tarayıcıda Açın

- Ana sayfa: http://localhost:3000
- Admin giriş: http://localhost:3000/admin/login
- Demo menü: http://localhost:3000/menu/demo-restoran

## Sorun Giderme

### Veritabanı Hatası
Eğer veritabanı hatası alıyorsanız:
```bash
npx prisma generate
npx prisma db push --force-reset
npm run db:seed
```

### Port Zaten Kullanılıyor
Farklı bir port kullanmak için:
```bash
PORT=3001 npm run dev
```

### Prisma Client Hatası
```bash
rm -rf node_modules/.prisma
npx prisma generate
```
