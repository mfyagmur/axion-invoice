# Yapılacak İşler (TODO)

Bu dosya, projede kalan ve ertelenmiş işlerin kaydını tutar. Tamamlanan işler burada kalırlar
(tarih ile işaretlenir), yeni işler dinamik olarak eklenir.

---

## Aktif Yapılacaklar

### 0. Sabit Tanımlamalar Yeniden Tasarımının Tarayıcıda Görsel Teyidi
**Dosya:** `frontend/src/pages/dashboard/settings/DefinitionsTab.tsx` ve `definitions/` altındaki yeni bileşenler
**Durum:** Ertelenmiş (tarayıcı otomasyon aracı yoktu)
**Bağlam:** 2026-08-17'de `dashboard/settings?tab=definitions` 3 kartlı grid olarak yeniden
tasarlandı (bkz. `docs/PROJECT_DESING.md` § 2026-08-17). Backend uçtan uca `curl` ile, frontend
`tsc`/`eslint`/Vite HMR ile doğrulandı ama gerçek tarayıcıda hiç açılmadı. Kontrol edilmesi
gerekenler: (1) 3 kolonlu grid'in mobil/tablet/masaüstü kırılımları, (2) panel açma/kapama CSS
animasyonunun (`grid-template-rows` transition) pürüzsüz çalışması, (3) skaler ayarların
(Para Birimi, Tarih Formatı, Vergi Yılı Başlangıcı, Fatura No) dropdown `onChange`'de gerçekten
otomatik kaydedip yeşil toast gösterdiği, (4) Banka Bilgileri/Sabit Açıklama liste tipi
CRUD akışının diğer tanımlamalarla aynı şekilde çalıştığı, (5) var olan 4 tanımlamanın (Birimler,
KDV, Ödeme Vadeleri, Kategoriler) fonksiyonel olarak bozulmadığı (regresyon).
**Sıra:** Yüksek

### 0.1 Fatura Sıra Numarasının Kullanıcı Tarafından Düzenlenmesi
**Dosya:** `backend/app/models/user.py` (`invoice_sequence`), `backend/app/schemas/auth.py`, `frontend/src/pages/dashboard/settings/definitions/CompanyScalarSettingForm.tsx`
**Durum:** Kapsam dışı bırakıldı (kullanıcı onayıyla)
**Bağlam:** Fatura No ayarında şu an yalnızca prefix + basamak sayısı düzenlenebiliyor;
`invoice_sequence` (asıl sayaç) hiç editlenemiyor. Kullanıcı manuel resetleme isterse, mevcut
faturalarla numara çakışması riskine karşı geri gitmeme + çakışma kontrolü eklenmesi gerekiyor.
**Sıra:** Düşük

### 0.2 Banka Hesabı IBAN Tam Checksum Doğrulaması
**Dosya:** `backend/app/schemas/definitions.py` (`BankAccountPayload`), `frontend/src/pages/dashboard/settings/DefinitionListSection.tsx` kullanım yeri (Banka Bilgileri formu)
**Durum:** Kapsam dışı bırakıldı (kullanıcı onayıyla)
**Bağlam:** Şu an IBAN için sadece uzunluk (`min_length=15, max_length=34`) kontrolü var, tam
resmi MOD-97 checksum algoritması (TCKN doğrulamasında yapıldığı gibi) eklenmedi.
**Sıra:** Düşük

### 0.3 Banka Bilgilerinde TR Dışı Banka Desteği
**Dosya:** `frontend/src/utils/formatIban.ts`, `frontend/src/pages/dashboard/settings/definitions/DefinitionPanel.tsx` (bankAccounts bloğu), backend `BankAccountPayload`/model alanları
**Durum:** Ertelenmiş (2026-08-17'de Türkiye'ye özgü şekilde uygulandı)
**Bağlam:** Şu an Banka Bilgileri formu (Şube Adı, Şube Kodu, IBAN maskeleme) yalnızca Türkiye
banka/IBAN formatına göre tasarlandı: IBAN maskeleme `TR00 0000 0000 0000 0000 0000 00` örneğiyle
4'lü gruplar halinde, 26 karakter. TR dışı banka/IBAN formatları (farklı uzunluk, farklı gruplama,
SWIFT/BIC gibi ek alanlar, ülke-özgü validasyon) desteklenmiyor. Kullanıcı yurt dışı banka hesabı
eklemek isterse, `formatIban` util'i genişletilip model/form'a ülke kodu alanı/dinamik IBAN maskeleme
eklenmeli.
**Sıra:** Düşük

