# 🚀 QR Menü Sistemi - Hızlı Kurulum

## ⚡ Otomatik Kurulum (Windows)

1. **setup.bat** dosyasını çalıştırın:
   ```bash
   setup.bat
   ```

Bu script otomatik olarak:
- ✅ Bağımlılıkları yükler
- ✅ .env dosyası oluşturur
- ✅ Prisma client'ı generate eder
- ✅ Veritabanını hazırlar
- ✅ Demo verileri yükler

## 📝 Manuel Kurulum

### 1. .env Dosyası Oluşturun

Proje kök dizininde `.env` dosyası oluşturun:

**Yöntem 1: Otomatik Secret Key Oluşturma**
```bash
node generate-secret.js
```
Bu komut size bir secret key verecek, onu kopyalayın.

**Yöntem 2: Manuel Oluşturma**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Sonra `.env` dosyasını oluşturun:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="buraya-oluşturduğunuz-secret-key-i-yapıştırın"
NEXTAUTH_URL="http://localhost:3000"
```

**Not:** Secret key herhangi bir uzun rastgele string olabilir. Güvenlik için en az 32 karakter önerilir.

### 2. Komutları Sırayla Çalıştırın

```bash
# Bağımlılıkları yükle
npm install

# Prisma client oluştur
npx prisma generate

# Veritabanını hazırla
npx prisma db push

# Demo verileri yükle (opsiyonel)
npm run db:seed

# Sunucuyu başlat
npm run dev
```

## 🎯 Kullanım

### Admin Paneli
- URL: http://localhost:3000/admin/login
- E-posta: `admin@demo.com`
- Şifre: `admin123`

### Demo Menü
- URL: http://localhost:3000/menu/demo-restoran

## ❗ Sorun Giderme

### "Prisma Client not found" hatası
```bash
npx prisma generate
```

### "Database not found" hatası
```bash
npx prisma db push
```

### Port 3000 kullanılıyor
```bash
# Farklı port kullan
PORT=3001 npm run dev
```

### Veritabanı sıfırlama
```bash
npx prisma db push --force-reset
npm run db:seed
```

## 📞 Destek

Sorun yaşıyorsanız:
1. Terminal çıktısını kontrol edin
2. Browser console'u kontrol edin
3. .env dosyasının doğru oluşturulduğundan emin olun
