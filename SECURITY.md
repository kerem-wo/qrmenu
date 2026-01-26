# Güvenlik Dokümantasyonu

## Genel Bakış

Bu uygulama, hassas belgelerin ve verilerin güvenliğini sağlamak için kapsamlı güvenlik önlemleri içermektedir.

## Güvenlik Özellikleri

### 1. Dosya Şifreleme

- **Algoritma**: AES-256-GCM (Authenticated Encryption)
- **Key Derivation**: PBKDF2 (100,000 iterations, SHA-512)
- **Salt**: Her dosya için rastgele 64-byte salt
- **IV**: Her dosya için rastgele 16-byte IV
- **Authentication Tag**: 16-byte GCM tag

Tüm hassas belgeler (Vergi Levhası, İşletme Ruhsatı, Ticaret Sicil Belgesi, Kimlik Belgesi) veritabanına kaydedilmeden önce şifrelenir.

### 2. Erişim Kontrolü

- **Platform Admin Only**: Belgeler sadece platform yöneticileri tarafından görüntülenebilir
- **Restaurant Admin**: Kendi belgelerini göremez (sadece platform admin)
- **Session Verification**: Her istekte session doğrulanır
- **Signature Verification**: Session cookie'leri HMAC-SHA256 ile imzalanır

### 3. Rate Limiting

- **Upload Endpoint**: 20 yükleme/dakika
- **Login Endpoint**: 5 deneme/dakika
- **API Endpoints**: Genel rate limiting

### 4. Input Validation

- **File Type Validation**: Magic bytes kontrolü (MIME type'dan daha güvenli)
- **File Size Limits**: Maksimum 10MB
- **Input Sanitization**: XSS koruması
- **SQL Injection Protection**: Prisma ORM kullanımı

### 5. HTTPS Enforcement

- Production'da tüm istekler HTTPS üzerinden olmalı
- HTTP istekleri otomatik olarak HTTPS'e yönlendirilir

### 6. Security Headers

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: geolocation=(), microphone=(), camera=()`

### 7. Session Security

- **HttpOnly Cookies**: JavaScript erişimi engellenir
- **Secure Flag**: Production'da sadece HTTPS
- **SameSite: strict**: CSRF koruması
- **HMAC Signature**: Cookie değişikliği tespit edilir
- **Session Expiry**: 7 gün

### 8. Audit Logging

Tüm güvenlik olayları loglanır:
- Dosya yüklemeleri
- Belge erişimleri
- Yetkisiz erişim denemeleri
- Rate limit aşımları
- Hata durumları

## Environment Variables

### Zorunlu Değişkenler

```env
# Veritabanı bağlantısı
DATABASE_URL=postgresql://...

# Şifreleme anahtarı (en az 32 karakter)
ENCRYPTION_KEY=your-very-long-random-encryption-key-minimum-32-characters

# Session imzalama için (opsiyonel, ENCRYPTION_KEY kullanılabilir)
SESSION_SECRET=your-session-secret-key
```

### Güvenli Key Oluşturma

```bash
# Node.js ile güvenli key oluşturma
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## API Endpoints

### Güvenli Dosya Yükleme

**Endpoint**: `POST /api/upload`

**Gereksinimler**:
- Authentication (admin session)
- HTTPS (production)
- Rate limiting (20/dakika)

**Güvenlik**:
- File type validation (magic bytes)
- File size validation (max 10MB)
- Automatic encryption
- Audit logging

### Belge Erişimi

**Endpoint**: `GET /api/documents/[restaurantId]`

**Gereksinimler**:
- Platform admin authentication
- HTTPS (production)

**Güvenlik**:
- Sadece platform admin erişebilir
- Belgeler decrypt edilir
- Full audit logging

## Veritabanı Güvenliği

- Tüm hassas belgeler şifrelenmiş olarak saklanır
- Şifreler bcrypt ile hash'lenir (10 rounds)
- Prisma ORM SQL injection koruması sağlar

## Güvenlik Best Practices

1. **Environment Variables**: Asla kod içinde hardcode etmeyin
2. **Key Rotation**: Düzenli olarak ENCRYPTION_KEY'i değiştirin
3. **HTTPS**: Production'da mutlaka HTTPS kullanın
4. **Backup Encryption**: Yedekler de şifrelenmiş olmalı
5. **Access Logs**: Tüm erişimleri izleyin
6. **Regular Updates**: Bağımlılıkları düzenli güncelleyin

## Güvenlik İhlali Durumunda

1. Tüm session'ları geçersiz kılın
2. ENCRYPTION_KEY'i değiştirin
3. Audit logları inceleyin
4. Etkilenen kullanıcıları bilgilendirin
5. Gerekirse yasal süreç başlatın

## Uyarılar

⚠️ **ÖNEMLİ**: 
- `ENCRYPTION_KEY` değiştirilirse, mevcut şifrelenmiş veriler decrypt edilemez
- Key'i güvenli bir yerde saklayın (password manager)
- Production'da asla console.log ile key'leri yazdırmayın
- Git'e asla commit etmeyin (.gitignore'da olmalı)
