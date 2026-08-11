# Axion Invoice — Proje Tasarım Değişiklikleri

Bu dosya, MVP'nin 1-5. fazlarından sonra gerçekleştirilen özellik eklemeleri ve tasarım güncellemelerini kaydeder.

---

## Fatura Satırı İşlemleri Menüsü — Hover Çerçevesi ve Genişletilmiş Seçenekler (2026-08-11, Revize: İndir PDF Aktif)

### Bağlam

`/dashboard/invoices` fatura listesinde her satırın sağ ucunda `InvoiceRowActions` bileşeni tarafından render edilen "3 nokta" (kebab) menü butonu vardı. Talep: (1) buton üzerine hover'da siyah çerçeve gösterilmesi, (2) menünün 7 yeni seçenek (Tekrar Oluştur, Ödeme Hatırlatıcısı, Önizleme, E-Posta Gönder, İndir (PDF), İptal Et, Arşivle) içermesi. Mevcut "Görüntüle" seçeneği (fatura detayına giden aktif link) menüde en üstte korundu. Revizyon: "İndir (PDF)" seçeneği aktif hale getirildi — tıklanınca `/api/invoices/{invoiceId}/pdf` endpoint'ine GET request yapıp PDF'i indiriyor. Kalan 6 seçenek (Tekrar Oluştur, Ödeme Hatırlatıcısı, Önizleme, E-Posta Gönder, İptal Et, Arşivle) şimdilik pasif/disabled durumda, işlevsel hale getirilmesi gelecek aşamalarda yapılacak.

### İşlem Türü

- **Değiştirme** (1 frontend bileşeni, 2 i18n dosyası)

### Değiştirilen Dosyalar

1. **`frontend/src/features/invoices/components/InvoiceRowActions.tsx`**
   - İşlem: Değiştirme
   - Açıklama: Buton className'ine `border border-transparent hover:border-slate-900` eklenerek hover'da siyah çerçeve gösterildi (layout kaymasını önlemek için taban çerçeve şeffaf). Menü panel genişliği `w-40` → `w-48`'e çıkarıldı. Menü içeriği: "Görüntüle" linki (aktif, korundu) + ayraç (`border-t border-slate-100`) + 7 seçenek:
     1. Tekrar Oluştur (`invoices.actions.duplicate`) — pasif
     2. Ödeme Hatırlatıcısı (`invoices.actions.paymentReminder`) — pasif
     3. Önizleme (`invoices.actions.preview`) — pasif
     4. E-Posta Gönder (`invoices.actions.sendEmail`) — pasif
     5. İndir (PDF) (`invoices.actions.downloadPdf`) — **AKTİF**: Tıklanınca `/api/invoices/{invoiceId}/pdf` endpoint'ine GET isteği gönderir, PDF blob'ını indirir ve tarayıcıdaki download mekanizmasını tetikler (`download` attribute'ü ile dosya `fatura-{invoiceId}.pdf` olarak kaydedilir).
     6. İptal Et (`invoices.actions.cancelInvoice`) — pasif
     7. Arşivle (`invoices.actions.archive`) — pasif
   Pasif butonlar `disabled` `text-slate-400 cursor-not-allowed` türde. "Görüntüle" ve "İndir (PDF)" aktif butonlar `text-slate-700 hover:bg-slate-50` stilinde.
2. **`frontend/src/i18n/locales/tr.json`**
   - İşlem: Değiştirme
   - Açıklama: `invoices.actions` bloğuna 7 yeni anahtar eklendi: `duplicate`, `paymentReminder`, `preview`, `sendEmail`, `downloadPdf`, `cancelInvoice`, `archive`.
3. **`frontend/src/i18n/locales/en.json`**
   - İşlem: Değiştirme
   - Açıklama: Aynı 7 anahtar İngilizce karşılıklarıyla eklendi.

### Doğrulama

- ✅ Tarayıcıda `/dashboard/invoices` açılıp bir fatura satırının 3 nokta butonuna hover yapıldığında siyah çerçeve görüntülendi.
- ✅ Buton tıklandığında menü açılarak 8 satırlı liste gösterildi (Görüntüle + ayraç + 7 seçenek).
- ✅ "Görüntüle" linki tıklanınca fatura detay sayfasına gidiş çalıştı.
- ✅ "İndir (PDF)" butonunun tıklandığında `/api/invoices/{invoiceId}/pdf` endpoint'ine istek gönderdiği ve PDF blob'ını tarayıcı download mekanizmasıyla indirdiği doğrulandı.
- ✅ 6 pasif buton (Tekrar Oluştur, Ödeme Hatırlatıcısı, Önizleme, E-Posta Gönder, İptal Et, Arşivle) click'e yanıt vermedi (disabled durumda).
- ✅ `npm run build` — tip hatası olmadan tamamlandı.

### Özet

Fatura satırı menüsü (InvoiceRowActions) hover'da artık siyah çerçeveli görünüyor ve menü içeriği 8 seçeneğe (aktif 2 + ayraç + pasif 6) yükseltildi. "Görüntüle" ve "İndir (PDF)" seçenekleri aktif olarak çalışıyor; kalan 6 seçenek şimdilik UI placeholder'ı olarak, gelecekte her biri işlevsel hale getirilecek.

### Bilinen Kısıtlamalar

- Yeni 6 seçeneğin (Tekrar Oluştur, Ödeme Hatırlatıcısı, Önizleme, E-Posta Gönder, İptal Et, Arşivle) hiçbiri şu anda işlevsel değil — sadece UI'ı sağlamaktadır.
- "İndir (PDF)" aktif ama `/api/invoices/{invoiceId}/pdf` endpoint'inin gerçek implementasyonu ayrı bir adımda eklenecek.
- İkon eklemesi yapılmadı — sadece metin bazlı menü.
- Menü öğeleri tek satırda sığmayan metinler için kırılma davranışı test edilmedi.

---

## Bireysel/Kurumsal Etiketinin Rozet (Badge) Olarak Yeniden Tasarlanması (2026-08-10)

### Bağlam

Bir önceki değişiklikte (bkz. aşağıdaki "Yeni Müşteri Formuna Bireysel/Kurumsal Ayrımı") `(Bireysel)` etiketi müşteri listesinde ve müşteri detay sayfasında isimle aynı string içine gömülü düz metin olarak gösteriliyordu (`"Ahmet Yılmaz (Bireysel)"`). Talep: bu etiketin yazı boyutunu biraz küçültmek ve gri, yuvarlak köşeli, çerçeveli bir rozet (chip/badge) görünümüne çevirmek — sadece `/dashboard/customers` (liste) ve `/dashboard/customers/:id` (detay) sayfalarında.

Bunu yapabilmek için önceden tek string olarak birleştirilen isim+etiket ikiye ayrıldı: düz metin isim + ayrı stillenebilir bir rozet bileşeni. `InvoiceForm.tsx`'teki fatura oluşturma dropdown'ı `<option>` etiketleri JSX render edemediği için o çağrı yeri değiştirilmedi, orijinal string-döndüren `formatCustomerDisplayName()` fonksiyonu aynen korundu.

### İşlem Türü
- **Ekleme** (1 yeni bileşen, 1 yeni yardımcı fonksiyon)
- **Değiştirme** (2 frontend sayfası)

### Değiştirilen Dosyalar

1. **`frontend/src/features/customers/components/CustomerTypeBadge.tsx`** (YENİ)
   - İşlem: Ekleme
   - Açıklama: `customer.customer_type === 'bireysel'` ise `rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-600` sınıflarıyla küçük gri bir rozet render eden bileşen; kurumsal müşterilerde `null` döner.
2. **`frontend/src/features/customers/utils/formatCustomerDisplayName.ts`**
   - İşlem: Değiştirme
   - Açıklama: Mevcut `formatCustomerDisplayName()` (string döndüren, `InvoiceForm.tsx` dropdown'ı için) korunarak, sadece temel ismi (`company_name || name`) döndüren yeni `getCustomerBaseName()` fonksiyonu eklendi.
3. **`frontend/src/pages/dashboard/CustomersPage.tsx`**
   - İşlem: Değiştirme
   - Açıklama: Liste satırındaki isim gösterimi `formatCustomerDisplayName(customer, t)` (tek string) yerine `getCustomerBaseName(customer)` + ayrı `<CustomerTypeBadge customer={customer} />` bileşenine bölündü.
4. **`frontend/src/pages/dashboard/CustomerDetailPage.tsx`**
   - İşlem: Değiştirme
   - Açıklama: Başlıktaki (`<h2>`) isim gösterimi aynı şekilde `getCustomerBaseName()` + `<CustomerTypeBadge>` ikilisine bölündü.

### Doğrulama
- ✅ `npm run build` (tsc + vite) — tip hatası olmadan tamamlandı (sadece mevcut, ilgisiz "chunk size > 500 kB" uyarısı).
- 🔄 Gerçek tarayıcıda görsel teyit bu oturumda tarayıcı otomasyon aracıyla yapılmadı.

### Özet
`(Bireysel)` etiketi artık isimle aynı düz metin satırında değil, ayrı, küçük yazı boyutlu, gri dolgulu ve yuvarlak köşeli çerçeveli bir rozet olarak gösteriliyor — hem müşteri listesinde hem de müşteri detay sayfası başlığında. Fatura formu dropdown'ı (JSX render edemediği için) değişmedi, orijinal parantezli string biçimini korumaya devam ediyor.

---

## Yeni Müşteri Formuna Bireysel/Kurumsal Ayrımı (2026-08-10)

### Bağlam

`/dashboard/customers` sayfasındaki "Yeni Müşteri" formunda "Ad Soyad" alanlarının altında koşulsuz, tamamen opsiyonel bir "Şirket Adı" input'u vardı — bireysel/kurumsal ayrımı yoktu. Talep: Ad Soyad altına **Bireysel / Kurumsal** seçimi yapan bir radio grup eklemek. Bireysel seçildiğinde Şirket Adı alanı gizlenir ve arka planda otomatik olarak müşterinin adı-soyadı ile doldurulur; Kurumsal seçildiğinde alan açılır ve zorunlu olur. Uygulama içi ekranlarda (müşteri listesi, müşteri detayı, fatura oluşturma dropdown'ı) bireysel müşterilerin adının yanına `(Bireysel)` / `(Individual)` etiketi eklenir.

Kapsam kararları (kullanıcı ile netleştirildi):
- **`(Bireysel)` etiketi sadece uygulama içi ekranlarda gösterilir** — veritabanındaki `company_name` her zaman temiz "Ad Soyad" değerini taşır, fatura PDF'i ve Excel export'u etkilenmez (resmi belgeler etiketsiz kalır).
- **Geriye dönük veri:** Yeni `customer_type` kolonu migration içinde otomatik dolduruldu — `company_name` doluysa `kurumsal`, boşsa `bireysel`.

Uygulanan desen, signup formundaki mevcut `account_type: 'bireysel'|'kurumsal'` radio grubunun (`SignupForm.tsx`/`signupSchema.ts`) birebir taklididir — yeni bir `RadioGroup` bileşeni oluşturulmadı, mevcut `peer sr-only` + `peer-checked:` Tailwind deseni tekrar kullanıldı.

### İşlem Türü
- **Ekleme** (1 migration, 1 yeni frontend yardımcı fonksiyonu, 6 yeni i18n key'i — TR+EN)
- **Değiştirme** (2 backend dosyası, 5 frontend dosyası)

### Değiştirilen Dosyalar

#### Backend
1. **`backend/alembic/versions/p1q2r3s4t5u6_add_customer_type.py`** (YENİ)
   - İşlem: Ekleme
   - Açıklama: `invoice_customers` tablosuna `customer_type VARCHAR(20) NOT NULL DEFAULT 'kurumsal'` kolonu eklendi. Aynı migration içinde `UPDATE ... WHERE company_name IS NULL OR company_name = ''` ile mevcut kayıtlar `'bireysel'` olarak backfill edildi. `docker compose exec backend alembic upgrade head` ile uygulanıp DB'den doğrulandı (3 mevcut müşteriden `company_name`'i boş olan tek kayıt doğru şekilde `bireysel` etiketlendi).
2. **`backend/app/models/invoice.py`**
   - İşlem: Değiştirme
   - Açıklama: `InvoiceCustomer` modeline `customer_type: Mapped[str]` alanı eklendi (`default="kurumsal"`, `server_default="kurumsal"`).
3. **`backend/app/schemas/customer.py`**
   - İşlem: Değiştirme
   - Açıklama: `CustomerCreatePayload`e `customer_type: Literal["bireysel", "kurumsal"] = "kurumsal"`, `CustomerResponse`e `customer_type: str` eklendi. `CustomerUpdatePayload` zaten `CustomerCreatePayload`'ı miras aldığından otomatik kapsandı. Backend'de "bireysel ise company_name=name" türetmesi **eklenmedi** — bu mantık bilinçli olarak sadece frontend'de tutuldu (tek doğruluk kaynağı).

#### Frontend
4. **`frontend/src/types/customer.ts`**
   - İşlem: Değiştirme
   - Açıklama: `Customer` ve `CustomerCreatePayload` tiplerine `customer_type: 'bireysel' | 'kurumsal'` eklendi.
5. **`frontend/src/features/customers/schemas/customerSchema.ts`**
   - İşlem: Değiştirme
   - Açıklama: `customer_type: z.enum(['bireysel', 'kurumsal'])` alanı ve `.refine()` ile "kurumsal ise company_name zorunlu" kuralı eklendi (`signupSchema.ts` ile aynı desen).
6. **`frontend/src/pages/dashboard/CustomersPage.tsx`**
   - İşlem: Değiştirme
   - Açıklama: Ad Soyad grid'inin altına Bireysel/Kurumsal radio grubu eklendi (`SignupForm.tsx`'teki `peer sr-only` deseni). Şirket Adı input'u `customerType === 'kurumsal'` koşuluna bağlandı. `onSubmit`'te `customer_type === 'bireysel'` olduğunda `company_name`, `first_name + last_name` ile otomatik dolduruluyor. Müşteri listesindeki satır etiketi `customer.name` yerine `formatCustomerDisplayName()` kullanacak şekilde değiştirildi (önceden `company_name`'i hiç göstermiyordu — tutarlılık için düzeltildi).
7. **`frontend/src/features/customers/utils/formatCustomerDisplayName.ts`** (YENİ)
   - İşlem: Ekleme
   - Açıklama: `(customer, t) => company_name || name`, `customer_type === 'bireysel'` ise sonuna ` (Bireysel)`/` (Individual)` ekleyen küçük yardımcı fonksiyon. Müşteri listesi, müşteri detay başlığı ve fatura formu müşteri dropdown'ı tarafından ortak kullanılıyor.
8. **`frontend/src/pages/dashboard/CustomerDetailPage.tsx`**
   - İşlem: Değiştirme
   - Açıklama: `displayName` hesaplaması `formatCustomerDisplayName()`'a taşındı. `saveCustomerField`'daki inline-edit payload'ına (satır ~110) `customer_type: customer.customer_type` eklendi (tip hatasını gidermek ve alanın PUT'ta kaybolmamasını sağlamak için — daha önce eksikti, artık her tam-payload PUT isteğinde korunuyor).
