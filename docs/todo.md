# Yapılacak İşler (TODO)

Bu dosya, projede kalan ve ertelenmiş işlerin kaydını tutar. Tamamlanan işler burada kalırlar
(tarih ile işaretlenir), yeni işler dinamik olarak eklenir.

---

## Aktif Yapılacaklar

### 1. Konum ve Telefon Alanlarını Register Ekranına Taşıma
**Dosya:** `frontend/src/pages/dashboard/settings/ProfileTab.tsx`  
**Durum:** Ertelenmiş (salt-okunur placeholder)  
**Bağlam:** Profil sayfasında konum ve telefon şu an placeholder metin/ikon gösterir; gerçek
veri girişi henüz yapılmamış. Register akışında bu alanları toplayacak form/adımlar eklenecek.  
**Sıra:** Normal  
**Tahmini:** ~4-6 saat (register flow genişletme, backend validation)

### 2. Stripe Test Hesabıyla Faz 4 Doğrulaması
**Dosya:** `backend/`, `frontend/src/pages/dashboard/billing/`  
**Durum:** Ertelenmiş (kullanıcı ortamına bağlı)  
**Bağlam:** Bkz. `docs/CLAUDE.md` → "Sıradaki Adım" § 1. Kullanıcının gerçek Stripe test
hesabıyla price'ları oluşturması, webhook'u dinlemesi, tarayıcıda checkout/portal/limit
kontrolleri teyit etmesi gerekiyor. Kod tarafı tamamlandı, sadece entegrasyon doğrulaması kalıyor.

### 3. Prod Deploy (Docker Compose, TLS, SMTP)
**Dosya:** `docker-compose.prod.yml`, `backend/Dockerfile`, `frontend/Dockerfile`, `backend/.env.example`  
**Durum:** Ertelenmiş (sunucu erişimi yok)  
**Bağlam:** Bkz. `docs/CLAUDE.md` → "Sıradaki Adım" § 2. Sunucu hazırlanıp `.env` doldurulduktan
sonra `docker compose -f docker-compose.prod.yml up -d --build` çalıştırılacak. TLS/Caddy/Let's
Encrypt henüz eklenmedi.  
**Sıra:** Yüksek (görev sırası başındadır ama ön koşullar harici)

---

## Tamamlananlar

(Henüz yok — yeni yapılar ertelenmiş.)

---

## Notlar
- Haftalık ~10-15 saatlik bütçenin bulunması gerekebilir.
- Her madde kapatılırken tarih eklenmeli (`## YYYY-MM-DD — [İş Adı]` başlığında).
- Yeni işler ortaya çıktıkça buraya eklenecek — bu liste canlı belgelendirmedir.
