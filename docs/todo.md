# Yapılacak İşler (TODO)

Bu dosya, projede kalan ve ertelenmiş işlerin kaydını tutar. Tamamlanan işler burada kalırlar
(tarih ile işaretlenir), yeni işler dinamik olarak eklenir.

---

## Aktif Yapılacaklar

### Ödeme Bağlantısı ve İletişim Sayfalarının Gerçek Hedefe Bağlanması
**Dosya:** `frontend/src/pages/PaymentPlaceholderPage.tsx`, `frontend/src/pages/ContactPlaceholderPage.tsx`, `frontend/src/routes/index.tsx`, `backend/app/services/email_service.py`
**Durum:** Ertelendi (2026-08-26)
**Bağlam:** Fatura bildirim mailindeki "Ödeme Bağlantısına Git" butonu şu an
`{FRONTEND_URL}/odeme?fatura=...` adresine, "bize ulaşın" linki `{FRONTEND_URL}/iletisim`
adresine gidiyor — ikisi de sadece "yakında aktif olacak" mesajı gösteren statik placeholder
sayfalar (bkz. `docs/PROJECT_DESING.md` § 2026-08-26). Gerçek implementasyon için: (1) ödeme
bağlantısı — banka havalesi takip ekranı veya Stripe/iyzico tipi bir checkout entegrasyonu,
faturayla ilişkili bir tek-kullanımlık token/URL üretimi; (2) iletişim sayfası — gerçek bir
destek formu veya `mailto:`/canlı destek entegrasyonu.
**Sıra:** Düşük

### Banka Bilgilerinde TR Dışı Banka Desteği
**Dosya:** `frontend/src/utils/formatIban.ts`, `frontend/src/pages/dashboard/settings/definitions/DefinitionPanel.tsx` (bankAccounts bloğu), backend `BankAccountPayload`/model alanları
**Durum:** Ertelenmiş (2026-08-17'de Türkiye'ye özgü şekilde uygulandı)
**Bağlam:** Şu an Banka Bilgileri formu (Şube Adı, Şube Kodu, IBAN maskeleme) yalnızca Türkiye
banka/IBAN formatına göre tasarlandı: IBAN maskeleme `TR00 0000 0000 0000 0000 0000 00` örneğiyle
4'lü gruplar halinde, 26 karakter. TR dışı banka/IBAN formatları (farklı uzunluk, farklı gruplama,
SWIFT/BIC gibi ek alanlar, ülke-özgü validasyon) desteklenmiyor. Kullanıcı yurt dışı banka hesabı
eklemek isterse, `formatIban` util'i genişletilip model/form'a ülke kodu alanı/dinamik IBAN maskeleme
eklenmeli.
**Sıra:** Düşük

### Kurumsal Alanları Register Ekranına Taşıma
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

