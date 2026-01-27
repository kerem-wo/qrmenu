# Rivo QR Menu

Modern ve hızlı QR menü sistemi.

## Deployment Notları

### Veritabanı Bağlantısı (Vercel)
Bu proje PostgreSQL veritabanı gerektirir. Vercel üzerinde deploy ederken **Settings > Environment Variables** kısmında `DATABASE_URL` değişkeninin doğru ayarlandığından emin olun.

**Hata Çözümü (P1001):**
Eğer `Can't reach database server at db.prisma.io:5432` hatası alıyorsanız, `DATABASE_URL` değişkeniniz hatalı veya varsayılan bir değerde kalmış demektir. Lütfen çalışan bir PostgreSQL bağlantı adresi (Supabase, Neon, Railway vb.) giriniz.
