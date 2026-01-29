# Google ile Giriş – Kurulum Rehberi

Admin panelinde "Google ile Giriş Yap" butonunun çalışması için aşağıdaki adımları tamamlayın.

---

## 1. Google Cloud Console’da Proje ve OAuth Ayarı

1. **Google Cloud Console**’a gidin: [https://console.cloud.google.com](https://console.cloud.google.com)
2. Üstten **proje seçin** veya **Yeni Proje** ile yeni bir proje oluşturun.
3. Sol menüden **APIs & Services** → **OAuth consent screen**:
   - **User Type**: "External" seçin (herkes Google ile giriş yapabilsin).
   - **Uygulama adı**: Örn. "Rivo QR Menü"
   - **Destek e-postası**: Kendi e-postanız
   - **Geliştirici iletişim bilgisi**: E-postanız
   - **Kaydet ve Devam** ile ilerleyin.
   - **Scopes** ekleme adımında **Ekle veya Kaldır** ile `email`, `profile`, `openid` ekleyin (genelde varsayılanla gelir). **Kaydet**.
   - **Test kullanıcıları** (Test modundaysanız): Giriş yapmasına izin vereceğiniz Gmail adreslerini ekleyin. Yayınlama yapınca bu kısım kalkar.
   - **Yayınla** (Production’da kullanacaksanız uygulamayı "In production" yapın).

4. **APIs & Services** → **Credentials**:
   - **+ Create Credentials** → **OAuth client ID**
   - **Application type**: "Web application"
   - **Name**: Örn. "Rivo QR Admin"
   - **Authorized JavaScript origins**:
     - Yerel: `http://localhost:3000`
     - Canlı: `https://siteniz.com` (kendi domain’iniz)
   - **Authorized redirect URIs**:
     - Yerel: `http://localhost:3000/api/admin/auth/google/callback`
     - Canlı: `https://siteniz.com/api/admin/auth/google/callback`
   - **Create** deyip **Client ID** ve **Client secret**’ı kopyalayın (bir daha tam gösterilmez; gerekirse "Download JSON" ile saklayın).

---

## 2. Ortam Değişkenlerini (.env) Doldurma

Proje kökündeki `.env` dosyasında şunları ekleyin veya güncelleyin:

```env
# Google OAuth – Admin "Google ile Giriş"
GOOGLE_CLIENT_ID="...buraya_client_id..."
GOOGLE_CLIENT_SECRET="...buraya_client_secret..."

# Uygulama adresi (callback için kullanılıyor)
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
# Canlıda: NEXT_PUBLIC_BASE_URL="https://siteniz.com"
```

- `GOOGLE_CLIENT_ID` ve `GOOGLE_CLIENT_SECRET` yoksa "Google ile Giriş" butonu tıklanınca hata sayfasına yönlendirilir veya "Google girişi yapılandırılmamış" benzeri mesaj alırsınız.
- Vercel / canlı ortamda bu değişkenleri **Environment Variables** kısmına da ekleyin; `NEXT_PUBLIC_BASE_URL` canlı domain’iniz olmalı.

---

## 3. Admin Hesabı ile Eşleştirme

Google ile giriş **sadece** veritabanında zaten kayıtlı bir **Admin** e-postası ile çalışır:

- Admin, restoran kaydı sırasında oluşturulur (e-posta + şifre).
- Google’da giriş yaptığınız e-posta, **Admin** kaydındaki **e-posta** ile **birebir aynı** olmalı (küçük harf, boşluksuz).

Yani:

1. Önce **Restoran Kaydı** ile bir admin oluşturun (örn. `admin@restoran.com`).
2. Google hesabınızın e-postası da `admin@restoran.com` ise "Google ile Giriş Yap" ile giriş yapabilirsiniz.
3. Farklı bir Gmail kullanacaksanız, o Gmail’i admin e-postası olarak kullanan bir restoran kaydı olmalı (veya mevcut admin e-postasını o Gmail ile değiştirmeniz gerekir; bu uygulama şu an sadece e-posta eşleştirmesi yapıyor).

---

## 4. Özet Kontrol Listesi

- [ ] Google Cloud Console’da proje seçildi / oluşturuldu
- [ ] OAuth consent screen (External) tamamlandı, gerekli scope’lar eklendi
- [ ] OAuth 2.0 "Web application" client oluşturuldu
- [ ] **Authorized redirect URIs** içinde `.../api/admin/auth/google/callback` (localhost ve canlı) eklendi
- [ ] `.env` içinde `GOOGLE_CLIENT_ID` ve `GOOGLE_CLIENT_SECRET` tanımlı
- [ ] `NEXT_PUBLIC_BASE_URL` doğru (localhost veya canlı domain)
- [ ] Giriş yapacağınız Google e-postası, veritabanındaki bir Admin e-postası ile aynı
- [ ] (İsteğe bağlı) Canlı ortamda env değişkenleri Vercel/ortam ayarlarına eklendi

Bu adımlardan sonra admin giriş sayfasındaki **Google ile Giriş Yap** butonu çalışır.
