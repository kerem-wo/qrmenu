@echo off
echo ========================================
echo   Vercel'e Otomatik Deploy Script
echo ========================================
echo.

REM Vercel CLI kontrolü
where vercel >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [1/5] Vercel CLI yukleniyor...
    npm install -g vercel
    if %ERRORLEVEL% NEQ 0 (
        echo HATA: Vercel CLI yuklenemedi!
        pause
        exit /b 1
    )
) else (
    echo [1/5] Vercel CLI zaten yuklu
)

echo.
echo [2/5] Vercel'e giris yapiliyor...
vercel login
if %ERRORLEVEL% NEQ 0 (
    echo HATA: Vercel giris basarisiz!
    pause
    exit /b 1
)

echo.
echo [3/5] Environment variables cekiliyor...
vercel env pull .env.local
if %ERRORLEVEL% NEQ 0 (
    echo UYARI: Environment variables cekilemedi, devam ediliyor...
)

echo.
echo [4/5] Prisma Client generate ediliyor...
npx prisma generate
if %ERRORLEVEL% NEQ 0 (
    echo HATA: Prisma generate basarisiz!
    pause
    exit /b 1
)

echo.
echo [5/5] Database tablolari olusturuluyor...
npx prisma db push
if %ERRORLEVEL% NEQ 0 (
    echo UYARI: Database push basarisiz olabilir, Vercel dashboard'dan kontrol edin
)

echo.
echo ========================================
echo   TAMAMLANDI!
echo ========================================
echo.
echo Simdi Vercel dashboard'dan projenizi kontrol edin:
echo https://vercel.com/dashboard
echo.
pause
