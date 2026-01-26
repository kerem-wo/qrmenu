# 🔒 Güvenlik Kurulumu - HEMEN YAPILMALI

## ⚠️ ÖNEMLİ UYARI

Bu uygulama production'a geçmeden önce **MUTLAKA** aşağıdaki adımları tamamlayın. Aksi takdirde uygulama çalışmayacaktır.

## 1. Encryption Key Oluşturma

Terminal'de şu komutu çalıştırın:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Çıktıyı kopyalayın (64 karakterlik hex string).

## 2. .env.local Dosyasına Ekleme

`.env.local` dosyanızı açın ve şunu ekleyin:

```env
ENCRYPTION_KEY=buraya-yukaridaki-64-karakterlik-string-yapistirin
```

**Örnek:**
```env
ENCRYPTION_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

## 3. Uygulamayı Yeniden Başlatma

Environment variable değişikliklerinden sonra uygulamayı yeniden başlatın:

```bash
npm run dev
```

## 4. Kontrol

Eğer `ENCRYPTION_KEY` eksikse, uygulama başlatıldığında hata verecektir. Lütfen `.env.local` dosyasını kontrol edin.

## Güvenlik Özellikleri

✅ **Dosya Şifreleme**: Tüm belgeler AES-256-GCM ile şifrelenir
✅ **Erişim Kontrolü**: Sadece platform admin belgelere erişebilir
✅ **Rate Limiting**: Brute force saldırılarına karşı koruma
✅ **Input Validation**: XSS ve injection saldırılarına karşı koruma
✅ **HTTPS**: Production'da zorunlu
✅ **Audit Logging**: Tüm güvenlik olayları loglanır

## Detaylı Bilgi

- `SECURITY.md` - Güvenlik dokümantasyonu
- `SECURITY-SETUP.md` - Detaylı kurulum rehberi
