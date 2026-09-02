# Proje Tasarım ve İşlem Kayıtları

Bu dosya, projede yapılan önemli backend/frontend değişikliklerinin tarihli kaydını tutar.

---

## 2026-09-02 — Demo Kullanıcı Dashboard'u

**Durum:** Ekleme — Tamamlandı.

**Özet:** `/dashboard` ekranı o güne kadar tamamen boş bir placeholder'dı ("Hoş geldiniz" yazısı
dışında hiçbir şey göstermiyordu). Bu iterasyonda **sadece demo hesap** için modern, veri odaklı
bir dashboard eklendi (normal kullanıcı ve admin dashboard'ları bilinçli olarak kapsam dışı
bırakıldı, `docs/todo.md`'ye ertelendi). Backend'de dashboard/istatistik amaçlı hiçbir endpoint
yoktu ve frontend'de hiç chart kütüphanesi kurulu değildi — bu nedenle iş hem yeni backend
agregasyon katmanını hem frontend'e **Recharts** entegrasyonunu kapsadı.

Ekran 3 bölümden oluşuyor: (1) "Genel Bakış" başlığı + bugünün tarihi + "Merhaba {ad}" + "Yeni
Fatura Ekle"/"Yeni Müşteri Ekle" butonları, altında 4 KPI kartı (Toplam/Ödenen/Bekleyen/Geciken —
her biri para birimi bazında gruplanmış tutar, fatura adedi ve TRY-bazlı aylık % trend oku ile);
(2) tarih aralığı + para birimi filtresine tepki veren bir durum dağılım donut grafiği ("Faturalar")
ve bir tutar aktivite bar grafiği ("Fatura Aktivitesi"); (3) son 10 faturayı listeleyen tıklanabilir
bir tablo ve en yüksek tutarlı 6 müşteriyi listeleyen bir tablo.

Kullanıcıyla netleştirilen iki ürün kararı: **"Toplam Fatura Tutarları"** arşivlenmemiş+iptal
edilmemiş tüm faturaları kapsar (taslak dahil — diğer 3 kart bunun alt kümesidir ama toplamları
"Toplam"a birebir eşit olmayabilir, bu kasıtlı); **aylık % trend** sadece **TRY cinsinden**
faturaların tutar bazlı ay-üzeri-ay değişimidir (çoklu döviz + canlı kur sorgusu olmadan güvenilir
toplanamayacağı için diğer para birimleri trend hesabına dahil edilmez, ilgili ay/geçen ay TRY
faturası yoksa `null`/nötr gösterilir).

Çoklu döviz her yerde **gruplanarak** gösterildi, asla sessizce toplanmadı (örn. "12.450,00 TRY" +
"340,00 USD" ayrı satırlar) — projede canlı TCMB kuru dışında saklı bir kur tablosu olmadığından
(bkz. `backend/app/services/fx_service.py`) cross-currency toplama güvenilir değil. Grafikler tek
seferde tek para birimi gösterir (dropdown ile seçilir).

**Yapılan dosyalar:**
- Backend (yeni): `backend/app/schemas/dashboard.py` (KPI/currency-breakdown/chart response
  şemaları), `backend/app/services/dashboard_service.py` (agregasyon mantığı — `display_status`
  hesaplaması `InvoiceSummaryResponse`'takiyle birebir aynı kurallarla `compute_display_status`
  helper'ında tekrarlandı, kova tanımları + TRY trend hesabı + top-6-müşteri sıralaması burada),
  `backend/app/api/v1/dashboard.py` (`GET /dashboard/overview`, `GET /dashboard/charts?currency=&
  from=&to=` — iki ayrı endpoint, KPI/son-faturalar/top-müşteriler filtre bağımsız olduğundan
  filtre değişince yeniden hesaplanmasınlar diye ayrıldı).
- Backend (değişiklik): `backend/app/main.py` — yeni `dashboard_router` kaydedildi.
- Frontend (yeni): `frontend/src/features/dashboard/` — `api/dashboardApi.ts`,
  `types/dashboard.ts`, `hooks/useDashboardOverview.ts` + `useDashboardCharts.ts`,
  `components/{DemoDashboard,DashboardWelcomeHeader,KpiCardGrid,KpiCard,CurrencyAmountChips,
  DashboardFilters,InvoiceStatusDonutChart,InvoiceActivityChart,RecentInvoicesTable,
  TopCustomersTable}.tsx`.
- Frontend (değişiklik): `frontend/src/pages/dashboard/DashboardHomePage.tsx` — `user.is_demo`
  true ise yeni `<DemoDashboard />`, değilse eski placeholder aynen korunuyor (normal/admin
  kullanıcı şimdilik dokunulmadı). `frontend/src/pages/dashboard/CustomersPage.tsx` — dashboard'daki
  "Yeni Müşteri Ekle" butonu `navigate(..., { state: { openNewCustomerModal: true } })` ile
  yönlendiriyor, `CustomersPage` bu state'i lazy `useState` initializer'ında okuyup modalı otomatik
  açıyor (setState-in-effect lint kuralına takılmamak için state güncellemesi effect'te değil,
  başlangıç state'inde yapıldı; effect sadece router state'ini temizlemek için kullanıldı).
  `frontend/src/i18n/locales/{tr,en}.json` — yeni `dashboard.demo.*` namespace'i.
- Bağımlılık: `frontend/package.json`'a `recharts` eklendi (SVG/React tabanlı, projedeki hand-rolled
  Tailwind component tarzına uyduğu, Tremor gibi kendi tasarım sistemini dayatmadığı için tercih
  edildi).

