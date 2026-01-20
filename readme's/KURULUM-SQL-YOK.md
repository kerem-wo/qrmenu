# 🎯 SQL Bilgisi Gerektirmeyen Kurulum

## ✅ En Kolay Yöntem: Vercel (Önerilen)

Vercel kullanırsanız **SQL bilgisi gerektirmez** - Her şey otomatik!

### 🚀 5 Dakikada Canlıya Alın

#### Adım 1: GitHub'a Yükleyin

```bash
# Terminal'de proje klasöründe:
git init
git add .
git commit -m "QR Menu System"
```

Sonra GitHub'da yeni repository oluşturup:

```bash
# Remote URL'ini ayarla (eğer zaten varsa güncelle)
git remote set-url origin https://github.com/kerem-wo/qrmenu
# VEYA yeni ekliyorsanız:
# git remote add origin https://github.com/kerem-wo/qrmenu

# Branch'i main olarak ayarla ve push et
git branch -M main
git push -u origin main
```

**Not:** Eğer "master" branch'i varsa, önce `git branch -M main` ile rename edin.

#### Adım 2: Vercel'e Bağlayın

1. https://vercel.com → "Sign Up" (GitHub ile)
2. "Add New Project"
3. GitHub repository'nizi seçin
4. "Import"

#### Adım 3: Vercel Postgres Ekleyin (1 Tık!)

1. Proje açıldıktan sonra → "Storage" sekmesi
2. "Create Database" → "Postgres" seçin
3. "Create" tıklayın

**Vercel otomatik olarak PostgreSQL oluşturur ve `DATABASE_URL` ekler!**

#### Adım 4: Tek Değişiklik - Schema

`prisma/schema.prisma` dosyasında sadece **1 satır** değiştirin:

```prisma
datasource db {
  provider = "postgresql"  // SQLite yerine PostgreSQL yazın
  url      = env("DATABASE_URL")
}
```

#### Adım 5: Environment Variables

Vercel dashboard → Settings → Environment Variables:

```
NEXTAUTH_SECRET = (npm run generate-secret ile oluşturun)
NEXTAUTH_URL = https://your-project.vercel.app
```

#### Adım 6: Deploy!

Vercel otomatik olarak:
- ✅ Build yapar
- ✅ PostgreSQL'e bağlanır
- ✅ Deploy eder
- ✅ SSL ekler
- ✅ Domain verir

## 🎉 Hazır!

Artık siteniz canlıda! **SQL bilgisi gerektirmedi!**

## 📝 Özet

1. GitHub'a push ✅
2. Vercel'e bağla ✅
3. Postgres ekle (1 tık) ✅
4. Schema'da `postgresql` yaz ✅
5. Environment variables ekle ✅
6. Deploy! ✅

**Toplam 5 dakika, SQL bilgisi gerektirmez!**

## 🆘 Sorun mu Var?

- Vercel dashboard'da "Deployments" sekmesinden logları kontrol edin
- Build hatası varsa terminalde `npm run build` çalıştırıp test edin
- Database hatası varsa Vercel Postgres'in oluşturulduğundan emin olun
