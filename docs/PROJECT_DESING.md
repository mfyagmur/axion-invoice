# Axion Invoice — Proje Tasarım Değişiklikleri

Bu dosya, MVP'nin 1-5. fazlarından sonra gerçekleştirilen özellik eklemeleri ve tasarım güncellemelerini kaydeder.

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