**Doğrulama:** Backend `py -c "import app.main"` ile temiz import edildi. `npx tsc -b` ve
`npx eslint` yeni dosyalarda hatasız (mevcut 4 pre-existing TS hatası bu değişiklikten bağımsız,
dokunulmayan dosyalarda). Backend + frontend dev server'ları başlatılıp demo hesapla (`demo@
axioninvoice.app`) gerçek giriş yapıldı, Playwright (headless Chromium, proje bağımlılığı değil —
scratchpad'te ayrı kuruldu) ile: masaüstü (1440px), mobil (390px) ve dark mode (`document.
documentElement.classList.add('dark')`) ekran görüntüleri alındı — tüm 3 bölüm doğru veriyle
render oluyor, responsive grid'ler (KPI 4→2→1 col, chart/tablo 3→1 col) çalışıyor, dark mode'da
grafik/tablo/kart renkleri okunabilir. "Yeni Müşteri Ekle" butonu tıklanıp `/dashboard/customers`'a
yönlendiği ve `CustomerFormModal`'ın otomatik açıldığı doğrulandı. Son Faturalar tablosunda bir
satıra tıklanıp `/dashboard/invoices/:id` detay sayfasına gittiği doğrulandı. Konsol/network
hatası yok (tek gözlenen 401, `/auth/refresh`'in sayfa ilk yüklenirken oturum yokken denemesi —
bu değişiklikten önce de var olan, ilgisiz bir davranış). Backend endpoint'leri demo kullanıcının
gerçek seed verisiyle (6 fatura, 6 müşteri) curl ile de ayrı doğrulandı: KPI kova toplamları, TRY
trend yüzdeleri (`-100.0%` — seed verisi tek seferde geçmiş tarihlere yazıldığı için "bu ay" 0
fatura, beklenen davranış), top-6-müşteri sıralaması ve son-10-fatura listesi doğru döndü.

---

## 2026-09-02 — Fatura Durum Sistemi Düzeltmeleri (Round 3: kalıcı DRAFT kaydı ve geriye dönük düzeltme)

**Durum:** Değiştirme — Tamamlandı.

**Özet:** Round 2'deki `celery-worker` restart'ı yeterli olmadı çünkü sorun canlı process'in eski
kodu değil, **veritabanındaki kalıcı veriydi**: bu faturalar ilk gönderildiklerinde `status: DRAFT →
SENT` mutasyonu henüz hiç yazılmamıştı (Round 1'den önce gönderilmişlerdi), dolayısıyla `status`
kolonu DB'de kalıcı olarak `DRAFT` yazılı kaldı — worker'ı yeniden başlatmak yeni gönderimleri
düzeltir ama geçmişte kalmış satırları düzeltmez. `docker exec backend-postgres-1 psql` ile
kontrol edilip 11 fatura (`email_sent_at` dolu ama `status='DRAFT'`) tek seferlik `UPDATE invoices
SET status='SENT' WHERE status='DRAFT' AND email_sent_at IS NOT NULL` ile geriye dönük düzeltildi.
Ayrıca `display_status` computed_field'ı, ham `status` kolonuna değil gerçek sinyal olan
`email_sent_at`'e de bakacak şekilde güçlendirildi (`status == SENT or email_sent_at is not None`)
— böylece ileride benzer bir veri tutarsızlığı (örn. bir worker restart'ı kaçırılırsa) tekrar aynı
görsel bug'a yol açmaz.

Ayrıca kullanıcıyla netleştirildi: **hiç e-posta ile gönderilmemiş (hâlâ gerçek Taslak) ama vade
tarihi geçmiş bir fatura "Gecikmiş" değil "Taslak" olarak kalmaya devam eder** — "Gecikmiş" sadece
gönderilmiş faturalar için anlamlıdır. Test sırasında rapor edilen "20.08.2026 gibi duran faturalar
hâlâ Taslak" örnekleri incelendiğinde bunların gerçekten hiç gönderilmemiş (email_sent_at boş)
taslaklar olduğu doğrulandı — bu, mevcut kapsam kararıyla tutarlı, bug değil.

**Yapılan dosyalar:**
- Backend: `backend/app/schemas/invoice.py` — `display_status`'ta `SENT` kontrolüne `or
  self.email_sent_at is not None` fallback'i eklendi.
- Veri: `axion_invoice` DB'sinde 11 satırlık tek seferlik backfill (`status`: `DRAFT` → `SENT`,
  yalnızca `email_sent_at` dolu olanlar) — kod değişikliği değil, geçmiş veri düzeltmesi.

**Doğrulama:** SQL ile backfill öncesi/sonrası satır sayısı ve değerleri doğrulandı (11/11 satır
`SENT`'e döndü). `due_at <= today` / `email_sent_at` fallback mantığı gerçek veri üzerinden elle
izlendi (örn. `INV202600015`: due_at 2026-08-24 ≤ bugün 2026-09-02 → beklenen sonuç "overdue").
Backend `--reload` ile yeni koddan temiz başladığı log'dan doğrulandı.

---

## 2026-09-02 — Fatura Durum Sistemi Düzeltmeleri (Round 2: Timeline yapısı, gönderim bug'ı, gecikme kuralı)

**Durum:** Değiştirme — Tamamlandı.

**Özet:** Aynı günün ilk turunda eklenen `display_status`/`StatusTimeline` işini kullanıcı canlıda
inceledi ve 3 sorun bildirdi, üçü de düzeltildi:

1. **`StatusTimeline` yapısı bozulmuştu.** İlk turda sabit 4 adımlı akış (Oluşturuldu → E-posta
   Gönderildi → Ödeme Alındı → Ödendi) kaldırılıp dallanan/dinamik bir adım listesiyle
   değiştirilmişti. Bu geri alındı: adım listesi tekrar sabit 4 öğe, `tone`/dallanma mantığı
   kaldırıldı. Arşiv/iptal/gecikme durumları artık adım listesini değiştirmiyor, bunun yerine
   Card'ın üstünde bağımsız, aynı anda birden fazlası gösterilebilen renkli banner'lar olarak
   ekleniyor (`timelineArchivedNote`/`timelineCancelledNote`/`timelineOverdueNote`). Alt mesaj
   bloğu da eski `completedStepsCount`'a göre 4 durumlu (`created-only`/`sent`/`payment-received`/
   `paid`) mantığa döndü, üstüne cancelled/overdue öncelikli iki mesaj eklendi.
2. **Gönderilen faturalar "Taslak" görünmeye devam ediyordu.** Kök neden kod değil, ortamdı:
   `email_tasks.py`'deki `status: DRAFT → SENT` mutasyonu doğru yazılmıştı ama çalışan
   `celery-worker`/`celery-beat` container'ları ilk turun kodunu hiç yüklememiş, saatlerdir eski
   process bellekte duruyordu (backend'in `--reload`'ı yalnızca `uvicorn`'u kapsıyor, Celery'yi
   otomatik yeniden başlatmıyor) — `docker restart backend-celery-worker-1 backend-celery-beat-1`
   ile çözüldü. Ayrıca gerçek bir kod kusuru da bulundu ve düzeltildi:
   `PaymentChaserPanel.tsx:103`'te rozet hâlâ ham `row.status`'u kullanıyordu, `row.displayStatus`'a
   çevrildi (diğer tüm kullanım noktaları ilk turda geçirilmişti, bu biri atlanmıştı).
3. **Gecikmiş (overdue) hesabı eksikti.** Kural genişletildi: vade tarihi girilmişse artık
   `due_at <= today` (vadesi bugün olan da "gecikmiş" sayılıyor, önceden kesin `<` idi); vade
   tarihi hiç girilmemişse oluşturulma gününden bir gün sonrasından itibaren (`created_at.date() <
   today`) gecikmiş sayılıyor. Kapsam aynı: yalnızca `SENT` durumundaki faturalar gecikmiş olabilir.

**Yapılan dosyalar:**
- Backend: `backend/app/schemas/invoice.py` — `display_status` computed_field'daki overdue dalı
  genişletildi (yukarıdaki kural).
- Frontend: `frontend/src/features/invoices/components/StatusTimeline.tsx` — sabit 4 adımlı yapıya
  geri dönüldü, arşiv/iptal/gecikme banner olarak eklendi; `frontend/src/features/invoices/components/PaymentChaserPanel.tsx` —
  rozet `row.displayStatus`'a çevrildi; `frontend/src/i18n/locales/tr.json` ve `en.json` —
  `timelinePaymentReceived`, `timelineMessagePaymentReceived`, `timelineCancelledNote`,
  `timelineOverdueNote` anahtarları eklendi.
- Ortam: `celery-worker`/`celery-beat` container'ları yeniden başlatıldı (kod değişikliği değil,
  ilk turun kodunun canlıya alınması için gerekliydi).

**Doğrulama:** `npx tsc --noEmit` (4 önceden var olan, ilgisiz hata dışında temiz), `npx eslint` iki
değişen dosyada temiz, iki locale dosyası JSON olarak geçerli, `docker logs backend-celery-worker-1`
ile worker'ın yeni koddan temiz başladığı doğrulandı. Gerçek e-posta gönderimi ve tarayıcı üzerinden
görsel doğrulama kullanıcıya kalıyor (bu ortamda tarayıcı aracı yok).

---

## 2026-09-02 — Fatura Durum (Status) Sisteminin Gerçek Yaşam Döngüsünü Yansıtması

**Durum:** Değiştirme — Tamamlandı.

**Özet:** `dashboard/invoices` listesi ve fatura detay sayfası (`StatusTimeline` dahil), gerçekte
hiç tetiklenmeyen durum geçişlerini gösteriyordu: `InvoiceStatus` enum'ında `SENT`/`OVERDUE` değerleri
vardı ama hiçbir kod yolu bunları yazmıyordu (e-posta gönderildiğinde sadece `email_sent_at` doluyor,
`status` hep `DRAFT` kalıyordu); `archived` alanı `status`'tan bağımsız bir boolean olduğu için
arşivlenen bir fatura rozette hâlâ eski durumunu gösteriyordu. Artık: fatura oluşturulunca **Taslak**,
e-posta gönderilince **Gönderildi** (gerçek DB geçişi), vade tarihi geçmiş ve hâlâ ödenmemiş
gönderilmiş faturalar için **Gecikmiş** (response-time hesaplanan, DB'ye yazılmayan alan), arşive
alınanlar **Arşiv**, iptal edilenler **İptal** rozetiyle gösteriliyor — hem listede hem detay sayfasının
üst rozetinde hem `StatusTimeline`'da tutarlı.

Kapsam kararı (kullanıcıyla netleştirildi): "Ödendi" (`paid`) durumuna geçecek hiçbir manuel/otomatik
mekanizma sistemde yoktu ve bu işin kapsamı dışında bırakıldı — ayrı bir iş olarak `docs/todo.md`'ye
eklendi. "Gecikmiş" DB'ye yazılan kalıcı bir durum değil, her API yanıtında anlık hesaplanan bir alan
(`display_status`) olarak tasarlandı — böylece ek migration veya zamanlanmış görev (cron) gerekmeden
her okumada güncel kalıyor, ve ödeme/iptal gibi bir aksiyon olduğunda otomatik olarak "gecikmiş"
etiketinden çıkıyor.

**Yapılan dosyalar:**

Backend:
- `backend/app/tasks/email_tasks.py` — Değiştirme: `send_invoice_email_task` içinde başarılı
  gönderim sonrası (`successful_recipients` doluyken), fatura hâlâ `DRAFT` ise `invoice.status`
  artık `SENT`'e gerçekten güncelleniyor (önceden sadece `email_sent_at`/`email_sent_to` doluyordu).
- `backend/app/schemas/invoice.py` — Değiştirme: `due_at` alanı `InvoiceDetailResponse`'tan
  `InvoiceSummaryResponse`'a taşındı (liste endpoint'i de vade tarihine ihtiyaç duyuyor);
  `InvoiceSummaryResponse`'a yeni `display_status` computed field eklendi — öncelik sırası:
  `archived` → `cancelled` → `paid` → (`sent` + vade geçmiş) `overdue` → ham `status`. Ham
  `status` kolonu ve ona bağlı iş mantığı (örn. `update_invoice`'ın sadece `DRAFT`'ta izin vermesi,
  cancel/restore guard'ları) değişmedi — `display_status` salt-okunur, DB'ye yazılmıyor.

Frontend:
- `frontend/src/types/invoice.ts` — Değiştirme: `InvoiceDisplayStatus = InvoiceStatus | 'archived'`
  eklendi; `InvoiceSummary`'ye `display_status`/`due_at` eklendi (`due_at` `InvoiceDetail`'den
  taşındı, artık Summary seviyesinde).
- `frontend/src/features/invoices/types/invoiceRow.ts`,
  `frontend/src/features/invoices/utils/mapInvoiceToRow.ts` — Değiştirme: `InvoiceRow`'a
  `displayStatus` alanı eklendi.
- `frontend/src/features/invoices/utils/invoiceStatusBadge.ts` — Değiştirme:
  `INVOICE_STATUS_BADGE_COLOR` artık `InvoiceDisplayStatus` bazlı, `archived: 'amber'` eklendi
  (mevcut `Badge` bileşeninde tanımlı ama hiç kullanılmayan `amber` rengi kullanıldı).
- `frontend/src/features/invoices/components/InvoiceStatusBadge.tsx` — Değiştirme: `status` prop
  tipi `InvoiceDisplayStatus`'a genişletildi.
- `frontend/src/features/invoices/components/InvoiceTableRow.tsx`,
  `frontend/src/features/invoices/components/InvoiceActionHeader.tsx` — Değiştirme: rozetler artık
  ham `status` yerine `displayStatus`/`display_status` gösteriyor.
- `frontend/src/pages/dashboard/CustomerDetailPage.tsx` — Değiştirme: lokal `STATUS_KEYS` sözlüğü
  kaldırıldı, müşteri detayındaki fatura listesi artık paylaşılan `InvoiceStatusBadge` bileşenini
  kullanıyor (kod tekrarı giderildi).
- `frontend/src/pages/dashboard/InvoicesPage.tsx` — Değiştirme: durum filtresi (`InvoiceToolbar`)
  artık `row.displayStatus`'a göre eşleşiyor (önceden ham `status`'a göreydi, "Gecikmiş" filtresi
  hiçbir zaman eşleşmiyordu). Sekme ayrımı (`archived`/`cancelled` tab'ları) ham alanlara göre
  kalmaya devam ediyor — bu iş mantığı, görsel etiketten bağımsız.
- `frontend/src/features/invoices/components/StatusTimeline.tsx` — Değiştirme: sabit 4 adımlı
  ("Oluşturuldu → E-posta Gönderildi → Ödeme Alındı → Ödendi") jenerik yapı kaldırıldı, yerine
  gerçek duruma göre dinamik adım listesi geldi: Oluşturuldu → (varsa) E-posta Gönderildi → ardından
  duruma göre **İptal Edildi** (kırmızı, terminal) veya **Ödendi** veya **Vade Geçti/Gecikmiş**
  (kırmızı, "dikkat" vurgusu) adımı. `archived` true ise adımlardan bağımsız ayrı bir amber
  "Arşivlendi" notu gösteriliyor. Hardcoded Türkçe mesaj metinleri kaldırılıp `t()` üzerinden i18n'e
  taşındı; kullanılmayan "Ödeme Alındı" ara adımı silindi (backend'de zaten ayrı bir "ödeme alındı"
  durumu yok).
- `frontend/src/pages/dashboard/InvoiceDetailPage.tsx` — Değiştirme: `StatusTimeline`'a yeni
  `displayStatus`/`archived`/`dueAt` prop'ları geçiliyor.
- `frontend/src/features/invoices/mocks/mockInvoiceRows.ts` — Değiştirme: mock satırlara
  `displayStatus` alanı eklendi (tip uyumu için).
- `frontend/src/i18n/locales/tr.json`, `frontend/src/i18n/locales/en.json` — Değiştirme:
  `invoices.status.archived` eklendi; `invoices.detail` altında `timelineOverdue`,
  `timelineCancelled`, `timelineArchivedNote` ve mesaj key'leri (`timelineMessage*`) eklendi,
  kullanılmayan `timelinePaymentReceived` kaldırıldı.

**Kapsam dışı bırakılanlar:** `PAID` durumuna manuel/otomatik geçiş mekanizması (bkz.
`docs/todo.md`); `archived` boolean kolonunun kendisi ve `/archive`/`/unarchive` endpoint'lerinin
davranışı (değişmedi, sadece görsel yansıması eklendi); herhangi bir DB migration (`display_status`
response-time hesaplanıyor, saklanmıyor).

**Doğrulama:**
- `npx tsc --noEmit -p tsconfig.app.json` → değiştirilen dosyalarda yeni hata yok; önceden var olan,
  ilgisiz 4 hata (Checkbox, navigation, InvoiceSendEmailModal, ProfileTab) değişmeden kaldı.
- Backend syntax'ı görsel olarak doğrulandı (bu ortamda çalışır bir Python yorumlayıcısı yoktu,
  `pytest`/`docker compose exec backend pytest` bu oturumda çalıştırılamadı).
- **Tarayıcıda henüz test edilmedi** — bkz. `docs/todo.md`.

---

## 2026-09-01 — Demo Hesabı Güvenlik Sekmesi (Security Tab) Kilitlemesi

**Durum:** Ekleme — Tamamlandı.

**Özet:** Demo hesabı (`demo@axioninvoice.app`) `dashboard/settings?tab=security` sayfasında
şifre değişikliği, iki adımlı doğrulama (2FA) ve açık oturumlar bölümlerini kullanıcı-engelleme +
KVKK gizlilik mesajı ile kilitlenmiş. 

Demo user'a yapılan işlemler:
1. Şifre değişikliği form'u — tüm input'lar disabled, "Şifreyi Değiştir" butonu disabled
2. 2FA (İki Adımlı Doğrulama) — Switch disabled, setup butonu disabled  
3. Açık Oturumlar — bölüm gizli, yerine "Demo hesabında KVKK gizlilik ilkesi nedeniyle açık
   oturumlar gösterilmemektedir" mesajı gösterilir

**Yapılan değişiklikler:**

1. **Backend** — ek değişiklik yok, önceki "Account Tab" kilitlemesinde zaten yapıldı:
   - `change_password` endpoint'i zaten `Depends(require_not_demo)` ile korunmuş (line 186)
   - Sessions endpoints'leri revoke işlemleri zaten `require_not_demo` ile korunmuş

2. **Frontend Component** (`frontend/src/pages/dashboard/settings/SecurityTab.tsx`):
   - Line 24: `const isDemo = user?.is_demo ?? false` ekledim
   - 2FA Card (lines 90-104): 
     - `<p>` metni gri renk (`.text-slate-400`) demo user'da
     - `<Switch>` `disabled={isDemo}` ve `onChange={isDemo ? undefined : setIs2faEnabled}`
   - Change Password form inputs (lines 114-139): `disabled={isDemo}` eklendi
   - Change Password submit button (line 145): `disabled={changePassword.isPending || isDemo}`
     ve `title={isDemo ? t('demo.actionBlocked') : undefined}`
   - Sessions Card (lines 151-213): Tüm kart `!isDemo` koşuluyla conditional render'da;
     demo user'lar için yeni amber alert box, `settings.security.demoSessionsMessage` mesajı

3. **Frontend I18n:**
   - `frontend/src/i18n/locales/tr.json` (line 767): 
     `"demoSessionsMessage": "Demo hesabında KVKK gizlilik ilkesi nedeniyle açık oturumlar gösterilmemektedir."`
   - `frontend/src/i18n/locales/en.json` (line 767):
     `"demoSessionsMessage": "Active sessions are not displayed on demo accounts for privacy compliance reasons."`

**I18n:** 1 yeni key (`settings.security.demoSessionsMessage`), `demo.actionBlocked` zaten mevcut.

**Dosyalar:** 3 dosya değişti (1 tsx, 2 json).

---

## 2026-09-01 — Demo Hesabı Profil Bilgisi ve Düzenleme Kilidi

**Durum:** Ekleme — Tamamlandı.

**Özet:** Demo hesabı (`demo@axioninvoice.app`) `dashboard/settings?tab=account` sayfasında şirket
profil bilgileri dolduruldu ve bu bilgilerin/logo'nun değiştirilmesi engellendi. Kullanıcı isteği:
demo user'a şu bilgileri seed et: Şirket Unvanı "Test Demo A.Ş.", Faaliyet "Bilgi Teknolojileri",
Vergi Dairesi "Yenibosna", Vergi Numarası "111111111111", Ticaret Sicil No "1234567891011",
Merkez Adresi "Merkez Mah. 12345 Sokak No: 11", Ülke "Turkiye", Şehir "İstanbul",
Kurumsal E-posta "demo@axioninvoice.app", Şirket Telefonu "212 1234578".

Demo user'ın bu alanları güncelleyememesi, logo upload/siliş yapamaması, ve bu işlemlere
basıldığında "Demo modunda bu işlem yapılamaz" (i18n: `demo.actionBlocked`) toast'ı gösterilmesi
gerekiyor.

**Yapılan değişiklikler:**

1. **Backend Migration** (`backend/alembic/versions/c9d8e7f6a5b4_seed_demo_user_profile.py`):
   - Yeni migration, `down_revision='a6b7c8d9e0f1'` (mevcut head)
   - Demo user'ın (`DEMO_USER_ID = ...d1`) 10 profile alanını (company_name, sector, tax_office,
     tax_number, trade_registry_no, address, country, city, corporate_email, phone) UPDATE et
   - `downgrade()` alanları NULL'a sıfırlar

2. **Backend Profile Endpoints** (`backend/app/api/v1/profile.py`):
   - `require_not_demo` dependency'si import et (line 10)
   - Aşağıdaki 5 endpoint'in `current_user` dependency'sini `Depends(require_not_demo)` olarak
     güncelle → demo user'lar 403 alırlar:
     - `PATCH /profile/account` (update_account, line 55)
     - `POST /profile/account/logo` (upload_account_logo, line 88)
     - `DELETE /profile/account/logo` (remove_account_logo, line 129)
     - `PATCH /profile/company-settings` (update_company_settings, line 162)
     - `POST /profile/password` (change_password, line 183)

3. **Frontend Hooks** — 403 error'unda `demo.actionBlocked` toast göster:
   - `frontend/src/features/profile/hooks/useUpdateAccount.ts`: onError handler (AxiosError check)
   - `frontend/src/features/profile/hooks/useUploadLogo.ts`: onError handler
   - `frontend/src/features/profile/hooks/useRemoveLogo.ts`: onError handler

4. **Frontend UI Disable**:
   - `AccountTab.tsx` (line ~100): "Güncelle" butonu → `disabled={user.is_demo}`
   - `LogoUpload.tsx`: Upload area dropzone disabled/opacity, Change/Remove butonları
     `disabled={isBusy || isDemo}`, CSS de `cursor-not-allowed` + `opacity-60`

**I18n:** `demo.actionBlocked` zaten mevcut — yeni çeviri eklenmedi.

**Dosyalar:** 7 dosya değişti (1 ekleme, 6 güncelleme).

---

## 2026-09-01 — Demo Hesabına Örnek Müşteri ve Fatura Verisi

**Durum:** Ekleme — Tamamlandı ve doğrulandı.

**Özet:** Kullanıcı isteği: demo hesabıyla (`demo@axioninvoice.app`) giriş yapıldığında ürünün
daha dolu/gerçekçi görünmesi için Müşteriler'e 5 (3 kurumsal, 2 bireysel), Faturalar'a 5 örnek
kayıt eklendi. Mevcut tek demo müşteri/fatura (`a85ba64f8453` migration'ından, `...d1`-`...d5`
ID'leri) silinmeden korundu, üzerine ekleme yapıldı.

Yeni Alembic migration `backend/alembic/versions/a6b7c8d9e0f1_seed_demo_customers_and_invoices.py`
(`down_revision='e5f6a7b8c9d0'`, mevcut migration head'i), `a85ba64f8453`'teki desenle birebir
aynı yöntem: `sa.table()` reflection + `op.bulk_insert`, sabit UUID'ler
(`...d6`-`...da` müşteriler, `...db`-`...df` faturalar, `...e0`-`...e4` fatura kalemleri),
idempotency guard (ilk müşteri ID'si zaten varsa `upgrade()` no-op).

- **5 müşteri** (`invoice_customers`): 3 kurumsal (`customer_type="kurumsal"`, `company_name`,
  `tax_office`/`tax_number` dolu — Mavi Teknoloji A.Ş., Yıldız İnşaat Ltd. Şti., Deniz Lojistik
  San. Tic. A.Ş.), 2 bireysel (`customer_type="bireysel"`, `first_name`/`last_name` — Ahmet
  Yılmaz, Elif Kaya).
- **5 fatura** (`invoices`): her biri farklı bir `status` ile (PAID, SENT, OVERDUE, PAID, DRAFT —
  Postgres enum'ları `InvoiceStatus.name` değerlerini, yani **büyük harf** kullanıyor, `.value`
  değil — bu, ilk denemede `invalid input value for enum invoice_status: "paid"` hatasıyla
  keşfedildi ve düzeltildi), `invoice_number` `"0002"`-`"0006"` (mevcut
  `invoice_service.next_invoice_number` formatı taklit edilerek: prefix yok + 4 haneli sıfır
  dolgu), her biri 1 satır kalemiyle, KDV %10 tutarlı (`subtotal`/`tax_total`/`grand_total` ve
  satır `tax_amount` birbirini tutuyor). Migration sonunda `users.invoice_sequence` `6`'ya
  güncellendi ki demo hesabından gerçek fatura oluşturulursa numara çakışmasın.
- `downgrade()` yeni eklenen tüm satırları (kalemler → faturalar → müşteriler) siler,
  `invoice_sequence`'ı `1`'e geri çeker; eski `...d1`-`...d5` verilerine dokunmaz.

**Karşılaşılan ve düzeltilen sorunlar:**
1. İlk revision ID (`f1a2b3c4d5e6`) repo'da zaten var olan başka bir migration'la çakıştı
   (`f1a2b3c4d5e6_add_invoice_pdf_status.py`) → `alembic heads` "Cycle detected" hatası verdi;
   dosya `a6b7c8d9e0f1` olarak yeniden adlandırıldı.
2. UUID sonek şeması `...d10`, `...d11` gibi 13 karakterlik son segmentler üretiyordu (geçersiz
   UUID — son segment tam 12 hex karakter olmalı) → hex sırasına devam edilerek (`d6`...`d9`,
   `da`, `db`...`df`, `e0`...`e4`) düzeltildi.
3. `status`/`invoice_type`/`scenario`/`commission_payer`/`pdf_status` alanları ilk denemede
   küçük harfle (`"paid"`, `"sale"` vb.) yazılmıştı; DB'deki Postgres enum tipleri büyük harf
   (`PAID`, `SALE` vb.) bekliyor → tüm değerler büyük harfe çevrildi.

**Yapılan dosyalar:**
- Ekleme: `backend/alembic/versions/a6b7c8d9e0f1_seed_demo_customers_and_invoices.py`.

**Doğrulama:**
- `docker exec backend-backend-1 alembic upgrade head` → hatasız tamamlandı.
- `docker exec backend-backend-1 alembic downgrade -1` sonra tekrar `upgrade head` → idempotent
  şekilde geri alınıp yeniden uygulanabildiği doğrulandı.
- Postgres'te doğrudan sorgu: 3 kurumsal + 2 bireysel yeni müşteri, 5 yeni fatura (durumları
  PAID/SENT/OVERDUE/PAID/DRAFT), `invoice_sequence=6` — beklenen değerlerle eşleşti.
- `docker exec backend-backend-1 pytest -q`: 60 geçti, 1 hata
  (`test_download_pdf_not_ready_returns_404`) — bu hata bu migration'dan **bağımsız, önceden var
  olan** bir sorun: `app/api/v1/invoices.py`'deki `download_invoice_pdf` endpoint'i PDF'i
  senkron/anında üretip 200 dönüyor, testin beklediği "henüz üretilmemişse 404" davranışı koda
  hiç yazılmamış — seed verisiyle veya bu değişiklikle hiçbir ilgisi yok, ayrı bir düzeltme
  gerektirir.
- Tarayıcıda demo hesabıyla giriş yapılıp Müşteriler/Faturalar sayfalarında görsel teyit henüz
  yapılmadı (bu ortamda tarayıcı aracı yok) — `docs/todo.md`'ye not düşüldü.

---

## 2026-09-01 — Login/Signup Kayan Panel Geri Getirildi + "Ücretsiz Başla" Ayrı Demo Girişi

**Durum:** Değiştirme — Tamamlandı (frontend build/test yeşil; tarayıcı görsel teyidi bekliyor).

**Özet:** Bu, aynı gün içindeki önceki "Login Ekranı Sadeleştirme" girişiminin **düzeltmesidir**.
Kullanıcı geri bildirdi: Login'i `AuthShell`'den çıkarıp bağımsız/animasyonsuz sayfa yapmak
Login/Signup'ın orijinal kayan panel (sliding) tasarımını bozdu — oysa istenen, `/login` ve
`/signup`'ın eskisi gibi kalıp, demo ön-dolu giriş formunun **"Ücretsiz Başla" akışına** ait
olmasıydı. Buna göre:
- `frontend/src/features/auth/components/LoginForm.tsx`, `frontend/src/routes/index.tsx`
  (`/login` route'u) ve `frontend/src/features/auth/components/LoginForm.test.tsx` `git checkout`
  ile bir önceki commit'teki orijinal hâline geri döndürüldü — `/login` ve `/signup` yine
  `AuthShell`'in kayan panel/overlay animasyonuyla çalışıyor, hiçbir alan ön dolu değil.
- Demo ön-dolu form, **yeni ve ayrı** bir bileşene taşındı:
  `frontend/src/features/auth/components/DemoLoginForm.tsx` — `ForgotPasswordForm` ile aynı
  statik kart deseninde, `defaultValues: { email: 'demo@axioninvoice.app', password: 'Demo.12345' }`
  ile ön dolu, "Giriş Yap" normal `/auth/login` akışını çağırıyor (bkz. bir önceki girdideki
  `e5f6a7b8c9d0_set_demo_user_password.py` migration'ı — hâlâ geçerli, bu formun çalışması için
  gerekli).
- Yeni route: `frontend/src/routes/index.tsx` içine `{ path: '/get-started', element:
  <DemoLoginForm /> }` eklendi (aynı `PublicOnlyRoute` altında, `/login`/`/signup` ile birlikte).
- `frontend/src/layouts/AuthLayout.tsx`'teki "Ücretsiz Başla" butonu (daha önce `useDemoLogin`
  ile tıklanınca sessizce/formsuz `/auth/demo`'ya bağlanıp direkt giriş yapıyordu — bkz.
  2026-08-27 notu, "pre-existing quirk") artık `/get-started`'a yönlendiren bir `Link`; kullanıcı
  önce ön dolu formu görüyor, girişi "Giriş Yap" butonuna tıklayarak kendisi tetikliyor.
- Yeni i18n key'leri: `auth.demoLogin.title`, `auth.demoLogin.subtitle`,
  `auth.demoLogin.backToLogin` (tr.json + en.json).

**Yapılan dosyalar:**
- Geri alma (`git checkout` ile orijinale döndürüldü): `frontend/src/features/auth/components/LoginForm.tsx`,
  `frontend/src/features/auth/components/LoginForm.test.tsx`, `frontend/src/routes/index.tsx`
  (route kısmı; import eklemeleri korunarak).
- Ekleme: `frontend/src/features/auth/components/DemoLoginForm.tsx`.
- Değiştirme: `frontend/src/routes/index.tsx` — `DemoLoginForm` import edildi, `/get-started`
  route'u eklendi.
- Değiştirme: `frontend/src/layouts/AuthLayout.tsx` — `useDemoLogin` kullanımı kaldırıldı,
  "Ücretsiz Başla" butonu `/get-started`'a giden bir `Link`'e çevrildi.
- Değiştirme: `frontend/src/i18n/locales/tr.json`, `frontend/src/i18n/locales/en.json` —
  `auth.demoLogin.*` key'leri eklendi.

**Not — `CTASection.tsx`'teki "Demoyu Dene" butonuna dokunulmadı:** Landing page'in alt
CTA'sındaki ayrı "Demoyu Dene" butonu hâlâ `useDemoLogin.mutate()` ile tek tıkla (formsuz)
giriş yapıyor. Kullanıcının şikâyeti özellikle `AuthLayout`'taki (Login/Signup sayfalarının
üst barındaki) "Ücretsiz Başla" butonuyla ilgiliydi ("Ücretsiz başla kısmında sadece Giriş yap
formu olacak"); `landing.hero.ctaPrimary` ("Ücretsiz Başla", zaten `/signup`'a `Link`) ve
`CTASection`'daki "Demoyu Dene" ayrı, kapsam dışı bırakıldı — istenirse ayrı bir görev olarak
ele alınabilir.

**Doğrulama:**
- Frontend: `npx vitest run src/features/auth` → 3/3 geçti (orijinal `LoginForm.test.tsx`
  değişmeden geri geldiği için aynı testler). `npm run build`'de dokunulan dosyalarda hata yok
  (projede önceden var olan 4 ilgisiz tip hatası duruyor — `Checkbox.tsx`, `navigation.ts`,
  `InvoiceSendEmailModal.tsx`, `ProfileTab.tsx`). `npx eslint` değişen/yeni dosyalarda 0 hata.
- `npm run test -- --run` çalıştırıldığında `InvoiceForm.test.tsx`'te 2 test kırmızı çıkıyor —
  `git stash` ile bu değişikliklerden bağımsız olarak da aynı şekilde kırmızı olduğu doğrulandı
  (önceden var olan, bu görevle ilgisiz bir regresyon — ayrı bir konu).
- Tarayıcı görsel teyidi bu ortamda yapılamadı (otomasyon aracı yok) — bkz. `docs/todo.md`.

---

## 2026-08-31 — Yeni Müşteri Modalı Kaydırmayı Tamamen Kaldırma

**Durum:** Tamamlandı (kod tarafı) — tarayıcı doğrulaması bekliyor.

**Özet:** Önceki düzeltmede scrollbar görsel olarak gizlenmişti ama fare tekerleğiyle içerik
hâlâ kayabiliyordu (görünmez scrollbar ile). Kullanıcı bunun yerine içeriğin modal içine tam
sığmasını, ne scrollbar'ın ne de mouse ile kaydırmanın var olmasını istemedi.

**Frontend:**
- Değiştirme: `frontend/src/components/Modal.tsx` — `size="xl"` içerik alanındaki
  `overflow-y-auto` (ve scrollbar-gizleme class'ları) kaldırılıp `overflow-hidden` yapıldı;
  artık kaydırma mekanizması tamamen devre dışı. Dış modal kutusunun `max-h-[85vh]` sınırı
  `max-h-[95vh]`'e çıkarıldı, içeriğin (4 kart, 2 sütunlu grid) modal içine daha rahat sığması
  için ekstra dikey alan bırakıldı.

**Kök neden ve düzeltme:** `overflow-y-auto` ile scrollbar sadece görsel olarak gizlenmişti,
underlying scroll container hâlâ fare tekerleği event'lerini yakalayıp içeriği kaydırıyordu.
Kullanıcı gerçek isteğin "scroll'un hiç olmaması" olduğunu belirtti; `overflow-hidden` scroll
mekanizmasını tamamen kaldırır, `max-h` artışı da normal form içeriğinin (4 kart) kırpılma
riskini azaltır.

**Doğrulama:**
- `npx tsc --noEmit -p tsconfig.app.json`: aynı 4 pre-existing, ilgisiz hata — yeni hata yok.
- `npx eslint src/components/Modal.tsx`: 0 hata.
- Tarayıcı doğrulaması bu ortamda yapılamadı (otomasyon aracı yok) — bkz. `docs/todo.md`.

---

## 2026-08-31 — Yeni Müşteri Modalı Dikey Scrollbar Gizleme

**Durum:** Tamamlandı (kod tarafı) — tarayıcı doğrulaması bekliyor.

**Özet:** Kullanıcı, modal içeriği taştığında görünen dikey kaydırma çubuğunun (scrollbar)
görsel olarak tamamen gizlenmesini istedi (kaydırma işlevi korunarak).

**Frontend:**
- Değiştirme: `frontend/src/components/Modal.tsx` — `size="xl"` içerik alanındaki
  `scrollbar-gutter-stable` class'ı kaldırıldı, yerine `[scrollbar-width:none]
  [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden` eklendi. Scrollbar artık hiç
  render edilmiyor (Firefox/IE için `scrollbar-width`/`-ms-overflow-style`, Chrome/Safari/Edge
  için `::-webkit-scrollbar` pseudo-element'i `display:none`), `overflow-y-auto` sayesinde
  fare tekerleği/touch ile kaydırma işlevi aynen çalışmaya devam ediyor. `scrollbar-gutter-stable`
  artık gereksiz — scrollbar hiç görünmediği için genişlik sıçraması riski de ortadan kalktı.

**Kök neden ve düzeltme:** Önceki düzeltme scrollbar'ın neden olduğu genişlik sıçramasını
`scrollbar-gutter-stable` ile engellemişti, ama scrollbar kendisi hâlâ görünür kalıyordu.
Kullanıcı bu sefer scrollbar'ın hiç görünmemesini istedi; tarayıcıya özel scrollbar-gizleme
CSS'i ile çözüldü.

**Doğrulama:**
- `npx tsc --noEmit -p tsconfig.app.json`: aynı 4 pre-existing, ilgisiz hata — yeni hata yok.
- `npx eslint src/components/Modal.tsx`: 0 hata.
- Tarayıcı doğrulaması bu ortamda yapılamadı (otomasyon aracı yok) — bkz. `docs/todo.md`.

---

## 2026-08-31 — Yeni Müşteri Modalı Layout Sıçraması Düzeltmesi

**Durum:** Tamamlandı (kod tarafı) — tarayıcı doğrulaması bekliyor.

**Özet:** Kurumsal/Bireysel seçimi değiştiğinde "Şirket Adı" alanının mount/unmount olması,
Kurumsal & Finansal kartının yüksekliğini değiştirip aynı grid satırındaki diğer kartı da
etkiliyor, ayrıca içerik alanında dikey scrollbar'ın anlık çıkıp kaybolması yatay bir "sıçrama"
(width jump) yaratıyordu. İkisi de giderildi.

**Frontend:**
- Değiştirme: `frontend/src/components/Modal.tsx` — `size="xl"` içerik alanına
  `scrollbar-gutter-stable` eklendi; scrollbar görünüp kaybolduğunda içerik genişliği artık
  sabit kalıyor (`size="md"` etkilenmedi).
- Değiştirme: `frontend/src/features/customers/components/CustomerFormModal.tsx` — "Şirket Adı"
  alanı artık `customerType === 'kurumsal'` koşuluyla mount/unmount edilmiyor; her zaman DOM'da
  render ediliyor, Bireysel seçiliyken sarmalayıcı `div`'e `invisible` class'ı (+ `tabIndex={-1}`,
  `aria-hidden`) uygulanıyor. Böylece alan görsel olarak kayboluyor ama kapladığı alan (yükseklik)
  sabit kalıyor, kart ve grid satırı boyu değişmiyor. `register('company_name')` ve validasyon
  mantığı aynen korundu (RHF `shouldUnregister` varsayılanı zaten değeri saklıyordu, bu değişiklik
  sadece render/CSS katmanında).

**Kök neden ve düzeltme:** Grid içindeki koşullu mount, kart yüksekliğini değiştirip aynı satırdaki
komşu kartı da yeniden konumlandırıyordu (CSS Grid satır yüksekliği en uzun öğeye göre belirlenir);
ayrıca `overflow-y-auto` içerik alanı `scrollbar-gutter` tanımlamadığından scrollbar görünürlüğü
değiştikçe kullanılabilir genişlik anlık değişiyordu. Düzeltme: (1) alanı her zaman mount edip
sadece görünürlüğünü gizlemek (yükseklik sabit kalır), (2) `scrollbar-gutter-stable` ile genişliği
sabitlemek.

**Doğrulama:**
- `npx tsc --noEmit -p tsconfig.app.json`: aynı 4 pre-existing, ilgisiz hata — yeni hata yok.
- `npx eslint` (`Modal.tsx`, `CustomerFormModal.tsx`): 0 hata, sadece daha önce de var olan
  react-hook-form `watch()` React Compiler uyarısı.
- Tarayıcı doğrulaması bu ortamda yapılamadı (otomasyon aracı yok) — bkz. `docs/todo.md`.

---

## 2026-08-31 — Yeni Müşteri Modalı Düzeltmeleri (kullanıcı geri bildirimi)

**Durum:** Tamamlandı (kod tarafı) — tarayıcı doğrulaması bekliyor.

**Özet:** Bir önceki "Yeni Müşteri Modalı Modern Redesign" sonrası kullanıcının verdiği 6 maddelik
düzeltme listesi uygulandı: modal header/footer yüksekliği daraltıldı, Web Adresi ve Faks alanları
Kurumsal karttan İletişim Bilgileri kartına taşındı, İletişim ve Adres kartlarının satır sırası
yeniden düzenlendi.

**Frontend:**
- Değiştirme: `frontend/src/components/Modal.tsx` — sadece `size="xl"` varyantında header
  (`p-6` → `px-6 py-3.5`) ve footer (`p-6` → `px-6 py-3`) padding'i daraltıldı; `size="md"`
  (diğer 2 kullanım yeri) etkilenmedi.
- Değiştirme: `frontend/src/features/customers/components/CustomerFormModal.tsx`:
  - Kurumsal & Finansal Bilgiler kartından `website` ve `fax` alanları çıkarıldı (sadece
    `mersis_no` tek başına kaldı).
  - İletişim Bilgileri kartı yeniden sıralandı: 1. satır E-posta (tam genişlik), 2. satır
    Web Adresi (tam genişlik, `prefix="https://"` mantığı aynen taşındı), 3. satır 2 kolon
    Telefon/Faks.
  - Adres Detayları kartı yeniden sıralandı: 1. satır Adres (tam genişlik), 2. satır 3 kolon
    Şehir/Posta Kodu/Ülke (`CountryAutocomplete` üçüncü kolonda).
  - Validasyon/submit mantığı (website `https://` auto-prefix, `fax`/`mersis_no` boşsa
    `undefined`) değişmedi — sadece alanların hangi kartta/sırada render edildiği değişti.

