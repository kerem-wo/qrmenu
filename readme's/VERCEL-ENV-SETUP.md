# Vercel Environment Variables Kurulumu

## 🔑 Resend API Key Ekleme

### Adım 1: Vercel Dashboard'a Giriş
1. [Vercel Dashboard](https://vercel.com/dashboard) adresine gidin
2. Projenizi seçin (`qrmenu`)

### Adım 2: Environment Variables Ekleme
1. Proje sayfasında **Settings** sekmesine tıklayın
2. Sol menüden **Environment Variables** seçeneğine tıklayın
3. Aşağıdaki değişkenleri ekleyin:

#### Değişken 1: RESEND_API_KEY
- **Key:** `RESEND_API_KEY`
- **Value:** `re_6Yq8KUiJ_Fa79GxR8m32qiK1cfZZoWDEr`
- **Environment:** Production, Preview, Development (hepsini seçin)
- **Add** butonuna tıklayın

#### Değişken 2: RESEND_FROM_EMAIL
- **Key:** `RESEND_FROM_EMAIL`
- **Value:** `onboarding@resend.dev` (veya doğruladığınız domain'den bir email)
- **Environment:** Production, Preview, Development (hepsini seçin)
- **Add** butonuna tıklayın

### Adım 3: Deploy
1. Environment variables eklendikten sonra, projeyi yeniden deploy edin
2. Veya otomatik deploy için bir commit yapın

### Adım 4: Test
1. Deploy tamamlandıktan sonra `/admin/forgot-password` sayfasına gidin
2. Bir email adresi girin
3. Email kutunuzu kontrol edin

## 📝 Notlar

- API key'i asla GitHub'a commit etmeyin
- `.env.local` dosyasını `.gitignore`'a eklediğinizden emin olun
- Production'da mutlaka doğrulanmış bir domain kullanın

## 🔒 Güvenlik

- API key'iniz sadece Vercel environment variables'da saklanmalı
- Bu dosyayı commit etmeyin (zaten gitignore'da olmalı)
