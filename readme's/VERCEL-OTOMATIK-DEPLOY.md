# 🚀 Vercel'e Otomatik Yükleme - Çok Kolay!

## ⚡ En Kolay Yöntem: Vercel Dashboard (Tarayıcıdan)

### Adım 1: GitHub'a Push (Zaten Yaptınız ✅)

Eğer henüz push etmediyseniz:
```bash
git add .
git commit -m "PostgreSQL için hazır"
git push origin main
```

### Adım 2: Vercel'e Giriş

1. **https://vercel.com** adresine gidin
2. **"Sign Up"** veya **"Log In"** tıklayın
3. **GitHub ile giriş yapın** (en kolay yol)

### Adım 3: Projeyi İçe Aktarın

1. Vercel dashboard'da **"Add New Project"** tıklayın
2. GitHub repository'nizi bulun: **`kerem-wo/qrmenu`**
3. **"Import"** tıklayın

### Adım 4: Vercel Postgres Ekleyin (ÇOK ÖNEMLİ!)

1. Vercel proje sayfasında **"Storage"** sekmesine tıklayın
2. **"Create Database"** butonuna tıklayın
3. **"Postgres"** seçin
4. **"Create"** tıklayın
5. ⏳ 1-2 dakika bekleyin (Vercel PostgreSQL oluşturuyor)

**✅ Vercel otomatik olarak `DATABASE_URL` ekler!**

### Adım 5: Environment Variables Ekleyin

1. Vercel proje sayfasında **"Settings"** sekmesine tıklayın
2. Sol menüden **"Environment Variables"** seçin
3. Şu değişkenleri ekleyin:

**Değişken 1:**
- **Name:** `NEXTAUTH_SECRET`
- **Value:** (Aşağıdaki komutu çalıştırın ve çıkan değeri kopyalayın)
  ```bash
  npm run generate-secret
  ```
- **Environment:** Production, Preview, Development (hepsini seçin)
- **"Add"** tıklayın

**Değişken 2:**
- **Name:** `NEXTAUTH_URL`
- **Value:** `https://your-project-name.vercel.app` (Vercel size otomatik verir, deploy sonrası görebilirsiniz)
- **Environment:** Production, Preview, Development
- **"Add"** tıklayın

**Not:** İlk deploy'dan sonra `NEXTAUTH_URL`'yi güncelleyebilirsiniz.

### Adım 6: Deploy!

1. Vercel otomatik olarak deploy başlatır
2. ⏳ 2-3 dakika bekleyin
3. Deploy tamamlandığında **"View"** tıklayın

### Adım 7: Database Tablolarını Oluşturun

Deploy tamamlandıktan sonra:

**Yöntem 1: Vercel Dashboard'dan (En Kolay)**
1. Vercel proje sayfasında **"Deployments"** sekmesine tıklayın
2. En son deployment'ın yanındaki **"..."** menüsüne tıklayın
3. **"Redeploy"** seçin
4. ⏳ Bekleyin

**Yöntem 2: Terminalden**
```bash
# Vercel CLI yükleyin (sadece bir kez)
npm i -g vercel

# Projeye gidin
cd "c:\Users\kerem\Desktop\QR MENÜ"

# Vercel'e bağlanın
vercel login

# Environment variables'ı çekin
vercel env pull .env.local

# Database tablolarını oluşturun
npx prisma db push
```

## 🎉 Hazır!

Artık siteniz çalışıyor! 

- **Site URL:** `https://your-project-name.vercel.app`
- **Admin Panel:** `https://your-project-name.vercel.app/admin/login`

## 🔑 İlk Giriş

Seed data ile demo admin hesabı:
- **Email:** `admin@demo.com`
- **Şifre:** `admin123`

**Not:** Production'da mutlaka şifreyi değiştirin!

## ❌ Sorun mu Var?

### Hata: "Can't reach database"
→ Vercel Postgres oluşturulmamış (Adım 4'ü tekrar yapın)

### Hata: "Table does not exist"
→ Adım 7'yi yapın (Database tablolarını oluşturun)

### Hata: "Invalid NEXTAUTH_SECRET"
→ Environment Variables'da `NEXTAUTH_SECRET` eksik (Adım 5'i kontrol edin)

## 📞 Yardım

Tüm hatalar için `VERCEL-HATA-COZUMU.md` dosyasına bakın.