**Kök neden ve düzeltme:** Yok — bug fix değil, kullanıcının önceki redesign'ı gördükten sonraki
görsel/gruplama tercihi. Backend'e dokunulmadı.

**Doğrulama:**
- `npx tsc --noEmit -p tsconfig.app.json`: aynı 4 pre-existing, ilgisiz hata (`Checkbox.tsx`,
  `navigation.ts`, `InvoiceSendEmailModal.tsx`, `ProfileTab.tsx`) — yeni hata yok.
- `npx eslint` (`Modal.tsx`, `CustomerFormModal.tsx`): 0 hata, sadece daha önce de var olan
  react-hook-form `watch()` React Compiler uyarısı.
- Tarayıcı doğrulaması bu ortamda yapılamadı (otomasyon aracı yok) — bkz. `docs/todo.md`.

---

## 2026-08-31 — Yeni Müşteri Modalı Modern Redesign

**Durum:** Tamamlandı (kod tarafı) — tarayıcı doğrulaması bekliyor.

**Özet:** `dashboard/customers`'daki "+ Yeni Müşteri" modalı, tek parça dikey form yığınından
geniş (`max-w-6xl`), 4 karta bölünmüş, ikonlu/alt-çizili input'lara sahip modüler bir yapıya
çevrildi. Backend'e ve form validasyon mantığına (`customerSchema.ts`, submit akışı) dokunulmadı —
sadece görsel/yapısal katman yenilendi.

**Frontend:**
- Ekleme: `frontend/src/components/SegmentedControl.tsx` — generic, ikonlu segmented
  control/toggle (`role="radiogroup"`), aktif seçenek koyu lacivert (`#111827`) dolgu.
- Ekleme: `frontend/src/components/FormCard.tsx` — ikon+başlıklı beyaz kart wrapper
  (`shadow-sm`, `rounded-2xl`), form bölümlerini gruplamak için.
- Ekleme: `frontend/src/components/UnderlinedInput.tsx` — sol ikonlu, alt çizgili modern input
  varyantı (mevcut `Input.tsx`'e dokunulmadı, o diğer formlarda kullanılmaya devam ediyor).
- Değiştirme: `frontend/src/components/Modal.tsx` — geriye dönük uyumlu `size?: 'md'|'xl'` ve
  `footer?: ReactNode` prop'ları eklendi (varsayılanlar mevcut davranışı birebir korur; diğer 2
  kullanım yeri — `CustomerDetailPage`, `InvoiceSendEmailModal` — hiçbir prop değişikliği
  yapmadan aynı görünümde kalır).
- Değiştirme: `frontend/src/components/CountryAutocomplete.tsx` — sadece `CustomerFormModal`
  içinde kullanıldığı için doğrudan alt-çizili + `Flag` ikonlu stile çevrildi, arama/klavye
  navigasyon mantığı aynen korundu.
- Değiştirme: `frontend/src/features/customers/components/CustomerFormModal.tsx` — `Modal`
  artık `size="xl"` ve sağ altta sabit `footer` (Vazgeç/Ekle) ile kullanılıyor. Başlığın altına
  Bireysel/Kurumsal `SegmentedControl` (User/Building2 ikonlu) eklendi. Form gövdesi
  `grid md:grid-cols-2` ile 4 `FormCard`'a bölündü: Kişisel & Kategori (ad/soyad/kategori),
  Kurumsal & Finansal (şirket adı/vergi dairesi/vergi no-TCKN/faks/MERSİS/website), İletişim
  (e-posta/telefon), Adres Detayları (adres/şehir/posta kodu/ülke). Tüm alanlar `UnderlinedInput`
  ve uygun lucide ikonlarla (`User`, `Building2`, `Landmark`, `CreditCard`, `Printer`,
  `FileText`, `Globe`, `Mail`, `Phone`, `MapPin`, `Building`, `Hash`) yeniden yazıldı.
  Bireysel/kurumsal'a göre koşullu alan gösterimi (şirket adı), zorunluluk (vergi dairesi) ve
  label/maxLength değişimi (TCKN) mantığı birebir korundu.
- i18n (`tr.json`/`en.json`): `customers.form` altına `sectionPersonal`, `sectionCorporate`,
  `sectionContact`, `sectionAddress` anahtarları eklendi; `newTitle` metni "Yeni Müşteri" →
  "Yeni Müşteri Kaydı" / "New Customer" → "New Customer Registration" olarak güncellendi.

**Kök neden ve düzeltme:** Yok — bu bir bug fix değil, kullanıcı isteğiyle başlatılan bilinçli bir
UI/UX redesign. Yan not: `Input.tsx`'de daha önce tanımsız bir `prefix` prop'u kullanımı (bilinen
pre-existing TS hatası kaynağıydı) vardı; `CustomerFormModal.tsx` artık `Input` yerine düzgün
tipli `prefix` destekleyen `UnderlinedInput` kullandığı için bu dosyaya özel hata kendiliğinden
ortadan kalktı.

**Doğrulama:**
- `npx tsc --noEmit -p tsconfig.app.json` çalıştırıldı — yeni/değişen dosyalarda sıfır hata; kalan
  4 hata (`Checkbox.tsx`, `navigation.ts`, `InvoiceSendEmailModal.tsx`, `ProfileTab.tsx`) bu
  değişiklikten önce de mevcuttu, ilgisiz.