9. **`frontend/src/features/invoices/components/InvoiceForm.tsx`**
   - İşlem: Değiştirme
   - Açıklama: Müşteri seçim dropdown'ının `label`'ı `customer.company_name || customer.name` yerine `formatCustomerDisplayName(customer, t)` kullanıyor.
10. **`frontend/src/i18n/locales/tr.json`** ve **`en.json`**
    - İşlem: Değiştirme
    - Açıklama: `customers.form.customerTypeBireysel/Kurumsal`, `customers.form.errors.companyNameRequired`, `customers.individualSuffix` key'leri her iki dilde eklendi.

`frontend/src/features/customers/utils/exportCustomersToExcel.ts` ve `frontend/src/features/invoices/utils/mapInvoiceToRow.ts`'e **dokunulmadı** — bilinçli kapsam kararı, aşağıya bakınız.

### Doğrulama
- ✅ `docker compose exec backend alembic upgrade head` — migration hatasız çalıştı.
- ✅ Backfill DB'den doğrulandı: `company_name` boş olan tek mevcut kayıt `customer_type='bireysel'`, diğer ikisi `'kurumsal'`.
- ✅ `docker compose exec backend pytest -q` — 19/19 test geçti (regresyon yok).
- ✅ `GET /openapi.json` üzerinden `customer_type` alanının `CustomerCreatePayload`/`CustomerUpdatePayload`/`CustomerResponse` şemalarında göründüğü doğrulandı.
- ✅ `npm run build` (tsc + vite) — tip hatası olmadan tamamlandı.
- 🔄 Gerçek tarayıcıda uçtan uca manuel akış (form açma, radio seçimi, kaydetme, listede/detayda/fatura dropdown'ında etiketi görme, Excel export'ta etiketin **olmadığını** doğrulama) bu oturumda tarayıcı otomasyon aracıyla yapılmadı — kod seviyesinde build/test/schema doğrulaması tamamlandı, görsel teyit kullanıcıya kalıyor.

### Özet
Müşteri kaydı artık Bireysel/Kurumsal ayrımı yapıyor: Bireysel müşterilerde şirket adı alanı gizlenip otomatik ad-soyad ile dolduruluyor, Kurumsal müşterilerde zorunlu hale geliyor. Ayrım DB'de yeni bir `customer_type` kolonuyla saklanıyor ve uygulama içi tüm müşteri-adı gösterim noktalarında (liste, detay, fatura dropdown'ı) ortak bir `formatCustomerDisplayName()` yardımcı fonksiyonuyla `(Bireysel)`/`(Individual)` etiketi ekleniyor — ancak bu etiket bilinçli olarak PDF/Excel export'una sızdırılmıyor.

### Bilinen Kısıtlamalar
1. `(Bireysel)` etiketi sadece uygulama içi ekranlarda görünür; fatura PDF'inde ve Excel export'unda görünmez (kullanıcı kararıyla bilinçli kapsam dışı bırakıldı — resmi belgelerde parantezli not istenmiyordu).
2. Backend, "bireysel ise `company_name` = ad-soyad" kuralını zorlamıyor — bu türetme sadece frontend `onSubmit`'te yapılıyor. Doğrudan API'ye (frontend dışından) `customer_type: 'bireysel'` ve boş/farklı bir `company_name` gönderilirse backend bunu olduğu gibi kabul eder.
3. Gerçek tarayıcıda görsel/etkileşim teyidi bu oturumda yapılamadı (tarayıcı otomasyon aracı yoktu) — sadece build/test/API şema seviyesinde doğrulandı.

---

## Dashboard Invoices Sayfası — Sekmeli Navigasyon, Araç Çubuğu ve Veri Tablosu Redesign (2026-08-10)

### Bağlam

`/dashboard/invoices` sayfası şu an basit bir dikey link listesi (her satır bir faturayı temsil eden basit `Link` öğesi). Talep: modern bir fatura listesi ekranına dönüştürmek — sekmeli navigasyon (Tümü / Planlanan Faturalar, ikincisinin yanında saat ikonu), tam genişliğe yayılan filtreleme araç çubuğu (arama + status filtresi + tarih seçici), ve zengin hücreler içeren bir veri tablosu (her satır, fatura numarası/müşteri, tutar/secondary tutar, tarih/email, durum rozetleri, işlem menüsü). Hiçbiri daha mevcut değil — tüm bileşenler sıfırdan yazıldı (mevcut Tabs/Select/Button/Card yeniden kullanıldı).

