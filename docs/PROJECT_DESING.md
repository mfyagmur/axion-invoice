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