- `git diff --stat` ile değişen dosya kapsamı plana birebir uyduğu doğrulandı (5 değişen + 3 yeni
  dosya, backend'e hiç dokunulmadı).
- Tarayıcıda gerçek görsel/etkileşim testi bu oturumda yapılamadı (ortamda tarayıcı otomasyon
  aracı yok) — bkz. `docs/todo.md`.

---

## 2026-08-28 — Faz 2: "Şifremi Unuttum" Şifre Sıfırlama Akışı

**Durum:** Tamamlandı

**Özet:** Faz 1 (Login/Kayıt Ol görsel yeniden tasarımı) kullanıcı tarafından onaylandı, Faz 2
kapsamı belirlendi: Login formuna "Şifremi unuttum?" linki ve email ile doğrulanan şifre sıfırlama
akışı eklendi (diğer üç aday alan — telefon, vergi no, KVKK checkbox — bu turda kapsam dışı
bırakıldı).

**Backend:**
- Yeni model `PasswordResetToken` (`backend/app/models/password_reset_token.py`) — `user_id`,
  `token_hash` (sha256, unique+index), `expires_at`, `used_at`. Ham token asla DB'ye yazılmaz.
- `backend/app/core/security.py`'ye `generate_reset_token()` (raw + hash döner) ve
  `hash_reset_token()` helper'ları eklendi.
- Yeni şema'lar `ForgotPasswordRequest`/`ResetPasswordRequest` (`backend/app/schemas/auth.py`).
- Yeni public endpoint'ler `POST /auth/forgot-password` ve `POST /auth/reset-password`
  (`backend/app/api/v1/auth.py`):
  - `forgot-password` her zaman 204 döner (kullanıcı var/yok, Google-only hesap fark etmeden) —
    email enumeration'ı önlemek için. 30 dakika geçerli token üretip email gönderir.
  - `reset-password` token hash'ini doğrular, süresi dolmuş/kullanılmış/geçersiz token'da 400
    döner. Başarılı sıfırlamada şifre hash'lenir, token `used_at` ile işaretlenir (tek kullanımlık),
    **ve kullanıcının tüm aktif oturumları (`UserSession`) iptal edilir** — güvenlik amaçlı, şifre
    değişince eski refresh token'lar geçersiz kalsın diye.
- Yeni email şablonu `backend/app/templates_html/email_password_reset.html` +
  `RESET_PASSWORD_LABELS` (tr/en) + `send_password_reset_email()` fonksiyonu
  (`backend/app/services/email_service.py`), mevcut `send_invoice_due_reminder_email` deseniyle
  birebir aynı yapıda.
- Migration `dab620bb915b_create_password_reset_tokens_table.py` — autogenerate edildi, container
  içinde `alembic upgrade head` ile uygulandı.

**Frontend:**
- `frontend/src/types/auth.ts`'e `ForgotPasswordPayload`/`ResetPasswordPayload`; `authApi.ts`'e
  `forgotPassword`/`resetPassword` metotları.
- Yeni hook'lar `useForgotPassword.ts` (mutation, aynı sayfada başarı mesajı gösterir, navigasyon
  yok — email enumeration'ı önlemek için her zaman aynı mesaj) ve `useResetPassword.ts` (mutation,
  başarıda `/login`'e yönlendirir).
- Yeni zod şemaları `forgotPasswordSchema.ts`/`resetPasswordSchema.ts` (mevcut `signupSchema.ts`
  şifre eşleşme `.refine` deseniyle aynı).
- Yeni sayfa bileşenleri `ForgotPasswordForm.tsx`/`ResetPasswordForm.tsx` — **bilinçli tasarım
  kararı:** `AuthShell`'in iki-panelli crossing-slide animasyon mekaniğine üçüncü bir mod olarak
  eklenmedi (üç panel için matematiği yeniden tasarlamak gereksiz karmaşıklık ve Faz 1'in kırılgan
  animasyon mantığını bozma riski taşırdı). Bunun yerine `AuthShell`'in mobil tek-panel kart
  stiliyle aynı sade görünümde, `AuthLayout` altında bağımsız sayfalar olarak eklendi.
  `ResetPasswordForm`, `useSearchParams`'tan `token` okur; token yoksa/eksikse forma izin vermeden
  hata gösterir.
- `LoginForm.tsx`'e şifre alanının altına "Şifremi unuttum?" linki (`/forgot-password`'a).
- Route'lar (`frontend/src/routes/index.tsx`): `/forgot-password` ve `/reset-password`, mevcut
  `AuthLayout` + `PublicOnlyRoute` altında (giriş yapmış kullanıcı erişemez).
- i18n: `auth.login.forgotPassword` + yeni `auth.forgotPassword.*`/`auth.resetPassword.*` blokları
  (tr.json/en.json).
- `getResetPasswordErrorKey` (`getAuthErrorKey.ts`) — 400 → `auth.resetPassword.errors.invalidToken`.

**Kök neden ve düzeltme:** Uygulamada şifre sıfırlama akışı hiç yoktu — kullanıcı şifresini
unutursa hesabına erişimi kalıcı olarak kaybediyordu. Mevcut email altyapısı (`email_service.py`)
ve auth route/hook/api katmanlarındaki desenler birebir takip edilerek tutarlı bir üçüncü akış
eklendi.

**Doğrulama:**
- Backend: `docker exec backend-backend-1 alembic upgrade head` başarılı; `python -m pytest -k auth`
  → 7/7 geçti (mevcut testler kırılmadı); router import kontrolü 9 route (7 eski + 2 yeni).
- **Uçtan uca canlı smoke test** (çalışan `backend-backend-1` container'ında, atılabilir bir test
  kullanıcısıyla — gerçek admin hesabına dokunulmadı, test sonunda kullanıcı silindi, cascade ile
  ilişkili token/session satırları da temizlendi):
  1. `POST /auth/forgot-password` → 204, DB'de `PasswordResetToken` satırı doğru `expires_at`
     (30dk) ile oluştu.
  2. Gerçek raw token ile `POST /auth/reset-password` → 204.
  3. Yeni şifreyle `POST /auth/login` → 200; eski şifreyle → 401 (şifre gerçekten değişti).
  4. Aynı token'ı tekrar kullanma → 400 (tek kullanımlık doğrulandı).
  5. Geçersiz/uydurma token → 400.
