# Vercel Deployment Kontrol Listesi

## 🔍 Deployment Görünmüyor mu? Şunları Kontrol Edin:

### 1. GitHub Repository Bağlantısı

Vercel projenizin GitHub repository ile bağlı olduğundan emin olun:

1. [Vercel Dashboard](https://vercel.com/dashboard) → Projenizi seçin
2. **Settings** → **Git** sekmesine gidin
3. **Connected Git Repository** bölümünde GitHub repository'nizin göründüğünü kontrol edin
4. Eğer bağlı değilse:
   - **Connect Git Repository** butonuna tıklayın
   - GitHub repository'nizi seçin (`kerem-wo/qrmenu`)
   - **Connect** butonuna tıklayın

### 2. Otomatik Deploy Ayarları

1. **Settings** → **Git** sekmesine gidin
2. **Production Branch** ayarının `main` olduğundan emin olun
3. **Automatic deployments** seçeneğinin açık olduğundan emin olun

### 3. Build Logları Kontrolü

1. Vercel Dashboard → Projeniz → **Deployments** sekmesine gidin
2. En son deployment'ı kontrol edin:
   - ✅ **Ready** = Başarılı
   - ⏳ **Building** = Hala build ediliyor
   - ❌ **Error** = Build hatası var

### 4. Build Hatası Varsa

Eğer build hatası varsa:

1. Deployment'a tıklayın
2. **Build Logs** sekmesine gidin
3. Hata mesajını kontrol edin
4. Yaygın hatalar:
   - **Missing dependencies**: `npm install` hatası
   - **TypeScript errors**: Type hataları
   - **Prisma errors**: Database bağlantı sorunları

### 5. Manuel Deploy Yapma

Otomatik deploy çalışmıyorsa manuel deploy yapabilirsiniz:

#### Yöntem 1: Vercel Dashboard'dan
1. Vercel Dashboard → Projeniz
2. **Deployments** sekmesi
3. Sağ üstteki **...** menüsü → **Redeploy**
4. **Redeploy** butonuna tıklayın

#### Yöntem 2: Vercel CLI ile
```bash
# Vercel CLI yüklü değilse
npm install -g vercel

# Proje dizininde
vercel --prod
```

### 6. GitHub Webhook Kontrolü

GitHub repository'nizde webhook'ların doğru ayarlandığını kontrol edin:

1. GitHub → Repository → **Settings** → **Webhooks**
2. Vercel webhook'unun aktif olduğunu kontrol edin
3. Son delivery'leri kontrol edin

### 7. Environment Variables Kontrolü

Build sırasında environment variable hatası olabilir:

1. Vercel Dashboard → **Settings** → **Environment Variables**
2. Şu değişkenlerin olduğundan emin olun:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `RESEND_API_KEY` (yeni eklenen)
   - `RESEND_FROM_EMAIL` (yeni eklenen)

### 8. Yeni Dosyaların Commit Edildiğini Kontrol Edin

```bash
git log --oneline -5
```

Son commit'lerinizi kontrol edin. Eğer yeni dosyalar commit edilmemişse:

```bash
git status
git add .
git commit -m "Your message"
git push origin main
```

## 🚀 Hızlı Çözüm

Eğer hiçbir şey çalışmıyorsa:

1. **Vercel Dashboard** → Projeniz → **Settings** → **General**
2. **Disconnect** butonuna tıklayın (Git bağlantısını kesin)
3. **Connect Git Repository** ile tekrar bağlayın
4. `main` branch'ini seçin
5. **Deploy** butonuna tıklayın

## 📞 Yardım

Hala sorun varsa:
- Vercel Build Logs'ları paylaşın
- GitHub repository linkini kontrol edin
- Environment variables'ların doğru olduğundan emin olun
