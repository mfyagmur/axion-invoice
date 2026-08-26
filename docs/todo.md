# Yapılacak İşler (TODO)

Bu dosya, projede kalan ve ertelenmiş işlerin kaydını tutar. Tamamlanan işler burada kalırlar
(tarih ile işaretlenir), yeni işler dinamik olarak eklenir.

---

## Aktif Yapılacaklar

### 0.1 Şablon Tasarımcısı — Ertelenen Alt Özellikler
**Durum:** Bilinçli olarak kapsam dışı bırakıldı — eklendi 2026-08-20
**Bağlam:** `docs/A4_Invoice_template.md`'nin ana maddeleri teslim edildi ama şu detaylar düşük
değer/yüksek efor nedeniyle ertelendi:
- **Equal-spacing snap:** 3+ eleman arasında eşit boşluk tespiti (`canvasGeometry.ts` şu an sadece
  grid/kenar/merkez/sayfa-merkezi snap destekliyor).
- **`GET /templates/{id}/preview-data`:** Editördeki "Önizle" modu şu an sadece element
  etiketlerini/placeholder'larını gösteriyor, gerçek bir faturanın verisiyle doldurmuyor.
- **Gerçek asset storage:** `image` elemanı seçilen dosyayı base64 data URL olarak `layout_json`
  içine gömüyor (backend'deki logo upload akışıyla aynı diske-yazma deseni kullanılmıyor) — büyük
  görsellerde JSONB satırını şişirebilir.
**Sıra:** Düşük

### Mail Gönderim Sistemi (SMTP) — Temel Uçtan Uca
**Dosya:** `backend/app/services/email_service.py`, `backend/app/tasks/email_tasks.py`, `frontend/src/features/invoices/components/InvoiceSendEmailModal.tsx`
**Durum:** Ertelendi (2026-08-25, güncellendi 2026-08-25)
**Bağlam:** Gerçek SMTP gönderimi uygulandı. E-posta gönderim durumu artık DB'de izleniyor
(`invoices.email_sent_at`/`email_sent_to`, `send_invoice_email_task` tarafından yazılıyor) ve
çoklu alıcı (`recipient_contact_ids`) Fatura Detay ekranındaki "E-Posta Gönder" modalından
düzenlenebiliyor — bu iki madde tamamlandı. Kalan ertelenen alt özellikler:
- Mail şablonu (HTML/branded tasarım) — şu an düz metin mesaj (`"Fatura Numarası: {num}..."`)
- Fatura PDF eki — `email_tasks.py` PDF bağımlılığını kaldırdı, mail gönderimi PDF üretimini beklemez
- Per-recipient gönderim başarı/hata takibi — `send_invoice_email_task` şu an "denendi" = "gönderildi"
  kabul ediyor, `email_service.send_invoice_email` içindeki SMTP hataları sadece loglanıyor,
  `email_sent_to` listesine hangi adreslerin gerçekten başarılı gittiği ayrımı yansımıyor
- `InvoiceRowActions.tsx`'teki liste sayfası "Mail Gönder" hızlı-gönder menü öğesi hâlâ alıcı
  düzenlemeden anlık gönderim yapıyor (detay sayfasındaki modal'a yönlendirilmedi, bilinçli olarak
  iki ayrı yol korundu)
**Sıra:** Orta (serideki sonraki adım)

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