### 0.4 Sabit Tanımlamaların Fatura ve Diğer Formlara Entegrasyonu
**Dosya:** `frontend/src/pages/dashboard/invoices/InvoiceForm.tsx`, `frontend/src/pages/dashboard/customers/`, diğer formlar
**Durum:** Kısmen tamamlandı (2026-08-19'de Vade alanı + Fatura para birimi varsayılanı eklendi; geri kalan kısımlar henüz yapılmadı)
**Bağlam:** `dashboard/settings?tab=definitions` sayfasındaki 6 tanımlama listesi (Birimler, KDV, Ödeme Vadeleri, 
Kategoriler, Banka Bilgileri, Sabit Açıklama) artık tam fonksiyonel ve KDV/Birimler/Sabit Açıklama için varsayılan seçim checkbox'ları var.

**Tamamlanan (2026-08-19):**
- `InvoiceForm.tsx`: Ödeme Detayları kartına "Vade" alanı eklendi (Ödeme Vadeleri dropdown'u, vade tarihi otomatik hesaplama)
- `InvoiceForm.tsx`: "Fatura para birimi" (`currency`) alanı artık Ayarlar'daki Döviz Tipi'nde seçili para birimiyle önceden dolu geliyor (kilitli değil, değiştirilebilir)

**Kalan görevler:**
- Kalem birimlerini (line_items unit) KDV/Birimler definitions'tan seçebilir dropdown yapma
- InvoiceForm'da KDV oranı alanını KDV definitions'tan seçebilir hale getirme
- CustomerForm'da kategori seçimi definitions'tan yapma
- InvoiceDetailPage'de banka hesabı seçimi yapma
- Varsayılan seçimlerin (checkbox ile işaretlenmiş) forms'da ön dolmasını sağlama

**Sıra:** Normal
**Tahmini:** Vade + Fatura para birimi ~1 saat tamamlandı; kalan ~8-10 saat

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

### 4. 2FA (İki Adımlı Doğrulama) Backend Entegrasyonu
**Dosya:** `backend/app/models/user.py`, `backend/app/api/v1/profile.py`, `frontend/src/pages/dashboard/settings/SecurityTab.tsx`  
**Durum:** Ertelenmiş (2026-08-14'te sadece görsel/UI eklendi, gerçek TOTP yok)  
**Bağlam:** `SecurityTab.tsx`'teki 2FA kartı şu an sadece kozmetik — switch local state'te tutuluyor,
backend'e hiç yazılmıyor, "Kurulumu Başlat" butonu disabled. Gerçek implementasyon için: `User`
modeline `totp_secret`, `totp_enabled`, `totp_backup_codes` kolonları (migration), TOTP secret
üretimi (`pyotp` kütüphanesi), QR kod üretimi (`qrcode`), `POST /profile/2fa/enable` (secret+QR
döner), `POST /profile/2fa/verify` (kullanıcının authenticator'dan girdiği kodu doğrular, `totp_enabled=true`
yapar), `POST /profile/2fa/disable`, login akışına 2FA kodu adımı eklenmesi gerekiyor.  
**Sıra:** Normal  
**Tahmini:** ~4-6 saat

### 5. PreferencesTab.tsx Checkbox'larını Switch Bileşenine Taşıma
**Dosya:** `frontend/src/pages/dashboard/settings/PreferencesTab.tsx`, `frontend/src/components/Switch.tsx`  
**Durum:** Ertelenmiş (kapsam dışı bırakıldı)  
**Bağlam:** 2026-08-14'te Güvenlik Ayarları sayfası için yeni `Switch.tsx` bileşeni eklendi.
Tutarlılık için `PreferencesTab.tsx`'teki bildirim tercihlerinin düz `<input type="checkbox">`
yerine bu yeni `Switch` bileşenini kullanması ileride değerlendirilebilir.  
**Sıra:** Düşük

### 6. Oturum Listesinde Konum (GeoIP) Gösterimi
**Dosya:** `backend/app/api/v1/sessions.py`, `backend/app/models/session.py`  
**Durum:** Ertelenmiş  
**Bağlam:** `UserSession` modelinde sadece `ip_address` tutuluyor, IP'den şehir/ülke çözümleyen bir
GeoIP servisi/kütüphanesi entegre edilmedi. Güvenlik Ayarları sayfasındaki oturum listesi şu an
sadece IP adresini gösteriyor, konum bilgisi yok.  
**Sıra:** Düşük

### 7. `revoke_other_sessions` — `revoked_count` Hesaplama Mantığı Yanıltıcı Olabilir
**Dosya:** `backend/app/api/v1/sessions.py` (satır ~89-98)  
**Durum:** Ertelenmiş (2026-08-14'te oturum yönetimi bug fix'i sırasında fark edildi, kapsam dışı bırakıldı)  
**Bağlam:** Dönen `revoked_count`, `len(kullanıcının TÜM zamanki oturumları) - şu an aktif olanlar - 1`
formülüyle hesaplanıyor. Bu formül, kullanıcının geçmişte (bu istekten önce) zaten revoke edilmiş
oturumları da toplam sayıya dahil ediyor — yani kullanıcının çok sayıda eski/kapalı oturumu varsa,
frontend'e dönen ve toast'ta gösterilen "N oturum sonlandırıldı" mesajındaki N, bu istekte
gerçekten kapatılan oturum sayısından **daha yüksek** çıkabilir. Doğru hesaplama: `update()`
çağrısından hemen önce, henüz revoke edilmemiş (`revoked_at IS NULL`) ve current olmayan
oturumların sayısını almak (`.filter(...).count()` update'ten önce), `update()`'in kendi dönüş
değerini (`.update()` etkilenen satır sayısını döner) kullanmak yeterli olurdu.  
**Sıra:** Düşük (kozmetik — işlevi bozmuyor, sadece toast mesajındaki sayı yanlış olabilir)

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
