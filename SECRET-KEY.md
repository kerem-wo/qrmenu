# 🔐 Secret Key Nasıl Oluşturulur?

Secret key, uygulamanızın güvenliği için kullanılan rastgele bir string'dir. İşte kolay yöntemler:

## 🚀 Hızlı Yöntemler

### Yöntem 1: Otomatik Script (Önerilen)
```bash
npm run generate-secret
```
veya
```bash
node generate-secret.js
```

Bu komut size otomatik olarak güvenli bir secret key oluşturur.

### Yöntem 2: Node.js Komutu
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Yöntem 3: Online Generator
Herhangi bir online random string generator kullanabilirsiniz:
- https://generate-secret.vercel.app/32
- En az 32 karakter uzunluğunda olmalı

### Yöntem 4: Manuel (Geliştirme için)
Geliştirme ortamı için basit bir string de kullanabilirsiniz:
```
NEXTAUTH_SECRET="dev-secret-key-12345"
```

**⚠️ UYARI:** Production (canlı) ortamda mutlaka güçlü bir secret key kullanın!

## 📝 .env Dosyasına Ekleme

Oluşturduğunuz secret key'i `.env` dosyasına şu şekilde ekleyin:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="buraya-secret-key-inizi-yapıştırın"
NEXTAUTH_URL="http://localhost:3000"
```

## ✅ Kontrol

Secret key'in doğru eklendiğini kontrol etmek için:
```bash
# Windows
type .env

# Mac/Linux
cat .env
```

.env dosyasında `NEXTAUTH_SECRET=` satırının yanında uzun bir string görmelisiniz.

## 🔒 Güvenlik İpuçları

1. ✅ Secret key'i asla Git'e commit etmeyin (.env dosyası zaten .gitignore'da)
2. ✅ Her ortam için farklı secret key kullanın (dev, staging, production)
3. ✅ Production'da en az 64 karakter uzunluğunda key kullanın
4. ✅ Secret key'i düzenli olarak değiştirin

## 💡 Örnek Secret Key Formatı

```
aB3dEf5gHi6jKl8mNo9pQr2sTu4vWx7yZ0+1AbCdEfGhIjKlMnOpQrStUvWxYz==
```

Bu tür rastgele karakterlerden oluşan uzun bir string olmalı.
