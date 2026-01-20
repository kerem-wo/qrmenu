# 🔧 Git Sorunları Düzeltme

## Sorunlar:
1. Branch adı "master" ama "main" olarak push edilmeye çalışılıyor
2. Remote zaten var ama eski URL'de

## Çözüm - Terminalde Şunları Çalıştırın:

### Seçenek 1: Master Branch'ini Push Et (Kolay)

```bash
# Remote URL'ini güncelle
git remote set-url origin https://github.com/kerem-wo/qrmenu

# Master branch'ini push et
git push -u origin master
```

### Seçenek 2: Main Branch'ine Geç (Önerilen)

```bash
# Branch'i main olarak rename et
git branch -M main

# Remote URL'ini güncelle
git remote set-url origin https://github.com/kerem-wo/qrmenu

# Push et
git push -u origin main
```

## ✅ Hangi Yöntemi Seçmeliyim?

**Seçenek 1** daha hızlı - Sadece master'ı push eder
**Seçenek 2** daha iyi - Modern standart (main branch)

Her ikisi de çalışır!
