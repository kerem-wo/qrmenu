# 🚀 Hızlı Kurulum - Otomatik Secret Key

## ⚡ Tek Komutla Kurulum

### Windows
```bash
setup.bat
```

Bu script otomatik olarak:
- ✅ Bağımlılıkları yükler
- ✅ **Secret key'i otomatik oluşturur ve .env dosyasına ekler**
- ✅ Prisma client'ı generate eder
- ✅ Veritabanını hazırlar
- ✅ Demo verileri yükler

### Manuel Kurulum (Windows/Mac/Linux)

```bash
# 1. Bağımlılıkları yükle
npm install

# 2. .env dosyasını otomatik oluştur (secret key dahil)
npm run setup-env

# 3. Veritabanını hazırla
npx prisma generate
npx prisma db push
npm run db:seed

# 4. Sunucuyu başlat
npm run dev
```

## 📝 Notlar

- **Secret key otomatik oluşturulur** - Elle eklemenize gerek yok!
- `.env` dosyası zaten varsa, mevcut secret key korunur
- Yeni secret key oluşturmak için: `npm run setup-env`

## 🎯 Kullanım

Sunucu başladıktan sonra:
- Admin: http://localhost:3000/admin/login
- Demo hesap: `admin@demo.com` / `admin123`
