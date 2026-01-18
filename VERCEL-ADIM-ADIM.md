
**Yöntem 2: Terminalden**

1. Terminal'i açın (PowerShell veya CMD)

2. Proje klasörüne gidin:
   ```bash
   cd "c:\Users\kerem\Desktop\QR MENÜ"
   ```

3. Vercel CLI yükleyin (sadece bir kez):
   ```bash
   npm install -g vercel
   ```

4. Vercel'e giriş yapın:
   ```bash
   vercel login
   ```
   (Tarayıcı açılır, GitHub ile giriş yapın)

5. Environment variables'ı çekin:
   ```bash
   vercel env pull .env.local
   ```

6. Database tablolarını oluşturun:
   ```bash
   npx prisma db push
   ```

## 🎉 Tamamlandı!

Artık siteniz çalışıyor!

- **Site URL:** Vercel dashboard'da görebilirsiniz
- **Admin Panel:** `https://your-site.vercel.app/admin/login`

## 🔑 İlk Giriş Bilgileri

Demo admin hesabı:
- **Email:** `admin@demo.com`
- **Şifre:** `admin123`

**⚠️ Production'da mutlaka şifreyi değiştirin!**

## ❓ Hangi Adımda Takıldınız?

Hangi adımda sorun yaşıyorsunuz? Bana söyleyin, daha detaylı yardım edeyim!

- [ ] Adım 2: Vercel'e giriş yapamıyorum
- [ ] Adım 3: Projeyi bulamıyorum
- [ ] Adım 4: Postgres oluşturamıyorum
- [ ] Adım 5: Environment variables ekleyemiyorum
- [ ] Adım 6: Deploy başarısız oluyor
- [ ] Adım 7: Database tablolarını oluşturamıyorum
