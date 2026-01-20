# 🔗 Vercel'e Bağlanma - Adım Adım

## ✅ Şu Ana Kadar Yaptıklarınız:
- ✅ Vercel CLI yüklendi
- ✅ Vercel'e giriş yapıldı

## 🔴 Şimdi Yapmanız Gerekenler:

### Seçenek 1: Otomatik Deploy (ÖNERİLEN - En Kolay!)

Terminal'de şu komutu çalıştırın:

```bash
vercel
```

Bu komut:
1. Projeyi Vercel'e bağlar
2. Otomatik deploy başlatır
3. Size sorular sorar (hepsine Enter'a basarak geçebilirsiniz)

**Sorular:**
- "Set up and deploy?" → **Y** (Evet)
- "Which scope?" → **Enter** (varsayılan)
- "Link to existing project?" → **N** (Hayır, yeni proje)
- "What's your project's name?" → **Enter** (varsayılan isim kullanılır)
- "In which directory is your code located?" → **Enter** (./)
- "Want to override the settings?" → **N** (Hayır)

### Seçenek 2: Manuel Link (Eğer Seçenek 1 Çalışmazsa)

1. Önce Vercel Dashboard'dan proje oluşturun:
   - https://vercel.com → "Add New Project"
   - GitHub repository'nizi seçin
   - "Import" tıklayın

2. Sonra terminal'de:
   ```bash
   vercel link
   ```
   
   Sorular:
   - "Set up and deploy?" → **Y**
   - "Which scope?" → **Enter**
   - "Link to existing project?" → **Y** (Evet)
   - Proje adını seçin

## 🎯 Sonraki Adımlar:

Deploy tamamlandıktan sonra:

1. **Vercel Postgres ekleyin:**
   - Vercel dashboard → Projeniz → "Storage" → "Create Database" → "Postgres"

2. **Environment Variables ekleyin:**
   - Vercel dashboard → Projeniz → "Settings" → "Environment Variables"
   - `NEXTAUTH_SECRET` ekleyin (npm run generate-secret ile oluşturun)
   - `NEXTAUTH_URL` ekleyin (Vercel size URL verecek)

3. **Database tablolarını oluşturun:**
   ```bash
   vercel env pull .env.local
   npx prisma db push
   ```

4. **Redeploy:**
   - Vercel dashboard → "Deployments" → En son deployment → "..." → "Redeploy"

## 💡 İpucu:

En kolay yol: Sadece `vercel` komutunu çalıştırın ve sorulara Enter'a basarak geçin!
