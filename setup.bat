@echo off
echo QR Menü Sistemi - Kurulum Başlatılıyor...
echo.

echo [1/4] Bağımlılıklar yükleniyor...
call npm install
if errorlevel 1 (
    echo HATA: npm install başarısız!
    pause
    exit /b 1
)

echo.
echo [2/4] .env dosyası kontrol ediliyor...
if not exist .env (
    echo .env dosyası bulunamadı, otomatik oluşturuluyor...
    call node setup-env.js
    if errorlevel 1 (
        echo UYARI: setup-env.js çalıştırılamadı, manuel oluşturuluyor...
        (
            echo DATABASE_URL="file:./dev.db"
            echo NEXTAUTH_SECRET="dev-secret-key-change-in-production"
            echo NEXTAUTH_URL="http://localhost:3000"
        ) > .env
        echo .env dosyası oluşturuldu!
    )
) else (
    echo .env dosyası mevcut.
    echo Not: Mevcut secret key korunuyor.
)

echo.
echo [3/4] Prisma client oluşturuluyor...
call npx prisma generate
if errorlevel 1 (
    echo HATA: Prisma generate başarısız!
    pause
    exit /b 1
)

echo.
echo [4/4] Veritabanı hazırlanıyor...
call npx prisma db push
if errorlevel 1 (
    echo HATA: Veritabanı hazırlama başarısız!
    pause
    exit /b 1
)

echo.
echo [BONUS] Demo veriler yükleniyor...
call npm run db:seed
if errorlevel 1 (
    echo UYARI: Demo veriler yüklenemedi, devam ediliyor...
)

echo.
echo ========================================
echo Kurulum tamamlandı!
echo.
echo Sunucuyu başlatmak için: npm run dev
echo Admin giriş: http://localhost:3000/admin/login
echo Demo hesap: admin@demo.com / admin123
echo ========================================
pause
