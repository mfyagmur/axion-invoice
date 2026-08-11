# Admin Kullanıcı Kurulumu

## 📋 Yapılan İşlemler

✅ **Veritabanı Temizleme**
- Demo haricindeki tüm kullanıcılar silindi
- Silinen kullanıcının tüm bağlı verileri temizlendi:
  - Faturalar (Invoices)
  - Müşteriler (Customers)
  - Fatura satırları (Line Items)
  - Abonelikleri (Subscriptions)

✅ **Admin Kullanıcı Oluşturuldu**
- Sınırsız fatura oluşturabilir
- Sınırsız şablon oluşturabilir
- Business plan'a atandı
- Admin yetkisine sahip

✅ **Demo Verisi Korundu**
- Demo kullanıcı ve verileri intact kalıyor
- Test ve demo amaçları için kullanılabilir

---

## 🔐 Admin Kullanıcı Bilgileri

| Özellik | Değer |
|---------|-------|
| **Email** | `admin@axioninvoice.app` |
| **Şifre** | `Admin@123456` |
| **İsim** | Admin Kullanıcı |
| **User ID** | `00000000-0000-0000-0000-0000000000a1` |
| **Plan** | Business |
| **Durum** | Aktif |

### Yetkiler
- ✅ Sınırsız Fatura
- ✅ Sınırsız Şablon  
- ✅ Admin Erişimi
- ✅ Tüm Özelliklere Erişim

---

## 🔄 Veritabanı Durumu

### Kullanıcılar (2 adet)

```
┌─────────────────────────────────┬──────────────────────────┬─────────┬──────────┐
│ Email                           │ İsim                     │ Admin   │ Demo     │
├─────────────────────────────────┼──────────────────────────┼─────────┼──────────┤
│ admin@axioninvoice.app          │ Admin Kullanıcı          │ Evet ✓  │ Hayır    │
│ demo@axioninvoice.app           │ Demo Kullanıcı           │ Hayır   │ Evet ✓   │
└─────────────────────────────────┴──────────────────────────┴─────────┴──────────┘
```

### Planlar

| Plan | Aylık Fiyat | Fatura/Ay | Şablon | Kullanıcı |
|------|-------------|-----------|--------|-----------|
| **Business** | ₺399 | Sınırsız | Sınırsız | Admin User |
| **Free** | ₺0 | 5 | 0 | Demo User |

---

## 🔧 Teknikalıler

### Migration (Alembic)
- **Dosya:** `backend/alembic/versions/f9e8a7b6c5d4_add_is_admin_to_users.py`
- **Açıklama:** Users tablosuna `is_admin` column'ı ekledi
- **Durum:** ✅ Applied

### Model Güncelleme
- **Dosya:** `backend/app/models/user.py`
- **Değişiklik:** `is_admin: Mapped[bool]` field'ı eklendi
- **Durum:** ✅ Updated

### Database
- **Durumu:** Clean ve ready for development
- **Demo verisi:** Intact
- **Production-ready:** Hazır

---

## 📝 SQL Sorguları

### Admin Kullanıcıyı Kontrol Et
```sql
SELECT email, full_name, is_admin, is_demo 
FROM users 
WHERE is_admin = true;
```

### Admin'in Aboneliğini Kontrol Et
```sql
SELECT u.email, p.name, s.status, s.billing_interval
FROM subscriptions s
JOIN plans p ON s.plan_id = p.id
JOIN users u ON s.user_id = u.id
WHERE u.is_admin = true;
```

### Tüm Kullanıcıları Listele
```sql
SELECT email, full_name, is_admin, is_demo, invoice_sequence
FROM users
ORDER BY is_admin DESC;
```

---

## 🚀 Geliştirme Notları

### Admin User ile Neler Yapabilirsiniz?

1. **Sınırsız Fatura Oluşturma**
   - Ay başına sınırlama yok
   - Tüm fatura özelliklerine erişim

2. **Sınırsız Şablon**
   - Özel şablonlar oluşturabilir
   - Sistem şablonlarını kullanabilir

3. **Test ve Development**
   - Tüm özellikleri test edebilirsiniz
   - Business plan özellikleri tam erişim

4. **Demo Verisi**
   - `demo@axioninvoice.app` kullanıcısı test için
   - Free plan ile limitli özellikleri test edin

### Development Workflow

```bash
# 1. Admin olarak giriş yap
Login:
  Email: admin@axioninvoice.app
  Password: Admin@123456

# 2. Sınırsız fatura ve şablon oluştur
# 3. Tüm özellikleri test et
# 4. Demo user ile free plan limitlerini test et
```

---

## 📌 İlişkili Dosyalar

- `backend/app/models/user.py` - User model (is_admin field)
- `backend/alembic/versions/f9e8a7b6c5d4_add_is_admin_to_users.py` - Migration
- `BUSINESS_PLAN.md` - Business Plan detayları
- `backend/app/core/security.py` - Şifre hashing

---

**Tarih:** 2026-08-05  
**Durum:** ✅ Ready for Testing  
**Contact:** m.yagmur@koel.com.tr
