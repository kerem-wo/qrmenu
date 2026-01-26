# Güvenlik Kurulum Rehberi

## ÖNEMLİ: İlk Kurulum

Bu uygulama, hassas belgelerin güvenliğini sağlamak için şifreleme kullanmaktadır. **Production'a geçmeden önce mutlaka aşağıdaki adımları tamamlayın.**

## 1. Encryption Key Oluşturma

Güvenli bir encryption key oluşturun (en az 32 karakter):

```bash
# Node.js ile güvenli key oluşturma
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Çıktıyı kopyalayın ve `.env.local` dosyasına ekleyin:

```env
ENCRYPTION_KEY=oluşturduğunuz-64-karakterlik-hex-string
```

## 2. Session Secret (Opsiyonel)

Session imzalama için ayrı bir secret kullanmak isterseniz:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

```env
SESSION_SECRET=oluşturduğunuz-64-karakterlik-hex-string
```

**Not**: Eğer `SESSION_SECRET` belirtmezseniz, `ENCRYPTION_KEY` kullanılacaktır.

## 3. Environment Variables Kontrolü

`.env.local` dosyanızda şunlar olmalı:

```env
# Zorunlu
DATABASE_URL=postgresql://...
ENCRYPTION_KEY=your-64-character-hex-string

# Opsiyonel (session için)
SESSION_SECRET=your-64-character-hex-string

# Diğer değişkenler
PLATFORM_ADMIN_PASSWORD=your-secure-password
```

## 4. Güvenlik Kontrol Listesi

- [ ] `ENCRYPTION_KEY` oluşturuldu ve `.env.local`'e eklendi
- [ ] `.env.local` dosyası `.gitignore`'da (kontrol edin)
- [ ] Production'da HTTPS aktif
- [ ] Database backup'ları şifrelenmiş
- [ ] Access logs izleniyor
- [ ] Regular security updates yapılıyor

## 5. Mevcut Verileri Şifreleme

Eğer uygulamada zaten şifrelenmemiş belgeler varsa, migration script'i çalıştırmanız gerekebilir.

## Uyarılar

⚠️ **ENCRYPTION_KEY değiştirilirse, mevcut şifrelenmiş veriler decrypt edilemez!**

⚠️ **Key'i güvenli bir yerde saklayın (password manager)**

⚠️ **Asla Git'e commit etmeyin**