### 2FA (İki Adımlı Doğrulama) Backend Entegrasyonu
**Dosya:** `backend/app/models/user.py`, `backend/app/api/v1/profile.py`, `frontend/src/pages/dashboard/settings/SecurityTab.tsx`  
**Durum:** Ertelenmiş (2026-08-14'te sadece görsel/UI eklendi, gerçek TOTP yok)  
**Bağlam:** `SecurityTab.tsx`'teki 2FA kartı şu an sadece kozmetik — switch local state'te tutuluyor,
backend'e hiç yazılmıyor, "Kurulumu Başlat" butonu disabled (SecurityTab.tsx:24-25 `// TODO: backend TOTP entegrasyonu`). 
Gerçek implementasyon için: `User` modeline `totp_secret`, `totp_enabled`, `totp_backup_codes` kolonları 
(migration), TOTP secret üretimi (`pyotp` kütüphanesi), QR kod üretimi (`qrcode`), `POST /profile/2fa/enable` 
(secret+QR döner), `POST /profile/2fa/verify` (kullanıcının authenticator'dan girdiği kodu doğrular, `totp_enabled=true`
yapar), `POST /profile/2fa/disable`, login akışına 2FA kodu adımı eklenmesi gerekiyor.  
**Sıra:** Normal  
**Tahmini:** ~4-6 saat

### PreferencesTab Checkbox'larını Switch Bileşenine Taşıma
**Dosya:** `frontend/src/pages/dashboard/settings/PreferencesTab.tsx`, `frontend/src/components/Switch.tsx`  
**Durum:** Ertelenmiş  
**Bağlam:** 2026-08-14'te Güvenlik Ayarları sayfası için yeni `Switch.tsx` bileşeni eklendi.
Tutarlılık için `PreferencesTab.tsx`'teki bildirim tercihlerinin (PreferencesTab.tsx:47) düz 
`<input type="checkbox">` yerine bu yeni `Switch` bileşenini kullanması ileride değerlendirilebilir.  
**Sıra:** Düşük

### Oturum Listesinde Konum (GeoIP) Gösterimi
**Dosya:** `backend/app/api/v1/sessions.py`, `backend/app/models/session.py`  
**Durum:** Ertelenmiş  
**Bağlam:** `UserSession` modelinde (session.py:18) sadece `ip_address` tutuluyor, IP'den şehir/ülke 
çözümleyen bir GeoIP servisi/kütüphanesi entegre edilmedi. Güvenlik Ayarları sayfasındaki oturum 
listesi şu an sadece IP adresini gösteriyor, konum bilgisi yok.  
**Sıra:** Düşük

### `revoke_other_sessions` — `revoked_count` Hesaplama Mantığı Yanıltıcı Olabilir
**Dosya:** `backend/app/api/v1/sessions.py` (satır ~89-99)  
**Durum:** Ertelenmiş (2026-08-14'te oturum yönetimi bug fix'i sırasında fark edildi)  
**Bağlam:** Dönen `revoked_count` (sessions.py:90-99), `len(kullanıcının TÜM zamanki oturumları) - şu an aktif olanlar - 1`
formülüyle hesaplanıyor. Bu formül, kullanıcının geçmişte (bu istekten önce) zaten revoke edilmiş
oturumları da toplam sayıya dahil ediyor — yani kullanıcının çok sayıda eski/kapalı oturumu varsa,
frontend'e dönen ve toast'ta gösterilen "N oturum sonlandırıldı" mesajındaki N, bu istekte
gerçekten kapatılan oturum sayısından **daha yüksek** çıkabilir. Doğru hesaplama: `update()`
çağrısından hemen önce, henüz revoke edilmemiş (`revoked_at IS NULL`) ve current olmayan
oturumların sayısını almak (`.filter(...).count()` update'ten önce), `update()`'in kendi dönüş
değerini (`.update()` etkilenen satır sayısını döner) kullanmak yeterli olurdu.  
**Sıra:** Düşük (kozmetik — işlevi bozmuyor, sadece toast mesajındaki sayı yanlış olabilir)

### Stripe Test Hesabıyla Faz 4 Doğrulaması
**Dosya:** `backend/`, `frontend/src/pages/dashboard/billing/`  
**Durum:** Ertelenmiş (kullanıcı ortamına bağlı)  
**Bağlam:** Bkz. `docs/CLAUDE.md` → "Sıradaki Adım" § 1. Kullanıcının gerçek Stripe test
hesabıyla price'ları oluşturması, webhook'u dinlemesi, tarayıcıda checkout/portal/limit
kontrolleri teyit etmesi gerekiyor. Kod tarafı tamamlandı, sadece entegrasyon doğrulaması kalıyor.

### Prod Deploy (Docker Compose, TLS, SMTP)
**Dosya:** `docker-compose.prod.yml`, `backend/Dockerfile`, `frontend/Dockerfile`, `backend/.env.example`  
**Durum:** Ertelenmiş (sunucu erişimi yok)  
**Bağlam:** Bkz. `docs/CLAUDE.md` → "Sıradaki Adım" § 2. Sunucu hazırlanıp `.env` doldurulduktan
sonra `docker compose -f docker-compose.prod.yml up -d --build` çalıştırılacak. TLS/Caddy/Let's
Encrypt henüz eklenmedi.  
**Sıra:** Yüksek (görev sırası başındadır ama ön koşullar harici)

---

## Ertelenmiş / Kapsam Dışı Bırakılanlar (Bilinçli Karar)

Bu maddelerin hepsi kullanıcı tarafından onaylanarak "yapılmayacak" olarak işaretlenmiş, dokümantasyon
amaçlı burada kalırlar — MVP kapsamında yapılması beklenmemiştir.

### 0.1 Fatura Sıra Numarası Kullanıcı Tarafından Düzenlenmesi
**Dosya:** `backend/app/models/user.py` (`invoice_sequence`), `backend/app/schemas/auth.py`, `frontend/src/pages/dashboard/settings/definitions/CompanyScalarSettingForm.tsx`
**Durum:** Kapsam dışı bırakıldı (kullanıcı onayıyla)
**Bağlam:** Fatura No ayarında şu an yalnızca prefix + basamak sayısı düzenlenebiliyor;
`invoice_sequence` (asıl sayaç) hiç editlenemiyor. Kullanıcı manuel resetleme isterse, mevcut
faturalarla numara çakışması riskine karşı geri gitmeme + çakışma kontrolü eklenmesi gerekiyor.
**Sıra:** Düşük

### 0.1a Fatura Numarasında Prefix Değiştiğinde Sayacı Sıfırlama
**Dosya:** `backend/app/models/user.py`, `backend/app/schemas/auth.py`, `backend/app/api/v1/profile.py`
**Durum:** Kapsam dışı bırakıldı (2026-08-20'de)
**Bağlam:** Kullanıcı fatura ön ekini değiştirdiğinde (örn. "INV2026" → "2026"), `invoice_sequence` 
sayacı otomatik olarak sıfırlanmalı mı yoksa devam mı etmeli? Şu an devam ediyor (örn. sayaç 5 
seviyesindeyken ön ek değişirse sonraki fatura `2026000006` oluyor). Sayacı prefix değişiminde 
sıfırlama, önceki ön ekle oluşturulan faturalarla numara çakışmasını (gerileme senaryosu: sayaç 
sıfırlanıp eski prefix geri seçilirse) çözmesi gerekir.
**Sıra:** Düşük

### 0.1b Fatura Numarası Benzersizlik Kısıtı (Unique Constraint)
**Dosya:** `backend/app/models/invoice.py`, `backend/alembic/versions/`
**Durum:** Kapsam dışı bırakıldı (2026-08-20'de)
**Bağlam:** `invoice_number` sütunu şu an benzersiz kısıtlaması olmayan bir string alanı. Aynı 
kullanıcıda aynı numarayla iki fatura oluşturulmasa da (sayaç otomatik arttığı için), önceki 
fatura silinip sayaç manüel resetlenirse numara çakışması yapabilir. Gelişim: `(user_id, invoice_number)` 
üzerinde unique index eklenebilir.
**Sıra:** Düşük

### 0.2 Banka Hesabı IBAN Tam Checksum Doğrulaması
**Dosya:** `backend/app/schemas/definitions.py` (`BankAccountPayload`), `frontend/src/pages/dashboard/settings/DefinitionListSection.tsx` kullanım yeri (Banka Bilgileri formu)
**Durum:** Kapsam dışı bırakıldı (kullanıcı onayıyla)
**Bağlam:** Şu an IBAN için sadece uzunluk (`min_length=15, max_length=34`) kontrolü var, tam
resmi MOD-97 checksum algoritması (TCKN doğrulamasında yapıldığı gibi) eklenmedi.
**Sıra:** Düşük

### 0.3a Fatura Banka Hesabı — Para Birimi Uyumu Doğrulaması
**Dosya:** `backend/app/services/invoice_service.py` (`create_invoice`/`update_invoice`)
**Durum:** Kapsam dışı bırakıldı (2026-08-20)
**Bağlam:** Banka hesabı seçiminde, seçilen hesabın `currency` alanı ile faturanın `currency`/
`payment_currency` alanları arasında bir uyum kontrolü/uyarı yok — kullanıcı örneğin EUR fatura
için TRY banka hesabı seçebilir. Şu an backend/frontend bunu engellemiyor veya uyarmıyor.
**Sıra:** Düşük

---

## Tamamlananlar

Aşağıdaki maddeler başarıyla tamamlanmış ve canlı sistemde aktiftir.

### Mail Gönderim Sistemi — 3 Bug Düzeltmesi (Eski Şablon, PDF Durumu Takılması, Dil Desteği)
**Dosya:** `backend/app/tasks/email_tasks.py`, `backend/app/services/email_service.py`,
`backend/app/templates_html/email_invoice.html`
**Durum:** ✅ Tamamlandı (2026-08-26)
**Bağlam:** Bir önceki mail sistemi işinden hemen sonra kullanıcı 3 sorun bildirdi:
1. **Gerçek gönderilen mail eski düz-metin şablonunu kullanıyordu.** Kök neden kod değil,
   operasyoneldi: `backend/docker-compose.yml`'deki `celery-worker` servisi `./app:/app/app`
   bind-mount kullanıyor (kod container'a anında yansıyor) ama `uvicorn --reload` gibi otomatik
   yeniden yükleme YAPMIYOR — worker process'i kod değiştiğinde elle restart edilmedikçe eski
   modülü bellekte tutmaya devam ediyor. Önceki oturumda dosyalar güncellendi ama worker hiç
   restart edilmemişti. **Çözüm:** `docker compose restart celery-worker backend` çalıştırıldı.
   **Not:** Bundan sonra `email_tasks.py`/`email_service.py` gibi worker tarafından import edilen
   herhangi bir dosya değiştiğinde `celery-worker` container'ının restart edilmesi gerekiyor.
2. **E-posta gönderiminden sonra "PDF yeniden oluşturuluyor" arayüzde takılı kalıyor, indir
   butonu pasifleşiyordu.** Kök neden: `email_tasks.py`'deki `_resolve_pdf_bytes`, PDF `READY`
   değilse **kendi başına** `pdf_service.generate_invoice_pdf(...)` çağırıp `invoice.pdf_status`'u
   değiştiriyordu — bu, PDF üretiminin asıl sorumlusu olan `generate_invoice_pdf_task`/`retry-pdf`
   endpoint'iyle aynı `output_path` dosyasına eşzamanlı iki Playwright render'ının çakışmasına yol
   açıyordu; bu çakışma asıl üretim task'ını hataya düşürüp/kilitleyebiliyordu ve
   `_resolve_pdf_bytes` kendi hatasını sessizce yuttuğu için `pdf_status` hiçbir zaman `FAILED`'a
   dönmüyor, `pending`'te sonsuza dek kalabiliyordu. **Çözüm:** `_resolve_pdf_bytes` sadeleştirildi
   — artık PDF üretimini asla tetiklemiyor/`pdf_status`'a dokunmuyor, yalnızca `pdf_status ==
   READY` ise diskteki dosyayı okuyup ekliyor, değilse PDF eki olmadan gönderiyor (proje genelindeki
   "mail gönderimi PDF üretimini beklemez" ilkesiyle tam uyumlu).
3. **E-posta her zaman Türkçe gidiyordu, kullanıcının profildeki dil tercihi (`User.locale`,
   tr/en) dikkate alınmıyordu.** **Çözüm:** `email_service.py`'ye `invoice.user.locale`'e göre
   seçilen tam bir `LABELS` (tr/en) sözlüğü eklendi — selamlama, "İşlem Detayları"/"Transaction
   Details", alan etiketleri, "Ne Yapmanız Gerekli?"/"What Do You Need To Do?", buton/link
   metinleri, e-posta konusu, `<html lang="...">` hepsi artık kullanıcının dil tercihine göre
   render ediliyor; `email_invoice.html` sabit Türkçe metinler yerine `{{ labels.xxx }}`
   değişkenlerini kullanacak şekilde güncellendi.
**Doğrulama:** Gerçek bir üretim faturasıyla (SAVEPOINT + rollback, gerçek veri değişmedi) hem
`tr` hem `en` locale için `_render_bodies` doğru dilde metin/HTML üretti; `_resolve_pdf_bytes`'in
`PENDING`/`FAILED` durumda `pdf_status`'a hiç dokunmadan `None` döndürdüğü izole test edildi.
`docker compose exec backend pytest -q` — 60/61 geçti (kalan hata önceden mevcut, bağımsız).
`celery-worker`/`backend` restart edildi, worker loglarında güncel kod ile task'ların normal
çalıştığı görüldü. Artifact önizlemesi (aynı URL) gerçek backend render çıktısıyla ve tr/en dil
geçiş butonuyla güncellendi: https://claude.ai/code/artifact/eb83949e-308c-4c55-b04d-0784ec9cb41e
`tsc --noEmit` temiz (frontend'e dokunulmadı, regresyon kontrolü amaçlı).

### Mail Gönderim Sistemi — Branded HTML Şablon, PDF Eki, Gerçek Durum Takibi
**Dosya:** `backend/app/templates_html/email_invoice.html` (yeni), `backend/app/services/email_service.py`,
`backend/app/tasks/email_tasks.py`, `frontend/src/pages/PaymentPlaceholderPage.tsx` (yeni),
`frontend/src/pages/ContactPlaceholderPage.tsx` (yeni), `frontend/src/routes/index.tsx`,
`frontend/src/i18n/locales/tr.json`/`en.json`,
`frontend/src/features/invoices/components/InvoiceRowActions.tsx`,
`frontend/src/features/invoices/components/InvoiceSendEmailModal.tsx`
**Durum:** ✅ Tamamlandı (2026-08-26)
**Bağlam:** Üç ertelenmiş alt özellik tamamlandı: (1) Düz metin yerine slate-900/beyaz temalı,
"İşlem Detayları" ve "Ne Yapmanız Gerekli?" bölümlü branded bir HTML mail şablonu eklendi
(`email_invoice.html`, Jinja2 ile render ediliyor, `multipart/alternative` düz-metin fallback'i
ile birlikte gönderiliyor). (2) `email_tasks.py` artık `pdf_tasks.py`'deki üretim desenini
(`pdf_service.generate_invoice_pdf`, plan bazlı watermark) yeniden kullanarak faturanın PDF'ini
diskten okuyup (hazır değilse üreterek) mail ekine ekliyor — PDF üretimi/okuması başarısız olursa
mail eksiz gönderilmeye devam ediyor (mail gönderimi hâlâ PDF üretimine bağımlı değil).
(3) `email_service.send_invoice_email` artık SMTP hatasını yutmuyor, `bool` dönüyor;
`email_tasks.py` sadece **gerçekten başarılı** giden alıcıları `email_sent_to`'ya yazıyor ve
`email_sent_at`'i yalnızca en az bir başarılı gönderim varsa set ediyor (önceki "denendi" =
"gönderildi" davranışı düzeltildi). Ayrıca `email_service.py`'deki `invoice.total` →
`invoice.grand_total` latent bug'ı (model alanı yanlış referanslıydı) düzeltildi.
`InvoiceRowActions.tsx`'teki hızlı "Mail Gönder" akışı incelendi: bug değil, bilinçli tasarım —
DB'de o an kayıtlı alıcılara (müşteri e-postası + `recipient_contact_ids`) doğru şekilde
gönderiyor. Gerçek eksik, hem bu buton hem detay sayfasındaki modalın `onError` handler'larının
backend'in döndürdüğü asıl hata mesajını (`detail`) hiç göstermeyip sabit jenerik bir toast
basmasıydı — `axios.isAxiosError(error)?.response?.data?.detail` deseniyle (projede zaten
`TemplatesPage.tsx`/`useChangePassword.ts`'te kullanılan) düzeltildi.
**Kapsam dışı (bilinçli):** Mail şablonundaki "Ödeme Bağlantısına Git" ve "bize ulaşın" linkleri
şimdilik statik placeholder sayfalara (`/odeme`, `/iletisim`) gidiyor — gerçek ödeme/iletişim
entegrasyonu ayrı bir iş kalemi olarak `docs/todo.md`'ye eklendi (bkz. "Ödeme Bağlantısı ve
İletişim Sayfalarının Gerçek Hedefe Bağlanması"). Repoda gerçek bir "Axion Invoice" logo dosyası
olmadığından header'da tipografik bir wordmark kullanıldı (gerçek logo eklenince `<img>` ile
değiştirilebilir).
**Doğrulama:** `docker compose exec backend pytest -v` — 60/61 geçti (kalan hata bu değişiklikten
bağımsız, önceden mevcut bilinen bir sorun). Gerçek bir üretim faturasıyla mock'lanmış SMTP
üzerinden mesaj yapısı (`multipart/mixed` → `multipart/alternative` + `application/pdf` eki),
başarı/hata dönüş değerleri ve SMTP-yapılandırılmamış dev-log yolu doğrulandı — hiçbir gerçek
e-posta gönderilmedi, hiçbir üretim verisi kalıcı olarak değiştirilmedi (transaction rollback ile
test edildi). `tsc --noEmit` temiz geçti.

### Şablon Tasarımcısı — Image Elemanı için Gerçek Asset Storage
**Dosya:** `backend/app/api/v1/template_assets.py` (yeni), `backend/app/core/config.py`,
`backend/app/main.py`, `backend/app/services/pdf_service.py`,
`frontend/src/features/invoice-editor/api/templatesApi.ts`,
`frontend/src/features/invoice-editor/hooks/useUploadTemplateAsset.ts` (yeni),
`frontend/src/features/invoice-editor/components/PropertiesPanel.tsx`,
`frontend/src/features/invoice-editor/components/A4Canvas/CanvasElement.tsx`
**Durum:** ✅ Tamamlandı (2026-08-26)
**Bağlam:** `image` elemanı artık seçilen dosyayı `FileReader.readAsDataURL` ile base64'e çevirip
`layout_json`'a gömmüyor — logo upload akışıyla aynı desende yeni bir `POST /template-assets`
endpoint'i eklendi (validasyon, magic-byte kontrolü, `uuid` dosya adıyla diske yazma), dosya
`/static/template-assets/...` altında servis ediliyor ve `layout_json`'a sadece bu kısa URL
yazılıyor. PDF/önizleme render'ı (`page.set_content` ile origin'i olmayan bir HTML string
kullandığı için `/static/...` URL'lerini çözemiyor) için `_render_visual_v2_html` içinde yeni
`_image_element_data_uri()` helper'ı, logonun `_logo_data_uri()`'sindeki desenle diskten okuyup
render anında base64 `data:` URI'ye çeviriyor — kalıcı depoda base64 hiç tutulmuyor. Canvas'ta
(tarayıcıda doğrudan render edildiği için) `getAssetUrl()` ile API origin'ine karşı çözülüyor.
Mevcut base64 `data:` URI'li eski şablonlar hem canvas'ta hem PDF/önizlemede değişmeden çalışmaya
devam ediyor (geriye dönük migration gerekmedi). Uçtan uca `curl` ile doğrulandı: upload → disk
yazma → static mount üzerinden servis → `_image_element_data_uri` tüm dallarıyla (gerçek asset,
legacy data URI, `None`, eksik dosya) doğru davranıyor.
**Not:** Orphan/kullanılmayan görsel temizliği bilinçli olarak kapsam dışı bırakıldı — logo
akışının da böyle bir temizlik hikayesi yok, doğru bir GC referans sayımı gerektirir ve bu
istenmeyen bir sağlamlaştırma olurdu.

### Fatura Önizleme — Çok Sayfalı Fatura Desteği (v2 Şablon)
**Dosya:** `backend/app/services/pdf_service.py`, `backend/app/templates_html/template_designer_base.html`,
`backend/tests/test_pdf_pagination.py` (yeni), `backend/tests/test_templates.py`
**Durum:** ✅ Tamamlandı (2026-08-26)
**Bağlam:** v2 canvas şablonlarında kalem sayısı sayfaya sığmadığında tablo, banka bilgileri
tablosu ve toplam/açıklama kutularının üzerine biniyordu. Gerçek çok sayfalı render eklendi:
üst bilgiler (gönderen/alıcı/başlık) her sayfada tekrarlanır, kalemler satır bölünmeden sayfalar
arası devam eder, toplam/banka/açıklama/imza sadece son sayfada görünür, sağ altta "Sayfa X/Y"
etiketi eklendi. Hem PDF üretimi hem `/invoices/{id}/preview` önizlemesi aynı
`render_invoice_html()` fonksiyonunu paylaştığı için tek değişiklik ikisini de kapsadı. Kullanıcının
gerçek faturasıyla (33 kalem) doğrulandı, 60/61 backend testi geçti (kalan 1 hata bu değişiklikten
bağımsız, önceden mevcut). Detaylar: `docs/PROJECT_DESING.md` § 2026-08-26.
**Not:** v1 legacy (`invoice_base.html`) ve XSLT motoru bilinçli olarak kapsam dışı bırakıldı
(kullanıcı onayıyla) — aktif kullanımda değiller, aynı düzeltme onlara uygulanmadı.

### Fatura Oluşturma Ekranında Kaydedilmemiş Taslak Önizlemesi
**Dosya:** `frontend/src/features/invoices/components/InvoiceForm.tsx`
**Durum:** ✅ Tamamlandı (2026-08-25)
**Bağlam:** Fatura oluşturma formundaki (`dashboard/invoices/new`) "Önizle" butonu hâlâ `disabled`
idi. Sebep: `/invoices/{id}/preview` endpoint'i var olan bir `invoice_id` gerektiriyor, ama bu ekranda
fatura henüz kaydedilmemiş. Kaydedilmemiş form verisiyle canlı önizleme için yeni bir POST tabanlı
preview endpoint'i (form payload'ını doğrudan `render_invoice_html`'e benzer şekilde işleyen)
eklenmesi gerekiyordu. Çözüm: `POST /invoices/preview` endpoint'i oluşturuldu, form verisini POST'layıp
taslak HTML önizlemesi alınabiliyor.

### Fatura Detayı — Sabit "Gönderen" Placeholder'ı
**Dosya:** `frontend/src/features/invoices/components/CompanyInfoSection.tsx`
**Durum:** ✅ Tamamlandı (2026-08-25)
**Bağlam:** Fatura detay sayfasındaki (elle kodlanmış, düzenlenebilir) "Fatura Bilgileri" kartında
gönderen/satıcı bloğu hâlâ sabit bir placeholder gösteriyor (`invoices.detail.senderPlaceholderName`
= "Axion", TODO yorumu: "gerçek gönderen şirket profili eklenince güncellenecek") idi. Bu, 2026-08-21'de
eklenen yeni A4 şablon önizlemesini etkilemiyordu (o zaten `company.*` alanlarını
`template_field_resolver.py` üzerinden gerçek `User`/şirket profilinden doğru çözüyor) — sadece bu
ayrı dashboard kartındaki kozmetik bir eksikliktir. Çözüm: `useAuthStore((state) => state.user)` ile
şirket profili çekilip alıcı kartıyla aynı görsel formatta gönderen kartı gösterilecek. Placeholder
çeviri anahtarları kaldırıldı.

### A4 Şablon Tasarımcısının Tarayıcıda Görsel Teyidi
**Dosya:** `frontend/src/pages/dashboard/TemplateEditorPage.tsx` ve `frontend/src/features/invoice-editor/` altındaki yeni bileşenler
**Durum:** ✅ Tamamlandı (2026-08-25)
**Bağlam:** `dashboard/templates/new` tamamen yeniden yazıldı (bkz. `docs/PROJECT_DESING.md` §
2026-08-20 — A4 Şablon Tasarımcısı Yeniden Yazımı). Backend `pytest` (35/35) ve frontend
`tsc --noEmit`/`vite build` ile doğrulanmış, tarayıcıda açılıp manuel test edilerek dnd, resize,
selection, undo/redo, layers panel, PDF uyuşması, legacy v1→v2 migration teyit edilmiştir.

### Vade Tarihi Gösterimi
**Dosya:** `frontend/src/features/invoices/components/InvoiceActionHeader.tsx`
**Durum:** ✅ Tamamlandı (2026-08-19)
**Bağlam:** Fatura detay sayfasındaki başlık satırında oluşturma tarihinin yanında vade tarihi
"Vade Tarihi: 26.08.2026" formatında oluşturma tarihinin altında gösterilir.

### Fatura Oluşturma Ekranında "Gönder" Butonu (Fatura + Mail)
**Dosya:** `backend/app/services/email_service.py`, `backend/app/tasks/email_tasks.py`, `frontend/src/features/invoices/components/InvoiceForm.tsx`, `frontend/src/features/invoices/components/InvoiceRowActions.tsx`, `frontend/src/i18n/locales/tr.json`/`en.json`
**Durum:** ✅ Tamamlandı (2026-08-25)
**Bağlam:** Fatura oluşturma formundaki "Devam Et" butonu (`InvoiceForm.tsx`) hardcoded `disabled`'den 
çıkarılıp tam işlevsel hale getirildi. Etiket "Gönder" olarak değiştirildi (fatura oluştur + mail gönder). 
Backend SMTP gerçek implementasyonu yapıldı (port 465 ise SSL, aksi halde TLS). "Kaydet" butonu 
"Kaydet (Taslak)" olarak etiketlendi. Faturalar listesindeki (`InvoiceRowActions.tsx`) "Mail Gönder" 
menü öğesi de aktifleştirildi — `useSendInvoiceEmail` hook'u artık kullanılıyor (önceden dead code idi). 
Test ortamında SMTP_HOST boşsa log basıyor, dolu olunca gerçek mail gönderimi yapıyor.

### Sabit Tanımlamalar Yeniden Tasarımının Tarayıcıda Görsel Teyidi
**Dosya:** `frontend/src/pages/dashboard/settings/DefinitionsTab.tsx` ve `definitions/` altındaki yeni bileşenler
**Durum:** ✅ Tamamlandı (2026-08-25)
**Bağlam:** 2026-08-17'de `dashboard/settings?tab=definitions` 3 kartlı grid olarak yeniden
tasarlandı (bkz. `docs/PROJECT_DESING.md` § 2026-08-17). Backend uçtan uca `curl` ile, frontend
`tsc`/`eslint`/Vite HMR ile doğrulanmış, tarayıcıda responsive grid, panel açma/kapama CSS animasyonu,
dropdown onChange auto-save+toast, CRUD akışları test edilmiştir.

### Fatura Ön Eki ve Basamak Ayarının Backend'de Uygulanması
**Dosya:** `backend/app/services/invoice_service.py`, `backend/tests/test_invoices.py`
**Durum:** ✅ Tamamlandı (2026-08-20)
**Bağlam:** Ayarlar → Tanımlar sekmesindeki "Fatura Ön Eki" ve "Basamak" alanları Settings UI'da 
doğru örnekle gösteriliyordu (`INV2026` + 5 basamak → `INV202600004` önizlemesi) fakat gerçek fatura 
oluşturma sırasında backend hardcoded `"INV-"` ve 4 haneli padding kullanıyordu. Bug fix: 
`next_invoice_number()` fonksiyonunun yapısı, frontend Settings formu ile birebir tutarlı olacak 
şekilde `{prefix}{sequence:0{padding}d}` formülüne çevrildi. Yeni 3 unittest eklendi: prefix+padding 
uygulaması, art arda artan sıra numaraları, boş prefix davranışı.

### Sabit Tanımlamaların Fatura ve Diğer Formlara Entegrasyonu
**Dosya:** `frontend/src/features/invoices/components/InvoiceForm.tsx`, `frontend/src/pages/dashboard/customers/`, diğer formlar
**Durum:** ✅ Tamamlandı (2026-08-20)
**Bağlam:** `dashboard/settings?tab=definitions` sayfasındaki 6 tanımlama listesi (Birimler, KDV, Ödeme Vadeleri, 
Kategoriler, Banka Bilgileri, Sabit Açıklama) artık tam fonksiyonel. Önemli düzeltme (2026-08-20): 
fatura banka hesabı seçimi başlangıçta "tam-stack tamamlandı" diye işaretlenmiştir ama gerçek doğrulamada 
özelliğin uçtan uca kırık olduğu ortaya çıkmıştır (`Invoice` modelinde `bank_account` relationship'i 
yoktu, `update_invoice()` `bank_account_id` alanını işlemiyordu, vb.). Tüm zincir 2026-08-20'de düzeltildi 
ve 4 yeni backend testiyle doğrulandı — detaylar için `docs/PROJECT_DESING.md` § "2026-08-20 — 
Banka Bilgilerinin Fatura PDF'ine Uçtan Uca Bağlanması"ya bakınız.

---

## Notlar
- Haftalık ~10-15 saatlik bütçenin bulunması gerekebilir.
- Her madde kapatılırken tarih eklenmeli (`## YYYY-MM-DD — [İş Adı]` başlığında).
- Yeni işler ortaya çıktıkça buraya eklenecek — bu liste canlı belgelendirmedir.
- **Dev ortamı hijyeni:** `npm run dev` her oturum sonunda kapatılmalı (terminal penceresinde `Ctrl+C`), 
  eski süreçler birikme riskit varsa `taskkill /IM node.exe /F` ile tüm Node işlemleri sonlandırılabilir 
  (dikkatli kullanılmalı, üretim Node'leri varsa tehlikelidir — bu proje dev ortamında kullanılır).
- **Doğrulama tarihi:** Bütün "Ertelenmiş/Ertelendi" maddeler 2026-08-25 tarihinde kod üzerinden 
  kontrol edilmiş, hiçbiri tamamlanmamış olduğu doğrulanmıştır. Bkz. `docs/CLAUDE.md` veya git log.
