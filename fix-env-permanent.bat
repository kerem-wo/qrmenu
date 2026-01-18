@echo off
echo ========================================
echo   .env Dosyasini Duzenleme
echo ========================================
echo.

echo [1/2] .env.local dosyasindaki DATABASE_URL'i okuyorum...
for /f "tokens=2 delims==" %%a in ('type .env.local ^| findstr DATABASE_URL') do set DB_URL=%%a

echo.
echo [2/2] .env dosyasini guncelliyorum...

REM .env dosyasinda DATABASE_URL satirini bul ve degistir
findstr /v "DATABASE_URL" .env > .env.tmp 2>nul
echo DATABASE_URL=%DB_URL% >> .env.tmp
move /y .env.tmp .env >nul

echo.
echo ========================================
echo   TAMAMLANDI!
echo ========================================
echo.
echo .env dosyasi guncellendi.
echo Simdi test edin:
echo   npx prisma db push
echo.
pause
