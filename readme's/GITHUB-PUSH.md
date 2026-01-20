# 🚀 GitHub'a Yükleme - Doğru Komutlar

## ✅ Doğru GitHub Repository: https://github.com/kerem-wo/qrmenu

## Terminalde Şu Komutları Çalıştırın:

```bash
# 1. Remote URL'ini güncelle (zaten varsa)
git remote set-url origin https://github.com/kerem-wo/qrmenu

# VEYA yeni ekliyorsanız:
# git remote add origin https://github.com/kerem-wo/qrmenu

# 2. Tüm dosyaları ekle
git add .

# 3. Commit et
git commit -m "QR Menu System - Complete"

# 4. Branch'i main olarak ayarla
git branch -M main

# 5. Push et
git push -u origin main
```

## ✅ Eğer Master Branch Kullanıyorsanız:

```bash
git remote set-url origin https://github.com/kerem-wo/qrmenu
git add .
git commit -m "QR Menu System - Complete"
git push -u origin master
```

## 🎯 Sonraki Adım: Vercel

GitHub'a yüklendikten sonra:
1. https://vercel.com → GitHub ile giriş
2. "Add New Project" → `kerem-wo/qrmenu` seçin
3. "Import"
4. Vercel Postgres ekleyin
5. Deploy!
