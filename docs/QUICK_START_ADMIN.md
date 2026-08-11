# 🚀 Admin User - Hızlı Başvuru

## 🔐 Giriş Bilgileri

```
Email:    admin@axioninvoice.app
Şifre:    Admin@123456
```

## ✨ Admin User Özellikleri

| Özellik | Durum |
|---------|-------|
| Sınırsız Fatura | ✅ |
| Sınırsız Şablon | ✅ |
| Business Plan | ✅ |
| Admin Yetkisi | ✅ |
| Tüm Özelliklere Erişim | ✅ |

## 🧪 Test Verisi

### Demo User (Test için - Free Plan)
```
Email:    demo@axioninvoice.app
Şifre:    (Seed data - CRUD test yapabilirsiniz)
Limiter:  5 fatura/ay, 0 şablon
```

## 📊 Veritabanı Durumu

✅ Temiz başlangıç  
✅ Demo verisi korundu  
✅ Admin user hazır  
✅ Business plan atandı  

## 🔗 Faydalı Linkler

- **[Admin User Kurulumu](./ADMIN_USER_SETUP.md)** - Detaylı dokümantasyon
- **[Business Plan Detayları](./BUSINESS_PLAN.md)** - Plan karşılaştırması
- **[User Model](./backend/app/models/user.py)** - is_admin field
- **[Migration](./backend/alembic/versions/f9e8a7b6c5d4_add_is_admin_to_users.py)** - DB schema

## 💡 Development Tips

### Admin Olarak Tam Test
```bash
1. admin@axioninvoice.app ile giriş yap
2. Sınırsız fatura oluştur
3. Özel şablon tasarla
4. Tüm özellikleri test et
```

### Free Plan Limitini Test Et
```bash
1. demo@axioninvoice.app ile giriş yap (Seed data ile)
2. 5 fatura oluşturmayı dene
3. 6. faturada hata al
4. Şablon oluşturmayı dene (Limit: 0)
```

## 📝 Önemli Notlar

- Admin şifresi development ortamı için basit tutuldu
- Production için güçlü şifre kullan
- Demo verisi test amaçlı - kopyala/değiştir yapabilirsin
- is_admin field veritabanında mevcut

---

**Setup Tarihi:** 2026-08-05  
**Durum:** ✅ Production Ready  
**Sonraki Adım:** Geliştirmeye başla!
