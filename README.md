# QR Menü Sistemi

Modern ve kullanıcı dostu restoran QR menü sistemi. Restoranlar için dijital menü çözümü ile müşteriler QR kod okutarak menüyü görüntüleyebilir ve online sipariş verebilir.

## Özellikler

- 🎨 **Modern ve Responsive Tasarım** - Tüm cihazlarda mükemmel görünüm
- 📱 **QR Kod Desteği** - Kolay menü erişimi
- 🛒 **Online Sipariş Sistemi** - Müşteriler direkt sipariş verebilir
- 👨‍💼 **Güçlü Admin Panel** - WordPress benzeri kullanıcı dostu arayüz
- 🍕 **Ürün Yönetimi** - Kolay ürün ekleme, düzenleme ve silme
- 🖼️ **Görsel Yönetimi** - Her ürün için özel görsel ve açıklama
- 📊 **Kategori Yönetimi** - Menüyü kategorilere ayırma
- 📈 **Sipariş Takibi** - Gelen siparişleri görüntüleme ve yönetme

## Teknolojiler

- **Next.js 14** - React framework (App Router)
- **TypeScript** - Tip güvenliği
- **Prisma** - Modern ORM
- **SQLite** - Geliştirme için hafif veritabanı
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI bileşenleri
- **React Hook Form** - Form yönetimi
- **Zod** - Schema validasyonu

## Kurulum

### Otomatik Kurulum (Windows)
```bash
setup.bat
```

### Manuel Kurulum

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. .env dosyasını otomatik oluşturun (secret key dahil):
```bash
npm run setup-env
```

3. Veritabanını hazırlayın:
```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

4. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

5. Tarayıcıda [http://localhost:3000](http://localhost:3000) adresini açın

## Kullanım

### İlk Kurulum

1. Bağımlılıkları yükleyin: `npm install`
2. Veritabanını hazırlayın: `npx prisma generate && npx prisma db push`
3. Demo verileri yükleyin: `npm run db:seed`
4. Geliştirme sunucusunu başlatın: `npm run dev`

### Admin Paneli

1. `/admin/login` adresinden admin paneline giriş yapın
   - Demo hesap: `admin@demo.com` / `admin123`
2. Dashboard'dan istatistikleri görüntüleyin
3. Kategori ekleyin: `/admin/categories`
4. Ürün ekleyin: `/admin/products`
5. Ürün eklerken görsel URL'i ve açıklama ekleyebilirsiniz
6. Ürünleri aktif/pasif yapabilirsiniz
7. QR kod oluşturarak müşterilerinize paylaşın

### Müşteri Görünümü

1. QR kodu okutun veya menü linkine gidin: `/menu/[restaurant-slug]`
2. Demo menü: `/menu/demo-restoran`
3. Kategorilere göre düzenlenmiş menüyü görüntüleyin
4. Ürünleri sepete ekleyin
5. Siparişinizi tamamlayın

## Proje Yapısı

```
├── app/
│   ├── admin/          # Admin panel sayfaları
│   ├── api/            # API routes
│   ├── menu/           # Public menü sayfaları
│   └── page.tsx        # Ana sayfa
├── components/
│   └── ui/             # UI bileşenleri
├── lib/                # Yardımcı fonksiyonlar
├── prisma/
│   └── schema.prisma   # Veritabanı şeması
└── public/             # Statik dosyalar
```

## Veritabanı Şeması

- **Restaurant** - Restoran bilgileri
- **Admin** - Admin kullanıcıları
- **Category** - Menü kategorileri
- **Product** - Ürünler
- **Order** - Siparişler
- **OrderItem** - Sipariş detayları

## Production Deployment

Production'a yüklemeden önce **mutlaka** `DEPLOY.md` ve `KURULUM-SQL-YOK.md` dosyalarını okuyun!

**Önemli:** SQLite production'da çalışmaz. PostgreSQL veya MySQL kullanmalısınız.

**En Kolay Yöntem:** Vercel kullanın - Otomatik PostgreSQL sağlar, SQL bilgisi gerektirmez!

Detaylı rehber: `KURULUM-SQL-YOK.md`

## Shopier Ödeme Ayarları

Tema yükseltme ödemeleri için production ortamında şu env değerleri gerekir:

```bash
SHOPIER_API_KEY=
SHOPIER_API_SECRET=
SHOPIER_WEBSITE_INDEX=1
SHOPIER_WEBHOOK_TOKEN=
SHOPIER_OSB_USERNAME=
SHOPIER_OSB_PASSWORD=
```

Shopier klasik ödeme dönüş URL'i: `https://rivoqr.com/api/shopier/callback`

Shopier webhook URL'i: `https://rivoqr.com/api/shopier/webhook`

OSB bildirim URL'i: `https://rivoqr.com/api/shopier/osb`

## Geliştirme Planı

- [x] Temel proje yapısı
- [x] Admin panel arayüzü
- [x] Ürün CRUD işlemleri
- [x] Public menü sayfası
- [x] Sipariş sistemi
- [x] QR kod oluşturma
- [ ] Görsel yükleme sistemi (dosya upload)
- [ ] Ödeme entegrasyonu
- [ ] Bildirim sistemi

## Lisans

Bu proje özel bir projedir.