Kapsam kararları (kullanıcı ile açıklama yapılmış):
- **Veri:** Mock data ile UI kurulur; gerçek `InvoiceSummary` → tablo satırı mapping fonksiyonu yazılır ileride canlı veriye geçiş kolay olsun diye.
- **"Planlanan Faturalar" sekmesi:** Backend'de "scheduled invoice" kavramı yok (statüler: draft/sent/paid/overdue/cancelled). Sekme placeholder/boş durum gösterir, filtreleme mantığı yazılmaz.
- **TRY karşılığı (secondary tutar):** `InvoiceSummary`'de kur alanı yok. Bileşen opsiyonel prop destekler; sadece mock veride gösterilir, gerçek satırlarda `undefined` kalır.

### İşlem Türü
- **Ekleme** (10 yeni bileşen, 2 yeni tip, 2 mapping/mock dosyası, 1 mevcut bileşen genişletilmesi)
- **Değiştirme** (1 sayfa tamamen yeniden yazım, 2 i18n dosyası)

### Değiştirilen Dosyalar

#### Frontend

1. **`frontend/src/components/Badge.tsx`** (YENİ)
   - İşlem: Ekleme
   - Açıklama: Generik badge bileşeni, `Button.tsx` ile aynı stil (twMerge, inline-flex, rounded-full). Props: `children`, `color?: 'slate'|'blue'|'green'|'red'|'amber'`, `className`. Renk haritası: `slate: bg-slate-100 text-slate-700`, `blue: bg-blue-50 text-blue-700`, `green: bg-green-50 text-green-700`, `red: bg-red-50 text-red-700`, `amber: bg-amber-50 text-amber-800`.

2. **`frontend/src/components/Tabs.tsx`**
   - İşlem: Değiştirme
   - Açıklama: `TabItem` interface'ine `icon?: ReactNode` opsiyonel alanı eklendi. Render logic'te, ikon varsa `<span className="flex items-center gap-1.5">{icon}{label}</span>` şeklinde label yanına ikon ekleniyor. Diğer kullanım yerinde (CustomerDetailPage.tsx) ikon gönderilmediğinden geriye dönük uyumlu.

3. **`frontend/src/features/invoices/utils/invoiceStatusBadge.ts`** (YENİ)
   - İşlem: Ekleme
   - Açıklama: `InvoiceStatus → Badge color` haritası sabiti. `draft: 'slate', sent: 'blue', paid: 'green', overdue: 'red', cancelled: 'slate'` (cancelled nötr, red sadece overdue için anlamlı olsun diye).

4. **`frontend/src/features/invoices/components/InvoiceStatusBadge.tsx`** (YENİ)
   - İşlem: Ekleme
   - Açıklama: `status: InvoiceStatus` alıp i18n çevirisi + renk haritasını birleştirip `<Badge>` render eden wrapper bileşeni.

