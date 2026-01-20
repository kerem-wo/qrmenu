# 🔧 Environment Variable Hatası Çözümü

## ❌ Sorun:
`DATABASE_URL` eklendi ama hala "URL must start with postgresql:// or postgres://" hatası alınıyor.

Bu, `.env.local` dosyasındaki `DATABASE_URL` değerinin yanlış formatta olduğu anlamına geliyor.

## ✅ Çözüm:

### Adım 1: .env.local Dosyasını Kontrol Edin

`.env.local` dosyasını açın ve `DATABASE_URL` satırını bulun.

**Yanlış formatlar:**
```
DATABASE_URL="prisma+postgres://..."  ❌
DATABASE_URL=""  ❌ (boş)
DATABASE_URL="file:./dev.db"  ❌ (SQLite)
```

**Doğru format:**
```
DATABASE_URL="postgres://..."  ✅
VEYA
DATABASE_URL="postgresql://..."  ✅
```

### Adım 2: DATABASE_URL'i Düzeltin

Eğer `DATABASE_URL` yanlış formattaysa:

1. `.env.local` dosyasını açın
2. `DATABASE_URL` satırını bulun
3. Eğer `prisma+postgres://` ile başlıyorsa, `POSTGRES_URL` değerini kullanın:

   `.env.local` dosyasında şu satırı bulun:
   ```
   POSTGRES_URL="postgres://..."
   ```

   Ve `DATABASE_URL` satırını şöyle değiştirin:
   ```
   DATABASE_URL="postgres://..."  (POSTGRES_URL'den kopyalayın)
   ```

### Adım 3: .env Dosyasını da Kontrol Edin

Prisma hem `.env` hem de `.env.local` dosyasını okur. `.env` dosyasında eski SQLite URL'i varsa, onu da düzeltin:

`.env` dosyasını açın ve şöyle olmalı:
```
DATABASE_URL="postgres://..."  (Vercel'den gelen URL)
```

VEYA `.env` dosyasını silin, sadece `.env.local` kullanın.

### Adım 4: Database Tablolarını Oluşturun

```bash
npx prisma db push
```

Artık çalışmalı! ✅

## 🎯 Hızlı Kontrol

Terminal'de şu komutu çalıştırın:

```bash
type .env.local | findstr DATABASE_URL
```

Bu komut `.env.local` dosyasındaki `DATABASE_URL` satırını gösterir.

Eğer `prisma+postgres://` görüyorsanız, `POSTGRES_URL` değerini kullanın!