- Frontend: `npx eslint` (tüm yeni/değişen dosyalar) → 0 hata; `npm run build` → sadece bilinen 5
  pre-existing hata (bu turun dosyalarında yeni hata yok); `npx vitest run LoginForm.test.tsx` →
  3/3 geçti (yeni "Şifremi unuttum?" linki mevcut selector'ları bozmadı).
- Tarayıcıda gerçek görsel/interaktif teyit yapılamadı (bu ortamda tarayıcı otomasyon aracı yok) —
  bkz. `docs/todo.md`.

---

## 2026-08-28 — Login/Kayıt Ol: Geçiş Animasyonu Gerçek Hareket + Google Ayırıcı Kaldırma + Buton Boyutu

**Durum:** Düzeltme (kullanıcı testinde bildirdi)

**Özet:** Kullanıcı üç sorun daha bildirdi: (1) "------ veya ------" ayırıcı yazısı (Google
girişinin üstündeki) kaldırılmalı; (2) "Giriş Yap" ve "Hesap Oluştur" submit butonlarının boyutu
sabit olmalı — şu an metin uzunluğuna göre farklı genişlikte görünüyorlardı; (3) Login↔Signup
geçiş animasyonu hissedilmiyor, sanki anında açılıyor.

**Kök neden ve düzeltme:**
1. `LoginForm.tsx`/`SignupForm.tsx`'teki Google giriş butonunun üstündeki `h-px` çizgili
   ayırıcı + `auth.login.googleDivider` metin bloğu tamamen kaldırıldı, `GoogleLoginButton`
   submit butonunun hemen altında kaldı.
2. Her iki formun submit `Button`'ına `w-full` eklendi — form zaten `max-w-sm` ile sabit
   genişlikte olduğundan buton artık metin uzunluğundan (Giriş Yap vs Hesap Oluştur) bağımsız
   olarak kart genişliğine sabitlendi.
3. **Asıl kök neden (animasyon):** `routes/index.tsx`'te `/login` ve `/signup`, ayrı sarmalayıcı
   sayfa bileşenleri (`LoginPage`/`SignupPage`) üzerinden `AuthShell`'i render ediyordu. React
   Router, `Outlet`'in eski/yeni render çıktısını karşılaştırırken bileşen **tipi** değiştiği için
   (`LoginPage` → `SignupPage`) tüm alt ağacı (dolayısıyla `AuthShell`'i de) unmount/mount
   ediyordu — bu da `transform`/`opacity` geçişinin "başlangıç" durumu olmadan direkt "bitiş"
   durumunda mount olmasına, yani animasyonun hiç oynamamasına yol açıyordu. Düzeltme: `LoginPage`/
   `SignupPage` sarmalayıcıları silindi, route'lar artık doğrudan `<AuthShell mode="login" />` /
   `<AuthShell mode="signup" />` render ediyor — `Outlet` artık aynı bileşen tipini (`AuthShell`)
   görüp unmount etmeden sadece `mode` prop'unu güncelliyor, `transition-all duration-600
   ease-in-out` artık gerçek bir geçiş olarak oynuyor.

**Doğrulama:** `npx eslint` (3 dokunulan dosya + `routes/index.tsx`) — 0 hata, sadece bilinen
`SignupForm.tsx` `watch()` uyarısı. `npm run build` — sadece önceden var olan, dokunulmayan 5
dosyadaki hatalar (`Checkbox.tsx`, `navigation.ts`, `CustomerFormModal.tsx`,
`InvoiceSendEmailModal.tsx`, `ProfileTab.tsx`). `npx vitest run LoginForm.test.tsx` — 3/3 geçti.
Bu ortamda tarayıcı otomasyon aracı yok, gerçek görsel/animasyon teyidi kullanıcının tarayıcısında
yapılmalı.

---

## 2026-08-28 — Login/Kayıt Ol: Kurumsal Taşma, Alt Bağlantı Tekrarı ve Input Kontrastı Düzeltmesi

**Durum:** Düzeltme (kullanıcı ekran görüntüsüyle bildirdi)

**Özet:** Kullanıcı tarayıcıda test edip üç sorun bildirdi: (1) Kayıt Ol tarafında "Kurumsal"
sekmesi seçilince (Şirket Adı alanı eklendiğinde) form içeriği kartın sabit yüksekliğini aşıyor,
kart kesiliyor/responsive'liği bozuluyordu; (2) formun altında yer alan "Zaten hesabınız var mı?
Giriş yapın" (ve login tarafında "Hesabınız yok mu? Kayıt olun") bağlantısı, overlay panelinde
zaten aynı mesajı ve CTA'yı veriyor olduğundan gereksiz tekrardı; (3) input alanları, camsı
(glassmorphism) kartın yarı saydam gri zemini üzerinde beyaz/soluk görünüp yeterince belirgin
değildi.

**Kök neden ve düzeltme:**
- `frontend/src/features/auth/components/AuthShell.tsx` — masaüstü panel sarmalayıcısındaki sabit
  `md:min-h-140` (35rem) kaldırıldı. Bunun yerine `ResizeObserver` ile aktif panelin
  (`LoginForm`/`SignupForm`) gerçek `scrollHeight`'ı ölçülüp kart yüksekliği buna göre
  `style.height` ile ayarlanıyor (`transition-[height] duration-300`). Böylece Kurumsal seçilip
  Şirket Adı alanı eklendiğinde kart kesilmeden yumuşakça büyüyor; login gibi daha kısa formlarda
  da gereksiz boşluk kalmıyor. Form panelleri artık `inset-y-0` ile tam yüksekliğe zorlanmıyor,
  sadece `top-0` ile hizalanıp doğal içerik yüksekliğinde kalıyor (overlay paneli hâlâ `inset-y-0`
  ile bu ölçülen yüksekliğe geriliyor).
- `frontend/src/features/auth/components/LoginForm.tsx` ve `SignupForm.tsx` — formun altındaki
  "Zaten hesabınız var mı?/Hesabınız yok mu?" bağlantı paragrafı kaldırıldı (kullanılmayan `Link`
  import'u da temizlendi); Google girişi divider'ı ve butonu korundu. Her `Input` çağrısına
  `bg-white`/`dark:bg-slate-800` + belirgin `border-slate-300`/`dark:border-slate-600` class'ı
  eklendi (global `Input.tsx` değişmedi — sadece bu iki form için çağrı yerinde override,
  diğer ekranlardaki input'ları etkilemiyor).

**Doğrulama:** `npm run test` (LoginForm testi 3/3 geçti), `npm run build`/`eslint` sadece bu
oturumdan önce var olan, dokunulmayan dosyalardaki hataları/uyarıları gösterdi (Checkbox.tsx,
navigation.ts, CustomerFormModal.tsx, InvoiceSendEmailModal.tsx, ProfileTab.tsx — hiçbiri auth
dosyalarıyla ilgili değil). Bu ortamda tarayıcı otomasyon aracı olmadığından görsel sonuç yine
kodla doğrulandı, tarayıcıda son kontrol kullanıcıya kalıyor.

---

## 2026-08-28 — Login/Kayıt Ol: Kayan Panel Çakışma Hatası Düzeltmesi

**Durum:** Düzeltme (kullanıcı ekran görüntüsüyle bildirdi)

**Özet:** Bir önceki düzeltmede ("Gerçek Kayan Panel Animasyonu") Signup panelinin "aktif"
dinlenme konumu yanlışlıkla **sol** yarımdı (`translateX(0%)` mode=signup iken), ama overlay
paneli de mode=signup'ta sola kayıyordu (`translateX(-100%)`) — ikisi aynı anda sol yarımda
üst üste biniyordu (ekran görüntüsünde Signup formunun "E-posta" alanı ile overlay'in "Zaten bir
hesabınız mı var? Giriş Yap" metninin iç içe geçmesi bu çakışmanın sonucuydu). Ayrıca animasyon
"sola atlama" gibi hissediliyordu çünkü panel pozisyonları arasında gerçek bir ara geçiş yoktu.

**Kök neden ve düzeltme:** `frontend/src/features/auth/components/AuthShell.tsx` — Login ve
Signup panelleri artık **her zaman aynı transform'u paylaşıyor** (ikisi de `left-0`'dan
`translateX(100%)`'e geçiyor, aynı 600ms `transition-all`), sadece `opacity`/`z-index` ile
hangisinin görünür olduğu değişiyor — böylece form paneli hiçbir zaman overlay panelinin durduğu
yarıyla aynı yarıda olmuyor: mode=login'de form solda + overlay sağda, mode=signup'ta form sağda
+ overlay solda. Geçiş sırasında iki form da aynı konumda birlikte kayıp opacity ile çapraz
soluklaşıyor (cross-fade), overlay ise ters yönde kayıyor — bu, klasik "sliding sign-in/sign-up"
deseninin (Codrops/Colorlib) doğru uygulanışı. Overlay paneline ayrıca açık `z-index: 30`
eklendi (geçiş sırasında formların üzerinde kalması için).

**Doğrulama:** `npm run test` (LoginForm testi 3/3), `npm run build`/`eslint` yeni hata
çıkarmadı. Bu ortamda tarayıcı otomasyon aracı olmadığından görsel sonuç yine kodla doğrulandı,
tarayıcıda son kontrol kullanıcıya kalıyor.

---

## 2026-08-28 — Login/Kayıt Ol: Gerçek Kayan Panel Animasyonu + "Ücretsiz Başla" Demo Girişi

**Durum:** Düzeltme (kullanıcı tarayıcı testinden sonra)

**Özet:** Faz 1'in ilk sürümü tarayıcıda test edildikten sonra iki sorun bildirildi: (1) kayan
panel animasyonu gerçek bir hareket hissi vermiyordu — sadece sağdaki tanıtım paneli kayıyor,
formun kendisi anlık içerik değişimiyle güncelleniyordu; (2) header'daki "Ücretsiz Başla" butonu
`/signup`'a yönlendiriyordu ama kullanıcı bunun tek tıkla demo girişi yapmasını istiyor.

**Animasyon düzeltmesi:**
- `frontend/src/features/auth/components/AuthShell.tsx` — Değiştirme: masaüstü görünümde artık
  `LoginForm` ve `SignupForm` **her ikisi de aynı anda DOM'da mount edilmiş** durumda, ayrı ayrı
  `absolute` konumlandırılmış panellerde. Aktif olmayan panel `inert` özelliğiyle klavye/etkileşimden
  tamamen çıkarılıyor (React 19'un desteklediği native `inert` attribute'u). `mode` değiştiğinde
  Login paneli `translateX(0%)` ↔ `translateX(100%)`, Signup paneli `translateX(-100%)` ↔
  `translateX(0%)` arasında `transition-transform duration-600 ease-in-out` ile zıt yönlerde
  karşılıklı kayarak yer değiştiriyor — overlay paneli de aynı anda ters yönde kayıyor. Artık
  hem form hem tanıtım paneli fiziksel olarak hareket ediyor.
- `frontend/src/features/auth/components/LoginForm.tsx`, `SignupForm.tsx` — Değiştirme: her
  `Input`'a açık `id` prop'u eklendi (ör. `id="login-email"` / `id="signup-email"`) — iki form
  aynı anda DOM'da olduğu için `Input.tsx`'in varsayılan `id = props.name` davranışı çakışan
  `id="email"` gibi ikili kimliklere yol açıyordu; `register(...)`'ın `name` değeri (RHF/zod
  bağlantısı) değişmedi, sadece HTML `id`/`label htmlFor` eşleşmesi ayrıştırıldı.

**"Ücretsiz Başla" düzeltmesi:**
- `frontend/src/layouts/AuthLayout.tsx` — Değiştirme: buton artık `/signup`'a `Link` yerine
  `useDemoLogin()` (`frontend/src/features/auth/hooks/useDemoLogin.ts`) mutation'ını tetikliyor —
  ana sayfadaki `CTASection.tsx`'in "Demoyu Dene" butonuyla aynı mekanizma (`POST /auth/demo`,
  şifresiz, sabit demo kullanıcısıyla doğrudan `/dashboard`'a giriş). Buton `demoLogin.isPending`
  iken devre dışı bırakılıyor.

**Neden formu demo bilgileriyle ön-doldurma seçeneği kullanılmadı:** Backend incelemesinde demo
kullanıcının (`demo@axioninvoice.app`) veritabanında gerçek bir şifresi olmadığı görüldü — `/auth/demo`
endpoint'i `is_demo=True` kullanıcıyı şifre kontrolü yapmadan buluyor. Normal `/auth/login` formu
her zaman şifre doğruluyor, bu yüzden formu ön-doldurup göndermek geçerli bir şifre atanmadan
çalışmazdı — bu da Faz 1'in "backend'e dokunulmaz" sınırını aşardı. Kullanıcıyla netleştirilip
mevcut şifresiz tek tıkla demo girişi mekanizması kullanılmasına karar verildi.

**Doğrulama:** `npm run test` (LoginForm testi 3/3 hâlâ geçiyor), `npm run build` (dokunulan
dosyalarda hata yok, projede önceden var olan ilgisiz 5 tip hatası duruyor), `npx eslint` yeni
hata çıkarmadı. Bu ortamda tarayıcı otomasyon aracı olmadığından animasyonun görsel sonucu
tarayıcıda teyit edilemedi — bkz. `docs/todo.md`.

---

## 2026-08-28 — Login/Kayıt Ol Ekranları Görsel Yeniden Tasarımı (Faz 1: Sadece UI)

**Durum:** Ekleme + Değiştirme

**Özet:** Login ve Signup ekranları, animasyonlu tek kartlı "kayan panel" (sliding overlay)
mantığıyla çalışan modern bir SaaS giriş deneyimine dönüştürüldü. Bu tamamen görsel/yapısal bir
değişiklik — react-hook-form + zod doğrulama, TanStack Query mutation'ları (`useLogin`/`useSignup`),
Zustand `authStore` ve `authApi` çağrıları hiç dokunulmadan aynen korundu. Yeni alan eklenmesi
(kullanıcının belirttiği Faz 2) bu oturumun kapsamı dışında bırakıldı, bkz. `docs/todo.md`.

**Yapılan dosyalar:**
- `frontend/src/layouts/AuthLayout.tsx` — Ekleme: `/login`/`/signup` için bağımsız tam-sayfa
  layout (kendi header'ı: logo, `LanguageSwitcher`, "Giriş Yap" linki, "Ücretsiz Başla" butonu,
  koyu-mavi-beyaz gradient arkaplan). Site genelindeki `PublicLayout`'tan ayrı — header tekrarı yok.
- `frontend/src/features/auth/components/AuthShell.tsx` — Ekleme: `mode: 'login' | 'signup'`
  prop'u alan, kayan panel mekaniğini süren paylaşılan bileşen. Rounded-3xl/glassmorphism/shadow-2xl
  "Fusion Kart" içinde sol form yuvası (mode'a göre `LoginForm`/`SignupForm` koşullu render) ve
  masaüstünde (`md:` ve üstü) sağda 200% genişlikte bir şerit içinde `translateX(0%)`/`translateX(-50%)`
  ile `transition-transform duration-600 ease-in-out` kayan, iki tanıtım metni+CTA barındıran overlay
  paneli. Mobilde (`< 768px`) overlay tamamen gizlenip sadece aktif form tam genişlik gösteriliyor.
- `frontend/src/pages/auth/LoginPage.tsx`, `SignupPage.tsx` — Değiştirme: `AuthShell mode="login"`
  / `mode="signup"` render eden ince sarmalayıcılara indirgendi.
- `frontend/src/routes/index.tsx` — Değiştirme: `/login`/`/signup`, `PublicLayout` altından çıkarılıp
  yeni `AuthLayout` altına taşındı (`PublicOnlyRoute` guard'ı aynen korunarak yeniden konumlandırıldı).
- `frontend/src/features/auth/components/LoginForm.tsx`, `SignupForm.tsx` — Değiştirme: sadece
  class/markup restyle (yeni `#111827` marka rengi, mavi focus-glow input'lar, `Button`/`Input`
  çağrı yerlerinde `className` override'ı — global `Button.tsx`/`Input.tsx` değişmedi). Tüm
  `register(...)`/`handleSubmit`/`watch`/`errors`/mutation/`GoogleLoginButton` bağlantıları aynı.
- `frontend/src/i18n/locales/tr.json`, `en.json` — Ekleme: `auth.overlay.toSignup`/`toLogin`
  (`title`/`body`/`cta`) — overlay panelindeki tanıtım metinleri için yeni anahtarlar. Form
  alanları/başlıklar için yeni anahtar gerekmedi, mevcut `auth.login.*`/`auth.signup.*`/
  `landing.nav.*` kullanıldı.

**Neden bu yapı:** `/login` ve `/signup` ayrı route olarak kaldı (kullanıcıyla netleşen karar —
doğrudan link/yer imi uyumluluğu için); `AuthShell` her iki route'ta da aynı React ağacı konumunda
aynı bileşen tipini render ettiğinden (`<AuthShell mode="login|signup" />`), React Router gezinme
sırasında bileşeni unmount etmiyor — sadece `mode` prop'u değişiyor, bu da CSS `transition`'ın
remount'a gerek kalmadan düzgün oynamasını sağlıyor.

**Doğrulama:** `npm run test` — `LoginForm.test.tsx` değişmeden geçti (3/3); testte önceden var
olan 2 ilgisiz başarısızlık (`InvoicesPage.test.tsx`, `InvoiceForm.test.tsx`) bu değişiklikten önce
de mevcuttu, `git stash` ile doğrulandı. `npm run build` (tsc) — değiştirilen dosyalarda hata yok
(projede önceden var olan, bu değişiklikle ilgisiz 5 tip hatası hâlâ duruyor, dokunulmadı).
`npx eslint` — yeni hata yok. `npm run dev` ile sunucu ayağa kaldırılıp `/login`/`/signup` `curl`
ile 200 döndüğü doğrulandı; bu ortamda tarayıcı otomasyon aracı (`chromium-cli`, Playwright)
mevcut olmadığından **gerçek görsel/etkileşim teyidi yapılamadı** — bkz. `docs/todo.md`.

**Not:** `feature/auth-redesign` git branch'i üzerinde çalışıldı (main dokunulmadı, güvenlik ağı).

---

## 2026-08-28 — Koyu Mod Renk Kontrastı Düzeltmeleri

**Durum:** Değiştirme

**Özet:** Aynı gün eklenen [Kalıcı Karanlık/Aydınlık Tema Modu](#2026-08-28--kalıcı-karanlıkaydınlık-darklight-tema-modu)
sadece iskelet/layout dosyalarına `dark:` varyantı eklemişti; kullanıcı Şablonlar (Templates)
ekranında metinlerin arkaplan koyulaştığında renk değiştirmediğini (siyah yazı/koyu arkaplan gibi
okunmaz kombinasyonlar) bildirdi. Bir Explore taramasıyla `dark:` sınıfı hiç olmayan tüm dosyaların
envanteri çıkarıldı ve **sadece renk utility'leri** (`text-*`, `bg-*`, `border-*`, `hover:*`,
`ring-*`, `placeholder-*`) eklendi — hiçbir class kaldırılmadı, hiçbir JSX/layout/davranış
değiştirilmedi, açık mod görünümü pikselde aynı kaldı.

**Yapılan dosyalar (paylaşılan bileşenler):** `components/Input.tsx`, `Select.tsx`, `Button.tsx`,
`Modal.tsx`, `Badge.tsx`, `ErrorState.tsx`, `ToastContainer.tsx`, `Tabs.tsx`, `Checkbox.tsx`,
`Switch.tsx`, `Drawer.tsx`, `ConfirmDialog.tsx`, `Textarea.tsx`, `EditableField.tsx`,
`CountryAutocomplete.tsx`, `InfoTooltip.tsx`, `PlaceholderPage.tsx` — hepsine eksik `dark:`
varyantları eklendi. `App.tsx`'e `sonner` `Toaster` için `theme={isDark ? 'dark' : 'light'}` prop'u
bağlandı; bunun için `store/themeStore.ts`'e `useIsDarkMode()` hook'u eklendi
(`useSyncExternalStore` ile `<html>` elementinin `dark` class'ını izliyor, `MutationObserver`
tabanlı — mevcut `mode`/`setMode` API'sine dokunulmadı).

**Yapılan dosyalar (Şablonlar/Templates — kullanıcının bildirdiği asıl sorun):**
`pages/dashboard/TemplatesPage.tsx`, `TemplateEditorPage.tsx`,
`features/invoice-editor/components/EditorToolbar.tsx`, `ElementPanel.tsx`, `LayersPanel.tsx`,
`PropertiesPanel.tsx`, `CustomFieldPopover.tsx`, `TableColumnEditor.tsx`. **Bilinçli istisna:**
`A4Canvas/A4Page.tsx` ve `A4Canvas/CanvasElement.tsx`'teki fatura önizleme "kağıt" yüzeyi
(`bg-white`, grid çizgileri, element içerik renkleri) **dokunulmadan bırakıldı** — gerçek bir
yazdırılabilir sayfa/PDF önizlemesini temsil ediyor ve kullanıcının şablonda seçtiği renkler zaten
içerik verisi.

**Yapılan dosyalar (Faturalar/Müşteriler):** `pages/dashboard/InvoicesPage.tsx`,
`CustomersPage.tsx`, `features/invoices/components/InvoiceTable.tsx`, `InvoiceTableRow.tsx`,
`InvoiceToolbar.tsx`, `InvoiceRowActions.tsx` (aksiyon dropdown menüsü),
`features/customers/components/CustomerTypeBadge.tsx`.

**Doğrulama:** `npx tsc --noEmit` hatasız geçti. Kağıt önizleme paneli dışındaki tüm kontrol/UI
yüzeylerinde artık koyu mod renk çifti (arkaplan+metin) tutarlı — ancak bu oturumda gerçek
tarayıcıda görsel teyit yapılmadı (bkz. `docs/todo.md`).

---

## 2026-08-28 — Kalıcı Karanlık/Aydınlık (Dark/Light) Tema Modu

**Durum:** Ekleme

**Özet:** Projede daha önce hiçbir tema altyapısı yoktu (grep ile `dark`/`theme`/
`prefers-color-scheme`/`localStorage` için tüm `frontend/src` tarandı, sıfır sonuç). Kullanıcı
kalıcı bir Açık/Koyu tema modu istedi; OS/tarayıcı tercihini (`prefers-color-scheme`) okuyan,
kullanıcı override ederse `localStorage`'a kalıcı yazan, 3 yönlü (Açık/Koyu/Sistem) bir kontrol
kuruldu. Proje Tailwind CSS v4 kullanıyor (klasik `tailwind.config.js` yok, CSS-first
konfigürasyon), bu yüzden `darkMode: 'class'` yerine v4'ün kendi `@custom-variant dark` mekanizması
kullanıldı. Tüm değişiklikler **sadece ek** `dark:` sınıfları — mevcut açık mod görünümü hiçbir
yerde değiştirilmedi (piksel bazında aynı).

**Yapılan dosyalar:**
- `frontend/src/index.css` — Değiştirme: `@custom-variant dark (&:where(.dark, .dark *));`
  eklendi (Tailwind v4'te class-tabanlı dark mode'u etkinleştirir). `body`'e
  `bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100` eklendi — bu, sayfa kökünün
  koyu modda beyaz kalmasını (sidebar/dropdown etrafında beyaz flash) önlüyor, çünkü hiçbir
  layout bileşeni kendi arkaplanını set etmiyordu. `.axion-scrollbar` için `.dark` scrollbar renk
  eşdeğerleri eklendi.
- `frontend/src/store/themeStore.ts` — Ekleme: `useThemeStore` (zustand `persist`), mevcut
  `localeStore.ts` deseni takip edildi. `ThemeMode = 'light' | 'dark' | 'system'`,
  `document.documentElement.classList.toggle('dark', ...)` ile uygulanıyor, `system` modunda
  `matchMedia('(prefers-color-scheme: dark)')` canlı değişiklik dinleyicisiyle anında güncelleniyor.
  Depolama key'i: `axion-theme-storage`.
- `frontend/index.html` — Değiştirme: `<head>` içine, React mount olmadan ÖNCE çalışan senkron bir
  inline `<script>` eklendi — `axion-theme-storage`'ı okuyup `<html>`'e `dark` sınıfını hemen
  uyguluyor (zustand `persist` rehydration React mount'tan SONRA çalıştığı için, bu script
  olmadan sayfa açık temayla "flaşlayıp" sonra koyuya geçerdi).
- `frontend/src/components/ThemeSwitcher.tsx` — Ekleme: `LanguageSwitcher.tsx` ile birebir aynı
  desen (segmented buton, `compact` prop, `twMerge`), `lucide-react`'ten `Sun`/`Moon`/`Monitor`
  ikonları. Hem sidebar hem Ayarlar sayfasında aynı bileşen kullanılıyor.
- `frontend/src/components/Card.tsx` — Değiştirme: paylaşılan `Card` bileşenine `dark:` varyantları
  eklendi (`dark:bg-slate-900`, `dark:border-slate-700`, başlık/ikon metinleri). Bu, planın
  kapsamındaki layout dosyalarının dışında ama zorunluydu — aksi halde tam da yeni butonun
  eklendiği Ayarlar &gt; Tercihler "Sistem" kartı koyu modda beyaz/bozuk görünecekti.
- `frontend/src/layouts/Sidebar.tsx` — Değiştirme: tüm ilgili sınıflara `dark:` eklendi (nav kökü,
  collapse butonu, app adı, nav linkleri + aktif durum, profil butonu, avatar, dropdown paneli,
  dropdown satırları, logout hover). Dil satırının hemen altına yeni bir "Tema" satırı eklendi
  (`<ThemeSwitcher compact />`).
- `frontend/src/pages/dashboard/settings/PreferencesTab.tsx` — Değiştirme: "Sistem" kartı içine,
  mevcut açıklama metninin üstüne `{t('settings.preferences.themeLabel')}` + `<ThemeSwitcher />`
  (tam boy) satırı eklendi, kart içindeki metinlere `dark:` eklendi.
- `frontend/src/layouts/DashboardLayout.tsx` — Değiştirme: mobil header border'ı ve demo banner'ına
  `dark:` eklendi.
- `frontend/src/layouts/PublicLayout.tsx` — Değiştirme: header/footer border, app adı, login linki
  ve footer metnine `dark:` eklendi.
- `frontend/src/i18n/locales/tr.json`, `en.json` — Değiştirme: `common` bloğuna
  `theme`/`themeLight`/`themeDark`/`themeSystem`, `settings.preferences` bloğuna `themeLabel`
  eklendi.

**Doğrulama:** Backend konteynerindeki (`backend-backend-1`) Playwright kurulumu kullanılarak
(host'ta çalışan Vite dev sunucusuna `--host-resolver-rules` ile `localhost` üzerinden erişilerek,
CORS/Vite host-check sorunları böylece aşıldı) uçtan uca gerçek tarayıcı testi yapıldı: yeni bir
kullanıcı signup ile oluşturuldu, dashboard'a girildi, sidebar profil menüsünden "Koyu" seçildi —
`<html>` `dark` sınıfını aldı, sidebar/dropdown/nav renkleri doğru şekilde koyu temaya döndü.
`?tab=preferences` sayfasındaki "Sistem" kartındaki kontrolün de aynı store'u paylaştığı (senkron,
"Koyu" olarak işaretli) doğrulandı. Sayfa `dark` mod aktifken yeniden yüklendiğinde, React mount
olmadan hemen önce (`wait_until="commit"`) `<html>` sınıfının zaten `dark` olduğu doğrulandı —
anti-flash script'i çalışıyor. "Açık"a geri dönüldüğünde tüm sınıflar temiz şekilde kaldırıldı,
kalıntı koyu stil kalmadı. Landing/login sayfası (açık modda) değişiklik öncesiyle karşılaştırılıp
piksel bazında aynı olduğu teyit edildi. `npx tsc --noEmit` hatasız geçti.

**Bilinen sınırlama:** Invoices/Customers/Dashboard ana sayfa gibi bu oturumda dokunulmayan diğer
sayfalar henüz `dark:` uyarlaması almadı (bkz. `docs/todo.md`) — koyu modda gezinirken beyaz
kartlar/kontrast sorunları görülebilir, bu regresyon değil, kapsam dışı bırakılmış bilinen bir
durum.

---

## 2026-08-27 — Yeni Şablonlarda Banka Tablosu Kesilmesi ve Alt Bant Düzeni Düzeltmesi

**Durum:** Değiştirme (bug fix)

**Özet:** Kullanıcı gerçek 3 banka hesabıyla Classic/Sharp/Clean/Compact şablonlarını test edince
"banka bilgileri satırı eksik, 2 banka görünüyor (3. yok), alan kesilmesi var" bildirdi. Gerçek
kök neden, `template_designer_base.html`'de `bank-account` tipi elemanların genel `.el` CSS
kuralını (`overflow: hidden`, sabit `height`) kullanması, ama `table` tipi elemanların sahip
olduğu `overflow: visible; height: auto` istisnasına **sahip olmamasıydı**. Backend'deki
`_reflow_elements_below_table` (`pdf_service.py`) banka tablosunun gerçek içerik yüksekliğini
doğru hesaplayıp elemanın `height_mm`'ini büyütüyordu, ama tahmin (`_natural_row_height_mm`, tek
satırlık font-metriği) gerçek render'dan bir miktar düşük kaldığında, CSS'teki sabit
`overflow:hidden` son satırın bir kısmını (özellikle IBAN/şube gibi uzun hücreleri) kesiyordu —
3 banka olduğunda en altta kalan satır görünmüyordu. Ayrıca Classic/Sharp şablonlarında imza+QR
elemanları banka tablosunun **üstünde**, aynı x-aralığında (dolayısıyla aynı yatay bölgede)
konumlandırılmıştı — banka tablosu tam genişliğe (178mm) çıkarılınca bu üstteki imza/QR kutuları
banka tablosunun üst kısmıyla dikey olarak çakışıyordu ("Yetkili İmza" yazısı tablo başlığının
üzerine biniyordu).

**Yapılan dosyalar:**
- `backend/app/templates_html/template_designer_base.html` — Değiştirme: `.el-table` CSS
  kuralına `.el-bank` de eklendi (`height: auto !important; overflow: visible !important`), ve
  eleman `class` seçiminde `element.type == 'bank-account'` için `el-bank` sınıfı atanır oldu.
  Bu, **tüm** v2 şablonlarda (mevcut + gelecekteki) banka tablosunun gerçek içerik kadar
  büyüyebilmesini garanti eder — artık font-metriği tahminine güvenmek zorunda değil, tahmin
  sadece "altındaki elemanları ne kadar aşağı itmeli" hesabı için kullanılıyor, kesilme riski
  ortadan kalktı.
- `backend/alembic/versions/b3f9e7a2c114_seed_v2_system_templates.py` — Değiştirme: 4 şablonun da
  alt bandı yeniden düzenlendi: (1) fatura kalemleri tablosunun tasarım yüksekliği Classic/Sharp/
  Clean'de küçültüldü (~124→100mm) — bu, alt bandı sayfanın biraz daha yukarısına taşıyarak banka
  tablosuna (artık 178mm tam genişlikte) büyüme payı bırakıyor ("banka bilgileri biraz daha
  yukarı" isteğiyle uyumlu); (2) Classic/Sharp'ta imza+QR, banka tablosunun **üstünden altına**
  taşındı (tabloyla aynı "yakın" reflow grubunda, tablo büyürse onlarla birlikte aşağı kayacak
  şekilde) — böylece tam genişlikteki banka tablosuyla asla çakışmıyorlar; (3) Compact'ta banka
  elemanı genişliği 110mm→150mm'ye çıkarıldı (QR yanına sığacak şekilde, IBAN sütununun
  sarmasını/kesilmesini önlemek için).
- Mevcut 4 satır (gerçek test faturaları `INV202600030/031/032` bunlara referans verdiği için
  `downgrade()`/`upgrade()` ile silinip yeniden eklenemedi — `invoices.template_id` FK'si
  `ON DELETE RESTRICT`) — bunun yerine düzeltilmiş `TEMPLATE_DEFS`'ten üretilen `layout_json`,
  bire bir aynı 4 UUID'ye doğrudan `UPDATE` ile senkronize edildi (yeni migration eklenmedi,
  çünkü bu satırlar bu oturumda eklenmiş, henüz başka bir ortama yayılmamış seed veri).