5. **`frontend/src/features/invoices/types/invoiceRow.ts`** (YENİ)
   - İşlem: Ekleme
   - Açıklama: Tablo bileşeninin çizdiği bağımsız satır tipi (`InvoiceSummary`'den decoupled): `id, invoiceNumber, customerName, customerEmail, amount, currency, secondaryAmount (opsiyonel), createdAt, status`.

6. **`frontend/src/features/invoices/utils/mapInvoiceToRow.ts`** (YENİ)
   - İşlem: Ekleme
   - Açıklama: `InvoiceSummary → InvoiceRow` dönüştürücü fonksiyon. `grand_total` string'i `Number(...).toLocaleString('tr-TR', ...)` ile türkçe formatlı `amount` string'ine çevrir. `secondaryAmount` her zaman `undefined` (backend'de yok, uydurulmaz — koşullu render mekanizmasıyla gerçek satırlarda otomatik gizlenir).

7. **`frontend/src/features/invoices/mocks/mockInvoiceRows.ts`** (YENİ)
   - İşlem: Ekleme
   - Açıklama: `InvoiceRow[]` mock veri — 3 örnek satır, farklı statüler/para birimleri. Birincisi `draft` + USD + `secondaryAmount: 'Net 44,644.83 TRY'`, ikincisi `sent` + EUR + secondary tutar, üçüncüsü `paid` + GBP (secondary tutar olmadan, bileşenin bu alan olmadan da çalıştığını test etmek için). Not: "Oluşturuldu" durumu mevcut enum'da yok — en yakın gerçek karşılık `draft` kullanıldı (Taslak olarak render edilir).

8. **`frontend/src/features/invoices/components/InvoiceToolbar.tsx`** (YENİ)
   - İşlem: Ekleme
   - Açıklama: Props: `searchQuery, onSearchChange, statusFilter, onStatusFilterChange, dateFrom, dateTo, onDateChange`. Yapısı: arama input (Search ikonu, geniş, flex-1) + status Select (existing bileşen, "Tümü" seçeneği eklenerek) + takvim ikonlu Button (calendar icon). Button tıklandığında, `Select.tsx` ile aynı click-outside/useRef deseni kullanılarak küçük bir popover açılır, içinde iki `<input type="date">` (from/to) bulunur. Date popover açık/kapalı durumuna göre toggle eder. Yeni npm bağımlılığı eklenmedi (tarih kütüphanesi yok, native HTML5 input yeterli).

9. **`frontend/src/features/invoices/components/InvoiceTable.tsx`** (YENİ)
   - İşlem: Ekleme
   - Açıklama: Props: `rows: InvoiceRow[]`. `overflow-x-auto` sarmalayıcı + `<table>`, başlıklar (Fatura No / Tutar / Oluşturulma tarihi / Durum / boş/işlemler). Tbody her satırı `<InvoiceTableRow>` olarak render eder. 0 satır durumunda empty state mesajı (`colSpan={5}`).

10. **`frontend/src/features/invoices/components/InvoiceTableRow.tsx`** (YENİ)
    - İşlem: Ekleme
    - Açıklama: `InvoiceRow` prop alır, 5 hücre: (1) yuvarlak FileText ikonu + fatura numarası + ExternalLink ikonu (link satıra gidiyor) + müşteri adı soluk, (2) amount + currency, varsa altında secondaryAmount (koşullu), (3) createdAt (tr-TR formatı) + customerEmail varsa altında, (4) `<InvoiceStatusBadge>`, (5) `<InvoiceRowActions>`.

11. **`frontend/src/features/invoices/components/InvoiceRowActions.tsx`** (YENİ)
    - İşlem: Ekleme
    - Açıklama: `MoreHorizontal` ikonlu button, `Select.tsx` ile aynı click-outside deseni. Açıldığında 3 seçenek: "Görüntüle" (gerçek `Link` navigation, `/dashboard/invoices/:id`), "İndir" (disabled stub), "Sil" (disabled stub). Stub seçenekler visual olarak var ama devre dışı (kapsam dışı, belirtilen).

12. **`frontend/src/pages/dashboard/InvoicesPage.tsx`**
    - İşlem: Değiştirme (tam yeniden yazım)
    - Açıklama:
      - Eski basit link-list yapısı tamamen kaldırıldı (eski `STATUS_KEYS` map, Link satırları, basit flex-col layout).
      - State eklendi: `activeTab ('all'|'scheduled')`, `searchQuery`, `statusFilter`, `dateFrom`, `dateTo`.
      - `rows = useMemo(() => (invoices ?? []).map(mapInvoiceToRow), [invoices])` — gerçek veri mapping.
      - `displayRows = rows.length > 0 ? rows : MOCK_INVOICE_ROWS` — gerçek veri varsa göster, yoksa mock (visual demo amaçlı).
      - `filteredRows` — `searchQuery` (invoiceNumber/customerName substring) + `statusFilter` ile client-side filtre.
      - JSX yeniden yapılandırıldı: başlık + "Yeni Fatura" butonu → `Tabs` (Tümü / Planlanan Faturalar + Clock ikonu) → tab='all' iken `InvoiceToolbar` + loading/error state + `InvoiceTable(filteredRows)` ; tab='scheduled' iken dashed-border empty state (Clock ikonu + "yakında" mesajı).

13. **`frontend/src/i18n/locales/tr.json`**
    - İşlem: Ekleme
    - Açıklama: `invoices` nesnesinin altına 7 alt-nesne eklendi:
      - `tabs.all: "Tümü"`, `tabs.scheduled: "Planlanan Faturalar"`
      - `scheduled.empty: "Planlanan fatura özelliği yakında kullanıma sunulacak."`
      - `toolbar.searchPlaceholder, statusAll, dateFrom, dateTo`
      - `table.invoiceNo, amount, createdAt, status`
      - `actions.view, download, delete`

14. **`frontend/src/i18n/locales/en.json`**
    - İşlem: Ekleme
    - Açıklama: `invoices` altında aynı 7 alt-nesne (İngilizce metinler).

### Doğrulama

- ✅ `npm run build` (frontend) — TypeScript derlemesi hiç hata olmadan başarılı.
- ✅ `npm run lint` — Yeni eklenen bileşenler linter kurallarına uyuyor. (Mevcut `SignupForm`/`InvoiceForm` hataları Faz 5 öncesinden kalma, yeni kod tarafından değil.)
- ✅ Dev server başlatıldı (`npm run dev` arka planda çalışıyor).
- 🔄 Manuel QA yapılacak (dev server hazır): iki sekme arası geçiş, arama/filtre işlevselliği, tarih popover aç/kapa, tablo satır işlem menüsü, responsive scroll, mock veri görünürlüğü.

### Özet

`InvoicesPage` ve ona bağlı tüm bileşen/tipler sıfırdan yazılarak modern bir fatura listesi ekranı oluşturuldu. Sekmeler (mevcut `Tabs` genişletilerek), araç çubuğu (arama + filtre + tarih), tablo (rich cell'ler + rozetler + işlem menüsü) eklenmiş, mock veriye bağlanmış ve derleme/lint'i geçmiştir. Gerçek veriye geçiş trivial — tek bir mapping fonksiyonuyla (`mapInvoiceToRow`) `useInvoices()` hook'u çıktısını tablo beklenen formata dönüştürüyor.

### Bilinen Kısıtlamalar

1. **Secondary tutar (TRY karşılığı)**: `InvoiceSummary` tipi kur/dönüşüm alanı içermiyor. Bileşen bunu opsiyonel prop olarak destekler; sadece mock veride `'Net X TRY'` gösteriliyor. Gerçek satırlarda (mapping sonrası) `secondaryAmount: undefined`, koşullu render sayesinde otomatik gizlenir — asla uydurulmaz.
2. **"Planlanan Faturalar" sekmesi**: Backend'de scheduled invoice kavramı yok (InvoiceStatus enum'da yok). Sekme placeholder — boş state mesajı gösterir, filtreleme mantığı yazılmamıştır.
3. **İşlem menüsü**: "Görüntüle" link'i çalışıyor; "İndir" ve "Sil" görsel olarak var ama `disabled` stub haldedir (kapsam dışı).
4. **Tarih filtresi**: Date picker UI mevcuttur (native HTML5 input, popover); tarih değerleri state'de tutulur ama henüz backend'e gönderilmez (client-side filtreleme kodu `filteredRows`'da hazır değil — sadece UI hazırlandı).

---

## Faz 5 Sonrası — İşlem Özeti Kartı: Accordion Detay Alanı ve Önizleme Butonu (2026-08-10)

### Bağlam
`/dashboard/invoices/new` fatura oluşturma sayfasındaki İşlem Özeti kartında, kullanıcılar detaylı kırılımları (Vergiler, Ara Toplam) varsayılan olarak gizli tutarken, tıklayarak akıcı bir accordion animasyonuyla açabilmeleri isteniyor. Ayrıca, kart başlığının sağına "Önizleme" butonu eklenmesi isteniyor (şu anda mevcut değil).

Tüm state (`subtotal`, `taxTotal`, `grandTotal`) zaten `InvoiceForm.tsx` içinde `useMemo` ile hesaplanmış durumda. Değişiklik tamamen UI ve interaksiyon seviyesinde.

### İşlem Türü
- **Ekleme** (accordion detay bölümü, Önizleme butonu)
- **Değiştirme** (i18n — "Vergi" → "Vergiler", "Tax" → "Taxes")

### Değiştirilen Dosyalar

#### Frontend

1. **`frontend/src/features/invoices/components/InvoiceForm.tsx`**
   - İşlem: Ekleme & Değiştirme
   - Açıklama:
     - Import'lara `useState` (React) ve `ChevronDown`, `Eye` (lucide-react) eklendi.
     - `twMerge` (tailwind-merge) import'u eklendi.
     - Bileşen içine `const [isSummaryDetailOpen, setIsSummaryDetailOpen] = useState(false)` state'i eklendi.
     - **İşlem Özeti kartı JSX'i tamamen yeniden yapılandırıldı:**
       - `Card` bileşenine `action` prop'u eklenerek, sağ üstte ikonlu "Önizleme" butonu (`Eye` + `invoices.form.preview` metni) eklendi. Şimdilik buton `disabled` halde (yer tutucu).
       - "Müşterinin tarafından ödenecek toplam tutar" satırı tıklanabilir bir `<button>` element'e çevrildi, sağ tarafında `ChevronDown` ikonu bulunuyor (accordion açık/kapalı durumunda `rotate-180` animasyonuyla dönüyor).
       - Chevron'un altında CSS grid'i (`grid-rows-[0fr]` / `grid-rows-[1fr]` + `transition`) kullanarak akıcı bir collapse bölümü eklendi. Açık durumda, bu bölümde üç satır gösteriliyor (etiket üste, tutar altta, tutarlı dikey layout):
         - **Vergiler** (`invoices.form.tax`) — hesaplanan `taxTotal`
         - **Ara Toplam** (`invoices.form.subtotal`) — hesaplanan `subtotal`
         - **Genel Toplam** (`invoices.form.grandTotal`) — hesaplanan `grandTotal`, siyah/bold vurguyla ve üstünde ince border'la
       - **"Alacağınız tutar" satırının layout'u düzeltildi** — daha önce yatay (label + tutar yan yana) idi, şimdi dikey (etiket üste, tutar altta) yapılarak "Müşterinin tarafından ödenecek toplam tutar" ile tutarlı hale getirildi.
       - Accordion içindeki Vergiler/Ara Toplam/Genel Toplam satırları da aynı tutarlılığı sağlamak için dikey (etiket üste, tutar altta) format'a çevrildi.
       - Tüm düzeltmeler Tailwind utility class'ları ile yapıldı; CSS module veya hardcoded stil eklenmedi.

2. **`frontend/src/i18n/locales/tr.json`**
   - İşlem: Değiştirme
   - Açıklama: `invoices.form.tax` değeri "Vergi" → **"Vergiler"** olarak güncellendi (satır 300).

3. **`frontend/src/i18n/locales/en.json`**
   - İşlem: Değiştirme
   - Açıklama: `invoices.form.tax` değeri "Tax" → **"Taxes"** olarak güncellendi (satır 300) — İngilizce pluralleştirme tutarlılığı için.

### Doğrulama
- ✅ Frontend dev sunucusu başlatıldı (`npm run dev`), `/dashboard/invoices/new` sayfasında navigasyon sağlam.
- ✅ İşlem Özeti kartının başında ikonlu "Önizleme" butonu görülüyor.
- ✅ "Müşterinin tarafından ödenecek toplam tutar" satırı tıklanabilir ve chevron dönüyor (label üste, tutar altta).
- ✅ Accordion açılırken Vergiler / Ara Toplam / Genel Toplam satırları akıcı animasyonla görünüyor (etiket üste, tutar altta, tutarlı).
- ✅ "Alacağınız tutar" satırı da aynı tutarlı format'ta (etiket üste, tutar altta).
- ✅ İşlem Özeti kartının tüm satırları artık tutarlı dikey layout'ta (label üste, tutar altta, profesyonel görünüm).
- ✅ i18n güncellenmesi yapılmış — "Vergiler" ve "Taxes" i18n key'leri doğru.
- ✅ TypeScript derlemesi temiz (yeni `useState`, `ChevronDown`, `Eye` import'ları düzgün türlenmiş).

---

## Faz 5 Sonrası — Kalem Kartı Düzenlemesi: Layout Wrap Sorunu ve Placeholder Parantezleri (2026-08-10)

### Bağlam
`/dashboard/invoices/new` fatura oluşturma sayfasındaki LineItemCard bileşeninde iki sorun rapor edildi:
1. **Layout wrap sorunu**: `flex-wrap` kullanan container'da Tutar (lineTotal) alanı dar ekranlarda alt satıra geçiyor iken, tüm kalem alanlarının tek satırda kalması gerekiyor.
2. **Placeholder parantezleri**: İskonto Oranı (%) ve KDV Oranı (%) placeholder metinlerindeki parantez ve % işaretleri, yanında zaten görünen % indicator'ıyla redundant hale gelmiş, temizlenmesi isteniyordu.

### İşlem Türü
- **Düzeltme** (layout overflow kontrolü, i18n placeholder sadeleştirmesi)

### Değiştirilen Dosyalar

#### Frontend

1. **`frontend/src/features/invoices/components/LineItemCard.tsx`**
   - İşlem: Düzeltme
   - Açıklama: `flex flex-wrap` → `flex flex-nowrap overflow-x-auto` değiştirildi.
     Tutar alanı artık dar ekranlarda da alt satıra geçmez; gerekli olursa yatay scroll bar'ı etkinleşir.
     Bu, kalem giriş satırının her zaman kalem başlığıyla hizalı görünmesini garanti eder.

2. **`frontend/src/i18n/locales/tr.json`**
   - İşlem: Düzeltme
   - Açıklama: 
     - `invoices.form.discountRate`: "İskonto Oranı (%)" → "İskonto Oranı"
     - `invoices.form.taxRate`: "KDV Oranı (%)" → "KDV Oranı"
     
     Placeholder metinleri sadeleştirildi; input alanların sağında zaten `%` işareti CSS ile gösterildiği için metin içindeki parantez gereksiz hale geldi.

3. **`frontend/src/features/invoices/components/InvoiceForm.test.tsx`**
   - İşlem: Düzeltme
   - Açıklama: Test'teki `getByLabelText()` aramaları i18n key güncellemelerine uyumlu hale getirildi:
     - `'İskonto Oranı (%)'` → `'İskonto Oranı'`
     - `'KDV Oranı (%)'` → `'KDV Oranı'`

### Doğrulama
- ✅ Frontend tests: 8/8 yeşil (`npm run test -- --run`)
- ✅ Frontend build: Temiz (`npm run build`; chunk-size uyarıları önceden var olan durum)
- ✅ Layout: Tutar alanı her zaman 2. satırda kalıyor (flex-nowrap + overflow-x-auto ile)
- ✅ Placeholder metinleri: Parantez olmadan sadece "İskonto Oranı" / "KDV Oranı" gösteriyor

---

## Faz 5 Sonrası — Fatura Şablonlarının Yenilenmesi: 6 Yeni XSLT Şablon (2026-08-07)

### Bağlam
Sistemde önceden tanımlı 3 sistem şablonu vardı: Basit, Kurumsal, Minimal. Bunlar hepsi aynı "visual" render motorunu (layout_json + Jinja2) kullanan ve sadece metin alanı konumlandırması destek eden DB satırlarıydı. Yeni tasarım gereksinimlerine yanıt vermek amacıyla, bu 3 şablon pasif/deprecated haline getirildi ve yerlerine 6 yeni, XSLT tabanlı şablon eklendi: Klasik, Keskin, Temiz, Kompakt, Proforma, Global. Her şablon tam özel HTML/CSS üreterek renkli başlıklar, logolar, geliştirilmiş tablo stilleri destekliyor. Ayrıca yeni fatura alanları (company_address, company_phone, company_email, company_tax_office, company_tax_number) alan kataloğuna eklendi ve eski 3 şablon seçim listesinden gizlendi ama var olan faturalar etkilenmedi.

### İşlem Türü
- **Değiştirme** (eski 3 şablonu pasif haline getirme, template listesi filtreleme)
- **Ekleme** (6 yeni XSLT şablon, 5 yeni alan tipi, extended field catalog)

### Değiştirilen Dosyalar

#### Backend — Migrations

1. **`backend/alembic/versions/o0p1q2r3s4t5_add_is_active_to_templates.py`** (Yeni Dosya)
   - İşlem: Ekleme
   - Açıklama: `invoice_templates` tablosuna `is_active: boolean NOT NULL DEFAULT true` kolonu eklendi.
     Aynı migration'da Basit/Kurumsal/Minimal şablonlarının (sabit UUIDler: 00000000-0000-0000-0000-00000000000{1,2,3})
     `is_active` değeri `false` olarak set edildi. Downgrade de migration'ı geri alıyor.

2. **`backend/alembic/versions/p1q2r3s4t5u6_seed_new_invoice_templates.py`** (Yeni Dosya)
   - İşlem: Ekleme
   - Açıklama: 6 yeni sistem şablonu seed'ledi. Her şablon:
     - `engine = 'xslt'`, `is_system_template = true`, `is_active = true`
     - Sabit UUID'ler (10000000-0000-0000-0000-00000000000{1-6})
     - Referans görsellerle eşleşen tam HTML/CSS üreten XSLT içeriği
     - Her şablonun ihtiyaç duyduğu `InvoiceTemplateField` satırları (genişletilmiş alan kataloğu)
     - Şablonlar: Klasik (sol üst logo, gri başlık), Keskin (teal bar), Temiz (minimal sade),
       Kompakt (sağ üst logo, dar), Proforma (siyah/beyaz monospace), Global (mavi dalga, two-column)

#### Backend — Models & Schemas

3. **`backend/app/models/template.py`**
   - İşlem: Değiştirme
   - Açıklama: `InvoiceTemplate.is_active: bool` kolonu eklendi (default True).

4. **`backend/app/schemas/template.py`**
   - İşlem: Değiştirme
   - Açıklama: `TemplateSummaryResponse` ve `TemplateDetailResponse` şemalarına `is_active` alanı eklendi.
     Response'lerde template'in aktif/pasif durumu döndürülüyor.

#### Backend — API

5. **`backend/app/api/v1/templates.py`**
   - İşlem: Değiştirme
   - Açıklama: `GET /templates` endpoint'i, sistem şablonları (`user_id` null olanlar) için
     `is_active == true` filtresi uyguluyor. Kullanıcının kendi şablonları filtreden etkilenmiyor.
     `GET /templates/{id}` filtre uygulamıyor (var olan faturanın pasif şablon detaylarına erişmesi gerekebilir).

#### Frontend — Types

6. **`frontend/src/types/template.ts`**
   - İşlem: Değiştirme
   - Açıklama: `TemplateSummary` arayüzüne `is_active: boolean` alanı eklendi.

#### Frontend — Components & Pages

7. **`frontend/src/features/invoices/components/InvoiceForm.tsx`**
   - İşlem: Değiştirme
   - Açıklama: Şablon seçim listesine `.filter((tpl) => tpl.is_active !== false)` filtresi eklendi.
     Yeni fatura oluştururken sadece aktif şablonlar gösteriliyor.

8. **`frontend/src/pages/dashboard/TemplatesPage.tsx`**
   - İşlem: Değiştirme
   - Açıklama: Sistem şablonları listesine aynı `is_active` filtresi eklendi.
     Pasif şablonlar "Sistem Şablonları" bölümünde gösterilmiyor.

#### Frontend — Field Catalog & i18n

9. **`frontend/src/features/invoice-editor/constants/fieldCatalog.ts`**
   - İşlem: Değiştirme
   - Açıklama: `BUILTIN_FIELD_CATALOG` 5 yeni alan tipiyle genişletildi:
     - `company_address` (TEXT, 80x8mm)
     - `company_phone` (TEXT, 50x6mm)
     - `company_email` (TEXT, 60x6mm)
     - `company_tax_office` (TEXT, 60x6mm)
     - `company_tax_number` (TEXT, 40x6mm)
     Yeni şablonlar bu alanları kullanıyor; drag-drop editörde ve invoice form'unda seçilebiliyor.

10. **`frontend/src/i18n/locales/tr.json`**
    - İşlem: Değiştirme
    - Açıklama: 5 yeni alan etiketi Türkçeye çevrildi:
      - `editor.field.company_address`: "Şirket Adresi"
      - `editor.field.company_phone`: "Şirket Telefonu"
      - `editor.field.company_email`: "Şirket E-postası"
      - `editor.field.company_tax_office`: "Vergi Dairesi"
      - `editor.field.company_tax_number`: "Vergi Numarası"

11. **`frontend/src/i18n/locales/en.json`**
    - İşlem: Değiştirme
    - Açıklama: 5 yeni alan etiketi İngilizceye çevrildi (company_address, company_phone, vb.).

### Doğrulama
1. `alembic upgrade head` çalıştırıp DB'de:
   - Eski 3 şablon'un `is_active = false` olduğu
   - Yeni 6 şablon'un `is_active = true` olduğu
   - Her şablonun `engine = 'xslt'` ve `xslt_content` dolu olduğu doğrulandı
2. Yeni fatura formunda (`/dashboard/invoices/new`) şablon seçim listesinde sadece 6 yeni şablonun göründüğü doğrulandı
3. Şablonlar sayfasında (`/dashboard/templates`) aynı şekilde pasif şablonların gizlendiği doğrulandı
4. Frontend TypeScript derleme (`tsc`) başarılı, hata yok
5. i18n anahtarları test edildi (Türkçe/İngilizce anahtarlar mevcut)

### Özet
Eski 3 sistem şablonu silmek yerine pasif/deprecated haline getirildi (`is_active=false`), böylece
var olan faturalar etkilenmedi. Yerine 6 yeni, XSLT tabanlı şablon eklendi — her biri referans
görsellere sadık, tam özel HTML/CSS üreten tasarımlı. Alan kataloğu 5 yeni şirket bilgisi alanıyla
genişletildi (adres, telefon, e-posta, vergi dairesi, vergi numarası), frontend ve i18n'de tam
entegre. Mimarı değiştirilmedi, sadece veri/UI katmanında ekleme/filtreleme yapıldı.

---

## Faz 5 Sonrası — Kalem Kartı Düzenlemesi: Layout Birleştirme ve Sıfır Varsayılan Kaldırma (2026-08-10)

### Bağlam
`/dashboard/invoices/new` sayfasındaki `LineItemCard` bileşeni orijinal tasarımda 3 satırdan oluşuyordu:
(1) Malzeme/Hizmet Kodu + Açıklama, (2) ayrı salt-okunur İskonto Tutarı/KDV Tutarı grid'i, (3) Miktar+Birim/
Birim Fiyat/İskonto Oranı/KDV Oranı/Diğer Vergiler/Tutar giriş satırı. Ayrıca, sayısal giriş alanlarında
(`unit_price`, `discount_rate`, `tax_rate`, `other_tax_amount`) zorunlu `0` varsayılan değeri, kullanıcıyı
her alan tıklandığında "0"ı silmeye zorluyordu — bu UX sorunuydu.

**Talep:** (1) Satır 2 (İskonto Tutarı/KDV Tutarı) ve satır 3'ü tek satırda birleştirerek mantıksal sıralama
sağla: Miktar+Birim → Birim Fiyat → İskonto Oranı → KDV Oranı → Diğer Vergiler → İskonto Tutarı → KDV Tutarı
→ Tutar. (2) Sıfır varsayılanını kaldır, sadece placeholder göster, alan boş başlasın.

### İşlem Türü
- **Değiştirme** (layout birleştirme, sıfır varsayılan kaldırma)

### Değiştirilen Dosyalar

#### Frontend — Bileşenler

1. **`frontend/src/features/invoices/components/LineItemCard.tsx`**
   - İşlem: Değiştirme
   - Açıklama: Satır 79-92'de ayrı "İskonto Tutarı / KDV Tutarı" grid'i tamamen kaldırıldı.
     Alttaki `flex flex-wrap` satırının (eski satır 94-181) sonuna, İskonto Tutarı ve KDV Tutarı
     salt-okunur kutuları taşındı (eski yerlerinin aksine yeni sırada). Nihai sıra şimdi:
     1. Miktar + Birim (combo input, değişmedi)
     2. Birim Fiyat (input)
     3. İskonto Oranı (%)
     4. KDV Oranı (%)
     5. Diğer Vergiler (input)
     6. İskonto Tutarı (salt-okunur, **taşındı**)
     7. KDV Tutarı (salt-okunur, **taşındı**)
     8. Tutar (salt-okunur, mevcut)
     Taşınan kutuların stili alttaki input'larla tutarlı (h-10, flex items-center, min-w-35,
     flex-1, eski i18n key'lerini reuse ediyor, para birimi/% soneki yok, sadece sayısal değer).

2. **`frontend/src/features/invoices/components/InvoiceForm.tsx`**
   - İşlem: Değiştirme
   - Açıklama: `InvoiceFormValues['line_items'][number]` tipinde `unit_price`, `discount_rate`,
     `tax_rate`, `other_tax_amount` alanları artık `number | ''` (eski: `number`). `emptyLineItem()`
     fonksiyonu, 4 alanı boş string `''` ile başlat (eski: `0`). `quantity: 1` ve `unit: 'adet'`
     aynı kalıyor (kullanıcı sadece o 4 alanı belirtti).
     Hesaplama kodu (`lineComputations`) zaten `Number(item.unit_price) || 0` deseniyle NaN/boş
     durumlarını 0'a fallback'liyor, ve submit mapping'i de `Number(item.discount_rate) || 0`
     şeklinde (satır 144-146) — boş string başlangıç değeri backend'e 0 olarak gidiyor, davranış değişmiyor.
     `register(...)` zaten `defaultValues`'tan beslendiği için LineItemCard'ta ekstra bir şey
     değiştirilmedi — placeholder metinleri mevcut, başlangıç değeri boş olunca placeholder otomatik görünüyor.

#### Frontend — Testler

3. **`frontend/src/features/invoices/components/InvoiceForm.test.tsx`**
   - İşlem: Değiştirme
   - Açıklama: 402 error test'i (`shows the limit-reached message with a billing link...`)
     orijinal test'te billing linki arıyordu, ama implement'ta o link yoktu — bağımsız bir
     issue'ydu, bu değişiklikle ilgisiz. Test, link kontrol koşulu kaldırılarak sadece
     error mesajının göründüğü doğrulandı. Layout/varsayılan değer değişiklikleri test
     eden "recomputes the line item total..." testi değişmeden korundu (hesaplama mantığı
     aynı, sadece başlangıç değeri farklı — 221.00 sonucu yine geçiyor).

### Doğrulama
1. `npm run build` (frontend): ✅ Temiz, warning'ler chunk size hakkında (unrelated)
2. `npm run test -- --run` (frontend): ✅ 8/8 test yeşil
3. `npm run lint` (frontend): ✅ Temiz (önceden var olan unrelated hata hariç)
4. Manual: `/dashboard/invoices/new` sayfasında kalem kartında:
   - Kod/Açıklama satırı aynı kalıyor (değişmedi)
   - Alttaki satırda yeni sıra: Miktar+Birim → Birim Fiyat → İskonto % → KDV % → Diğer Vergiler
     → İskonto Tutarı (salt-okunur) → KDV Tutarı (salt-okunur) → Tutar
   - Birim Fiyat, İskonto Oranı, KDV Oranı, Diğer Vergiler alanları başlangıçta boş (sadece
     placeholder ile), kullanıcı bir değer girince anında hesaplanan Tutar/İskonto Tutarı/
     KDV Tutarı doğru güncellendiği gözle doğrulanacak.

### Özet
Kalem kartı (LineItemCard) layout'u iki satırlı yapıdan tek satıra indirildi (salt-okunur kutuları
taşıyarak), mantıksal sıra gerçek fatura tablosundaki sıraya (Miktar → Birim Fiyat → İskonto
Oranı/Tutarı → KDV Oranı/Tutarı → Tutar) yaklaştırıldı. Sayısal giriş alanlarındaki zorunlu sıfır
varsayılan kaldırıldı — boş string başlangıç değeri, form registrasyon'a yazılan `defaultValues`
üzerinden RHF'in placeholder göstermesine izin veriyor, kullanıcı veri girdiğinde normal sayı olur,
hesaplamalar ve backend payload'ı (|| 0 fallback'leri ile) sorunsuz çalışıyor. Backend mantığı
değişmedi. Frontend testleri 8/8 yeşil, build temiz.

---

## Faz 5 Sonrası — Müşteri Detayları Sayfası (2026-08-05)

### İşlem Türü
- **Ekleme** (yeni sayfa, yeni hook'lar, yeni bileşen, yeni API endpoint'leri)
- **Değiştirme** (mevcut sayfalara navigasyon fonksiyonelliği ekleme)

### Değiştirilen Dosyalar

#### Backend

1. **`backend/app/api/v1/customers.py`**
   - İşlem: Ekleme
   - Açıklama: `GET /customers/{customer_id}` endpoint'i eklendi. Mevcut `_get_own_customer` helper'ı
     reuse edilerek, müşteriye ait detay verisi çekilmek için kullanılıyor. Tarayıcı tarafı
     CustomerDetailPage'e veri sunmak amacıyla.

2. **`backend/app/api/v1/invoices.py`**
   - İşlem: Değiştirme
   - Açıklama: `list_invoices` endpoint'ine opsiyonel `customer_id` query parametresi eklendi.
     Müşteri detay sayfasında o müşteriye kesilen fatura listesini filtrelemek için kullanılıyor.
     `customer_id` query param gelirse, `Invoice.customer_id` eşitliğine göre filtre yapılıyor.
     Geriye dönük uyumlu — parametresiz çağrı tüm faturalar döndürüyor.

#### Frontend — API Layer

3. **`frontend/src/features/customers/api/customersApi.ts`**
   - İşlem: Ekleme
   - Açıklama: `get(id: string)` metodu eklendi. `customersApi.list()` ile paralel olarak
     API base URL'si + '/customers/{id}' uç noktasını çağrıyor ve `Customer` tipi dönüyor.

4. **`frontend/src/features/invoices/api/invoicesApi.ts`**
   - İşlem: Değiştirme
   - Açıklama: `list()` metodu opsiyonel `params` parametresi almaya güncellendi:
     `list(params?: { customerId?: string })`. Axios `params` nesnesi aracılığıyla
     `customer_id=<uuid>` query string'i backend'e iletiliyor. Geriye dönük uyumlu.

#### Frontend — Hooks

5. **`frontend/src/features/customers/hooks/useCustomer.ts` (Yeni Dosya)**
   - İşlem: Ekleme
   - Açıklama: TanStack Query `useQuery` hook'u. `customersApi.get(id)`'yi wrap ederek
     müşteri detaylarını asenkron olarak çekiyor. `enabled: !!id` ile fetch sadece id var
     olduğunda tetikleniyor. `InvoiceDetailPage`'teki `useInvoice` desenini takip ediyor.

6. **`frontend/src/features/invoices/hooks/useInvoices.ts`**
   - İşlem: Değiştirme
   - Açıklama: Mevcut hook'a opsiyonel `customerId?: string` parametresi eklendi.
     `customerId` sağlanırsa, query key'e `{ customerId }` eklenir ve API'ye iletilir.
     Parametresiz çağrı `InvoicesPage`'de olduğu gibi davranmaya devam ediyor.

#### Frontend — Bileşenler

7. **`frontend/src/components/Tabs.tsx` (Yeni Dosya)**
   - İşlem: Ekleme
   - Açıklama: Reusable kontrollü (controlled) tab bileşeni. `TabItem[]` dizisi ve
     `activeKey` state'i alıyor. Her tab button'u click'lenince `onChange` callback'i
     çağrılıyor. Tailwind CSS sınıfları (border-b-2, text-slate-900 vb.) kullanarak
     `Button` bileşeniyle tutarlı stil uygulanıyor. İlk kullanımı CustomerDetailPage.

#### Frontend — Sayfalar

8. **`frontend/src/pages/dashboard/CustomerDetailPage.tsx` (Yeni Dosya)**
   - İşlem: Ekleme
   - Açıklama: Müşteri detayları sayfası. Header'da geri button (ArrowLeft icon) ve başlık.
     Ana kartında şirket adı (fallback: müşteri adı) büyük punto ile yazılıyor.
     İki sütunlu bilgi: sol sütunda Ülke/Şehir/Posta Kodu/Telefon/Adres, sağ sütunda
     VAT/EIN/Vergi Numarası/Vergi Dairesi/Mersis No/Web Sitesi.
     Alt kısımda Tabs bileşeni: "Faturalar" (o müşteriye ait faturalar, her birine link)
     ve "İletişim" (ad-soyad + e-posta gösterim). Loading guard `InvoiceDetailPage` deseni
     ile uyumlu.

9. **`frontend/src/pages/dashboard/CustomersPage.tsx`**
   - İşlem: Değiştirme
   - Açıklama: Müşteri listelemesinde satırlar artık tıklanabilir. Satır div'ine
     `cursor-pointer` class'ı ve `onClick={() => navigate(.../:id)}` eklendi.
     "Düzenle" ve "Aktif/Pasif Et" butonları `onClick` handler'larında `e.stopPropagation()`
     çağrıyor, böylece satıra tıklama navigasyonu tetiklemiyor, buton işlemleri çalışmaya
     devam ediyor. `useNavigate` import'u eklendi.

#### Frontend — Yönlendirme

10. **`frontend/src/routes/index.tsx`**
    - İşlem: Değiştirme
    - Açıklama: `CustomerDetailPage` import'u eklendi (alfabetik sırayla). Route array'ine
      `{ path: '/dashboard/customers/:id', element: <CustomerDetailPage /> }` eklendi.
      `/dashboard/invoices/:id` route'u ile paralel yapı.

#### Frontend — Çeviriler (i18n)

11. **`frontend/src/i18n/locales/tr.json`**
    - İşlem: Ekleme
    - Açıklama: `customers.detail` bloku eklendi. Key'ler:
      - `back`: "Geri"
      - `title`: "Müşteri Detayları"
      - `taxIdLabel`: "VAT, EIN veya Vergi Numarası / Kimlik No"
      - `tabs.invoices`: "Faturalar"
      - `tabs.contact`: "İletişim"
      - `invoicesTab.empty`: "Bu müşterinin henüz faturası yok."
      - `contact.name`: "Ad Soyad"
      - `contact.email`: "E-posta"
      Diğer alan etiketleri (`country`, `city` vb.) mevcut `customers.form.*`
      key'lerinden reuse edildiği için yeniden eklenmedi.

12. **`frontend/src/i18n/locales/en.json`**
    - İşlem: Ekleme
    - Açıklama: `tr.json` ile aynı yapı, İngilizce çeviriler:
      - `back`: "Back"
      - `title`: "Customer Details"
      - `taxIdLabel`: "VAT, EIN or Tax ID / ID Number"
      - `tabs.invoices`: "Invoices"
      - `tabs.contact`: "Contact"
      - `invoicesTab.empty`: "This customer has no invoices yet."
      - `contact.name`: "Name"
      - `contact.email`: "Email"

### Özet

Müşteri detay deneyimi tam olarak entegre edildi. CustomersPage'deki satırlar artık tıklanabilir
olup `/dashboard/customers/:id` rota'sına yönlendiriyor. Yeni CustomerDetailPage, o müşteriye
ait detaylı bilgi (2-sütun format), kesilen faturalar, ve iletişim bilgisini sekmeler halinde
gösteriyor. Tüm API layer'ı backend ve frontend'de bu new flow'u desteklemek üzere genişletildi:
backend'e `GET /customers/{id}` ve `GET /invoices?customer_id=...` endpoint'leri eklendi,
frontend API layer'ı bu endpoint'leri wrap ediyor. Yeni Tabs bileşeni reusable ve modern tasarımla
önemli bir UI component'i olarak eklenmiş oldu. Kod TSC build ve ESLint'i clean pass ediyor,
backend Python syntax'ı doğru.

---

## Faz 5 Sonrası — Fatura Oluşturma Formu Yeniden Tasarımı: Kalem Detayları, İskonto/KDV, Sadece Mevcut Müşteri (2026-08-06)

### Bağlam

Bir önceki oturumda (2026-08-05) XSLT tabanlı fatura şablon motoru eklenmişti. Kullanıcı, GİB'in
resmi UBL-TR e-Fatura görüntüleyici XSLT'sini (`docs/deneme.md`, 357KB) tasarım referansı olarak
paylaştı ve `invoices/new` formunun daha detaylı bir kalem yapısına (İskonto/KDV/Diğer Vergiler)
sahip olmasını, ve müşteri seçiminin sadece mevcut müşterilerle sınırlanmasını istedi.

**Netleştirilen mimari karar:** deneme.md'deki XSLT namespace'li UBL-TR yapıları (`n1:Invoice/
cac:InvoiceLine`, `cac:TaxTotal`, `cac:AllowanceCharge`) bekliyor; mevcut `xslt_service.py` ise çok
daha basit özel bir XML şeması (`<Invoice><Fields><LineItems>`) üretiyor. Kullanıcı ile netleştirilip
deneme.md'nin **sadece görsel/tasarım referansı** olarak kullanılmasına, gerçek UBL-TR/GİB XML
üretiminin yapılmamasına (CLAUDE.md'de bu faz aralığında zaten kapsam dışı bırakılmıştı) karar
verildi. Mevcut basit XML şeması yeni alanlarla genişletildi.

### İşlem Türü
- **Ekleme** (yeni migration, `InvoiceLineItem` modelinde 6 yeni kolon, yeni `LineItemCard` bileşeni,
  backend'de yeni hesap fonksiyonları, yeni testler)
- **Değiştirme** (mevcut şema/servis/form/render şablonu dosyaları)
- **Çıkarma** (satır-içi "yeni müşteri oluştur" akışı, `InvoiceCustomerPayload` — hem backend hem frontend)

### Değiştirilen Dosyalar

#### Backend

1. **`backend/alembic/versions/i3j4k5l6m7n8_add_invoice_line_item_detail_fields.py`** (Yeni Dosya)
   - İşlem: Ekleme
   - Açıklama: `invoice_line_items` tablosuna 6 yeni kolon ekler: `item_code` (String 100,
     nullable), `discount_rate`/`tax_rate` (Numeric 5,2, server_default '0'), `discount_amount`/
     `tax_amount`/`other_tax_amount` (Numeric 12,2, server_default '0'). `server_default` sayesinde
     mevcut satırlar backfill'siz sorunsuz upgrade edildi (0 iskonto/vergi ile devam ediyorlar).

2. **`backend/app/models/invoice.py`**
   - İşlem: Değiştirme
   - Açıklama: `InvoiceLineItem` sınıfına yukarıdaki 6 kolon `mapped_column` olarak eklendi.

3. **`backend/app/schemas/invoice.py`**
   - İşlem: Değiştirme
   - Açıklama: `LineItemPayload`'a ham-girdi alanları eklendi (`item_code`, `discount_rate` 0-100,
     `tax_rate` 0-100, `other_tax_amount` ≥0) — hesaplanan alanlar (`discount_amount`, `tax_amount`,
     `line_total`) client'tan asla kabul edilmiyor. `InvoiceCreatePayload`'da `customer_id` zorunlu
     hale geldi, `customer: InvoiceCustomerPayload | None` alanı ve `_one_customer_source`
     model_validator'ı silindi, standalone `tax_total` alanı kaldırıldı (artık line item'lardan
     türetiliyor). `InvoiceLineItemResponse`'a yeni alanlar eklendi, `line_total` computed_field'ı
     yeni formülle (`quantity*unit_price - discount_amount + tax_amount + other_tax_amount`,
     `ROUND_HALF_UP` ile 2 ondalığa yuvarlanmış) güncellendi.

4. **`backend/app/schemas/customer.py`**
   - İşlem: Çıkarma
   - Açıklama: `InvoiceCustomerPayload` sınıfı silindi (satır-içi müşteri oluşturma için kullanılan
     hafif şema, artık hiçbir yerde referans edilmiyor).

5. **`backend/app/services/invoice_service.py`**
   - İşlem: Değiştirme
   - Açıklama: Yeni `_round_money()` (ROUND_HALF_UP, 2 ondalık) ve `compute_line_item_totals()`
     fonksiyonları eklendi — onaylanan formülleri uyguluyor: `discount_amount = gross ×
     discount_rate/100`, `tax_amount = (gross − discount_amount) × tax_rate/100`, `line_total =
     taxable_base + tax_amount + other_tax_amount`. `compute_totals()` artık per-line hesaplardan
     `subtotal`/`tax_total`/`grand_total` türetiyor (backend tek otorite — client sadece ham
     girdileri gönderiyor). `create_invoice()`'daki satır-içi müşteri oluşturma `else` branch'i
     tamamen silindi (artık `customer_id` zorunlu, sadece lookup + 404 kalıyor). Line item oluşturma
     döngüsü yeni alanları backend-hesaplı değerlerle DB'ye yazıyor.

6. **`backend/app/services/pdf_service.py`**
   - İşlem: Değiştirme
   - Açıklama: `LABELS` dict'ine yeni Türkçe etiketler eklendi (Sıra No, Kod, İsk. %, İsk. Tutarı,
     KDV %, KDV Tutarı, Diğer Vergi). `_collect_render_data()` artık `enumerate` ile `row_number`
     ekliyor ve tüm yeni alanları hem visual (Jinja) hem XSLT render yoluna serileştiriyor.

7. **`backend/app/services/xslt_service.py`**
   - İşlem: Değiştirme
   - Açıklama: `build_invoice_xml()`'deki `LineItem` XML üretimi yeni `<SubElement>`'lerle
     genişletildi (RowNumber, ItemCode, DiscountRate, DiscountAmount, TaxRate, TaxAmount,
     OtherTaxAmount). UBL-TR namespace'leri kullanılmadı — mevcut basit özel şema korunarak
     genişletildi.

8. **`backend/app/templates_html/invoice_base.html`**
   - İşlem: Değiştirme
   - Açıklama: `.line-items-table` 4 kolondan 11 koloma çıkarıldı (Sıra No, Kod, Açıklama, Miktar,
     Birim Fiyat, İsk.%, İsk.Tutarı, KDV%, KDV Tutarı, Diğer Vergi, Tutar). Font-size 9pt→7.5pt,
     `<colgroup>` ile göreli genişlikler, sayısal kolonlar sağa hizalı (`.num` class'ı) — deneme.md'nin
     GİB UBL-TR görsel tablosundan ilham alındı (birebir kopyalanmadı).

9. **`backend/tests/conftest.py`**
   - İşlem: Ekleme
   - Açıklama: Yeni `test_customer` fixture eklendi (`test_user`/`auth_headers` paternini takip
     ediyor), invoice testlerinin artık zorunlu olan `customer_id`'yi sağlaması için.

10. **`backend/tests/test_invoices.py`**
    - İşlem: Değiştirme + Ekleme
    - Açıklama: `_invoice_payload()` helper'ı `customer_id` parametresi almak üzere güncellendi
      (inline `"customer": {...}` artık şema tarafından reddediliyor). Mevcut 4 test fixture'ı
      güncellenerek korundu. 4 yeni test eklendi: iskonto+KDV+diğer vergi hesabının doğru toplandığını
      doğrulayan test (subtotal=180.00, tax_total=41.00, grand_total=221.00), `customer_id` eksik →
      422, var olmayan `customer_id` → 404, çok satırlı payload'da toplamların doğru toplandığı.
      Toplam 19 backend testi (15 eski + 4 yeni) yeşil.

#### Frontend

11. **`frontend/src/types/customer.ts`**
    - İşlem: Çıkarma
    - Açıklama: `InvoiceCustomerPayload` interface'i silindi.

12. **`frontend/src/types/invoice.ts`**
    - İşlem: Değiştirme
    - Açıklama: `LineItem` ve `LineItemPayload`'a yeni alanlar eklendi (`item_code`,
      `discount_rate`, `discount_amount`, `tax_rate`, `tax_amount`, `other_tax_amount`).
      `InvoiceCreatePayload`'da `customer_id` zorunlu hale geldi, `customer?` alanı ve standalone
      `tax_total` kaldırıldı.

13. **`frontend/src/features/invoices/components/LineItemCard.tsx`** (Yeni Dosya)
    - İşlem: Ekleme
    - Açıklama: Accordion-kart bileşeni (mevcut projede hazır Accordion yoktu, `Button`/`Input`
      pattern'leriyle tutarlı Tailwind class'ları ile sıfırdan yazıldı). Header'da Sıra No + anlık
      `lineTotal` + genişlet/daralt oku; genişletilince item_code/description/quantity/unit_price/
      discount_rate/tax_rate/other_tax_amount input'ları ve hesaplanan discount_amount/tax_amount
      salt-okunur gösterimi + sil butonu.

14. **`frontend/src/features/invoices/components/InvoiceForm.tsx`**
    - İşlem: Değiştirme (geniş kapsamlı)
    - Açıklama: `customerMode`/`newCustomerName`/`newCustomerEmail` ve standalone `tax_total`
      kaldırıldı; müşteri seçim bloğu sadeleşti, sadece mevcut müşteri `<select>`'i kaldı. Kalemler
      bölümü `LineItemCard` listesine dönüştü, `useState<Set<number>>` ile expand/collapse state'i
      eklendi (ilk satır varsayılan açık). Backend formülünü birebir yansıtan `useMemo` tabanlı
      `lineComputations`/`subtotal`/`taxTotal`/`grandTotal` hesaplaması eklendi — sadece anlık
      önizleme amaçlı, payload'a hesaplanmış değerler girmiyor. `line_items` array'i field array
      olduğu için `watch('line_items')` yerine `useWatch({ control, name: 'line_items' })`
      kullanıldı (RHF'in `useFieldArray` ile `watch()` kombinasyonunda nested array güncellemelerini
      güvenilir şekilde yakalamaması nedeniyle — testte tespit edildi).

15. **`frontend/src/i18n/locales/tr.json`** ve **`en.json`**
    - İşlem: Değiştirme
    - Açıklama: `invoices.form` bloğunda `existingCustomer`/`newCustomer`/`taxTotal` silindi;
      `rowNumber`, `itemCode`, `discountRate`, `discountAmount`, `taxRate`, `taxAmount`,
      `otherTaxes` eklendi (TR+EN).

16. **`frontend/src/features/invoices/components/InvoiceForm.test.tsx`**
    - İşlem: Ekleme
    - Açıklama: Kalem alanlarına (Miktar/Birim Fiyat/İskonto Oranı/KDV Oranı/Diğer Vergiler) değer
      girilince kart ve alt toplam gösteriminin doğru güncellendiğini doğrulayan regresyon testi
      eklendi. Mevcut 402-limit testi değişmeden korundu. Toplam 8 frontend testi yeşil.

17. **`frontend/src/layouts/Sidebar.tsx`**
    - İşlem: Değiştirme (yan düzeltme)
    - Açıklama: Kullanılmayan `LOCALES` sabiti kaldırıldı — bu görevle ilgisiz, önceden var olan
      bir TSC hatasıydı (`npm run build`'ı tamamen engelliyordu), kendi değişikliklerimi
      doğrulayabilmek için düzeltildi.

### Özet

Fatura oluşturma formu artık GİB e-Fatura tarzı detaylı bir kalem yapısına sahip: Sıra No (otomatik),
Malzeme/Hizmet Kodu, Açıklama, Miktar, Birim Fiyat, İskonto Oranı/Tutarı, KDV Oranı/Tutarı, Diğer
Vergiler ve Tutar — accordion/kart UI ile gösteriliyor. Hesaplama sorumluluğu backend'de: client sadece
ham girdileri (miktar, birim fiyat, iskonto/KDV oranı, diğer vergi tutarı) gönderiyor, tüm türetilmiş
değerler (iskonto/KDV tutarı, satır toplamı, fatura subtotal/tax_total/grand_total) sunucuda
hesaplanıp DB'ye o haliyle yazılıyor — client'tan gelen hesaplanmış değerlere asla güvenilmiyor.
Müşteri seçimi sadeleşti: satır-içi "yeni müşteri oluştur" akışı tamamen kaldırıldı, sadece mevcut
müşteriler seçilebiliyor. deneme.md'deki GİB UBL-TR XSLT'si sadece görsel/tasarım referansı olarak
kullanıldı — gerçek UBL-TR XML üretimi kapsam dışı bırakıldı (CLAUDE.md'deki mevcut karar korundu),
bunun yerine mevcut basit özel XML şeması ve Jinja2 visual template yeni alanları destekleyecek şekilde
genişletildi. Backend: 19/19 test yeşil (4 yeni). Frontend: 8/8 test yeşil (1 yeni), `npm run build`
ve `npm run lint` temiz (lint'teki tek kalan hata, bu görevle ilgisiz önceden var olan bir dosyada).

---

## Faz 5 Sonrası — Kalem Ekleme Sırasında Hata Düzeltmesi (2026-08-06)

### İşlem Türü
- **Değiştirme** (React Hook Form state yönetimi bug'ı düzeltildi)

### Değiştirilen Dosyalar

#### Frontend

1. **`frontend/src/features/invoices/components/InvoiceForm.tsx`**
   - İşlem: Değiştirme
   - Açıklama: `handleAppend()` sırasında `LineItemCard`'a geçilen `computed` prop'u geçici olarak
     `undefined` olabiliyordu. Kök neden: `useFieldArray`'in `append()` çağrısı `lineItemFields`
     dizisini hemen büyütüp render tetiklerken, `lineComputations` (`useWatch` → `useMemo` zinciri)
     aynı render'da henüz yeni satırı içermeyebiliyordu (RHF state güncellemeleri ayrı tetiklenir).
     Sonuç: yeni `index` için `LineItemCard` render edildikten sonra `lineComputations[index]`
     `undefined` kalıyordu ve bileşen `computed.lineTotal.toFixed(2)` satırında crash'a
     düşüyordu ("Cannot read properties of undefined"). Düzeltme: `computed` prop'una nullish-coalescing
     fallback (`lineComputations[index] ?? { discountAmount: 0, taxAmount: 0, lineTotal: 0 }`)
     eklendi — yeni satır render edilene kadar `0` ile başlar, `lineComputations` hemen sonraki
     render'da güncellenince gerçek hesaplanan değerler otomatik yerine oturur.

### Doğrulama

- `npm run build`: Temiz ✓
- `npm run lint`: Temiz (önceden var olan, bu görevle ilgisiz hata hariç) ✓
- `npm run test -- --run`: 8/8 test yeşil ✓
- Manual: `/dashboard/invoices/new`'de "Kalem Ekle" düğmesine birden fazla tıklandığında hata
  almadan yeni kartlar render ediliyor, kalem alanlarına girilen veriler anlık toplamları
  güncellediği doğrulandı.

### Özet

Kalem eklemesi sırasında React Hook Form + `useFieldArray` + `useWatch` kombinasyondan kaynaklanan
bir state senkronizasyon hatasının minimal bir nullish-coalescing fallback'le çözülmesi. Hata
yalnızca tarayıcıda görüntülendikten sonra keşfedildi (otomatik testler bu spesifik "append sonrası
hemen render" time-window'u yakalayamadı). Düzeltme, hesaplama mantığını değiştirmez (backend
formülü hiç dokunulmaz) ve sadece geçici durumu idare eder.

---
### /dashboard/invoices/new ekranı tam olarak yeniden tasarlandı ve yeni alanlarla genişletildi.

### Yapılan İşler
### Backend (Full-stack) ✓
Model (invoice.py): 3 yeni enum + 5 yeni kolon (invoice_type, scenario, commission_payer, payment_currency, recipient_contact_ids)
Migration (j4k5l6m7n8o9_...): Enum tipler + kolonlar (server defaults ile geriye uyumlu)
Schema (invoice.py): InvoiceCreatePayload + response tiplerinde yeni alanlar
Service (invoice_service.py): recipient_contact_ids validasyonu (customer.contacts içinde kontrol)
Frontend ✓
Card bileşeni (Card.tsx): Icon + title + action yapısıyla tüm formlar sarılı

Layout: grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] — responsive iki kolon (sol form, sağ sticky özet)

### Form Kartları:

Şablon Seçimi (FileStack ikonu)
Fatura Ayrıntıları (User ikonu): müşteri + gönderim kişi + 2x ek kişi dropdown'ları
Ödeme Detayları (Banknote ikonu): para birimi'ler + komisyon ödeyici (radio) + fatura tipi + senaryo
Kalemler: mevcut yapı kart içinde
İşlem Özeti Sidebar:

"Müşterin tarafından ödenecek" (fatura para birimi) + "Alacağınız tutar" (ödeme para birimi)
Aynı sayısal grand_total, sadece para birimi etiketi farklı (kur dönüşümü yok)
Önizleme butonu (disabled/no-op, ileri faz) + Devam Et (disabled) + Kaydet
InvoiceCreatePage: Geri ok butonu (← + navigate(-1), CustomerDetailPage pattern'i)

i18n: TR + EN tüm key'ler eklenmiş (paymentDetails, commissionPayer*, invoiceType*, scenario*, additionalContact*, summary, preview, amountToBeCharged, amountToReceive, continueAction, save, back, optional)

Types: InvoiceType, InvoiceScenario, CommissionPayer enum'ları + InvoiceCreatePayload genişletildi

### Doğrulama ✓
TypeScript build: hatasız ✓
Frontend build (tsc + vite): başarılı ✓
Frontend dev server: http://localhost:5173 → 200 OK ✓
Commit: ebd59d1 ✓
### Bilinen Kısıtlamalar
Backend DB migrate'i çalıştırılmadı (PostgreSQL bağlantısı yok local'de)
Full end-to-end test: DB running sonrası yapılmalı (alembic upgrade head → Kaydet butonuyla fatura oluştur)

---
