# Yapılacak İşler (TODO)

Bu dosya, projede kalan ve ertelenmiş işlerin kaydını tutar. Tamamlanan işler burada kalırlar
(tarih ile işaretlenir), yeni işler dinamik olarak eklenir.

---

## Aktif Yapılacaklar

### 1. Kurumsal Alanları Register Ekranına Taşıma
**Dosya:** `frontend/src/features/auth/components/SignupForm.tsx`, `frontend/src/pages/dashboard/settings/ProfileTab.tsx`  
**Durum:** Ertelenmiş (tüm kurumsal alanlar hâlâ sadece Account sekmesinden giriliyor)  
**Bağlam:** 2026-08-14 itibarıyla Account sekmesine ("Firma Bilgileri" kartı) `sector`,
`trade_registry_no`, `corporate_email` alanları da eklendi (bkz. `docs/PROJECT_DESING.md` §
2026-08-14). Ancak register formu (`SignupForm.tsx`) hâlâ sadece `company_name` topluyor — geri
kalan TÜM kurumsal alanlar (`address, city, postal_code, country, phone, tax_office, tax_number,
sector, trade_registry_no, corporate_email`) yalnızca kayıt SONRASI Account sekmesinden
doldurulabiliyor. Profil sayfasında konum/telefon da hâlâ salt-okunur placeholder gösteriyor.
İdeal akış: kurumsal hesap türü (`kurumsal`) seçildiğinde register formunda bu alanların (en azından
zorunlu olanların) toplanması, boş bırakılırsa Account sekmesinden tamamlanabilmesi.  
**Sıra:** Normal  
**Tahmini:** ~6-8 saat (register flow genişletme, çok adımlı form/validation, backend zaten hazır)

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

## Tamamlananlar

(Henüz yok — yeni yapılar ertelenmiş.)

---

## Notlar
- Haftalık ~10-15 saatlik bütçenin bulunması gerekebilir.
- Her madde kapatılırken tarih eklenmeli (`## YYYY-MM-DD — [İş Adı]` başlığında).
- Yeni işler ortaya çıktıkça buraya eklenecek — bu liste canlı belgelendirmedir.
- **Dev ortamı hijyeni:** `npm run dev` her oturum sonunda kapatılmalı (terminal penceresinde `Ctrl+C`), 
  eski süreçler birikme riskit varsa `taskkill /IM node.exe /F` ile tüm Node işlemleri sonlandırılabilir 
  (dikkatli kullanılmalı, üretim Node'leri varsa tehlikelidir — bu proje dev ortamında kullanılır).