**Doğrulama:** Gerçek KuveytTurk Katılım hesabına ek olarak bellekte (DB'ye yazılmadan) 2 sahte
banka hesabı (Denizbank, Garanti BBVA — biri TRY biri EUR) ve `issued_at`/`due_at` eklenmiş bir
test faturasıyla 4 şablon da yeniden render edilip Playwright screenshot ile incelendi: her 4
şablonda 3 banka satırı da tam ve kesilmeden görünüyor, Tarih/Vade değerleri doğru gösteriliyor,
Classic/Sharp'ta imza/QR artık banka tablosuyla çakışmıyor. Ardından normal 1-2 banka / 1 kalem
senaryosu ve 25 kalemli çok-sayfalı senaryo (`test_multi.py` deseni) tekrar çalıştırılıp
regresyon olmadığı (sayfalama hâlâ Classic/Sharp/Clean'de 2, Compact'ta 1 sayfa) doğrulandı.

**Neden CSS düzeltmesi + koordinat düzeltmesi birlikte:** Sadece koordinatları büyütmek (bank
elemanına daha cömert `height_mm` vermek) riskli kalırdı — tahmin fonksiyonu her zaman gerçek
render'ı birebir yakalayamayabilir (font/tarayıcı farkları). CSS'teki `overflow:hidden`'ı
kaldırmak, KAÇ banka olursa olsun (2, 3, hatta gelecekte 3'ten fazla alan eklenirse) kesilmeyi
kökten imkânsız hale getiriyor — bu, tek bir şablona özel yama değil, render motorunun kendisindeki
eksik bir istisnanın (yalnızca `table` tipi için vardı, `bank-account` için unutulmuştu)
tamamlanmasıdır.

---

## 2026-08-27 — Fatura Formu: 3 Bug Düzeltmesi (Alıcı Kişi StrictMode Bugu, Fatura Tarihi Boş)

**Durum:** Değiştirme (bug fix), 1 madde bulgu/açıklama olarak kapatıldı (kod değişikliği yok)

**Özet:** Yeni 4 şablon test edilirken bildirilen 3 sorun incelendi:

1. **"Tekrar Oluştur" (duplicate) sonrası Alıcı Kişi alanı dolu görünüyor ama Kaydet/Devam Et'te
   "zorunludur" hatası veriyor, aynı kişiyi tekrar seçince düzeliyor.** Kök neden bulundu:
   `InvoiceForm.tsx`'teki `recipient_contact_ids` sıfırlama efekti (`customer_id` değiştiğinde
   alıcıları temizler), "ilk render'ı atla" mantığını bir `useRef` bayrağıyla uyguluyordu
   (`isFirstCustomerRender`). React 18 `StrictMode` (bkz. `main.tsx`), geliştirme modunda mount
   sonrası effect'leri **bilerek iki kez** çalıştırır (cleanup yokmuş gibi ard arda) — bayrak
   YALNIZCA ilk çağrıyı atlıyordu, hemen ardından gelen ikinci StrictMode çağrısında bayrak zaten
   `false` olduğundan `setValue('recipient_contact_ids', [])` çalışıp duplicate akışından gelen
   alıcıyı sessizce siliyordu (görsel olarak "dolu" kalan Select ise stale re-render'dı). Bu, yalnızca
   `customerId`'nin mount anında zaten dolu geldiği senaryoda (yani tam olarak "Tekrar Oluştur")
   tetikleniyor — sıfırdan yeni fatura formunda zaten `customer_id=''` olduğundan fark edilmiyordu.
   **Düzeltme:** `frontend/src/features/invoices/components/InvoiceForm.tsx` — bayrak yerine
   "önceki customerId" karşılaştırması kullanıldı (`previousCustomerIdRef`), StrictMode'un aynı
   render'ı tekrar çağırmasına karşı doğal olarak idempotent.
2. **3 banka seçilmesine rağmen yeni şablonlarda 1 banka görünüyor:** Kod incelemesi + gerçek
   test faturaları (`INV202600030/031/032`) DB'den sorgulanarak doğrulandı — bu bir şablon/render
   hatası değil. `bank-account` elemanı (slot=1) zaten `payment.bank_account_1/2/3`'ün HEPSİNİ tek
   tabloda listeliyor (`template_designer_base.html` `{% for ba in bank_accounts %}`), render
   scripti ile doğrulandı (2 sıra render edildi). Sorun: test kullanıcısının tanımlı sadece **2**
   banka hesabı var (`KuveytTürk`, `KuveytTurk Katılım`) ve incelenen 3 faturada `bank_account_id`
   ile `bank_account_id_2` **aynı** hesaba işaret ediyor (`bank_account_id_3` boş) — yani aslında
   2 slot dolu ve ikisi de aynı bankayı gösteriyor, bu da "tek banka" görünümüne yol açıyor. Kod
   tarafında slot'ları otomatik kopyalayan bir mekanizma bulunamadı; kullanıcı 1. ve 2. slotta
   yanlışlıkla aynı hesabı seçmiş görünüyor. **Kod değişikliği yapılmadı** — kullanıcıya bildirildi,
   gerçek 3 farklı banka ile yeniden test önerildi.
3. **Bazı şablonlarda "Tarih" (invoice.date / issued_at) boş:** `InvoiceForm.tsx`'te `issued_at`
   alanı için **hiçbir UI girişi yoktu** (tip/defaultValues'ta var ama register/Controller yok) —
   yeni oluşturulan HER fatura `issued_at=''→undefined→NULL` ile kaydediliyordu (yalnızca
   `buildDuplicateInitialValues.ts`'nin "Tekrar Oluştur" akışında bugünün tarihini elle basması
   sayesinde bazı faturalarda dolu görünüyordu — bu da "bazı şablonlarda dolu, bazılarında boş"
   tutarsızlığının asıl kaynağıydı, şablonla ilgisi yoktu). **Düzeltme:** `InvoiceForm.tsx`'in
   `useForm` `defaultValues`'ında `issued_at: ''` → `issued_at: new Date().toISOString().slice(0,10)`
   yapıldı — artık yeni faturalar da duplicate akışıyla tutarlı şekilde bugünün tarihiyle açılıyor.
   `due_at` (Vade Tarihi) için manuel giriş hâlâ yok, sadece ödeme vadesi (payment term) seçilince
   otomatik hesaplanıyor — bu, `docs/PROJECT_DESING.md`'deki due-reminder kuralıyla (vade tarihi
   yoksa kesim tarihinin ertesi gününden itibaren hatırlatma) tutarlı, kasıtlı bir durum olarak
   değerlendirildi ve değiştirilmedi.

**Yapılan dosyalar:**
- `frontend/src/features/invoices/components/InvoiceForm.tsx` — Değiştirme: `recipient_contact_ids`
  sıfırlama efekti `previousCustomerIdRef` ile yeniden yazıldı (StrictMode-güvenli); `issued_at`
  defaultValue'su bugünün tarihine çevrildi.

**Doğrulama:** `npx tsc -b --noEmit` — değişiklik öncesiyle aynı (ilgisiz, önceden var olan) 5 hata
dışında yeni hata yok. Gerçek faturalar (`INV202600030/031/032`) backend'den doğrudan sorgulanarak
banka/tarih verisi teyit edildi. Frontend değişikliği tarayıcıda manuel olarak test edilmedi (Vite
dev server bu oturumda ayrı çalışıyor, HMR ile otomatik yansıması beklenir) — bkz. `docs/todo.md`.

---

## 2026-08-27 — 4 Yeni Fatura Şablonu: Classic, Sharp, Clean, Compact

**Durum:** Ekleme

**Özet:** Kullanıcı isteğiyle sisteme 4 yeni **v2 sistem şablonu** eklendi: **Classic** (minimalist/
kurumsal, lacivert+gri, ücretsiz — `min_plan_key=None`) ve **Sharp/Clean/Compact** (modern/premium,
Business plana özel — `min_plan_key="business"`). Keşif sonucu netleşen mimari gerçek: bu projede
şablonlar statik dosya değil, `InvoiceTemplate` DB satırlarıdır — bir "tasarım" `layout_json` JSONB
alanında saklanan mutlak konumlu (mm birimli) `Element` listesidir
(`backend/app/schemas/template.py`), tüm v2 şablonlar aynı Jinja2 render dosyasını
(`backend/app/templates_html/template_designer_base.html`) paylaşır. Bu yüzden 4 yeni tasarım, tek
bir Alembic seed migration'ında elle yazılmış `layout_json` element dizileri olarak eklendi — mevcut
3 legacy sistem şablonuyla (Basit/Kurumsal/Minimal, `layout_version=1`) aynı desende ama güncel
`layout_version=2` formatında.

**Yapılan dosyalar:**
- `backend/alembic/versions/b3f9e7a2c114_seed_v2_system_templates.py` — Ekleme: `5649ad6ab27c`'den
  zincirlenen yeni migration. 4 sabit UUID'li `InvoiceTemplate` satırı (`layout_version=2`,
  `engine=VISUAL`, `orientation=portrait`, `page_size=A4`, `is_system_template=True`) + her şablonun
  kullandığı `dynamic-field` element'lerine karşılık gelen `invoice_template_fields` satırları
  (field_key başına tekilleştirilmiş, TR etiketli). Dosya içinde küçük bir element-builder DSL'i
  (`text/field/line/rect/logo/qrcode/signature/bank/table/col` fonksiyonları) tanımlanıp 4 tasarımın
  ~26-36 elemanlık `layout_json` dizisi bu fonksiyonlarla inşa edildi (ham dict literal yerine —
  4 tasarım×~30 eleman elle yazılırken hata riskini azaltmak için).
  - **Classic:** lacivert `#1e3a5f`/gri `#64748b` paleti, ince kenarlıklı müşteri kutusu, klasik
    tablo, toplamlar + banka/imza/QR alt bandı.
  - **Sharp:** üstte tam genişlik koyu `#111827` bant + amber `#f59e0b` vurgu çizgileri (hafif
    `rotation` ile "eğik" geometrik his), köşeleri keskin (0 radius) paneller, koyu dolgulu toplam
    kartı.
  - **Clean:** zümrüt `#059669` vurgu, yuvarlatılmış (`border_radius`) açık-tonlu kartlar, geniş
    satır aralığı, ferah/boşluklu düzen.
  - **Compact:** indigo `#4338ca` ince üst bant, en küçük font/satır yüksekliği (5mm), zebra açık,
    en geniş tablo alanı (y=30-210mm) — çok kalemli faturalarda daha fazla satırın tek sayfada
    kalmasını hedefler.
  - Font stratejisi: yalnızca websafe yığınlar (`Arial, Helvetica, sans-serif` / `Georgia, 'Times
    New Roman', serif`) — Playwright/Chromium Docker imajında özel Google Fonts kurulu olmadığından
    "premium" his renk/kontrast/boşlukla yaratıldı, Dockerfile'a dokunulmadı.
- `docs/PROJECT_DESING.md`, `docs/todo.md` — bu girişler.

**Neden migration (visual editor + promote değil):** Version-controlled, tekrarlanabilir, PR'da
review edilebilir — kullanıcıyla netleşen tercih. `719b9957c4bc_seed_system_templates.py`'daki
desenin (sabit UUID, idempotent `upgrade()`, temiz `downgrade()`) v2 şemaya taşınmış hali.

**Önemli mimari bulgu (kod değişikliği yapılmadı, sadece belgeleniyor):** `min_plan_key`, şu anki
kodda **sadece** `POST /templates/{id}/duplicate` (bir sistem şablonunu kopyalayıp kendi düzenlenebilir
kopyanı oluşturma) akışında kontrol ediliyor (`app/api/v1/templates.py:145`,
`subscription_service.check_min_plan`) — **fatura oluşturma/önizleme sırasında bir şablonu doğrudan
seçmeyi kısıtlamıyor** (`invoice_service._get_visible_template` hiç `check_min_plan` çağırmıyor).
Bunu doğrulayan kanıt: mevcut 3 legacy sistem şablonu da (`g1h2i3j4k5l6_add_xslt_template_columns.py`
migration'ıyla) `min_plan_key="pro"` taşıyor, ama Free plan kullanıcılar bunları faturada kullanmaya
devam edebiliyor — bu, `docs/CLAUDE.md`'deki "Free: 0 özel şablon, sadece 3 sistem şablonu
kullanılabilir" kararıyla ve mevcut `test_create_invoice_success` testiyle birebir tutarlı.
Kullanıcıyla netleştirildi: **mevcut davranış korunacak** — yani Free kullanıcılar Sharp/Clean/
Compact'ı **faturada seçip kullanabilir**, ama kendi kopyalarını oluşturup düzenleyemezler (402).
Faturada kullanmayı da kısıtlamak istenirse, ayrıca legacy 3 şablonun `min_plan_key`'ini `NULL`'a
çeken düzeltici bir migration gerekir (aksi halde Free kullanıcılar hiçbir fatura oluşturamaz hale
gelir) — bkz. `docs/todo.md`.

**Doğrulama:** `docker compose exec backend alembic upgrade head` → 4 satır + karşılık gelen
`invoice_template_fields` satırları oluştuğu Postgres'ten sorgulanarak teyit edildi;
`alembic downgrade -1` → temiz silindi, tekrar `upgrade head` sorunsuz. Gerçek bir faturayı
(`INV202600029`) her 4 yeni şablonla `render_invoice_html` + Playwright screenshot ile render edip
görsel olarak incelendi (header/şirket/müşteri/tablo/toplamlar/banka/QR doğru, renk/hizalama
tasarıma uygun). Aynı fatura 25 satıra çoğaltılarak (yalnızca bellekte, DB'ye yazılmadan) çok
sayfalı senaryo test edildi: Classic/Sharp/Clean 2 sayfaya bölündü (header/müşteri her sayfada
tekrarlıyor, toplam/banka/QR sadece son sayfada — `_classify_elements`/`_reflow_elements_below_table`
mantığıyla uyumlu), Compact tasarım amacına uygun şekilde 25 satırı tek sayfada tuttu. `pytest -q
tests/test_templates.py tests/test_invoices.py tests/test_subscriptions.py` çalıştırıldı — migration
sonrası hepsi geçti (bir test, `test_download_pdf_not_ready_returns_404`, bu oturumdaki canlı
celery-worker/beat'in gerçek zamanlı PDF üretmesiyle ilgili önceden var olan/ilgisiz bir flake —
git diff'te template migration dışında hiçbir tracked dosya değişmediği doğrulanarak teyit edildi).
`GET /templates` canlı backend'de 200 döndü (tarayıcıda aktif kullanıcı trafiği vardı).

**Doğrulanmayan (manuel, tarayıcı gerekiyor):** `dashboard/invoices/new` formundaki şablon
dropdown'ında 4 yeni ismin görsel olarak seçilip taslak önizlemenin (`InvoiceDraftPreviewModal`)
tarayıcıda da aynı şekilde göründüğü teyit edilmedi — script ile render edilen HTML/screenshot
doğrulaması yapıldı ama gerçek tarayıcı/React akışı üzerinden değil.

---

## 2026-08-27 — Vade Tarihi Bazlı Fatura Hatırlatması (Kullanıcıya Mail)

**Durum:** Ekleme

**Özet:** `dashboard/settings?tab=preferences` sayfasındaki "Bildirim Tercihleri" kartında bulunan `User.notify_invoice_reminders` checkbox'ı daha önce gerçek, backend'e persist edilen bir alan idi ama hiçbir arka plan görevine entegre edilmemişti. Bu değişiklikle, checkbox açıldığında kullanıcının (hesap sahibinin) ödenmemiş TÜM faturaları için **vade tarihine** (`Invoice.due_at`) bağlı kurallı hatırlatma maili **kullanıcının kendi e-posta adresine** gönderilmeye başlandı — müşteriye değil. Kurallar: (1) Vade tarihi yoksa → kesim tarihinin ertesi gününden itibaren her gün; (2) Vade tarihi varsa → son 3 gün + vadesi geçmiş her gün; (3) Vade tarihi geçmişse ve ödenmemişse → her gün (gecikme uyarısı); (4) Checkbox kapalıysa gönderim yapılmaz. Bu sistem, mevcut müşteri-yönlü "Ödeme Hatırlatıcısı" (`PaymentChaserPanel`, fatura bazlı `payment_reminder_active`, 7/10/13 gün) özelliğinden tamamen bağımsız çalışır.

**Yapılan dosyalar:**
- `backend/alembic/versions/5649ad6ab27c_create_invoice_due_reminders_table.py` — Ekleme: yeni migration, `f3g4h5i6j7k8`'dan zincirlenen. Tablo oluşturulması ve `f3g4h5i6j7k8 → 5649ad6ab27c` chain doğrulanarak `alembic upgrade head` çalıştırılıp tablo prodüksiyona eklendi.
- `backend/app/models/invoice.py` — Ekleme: `InvoiceDueReminder` modeli (invoice_id FK, reminder_date Date, sent_at DateTime, sent_to String) ve `UniqueConstraint('invoice_id', 'reminder_date')` — her (fatura, tarih) çiftinde en fazla bir kez gönderim garanti eder. `Invoice.due_reminders` ilişkisi eklendi.
- `backend/app/tasks/celery_app.py` — Değiştirme: `beat_schedule`'a `check_invoice_due_reminders` (saatlik, `crontab(minute=0)`) eklendi — `check_payment_reminders` ile paralel çalışır.
- `backend/app/tasks/email_tasks.py` — Ekleme: `check_invoice_due_reminders` (beat tetikler, `notify_invoice_reminders=True` olan kullanıcıların ödenmemiş faturalarını tarar, kuralları kontrol edip süresi gelen faturalar için `send_invoice_due_reminder_email_task` kuyruklar) ve `send_invoice_due_reminder_email_task` (alıcı **kullanıcı**, müşteri değil; mail gönderip `InvoiceDueReminder` kaydını oluşturur, unique constraint çakışması iki kez tetiklenmeye karşı korumalı). Hem `date`/`timedelta`/`from app.models.user import User` eklendi.
- `backend/app/services/email_service.py` — Ekleme: `DUE_REMINDER_LABELS` (tr/en, dört `kind` için ayrı mesaj: `no_due_date`, `approaching`, `due_today`, `overdue`) ve `send_invoice_due_reminder_email` fonksiyonu (CTA butonu müşteri değil, kullanıcıyı fatura detayına yönlendir: `{frontend_url}/dashboard/invoices/{invoice.id}`).
- `backend/app/templates_html/email_invoice_due_reminder.html` — Ekleme: mevcut `email_payment_reminder.html` ile aynı görsel yapı (koyu header, detay kutusu, footer) ama mesaj `kind`'e göre değişken ve CTA butonu "Faturayı Görüntüle" (detay sayfası linki).
- `frontend/src/pages/dashboard/settings/PreferencesTab.tsx` — Değiştirme: checkbox işaretliyken (`formData.notify_invoice_reminders === true`), altında `user.email` gösteren not eklendi (mailin nereye gideceğini netleştirmek için).
- `frontend/src/i18n/locales/en.json`, `tr.json` — Ekleme: `settings.preferences.invoiceRemindersEmailNote` anahtarı (interpolasyonlu, örn. `"Reminders will be sent to: {{email}}"` / `"Bildirimler şu adrese gönderilecek: {{email}}"`).

**Neden günlük tablo (adım tablosu değil):** Mevcut `InvoicePaymentReminder` sabit 3-adım (7/10/13 gün) mantığı kullanıyor. Due-reminder ise **günlük tekrarlı** — her takvim günü yeni bir hatırlatma potansiyeli var. Idempotency anahtarı `(invoice_id, reminder_date)` olmalı (step_index değil).

**Neden yeni bir task (mevcut `check_payment_reminders`'ı genişletmeyi değil):** İki sistem kuralı tamamen ayrı (oluşturma tarihi vs vade tarihi, müşteri vs kullanıcı, 3-adım vs günlük), codebase karışmaması ve testliliği için ayrı task'lar tercih edildi.

**Doğrulama:** `alembic heads` gerçek ucu bulup `5649ad6ab27c` doğru bağlandı; `alembic upgrade head` hatasız çalıştırıldı (tablo oluşturuldu); `npx tsc -b --noEmit` frontend hatasız (pre-existing TypeScript hataları mevcut ama bu feature'la ilgisi yok); migration dosyası otomatik-generate edildi ve hazırdır. Backend task'ları elle gözden geçirildi (Docker ortamında çalışan Python olmadığı için import test yapılamadı). HTML template Jinja2 sözdizimi doğru.

**Doğrulanması gereken (manuel):** Docker üzerinden Celery beat çalışır ve saatlik `check_invoice_due_reminders` tetiklenirse, o an ödenmemiş olan ve `notify_invoice_reminders=True` olan bir test faturasında, vade tarihleri kurallarına uygun olarak mail kuyruklanması gerekir. SMTP yoksa loglarda gönderilecek metin görünecek, tablo'da `InvoiceDueReminder` satırı oluşacak. Aynı gün tekrar tetiklenirse (IdempotencyError olmayıp sessizce geçerek) ikinci mail gönderilmemelidir.

---

## 2026-08-27 — Ödeme Hatırlatıcısı (Payment Reminder) Otomatik Mail Gönderimi

**Durum:** Ekleme

**Özet:** `PaymentChaserPanel.tsx` içindeki "Ödeme Hatırlatıcısı" özelliği daha önce sadece görsel bir bileşendi — `payment_reminder_active` bayrağı backend'e kaydediliyordu ama panelde gösterilen 7/10/13 günlük `REMINDER_STEPS` hiçbir zaman gerçek bir mail göndermiyordu. Bu değişiklikle, bayrak aktifken faturanın oluşturulma tarihinden (`invoice.created_at`) 7, 10 ve 13 gün sonra otomatik olarak kurumsal görünümlü, tr/en destekli bir "ödeme hatırlatma" maili gönderilmeye başlandı.

**Yapılan dosyalar:**
- `backend/app/models/invoice.py` — Ekleme: `InvoicePaymentReminder` modeli (invoice_id, step_index, offset_days, sent_at, sent_to; `UniqueConstraint(invoice_id, step_index)`) ve `Invoice.reminder_steps` ilişkisi. Her adımın en fazla bir kez gönderilmesini garanti eden idempotency kaynağı.
- `backend/alembic/versions/a3b4c5d6e7f8_create_invoice_payment_reminders_table.py` — Ekleme: yukarıdaki tablo için migration (`z2a3b4c5d6e7`'den zincirlenir).
- `backend/app/tasks/celery_app.py` — Değiştirme: `beat_schedule` eklendi — `check_payment_reminders` task'ı saatlik (`crontab(minute=0)`, UTC) tetiklenir. Projede daha önce hiçbir Celery Beat/cron mekanizması yoktu, sıfırdan eklendi.
- `backend/app/tasks/email_tasks.py` — Değiştirme: `REMINDER_STEPS = [(0,7),(1,10),(2,13)]` sabiti (frontend'deki panel ile senkron tutulmalı), `_collect_recipients` helper'ına çıkarma (mevcut `send_invoice_email_task` mantığından), yeni `check_payment_reminders` task'ı (aktif+ödenmemiş faturaları tarar, süresi gelmiş ve gönderilmemiş adımları kuyruklar) ve `send_payment_reminder_email_task` (mail gönderip `InvoicePaymentReminder` kaydını oluşturur/günceller, unique constraint ile çift gönderime karşı korumalı).
- `backend/app/services/email_service.py` — Değiştirme: SMTP gönderim mantığı `_dispatch_email` adlı ortak bir private helper'a çıkarıldı (mevcut `send_invoice_email` davranışı birebir korunarak refactor edildi); yeni `REMINDER_LABELS` (tr/en) sözlüğü ve `send_payment_reminder_email` fonksiyonu eklendi.
- `backend/app/templates_html/email_payment_reminder.html` — Ekleme: `email_invoice.html` ile aynı kurumsal görsel dilde (koyu header, detay kutusu, "Pay Now" CTA butonu, footer), ödeme hatırlatmasına özel içerikli yeni mail şablonu.
- `backend/app/schemas/invoice.py` — Ekleme: `PaymentReminderStepResponse` şeması ve `InvoiceSummaryResponse.reminder_steps` alanı — panelde her adımın gönderilip gönderilmediğini göstermek için.
- `backend/docker-compose.yml`, `docker-compose.prod.yml` — Ekleme: `celery-beat` servisi (mevcut `celery-worker` ile aynı build/env, komut `celery -A app.tasks.celery_app beat`).
- `frontend/src/types/invoice.ts` — Ekleme: `PaymentReminderStep` tipi ve `InvoiceSummary.reminder_steps` alanı.
- `frontend/src/features/invoices/types/invoiceRow.ts`, `frontend/src/features/invoices/utils/mapInvoiceToRow.ts` — Değiştirme: `reminderSteps` passthrough eklendi.
- `frontend/src/features/invoices/components/PaymentChaserPanel.tsx` — Değiştirme: her adımın açılır içeriğinde, gönderilmişse "sent on {date}" metni ve başlıkta yeşil "Gönderildi" rozeti gösteriliyor; gönderilmemişse eski placeholder metni korunuyor. Aktif/deaktif butonları ve mevcut davranış değiştirilmedi.
- `frontend/src/i18n/locales/en.json`, `tr.json` — Ekleme: `paymentChaser.emailSentOn`, `paymentChaser.sentBadge` anahtarları.

**Neden ayrı tablo (JSON kolon değil):** `check_payment_reminders` periyodik görevi her saat "bu adım daha önce gönderildi mi" sorusunu atomik sormalı; unique constraint + gönderim-sonrası-insert deseni, çakışan/örtüşen çalıştırmalarda çift mail atılmasını mimari olarak engelliyor.

**Not:** Fatura `PAID`/`CANCELLED` olduğunda veya hatırlatıcı deaktif edildiğinde, `check_payment_reminders` sorgusu o faturayı zaten döndürmediği için ayrı bir "iptal" mantığına gerek kalmadı.

**Doğrulama:** `alembic upgrade head` ile migration test edildi (dosya oluşturuldu, syntax kontrol edildi); backend modülleri elle gözden geçirildi (yerelde çalışan Python ortamı olmadığından `python -c import` çalıştırılamadı — proje Docker üzerinden çalışıyor); frontend `npx tsc --noEmit` hatasız geçti. Docker üzerinden `celery-worker`/`celery-beat` servislerinin uçtan uca gönderim testi henüz yapılmadı (bkz. `docs/todo.md`).

---

## 2026-08-27 — Fatura Listesi 500 Hatası Düzeltmesi (migration revision çakışması)

**Durum:** Düzeltme (Bug Fix)

**Özet:** Ödeme Hatırlatıcısı özelliği eklendikten sonra faturalar sekmesi `500 Internal Server Error` vermeye başladı. `docker compose logs backend` incelendiğinde kök neden net görüldü: `InvoiceSummaryResponse.reminder_steps` alanı serileştirilirken SQLAlchemy `invoice_payment_reminders` tablosuna sorgu atıyor, ancak `psycopg2.errors.UndefinedTable: relation "invoice_payment_reminders" does not exist` hatası alınıyordu — yani migration hiç uygulanmamıştı. `alembic upgrade head` çalıştırıldığında ayrı bir sorun ortaya çıktı: yeni migration dosyasının revizyon kimliği (`a3b4c5d6e7f8`), projede zaten var olan ve tamamen alakasız bir migration'la (`create_user_sessions_table`, 2026-08-13 tarihli) **çakışıyordu** — ikisi de aynı revision ID'yi kullanıyordu ("Revision a3b4c5d6e7f8 is present more than once" uyarısı ve "Multiple head revisions" hatası). Bu çakışma, migration'ın hiçbir zaman gerçek zincire eklenmediği ve dolayısıyla hiç çalıştırılmadığı anlamına geliyordu.

**Yapılan dosyalar:**
- `backend/alembic/versions/a3b4c5d6e7f8_create_invoice_payment_reminders_table.py` → `f3g4h5i6j7k8_create_invoice_payment_reminders_table.py` — Değiştirme: dosya yeniden adlandırıldı, `revision` alanı `f3g4h5i6j7k8` olarak güncellendi, `down_revision` gerçek zincir ucu olan `v1w2x3y4z5a6`'ya düzeltildi (önceki plan sırasında `z2a3b4c5d6e7` varsayılmıştı, ancak DB'deki gerçek `alembic_version` kaydı `v1w2x3y4z5a6` idi — proje geçmişinde başka geliştiriciler/oturumlar tarafından eklenmiş migration'lar plan yazılırken gözden kaçmıştı).
- DB üzerinde `alembic upgrade head` çalıştırılarak `invoice_payment_reminders` tablosu gerçekten oluşturuldu; `backend`/`celery-worker` container'ları yeniden başlatıldı (aborted transaction state temizlendi).

**Neden oluştu:** Migration dosyası oluşturulurken zincirin ucu (`down_revision`) elle tahmin edilmiş, gerçek DB `alembic_version` durumu doğrulanmamıştı. İleride yeni migration eklenirken önce `alembic heads` / `SELECT version_num FROM alembic_version` ile gerçek zincir ucu teyit edilmeli.

**Doğrulama:** `docker compose exec backend alembic heads` tek head (`f3g4h5i6j7k8`) gösterdi; `alembic upgrade head` hatasız tamamlandı; backend yeniden başlatıldıktan sonra loglarda hata yok. Kullanıcı arayüzünden gerçek oturumla tam doğrulama önerilir (frontend'den faturalar sekmesi tekrar açılarak).

---

## 2026-08-27 — PaymentChaserPanel Accordion İçeriği: Gerçek Mail Özeti

**Durum:** Değiştirme

**Özet:** "Ödeme Hatırlatıcısı" panelinde her e-posta adımının accordion'ı açıldığında sadece "E-posta içeriği yakında düzenlenebilir olacak." placeholder metni gösteriliyordu. Bu metin, `email_payment_reminder.html` şablonunun gerçek içeriğini (kurumsal header, selamlama, ödenmemiş fatura bildirimi, tutar/düzenlenme tarihi mini tablosu, "Şimdi Öde" buton önizlemesi, "zaten ödediyseniz dikkate almayın" notu) yansıtan responsive bir özet kartıyla değiştirildi — placeholder tamamen kaldırıldı.

**Yapılan dosyalar:**
- `frontend/src/features/invoices/components/PaymentChaserPanel.tsx` — Değiştirme: accordion içeriği, `backend/app/templates_html/email_payment_reminder.html` ile aynı görsel dile (koyu "Axion Invoice" header, detay kutusu, koyu CTA rozeti) sahip statik bir önizleme kartına dönüştürüldü. Gönderici adı için `useAuthStore`'dan `user.company_name || user.full_name` okunuyor; müşteri adı, fatura numarası, tutar ve oluşturulma tarihi zaten mevcut olan `row` (`InvoiceRow`) alanlarından besleniyor. Gönderilmişse yeşil "sent on" metni özet kartının üstünde ayrıca gösterilmeye devam ediyor.
- `frontend/src/i18n/locales/tr.json`, `en.json` — Ekleme: `paymentChaser.previewGreeting`, `previewNotice`, `previewAmountLabel`, `previewIssuedLabel`, `previewPaymentLine`, `previewPaymentButton`, `previewAlreadyPaid` anahtarları — backend'deki `REMINDER_LABELS` metinleriyle anlamca birebir eşleşecek şekilde çevrildi. `emailBodyPlaceholder` anahtarı artık kullanılmıyor ama geriye dönük uyumluluk için dosyada bırakıldı (silinmedi).

**Neden statik önizleme (canlı render değil):** Gerçek mail HTML'ini iframe ile render etmek yerine, panelin zaten sahip olduğu `InvoiceRow` verisiyle Tailwind tabanlı bir özet kartı oluşturmak tercih edildi — böylece ek bir API çağrısı veya iframe/sanitization riski olmadan, kullanıcıya mail içeriğinin ne olacağına dair doğru bir fikir veriliyor.

**Doğrulama:** `npx tsc --noEmit` hatasız geçti. Görsel/tarayıcı testi yapılmadı (bkz. `docs/todo.md`).

---

## 2026-08-27 — Sidebar Çıkış Yap Butonu Seperatörü

**Durum:** Değiştirme

**Özet:** Sidebar'daki açılır menüde Ayarlar/Destek seçenekleriyle Çıkış Yap butonu ayrı olmadan gösteriliyordu. Çıkış Yap'ın yıkıcı doğası (logout) gereğince, bu seçeneği görsel olarak ayırmak için üstüne `border-t border-slate-200` eklendi — proje genelinde kullanılan standart separator rengiyle tutarlı.

**Yapılan dosyalar:**
- `frontend/src/layouts/Sidebar.tsx` — Değiştirme: Çıkış Yap `<button>` elemanına `border-t border-slate-200` className'i eklendi (Ayarlar/Destek bölümünden visual ayrım sağlar).

**Doğrulama:** `npx tsc --noEmit` hatasız geçti. Görsel testi yapılmadı.

---

## 2026-08-27 — Preferences Tab'ında 3 Kolon Responsive Yapı

**Durum:** Değiştirme

**Özet:** `dashboard/settings?tab=preferences` sekmesinde seçenekler lineer/sıralı liste olarak gösteriliyordu. Proje responsive tasarım tercihlerine uygun olarak 3 kolon kart yapısına dönüştürüldü: (1) Bildirim Tercihleri, (2) Süreler, (3) Sistem. Responsive breakpoints: `grid-cols-1` (mobil), `md:grid-cols-2` (tablet), `lg:grid-cols-3` (desktop).

**Yapılan dosyalar:**
- `frontend/src/pages/dashboard/settings/PreferencesTab.tsx` — Değiştirme: mevcut `max-w-xl` container yerine `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6` eklendi; her tercih kartı (Bildirim, Süreler, Sistem) içine yerleştirildi. "Sistem" kartı yapısal olarak açık kalıyor — ileride tema/zaman dilimi/tarih formatı gibi tercihler eklenebilecek şekilde tasarlandı.
- `frontend/src/i18n/locales/en.json` — Ekleme: `settings.preferences.system`, `settings.preferences.systemDescription`, `settings.preferences.systemInfo` anahtarları.
- `frontend/src/i18n/locales/tr.json` — Ekleme: `settings.preferences.system`, `settings.preferences.systemDescription`, `settings.preferences.systemInfo` anahtarları (Türkçe çeviri).
- `frontend/src/features/invoices/mocks/mockInvoiceRows.ts` — Ekleme: Mock invoice'lardaki `reminderSteps: []` alanı (payment reminder özelliğinden gelen zorunlu alan, önceki oturumda eklenmişti ama mock'ler güncellenmemişti).

**Doğrulama:** `npx tsc -b` derlemesi, mock'ler güncellendikten sonra başarılı. Görsel/tarayıcı testi yapılmadı.

**Not:** Sistem kartı şimdilik boş yer tutucu içeriyor — ileride tema switcher, zaman dilimi, tarih formatı vb. tercihler eklenebilir.

---

## 2026-09-01 — Demo Hesabı Faturalandırma Sekmesi (Billing Tab) Kilitlemesi

**Durum:** Ekleme — Tamamlandı.

**Özet:** Demo hesabı (`demo@axioninvoice.app`) `dashboard/settings?tab=billing` sayfasındaki 
upgrade (yükselt) butonlarının pasif (disabled) olması sağlandı. Aylık/yıllık interval seçimi 
ve mevcut plan gösterimi erişilebilir kalırken, Pro ve Business planlarına yükselt butonları 
demo user'lar için disable edildi. Tooltip ile `demo.actionBlocked` mesajı gösterilir.

**Yapılan değişiklikler:**

1. **Frontend Component** (`frontend/src/pages/dashboard/BillingPage.tsx`):
   - Line 5: `useAuthStore` import'u eklendi
   - Lines 22-23: `const user = useAuthStore((state) => state.user)` ve `const isDemo = user?.is_demo ?? false` ekledildi
   - Line 107: Upgrade Button'unda `disabled={isCurrent || plan.key === 'free' || checkout.isPending || isDemo}` 
     ve `title={isDemo ? t('demo.actionBlocked') : undefined}` eklendi

**I18n:** `demo.actionBlocked` key'i zaten mevcut — yeni çeviri eklenmedi.

**Dosyalar:** 1 dosya değişti (BillingPage.tsx).

**Doğrulama:**
- `npm run build` — tarayıcı hatasız derlenmiş.
- TypeScript strict — types doğru.
- Upgrade butonları konuma göre conditional render'da değil, sadece disable state'inde — 
  UI tutarlığını ve aylık/yıllık interval seçimi arasında geçişi korur.

---

## 2026-09-02 — E-posta Tabanlı İki Adımlı Doğrulama (2FA)

**Durum:** Ekleme — Tamamlandı.

**Özet:** `dashboard/settings?tab=security` sayfasındaki 2FA kartı, şimdiye kadar hiçbir
backend'e bağlı olmayan görsel bir placeholder'dı (lokal `useState`, kalıcı `disabled` buton).
Bu iş kapsamında e-posta tabanlı, tam işlevsel bir iki adımlı doğrulama sistemi eklendi: kullanıcı
şifreyle giriş yaptıktan sonra `is_2fa_enabled=True` ise 6 haneli, 3 dakika geçerli bir OTP kodu
üretilip kayıtlı 2FA e-postasına gönderiliyor, doğrulama başarılı olunca normal access/refresh
token'lar veriliyor. Settings → Security'de kullanıcı doğrulama e-postasını girip onaylayabiliyor
(sonradan değiştirilebilir). SMS ve Authenticator yöntemleri UI'da pasif buton olarak hazırlandı,
ileride kolayca aktifleştirilebilecek şekilde (bkz. `docs/todo.md`).

**Korunan kurallar:** `access_token_expire_minutes=15`, `refresh_token_expire_days=7`,
`session_timeout_minutes` (idle-logout) ve `refresh_token` cookie'sinin session-cookie davranışı
(`max_age` yok) hiç değiştirilmedi — `_set_refresh_cookie` helper'ı aynen yeniden kullanıldı.
`signup`/`google_login`/`demo_login`/`refresh` endpoint'leri dokunulmadan kaldı, sadece şifreli
`login()` 2FA'ya göre dallandı. Demo hesap `require_not_demo` guard'ı ile 2FA'yı hiç
etkinleştiremiyor.

**Yapılan dosyalar:**

Backend:
- `backend/app/models/user.py` — `is_2fa_enabled`, `two_factor_email`, `two_factor_pending_email`,
  `two_factor_otp_hash`, `two_factor_otp_expires_at`, `two_factor_otp_purpose` kolonları eklendi.
- `backend/alembic/versions/c2d3e4f5a6b7_add_two_factor_columns_to_users.py` — Ekleme. Ayrıca
  repoda önceden var olan, fark edilmemiş iki bağımsız migration head'ini (`a1218f0ebf82` ve
  `c9d8e7f6a5b4`) merge eden bir revizyon olarak yazıldı (`down_revision` tuple) — bu ikisi
  benim değişikliğimden bağımsız, önceden var olan bir dallanma sorunuydu, test veritabanının
  `alembic upgrade head` ile açılmasını engelliyordu.
- `backend/app/core/security.py` — Değiştirme: `_create_token`'a `"two_factor"` token tipi
  eklendi. Ekleme: `create_two_factor_token`, `generate_otp_code`.
- `backend/app/schemas/auth.py` — Ekleme: `LoginResponse`, `VerifyTwoFactorRequest`,
  `ResendTwoFactorRequest`, `TwoFactorEmailSetupRequest`, `TwoFactorEmailConfirmRequest`,
  `TwoFactorToggleRequest`. `UserResponse`'a `is_2fa_enabled`/`two_factor_email`/
  `two_factor_pending_email` eklendi.
- `backend/app/services/email_service.py` — Ekleme: `OTP_EMAIL_LABELS` (tr/en), `send_2fa_otp_email`.
- `backend/app/templates_html/email_2fa_otp.html` — Ekleme: `email_password_reset.html`
  deseninden türetilmiş OTP e-posta şablonu.
- `backend/app/api/v1/auth.py` — Değiştirme: `login()` artık `LoginResponse` dönüyor ve
  `is_2fa_enabled` ise `_issue_login_otp` ile OTP akışına giriyor. Ekleme:
  `OTP_EXPIRE_MINUTES`/`OTP_RESEND_COOLDOWN_SECONDS` sabitleri, `_mask_email`,
  `_issue_login_otp`, `POST /auth/verify-2fa`, `POST /auth/resend-2fa-otp`.
- `backend/app/api/v1/two_factor.py` — Ekleme: `/2fa/email/setup`, `/2fa/email/confirm`,
  `/2fa/toggle` (hepsi `require_not_demo`).
- `backend/app/main.py` — Değiştirme: `two_factor_router` kaydedildi.
- `backend/tests/test_auth.py` — Ekleme: 7 yeni test (2FA'lı login pending-challenge döndürüyor,
  doğru/yanlış/süresi-dolmuş kod senaryoları + OTP alanlarının temizlenip temizlenmediği,
  e-posta kurulum+onay happy path, e-postasız toggle 400, demo kullanıcı 403).

Frontend:
- `frontend/src/types/auth.ts` — `User`'a 3 yeni alan + `LoginResponse` ve 2FA payload tipleri.
- `frontend/src/features/auth/api/authApi.ts` — `login` dönüş tipi `LoginResponse`; `verifyTwoFactor`,
  `resendTwoFactorOtp` eklendi.
- `frontend/src/features/twoFactor/api/twoFactorApi.ts`, `hooks/{useSetupTwoFactorEmail,
  useConfirmTwoFactorEmail,useToggleTwoFactor,index}.ts` — Ekleme (yeni modül, `features/profile`
  ile aynı desen; başarıda `useAuthStore.getState().setAuth(...)` ile store güncelleniyor).
- `frontend/src/features/auth/hooks/useLogin.ts` — Değiştirme: `requires_2fa` ise finalize etmiyor.
- `frontend/src/features/auth/hooks/useVerifyTwoFactor.ts`,
  `useResendTwoFactorOtp.ts` — Ekleme.
- `frontend/src/features/auth/components/LoginForm.tsx` — Değiştirme: `login.data?.requires_2fa`
  true iken kimlik bilgisi formu yerine 6 haneli kod formu render ediliyor (maskelenmiş e-posta
  ipucu, tekrar gönder, geri). `AuthShell.tsx`'in mevcut `ResizeObserver` yükseklik animasyonu
  panel değişimini otomatik yakaladığı için `AuthShell`'e dokunulmadı.
- `frontend/src/pages/dashboard/settings/SecurityTab.tsx` — Değiştirme: placeholder kaldırıldı,
  üç yöntemli (E-posta aktif, SMS/Authenticator pasif) kart eklendi; switch artık `user.is_2fa_enabled`'a
  bağlı ve `two_factor_email` onaylı değilse disabled.
- `frontend/src/i18n/locales/{tr,en}.json` — `auth.login.twoFactor.*` ve
  `settings.security.twoFactor.{methods,emailSetup,comingSoon,enableRequiresEmail}` anahtarları eklendi.

**Doğrulama:**
- `docker compose exec backend pytest tests/test_auth.py -q` → 14/14 geçti (7 mevcut + 7 yeni).
- `docker compose exec backend pytest -q` → 67 geçti, 1 ilgisiz önceden var olan başarısızlık
  (`test_invoices.py::test_download_pdf_not_ready_returns_404`, bu işle alakasız).
- `docker compose exec backend alembic upgrade head` → dev veritabanına başarıyla uygulandı
  (iki head merge edilip 2FA kolonları eklendi).
- Backend `app.openapi()` ile tüm yeni endpoint'lerin (`/api/v1/2fa/*`, `/api/v1/auth/verify-2fa`,
  `/api/v1/auth/resend-2fa-otp`) doğru kayıtlı olduğu doğrulandı.
- Frontend: `npx tsc -b` → sadece bu işten önce de var olan, ilgisiz 4 hata kaldı (Checkbox.tsx,
  navigation.ts, InvoiceSendEmailModal.tsx, ProfileTab.tsx); yeni kod hatasız derleniyor.
- `npx eslint` (değiştirilen tüm frontend dosyaları) → temiz.
- `npx vitest run src/features/auth` → mevcut 3 `LoginForm` testi hâlâ geçiyor.
- **Tarayıcıda henüz test edilmedi** — bkz. `docs/todo.md`.

## 2026-09-02 — Login OTP Ekranı Düzeltmeleri (Süre Sayacı, Hata Ayrımı, Resend Cooldown)

**Durum:** Tamamlandı.

**Özet:** Yukarıdaki 2FA login akışının kullanıcı testinde 5 sorun bulundu: OTP'nin 3 dakikalık
süresi hiçbir yerde gösterilmiyordu, yanlış kod ile süresi dolmuş kod aynı tek mesajla
gösteriliyordu, "Kodu Tekrar Gönder" butonu 30 saniyelik cooldown'a (429) takıldığında bunu
gerçek bir gönderim hatasıymış gibi ("Kod gönderilemedi...") gösteriyordu ve uyarı toast'ları
çok hızlı kayboluyordu. Backend'de `verify-2fa`'nın 400 (süre doldu, OTP temizlenir) / 401
(yanlış kod, OTP korunur — tekrar deneme hakkı) ayrımı zaten doğruydu, sadece frontend'e
taşınmamıştı; "Geri" butonu dışında otomatik yönlendirme olmadığı doğrulandı (zaten böyleydi,
değişmedi). `OTP_EXPIRE_MINUTES=3`/`OTP_RESEND_COOLDOWN_SECONDS=30` sabitleri ve mevcut
token/cookie/session mantığı değiştirilmedi.

**Yapılan dosyalar:**

Backend:
- `backend/app/schemas/auth.py` — Değiştirme: `LoginResponse`'a `two_factor_otp_expires_at:
  datetime | None` eklendi (frontend'in geri sayımı hesaplayabilmesi için).
- `backend/app/api/v1/auth.py` — Değiştirme: `_issue_login_otp` artık `(token, expires_at)`
  tuple'ı döndürüyor; `login`/`resend_two_factor_otp` bu değeri `LoginResponse`'a taşıyor.
  `resend_two_factor_otp`'ta 429 fırlatılırken kalan saniye standart `Retry-After` header'ı
  olarak eklendi (`detail` metni değişmedi, ekstra bilgi header üzerinden taşınıyor).
- `backend/app/main.py` — Değiştirme: `CORSMiddleware`'e `expose_headers=["Retry-After"]`
  eklendi (aksi halde tarayıcı JS'i bu header'ı okuyamıyor — CORS-safelist dışı header'lar
  `Access-Control-Expose-Headers` olmadan JS'e görünmez).
- `backend/tests/test_auth.py` — Ekleme: `test_resend_2fa_otp_within_cooldown_returns_429_
  with_retry_after`, `test_resend_2fa_otp_after_cooldown_returns_new_challenge`; mevcut pending-
  challenge testine `two_factor_otp_expires_at` alanının dolu geldiği assert'i eklendi.

Frontend:
- `frontend/src/types/auth.ts` — Değiştirme: `LoginResponse`'a `two_factor_otp_expires_at`
  eklendi.
- `frontend/src/store/toastStore.ts` — Değiştirme: `push(message, variant?, durationMs?)` —
  opsiyonel `durationMs` parametresi eklendi (varsayılan mevcut `5000`, geriye dönük uyumlu).
- `frontend/src/features/auth/hooks/useResendTwoFactorOtp.ts` — Değiştirme: `onError` artık
  429'u (`Retry-After` header'ından kalan saniyeyi okuyarak) diğer hatalardan ayırıyor; her iki
  toast da `8000`ms görünür kalıyor.
- `frontend/src/features/auth/components/LoginForm.tsx` — Değiştirme: OTP formuna "Doğrulama
  Kodu" satırının sağında canlı `mm:ss` geri sayım eklendi (`setInterval` ile saniyede bir
  güncelleniyor); süre `0`'a inince veya backend `400` dönünce input/buton kilitlenip
  `errorExpired` gösteriliyor, `401` durumunda ise sadece `errorInvalidCode` gösteriliyor.
  "Tekrar Gönder" butonu artık ayrı bir state tutmadan `remainingSeconds`'tan türetilen 30
  saniyelik yerel cooldown'u buton üzerinde sayaç olarak gösterip pasif tutuyor (backend'e
  gereksiz 429 isteği gitmesini de önlüyor). "Geri" davranışı değişmedi.
- `frontend/src/i18n/locales/{tr,en}.json` — Ekleme: `auth.login.twoFactor.{timeRemaining,
  errorExpired,resendCooldown}`; `errorInvalidCode` metni süresi-dolmuş ihtimalini artık
  içermeyecek şekilde sadeleştirildi.

**Doğrulama:**
- `docker exec backend-backend-1 pytest tests/test_auth.py -q` → 16/16 geçti (14 mevcut + 2 yeni).
- `npx tsc -b` → değiştirilen dosyalarda yeni hata yok; bu işten önce de var olan, ilgisiz 4
  hata kaldı (Checkbox.tsx, navigation.ts, InvoiceSendEmailModal.tsx, ProfileTab.tsx).
- `npx eslint` (değiştirilen tüm dosyalar) → temiz (ilk denemede `react-hooks/set-state-in-effect`
  hatası çıktı, resend-cooldown state'i kaldırılıp `remainingSeconds`'tan türetilerek çözüldü).
- `npx vitest run` → `LoginForm.test.tsx` geçti; `InvoiceForm.test.tsx`/`InvoicesPage.test.tsx`'teki
  2 başarısızlık bu işle ilgisiz, dokunulmayan dosyalarda (önceden var olan sorunlar).
- **Tarayıcıda henüz test edilmedi** — bkz. `docs/todo.md`.

## 2026-09-02 — Login OTP: Yanlış Kod Login Ekranına Atıyordu + Süre Dolunca Resend Çalışmıyordu

**Durum:** Tamamlandı.

**Özet:** Yukarıdaki düzeltmeden sonra kullanıcı iki ek sorun bildirdi: (1) OTP ekranında yanlış
kod girilince doğrudan login ekranına düşülüyordu, hatalı kod bilgisi hiç gösterilmiyordu; (2)
kodun süresi dolduktan sonra "Kodu Tekrar Gönder"e basınca da login ekranına atılıyordu, yeni kod
istemek mümkün olmuyordu. Kök neden ikisi için de aynıydı: `apiClient.ts`'teki global 401
interceptor'ı, `verify-2fa`/`resend-2fa-otp`'tan gelen her 401'i "oturum süresi doldu" sanıp
refresh token ile yenilemeye çalışıyor, henüz login olmamış bir kullanıcı için refresh cookie'si
olmadığından bu her zaman başarısız oluyor ve `clearAuth()` + `window.location.href = '/login'`
ile sert yönlendirme yapıyordu — hem yanlış-kod 401'i hem de süresi-dolmuş-token 401'i bu yolu
tetikliyordu. Ayrıca ikinci sorunun ayrı bir katmanı daha vardı: `_issue_login_otp`, doğrulama
oturumunu taşıyan `two_factor_token` JWT'sini `OTP_EXPIRE_MINUTES` (3dk) ile üretiyordu — yani OTP
kodu süresi dolduğunda JWT'nin kendisi de süresi dolmuş oluyor, bu yüzden backend "Kodu Tekrar
Gönder" isteğini bile 401 ile reddediyordu (kod süresi dolsa da resend'in çalışması gerekirdi).
`OTP_EXPIRE_MINUTES=3`/`OTP_RESEND_COOLDOWN_SECONDS=30` ve OTP kod doğrulama kuralları değişmedi.

**Yapılan dosyalar:**

Backend:
- `backend/app/api/v1/auth.py` — Değiştirme: yeni `TWO_FACTOR_SESSION_EXPIRE_MINUTES = 15`
  sabiti eklendi; `_issue_login_otp` artık `create_two_factor_token`'ı OTP süresi (3dk) yerine bu
  15dk'lık oturum süresiyle çağırıyor. OTP kodunun kendi geçerliliği hâlâ ayrı olarak
  `user.two_factor_otp_expires_at` üzerinden kontrol ediliyor (değişmedi) — yani kod hâlâ tam 3
  dakika sonra geçersiz oluyor, sadece doğrulama oturumunun kendisi (resend hakkı) daha uzun
  yaşıyor.
- `backend/tests/test_auth.py` — Ekleme: `test_resend_2fa_otp_after_otp_expiry_still_succeeds` —
  OTP kodu süresi dolmuş olsa bile (`two_factor_otp_expires_at` geçmişte), 15dk'lık token ile
  resend isteğinin 401 değil 200 döndüğünü doğruluyor.

Frontend:
- `frontend/src/lib/apiClient.ts` — Değiştirme: `NO_REFRESH_PATHS`'e `/auth/verify-2fa` ve
  `/auth/resend-2fa-otp` eklendi. Bu iki endpoint'ten gelen 401, artık refresh-token akışını
  tetiklemiyor ve sert `/login` yönlendirmesi yapmıyor; hata normal şekilde `verifyTwoFactor`/
  `resendTwoFactorOtp` mutation'ının `error`/`isError` state'ine düşüyor ve `LoginForm.tsx`
  zaten var olan `errorInvalidCode`/`errorExpired` ayrımıyla ekranda gösteriliyor — OTP
  ekranından ayrılmadan kullanıcı bilgilendiriliyor.

**Doğrulama:**
- `docker exec backend-backend-1 pytest tests/test_auth.py -q` → 17/17 geçti (16 mevcut + 1 yeni).
- `npx tsc -b` → değiştirilen dosyada yeni hata yok; önceden var olan, ilgisiz 4 hata kaldı.
- `npx eslint src/lib/apiClient.ts src/features/auth/components/LoginForm.tsx` → temiz.
- **Tarayıcıda henüz test edilmedi** — bkz. `docs/todo.md`.
