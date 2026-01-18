# 📋 Vercel Database URL'lerini Kopyalama

## ✅ Şimdi Yapmanız Gerekenler:

### Adım 1: DATABASE_URL'i Kopyalayın

1. Vercel dashboard'da **"Copy Snippet"** butonuna tıklayın
   - Veya `DATABASE_URL` değerini manuel olarak kopyalayın

2. `.env.local` dosyasını açın (proje klasöründe)

3. `DATABASE_URL` satırını bulun ve Vercel'den kopyaladığınız değerle değiştirin

   Şöyle görünmeli:
   ```
   DATABASE_URL="postgres://361a26ee20d46cfd625c3a00c456d8271e3ac83836c48ac9edb2e660f040e3fe:sk_CUAFqW0kaVXhYgoR1qJ4k@db.prisma.io:5432/postgres?ss..."
   ```

### Adım 2: Environment Variables'ı Güncelleyin

Terminal'de:

```bash
vercel env pull .env.local
```

Bu komut Vercel'den güncel URL'leri çeker.

### Adım 3: Database Tablolarını Oluşturun

```bash
npx prisma db push
```

Artık çalışmalı! ✅

## 🎯 Alternatif: Vercel CLI ile Otomatik

Eğer "Copy Snippet" ile uğraşmak istemiyorsanız:

```bash
vercel env pull .env.local
npx prisma db push
```

Bu komutlar Vercel'den otomatik olarak doğru URL'leri çeker ve database tablolarını oluşturur.

## ✅ Kontrol

`.env.local` dosyasında `DATABASE_URL` şöyle görünmeli:

```
DATABASE_URL="postgres://..."
```

`postgres://` veya `postgresql://` ile başlamalı, `prisma+postgres://` ile değil!
