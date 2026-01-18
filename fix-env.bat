@echo off
echo ========================================
echo   Environment Variable Kontrolu
echo ========================================
echo.

echo [1/3] .env.local dosyasindaki DATABASE_URL:
type .env.local | findstr DATABASE_URL
echo.

echo [2/3] .env dosyasindaki DATABASE_URL (varsa):
if exist .env (
    type .env | findstr DATABASE_URL
) else (
    echo .env dosyasi bulunamadi (bu normal)
)
echo.

echo [3/3] Prisma'nin gorecegi DATABASE_URL:
set DATABASE_URL
echo.

echo ========================================
echo   Cozum:
echo ========================================
echo.
echo Eger .env dosyasinda DATABASE_URL varsa:
echo 1. .env dosyasini silin VEYA
echo 2. .env dosyasindaki DATABASE_URL satirini silin
echo.
echo Sonra tekrar deneyin:
echo   npx prisma db push
echo.
pause
