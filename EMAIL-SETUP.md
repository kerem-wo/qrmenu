# Email Servisi Kurulumu (Resend)

Bu dokümantasyon, şifre sıfırlama email gönderimi için Resend servisinin nasıl kurulacağını açıklar.

## 📧 Resend Nedir?

Resend, modern web uygulamaları için güvenilir bir email gönderim servisidir. Ücretsiz planında ayda 3,000 email gönderme hakkı sunar.

## 🚀 Kurulum Adımları

### 1. Resend Hesabı Oluşturma

1. [Resend.com](https://resend.com) adresine gidin
2. Ücretsiz hesap oluşturun
3. Email adresinizi doğrulayın

### 2. API Key Alma

1. Resend dashboard'a giriş yapın
2. **API Keys** sekmesine gidin
3. **Create API Key** butonuna tıklayın
4. Key'e bir isim verin (örn: "QR Menu Production")
5. **Permissions** için **Sending access** seçin
6. API Key'i kopyalayın (sadece bir kez gösterilir!)

### 3. Domain Doğrulama (Opsiyonel ama Önerilen)

**Not:** Ücretsiz plan için domain doğrulaması zorunlu değildir, ancak email deliverability için önerilir.

1. Resend dashboard'da **Domains** sekmesine gidin
2. **Add Domain** butonuna tıklayın
3. Domain adınızı girin (örn: `mail.yourdomain.com`)
4. DNS kayıtlarını ekleyin:
   - **SPF Record**: `v=spf1 include:resend.com ~all`
   - **DKIM Record**: Resend tarafından sağlanan özel kayıt
   - **DMARC Record**: `v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com`

### 4. Environment Variables Ekleme

#### Vercel'de:

1. Vercel dashboard'a gidin
2. Projenizi seçin
3. **Settings** > **Environment Variables** sekmesine gidin
4. Aşağıdaki değişkenleri ekleyin:

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@qrmenu.app
```

**Not:** `RESEND_FROM_EMAIL` için domain doğrulaması yapmadıysanız, Resend'in varsayılan domain'ini kullanabilirsiniz (örn: `onboarding@resend.dev`). Ancak production için kendi domain'inizi kullanmanız önerilir.

#### Local Development (.env.local):

Proje kök dizininde `.env.local` dosyası oluşturun:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@qrmenu.app
```

### 5. Deploy ve Test

1. Değişkenleri ekledikten sonra projeyi yeniden deploy edin
2. `/admin/forgot-password` sayfasına gidin
3. Bir email adresi girin
4. Email kutunuzu kontrol edin

## 🔧 Nasıl Çalışır?

1. Kullanıcı `/admin/forgot-password` sayfasında email adresini girer
2. Sistem admin kaydını bulur ve reset token oluşturur
3. Resend API kullanılarak şifre sıfırlama email'i gönderilir
4. Email'deki linke tıklayan kullanıcı yeni şifresini belirleyebilir

## 📝 Email Template

Email template'i `lib/email.ts` dosyasında tanımlanmıştır. İstediğiniz gibi özelleştirebilirsiniz.

## ⚠️ Troubleshooting

### Email Gönderilmiyor

1. **API Key Kontrolü:**
   - Vercel environment variables'da `RESEND_API_KEY` doğru mu?
   - API key'in `Sending access` yetkisi var mı?

2. **From Email Kontrolü:**
   - `RESEND_FROM_EMAIL` doğrulanmış bir domain'den mi?
   - Domain doğrulaması yapılmadıysa, Resend'in varsayılan domain'ini kullanın

3. **Log Kontrolü:**
   - Vercel function logs'larını kontrol edin
   - `lib/email.ts` dosyasında console.log çıktılarını inceleyin

### Development Modu

`RESEND_API_KEY` ayarlanmamışsa, sistem email'i console'a yazdırır. Bu, development için yeterlidir ancak production'da mutlaka Resend API key'i eklenmelidir.

## 💰 Fiyatlandırma

- **Ücretsiz Plan:** Ayda 3,000 email (günlük 100 email limiti)
- **Pro Plan:** $20/ay - Ayda 50,000 email

Daha fazla bilgi için: [Resend Pricing](https://resend.com/pricing)

## 🔗 Faydalı Linkler

- [Resend Documentation](https://resend.com/docs)
- [Resend Next.js Guide](https://resend.com/docs/send-with-nextjs)
- [Resend Dashboard](https://resend.com/emails)
