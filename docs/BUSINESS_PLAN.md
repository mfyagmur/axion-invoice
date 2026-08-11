# Business Plan - AxionOS Invoice

## Plan Detayları

| Özellik | Değer |
|---------|-------|
| **Ad** | Business |
| **Aylık Fiyat** | 399₺ |
| **Yıllık Fiyat** | 3.990₺ |
| **Maksimum Faturalar/Ay** | Sınırsız |
| **Maksimum Şablonlar** | Sınırsız |
| **Database ID** | 00000000-0000-0000-0000-0000000000f3 |

## Business Plan'ın Özellikleri

✅ **Sınırsız Fatura Oluşturma** - Ay başına kaç fatura oluşturacağınız konusunda hiçbir sınırlama yok  
✅ **Sınırsız Özel Şablonlar** - İhtiyacınız kadar özel fatura şablonu oluşturun  
✅ **Diğer Tüm Özellikleri** - Uygulamanın tüm temel özelliklerine erişim  

## Karşılaştırma

| Özellik | Free | Pro | Business |
|---------|------|-----|----------|
| Aylık Fiyat | ₺0 | ₺149 | ₺399 |
| Faturalar/Ay | 5 | 100 | Sınırsız |
| Şablonlar | 0 | 10 | Sınırsız |

## Test Kullanıcısı Bilgileri

**Email:** `mfyagmur@gmail.com`  
**Kullanıcı ID:** `7c5a8e39-2c93-4f01-bd0a-43c04df1bbf7`  
**Mevcut Plan:** Business ✅  
**Durum:** Aktif  
**Upgrade Tarihi:** 2026-08-05

---

### API Endpoints

- **Planları Listele:** `GET /api/v1/plans`
- **Abonelik Kontrolü:** `GET /api/v1/subscriptions/me`
- **Checkout Oluştur:** `POST /api/v1/subscriptions/checkout`

### Database Queries

```sql
-- Planları görüntüle
SELECT * FROM plans ORDER BY price_monthly;

-- Kullanıcının aboneliğini kontrol et
SELECT u.email, p.name, s.status, s.billing_interval
FROM subscriptions s
JOIN plans p ON s.plan_id = p.id
JOIN users u ON s.user_id = u.id
WHERE u.email = 'mfyagmur@gmail.com';

-- Kullanıcıyı Business'a upgrade et (SQL)
UPDATE subscriptions 
SET plan_id = '00000000-0000-0000-0000-0000000000f3'
WHERE user_id IN (
  SELECT id FROM users WHERE email = 'mfyagmur@gmail.com'
);
```

---

**Hazırlanıyor:** Test ortamı  
**Kişiler:** m.yagmur@koel.com.tr
