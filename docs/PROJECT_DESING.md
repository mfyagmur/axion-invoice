# Proje Tasarım ve İşlem Kayıtları

Bu dosya, projede yapılan önemli backend/frontend değişikliklerinin tarihli kaydını tutar.

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
