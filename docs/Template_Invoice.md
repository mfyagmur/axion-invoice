# Fatura Şablonu → Fatura Önizleme → PDF Render Sistemi

## AMAÇ

Projede daha önce geliştirilmiş olan **A4 Fatura Şablon Editörü(Invoice-editor)(dashboard/templates/template id/edit)** ile oluşturulan şablonların, kesilmiş/oluşturulmuş faturaların(dashboard/invoices/fatura id) **önizleme ekranları ve PDF çıktıları birebir kullanılmasını** istiyorum.

Şablon editöründe tanımlanan alanlar ile fatura ekranındaki gerçek fatura alanları zaten aynı mantıkta hazırlanmıştır.

Örneğin:

* Şablondaki `Fatura No` alanı → Faturadaki `Fatura No`
* Şablondaki `Fatura Tarihi` → Faturadaki `Fatura Tarihi`
* Şablondaki `VKN/TCKN` → Faturadaki `VKN/TCKN`
* Şablondaki `Firma Ünvanı` → Faturadaki müşteri/firma ünvanı
* Şablondaki `Banka Bilgileri 1` → Fatura şirketinin `Banka Bilgileri 1`
* Şablondaki `Banka Bilgileri 2` → Fatura şirketinin `Banka Bilgileri 2`
* Şablondaki `IBAN` → İlgili IBAN
* Şablondaki `Ürün/Hizmet Tablosu` → Faturanın kalemleri
* Şablondaki `Toplam` → Faturanın hesaplanan toplamı
* Şablondaki `KDV` → Faturanın KDV bilgisi

Bu sistemin amacı, **seçilen fatura şablonunu gerçek fatura verileriyle doldurup aynı görsel yerleşimi koruyarak ekranda göstermek ve PDF olarak üretmektir.**

---

# 1. ÖNCE MEVCUT PROJEYİ ANALİZ ET

Kod yazmaya başlamadan önce mevcut projeyi analiz et.

Özellikle aşağıdaki yapıları bul:

* Fatura Şablon Editörü
* Template/Template Editor componentleri
* Fatura oluşturma ekranı
* Fatura detay ekranı
* Fatura verisi/modeli
* Fatura alanları
* Şablon kayıt yapısı
* Şablon JSON yapısı
* Seçili şablon bilgisinin tutulduğu alan
* Firma bilgileri
* Banka bilgileri
* Fatura kalemleri
* Vergi/KDV hesaplamaları
* Tüm Bilgiler
* Para birimi
* Toplamlar
* PDF ile ilgili mevcut yapı varsa onu
* Preview ile ilgili mevcut yapı varsa onu

Öncelikle mevcut mimariyi anlamadan yeni bir sistem oluşturma.

**Mevcut component, type, interface, hook, service ve utility yapılarını mümkün olduğunca yeniden kullan.**

Yeni bir template editor oluşturma.

---

# 2. TEMEL MİMARİ

Sistem aşağıdaki veri akışına sahip olmalı:

```text
Fatura
   ↓
Seçili Template
   ↓
Template JSON / Template Definition
   ↓
Template Field Mapping
   ↓
Invoice Data
   ↓
Resolved Template Data
   ↓
Invoice Renderer
   ↓
┌───────────────────────┐
│ Fatura Önizleme       │
│                       │
│ A4 görünümü           │
│ Template yerleşimi    │
│ Gerçek fatura verisi  │
└───────────────────────┘
   ↓
PDF Renderer
   ↓
PDF
```

En önemli prensip:

**Önizleme ile PDF aynı render mantığını kullanmalıdır.**

Önizlemede görünen fatura ile PDF çıktısındaki fatura mümkün olduğunca piksel seviyesinde aynı olmalıdır.

---

# 3. TEMPLATE VE INVOICE DATA AYRIMI

Şablon sadece tasarımı/yerleşimi belirlemeli.

Fatura ise gerçek veriyi sağlamalı.

Mevcut projede bu alanların karşılığı varsa **mevcut isimlendirmeyi bozma**, mevcut yapıya adapte ol.

---

# 5. FIELD TYPES

Mevcut template editor hangi field tiplerini destekliyorsa onları tespit et ve renderer tarafında destekle.

Örneğin:

```text
text
number
date
currency
image
logo
table
label
signature
bank
address
customer
company
totals
```

gibi tipler varsa bunların render karşılıklarını oluştur.

Özellikle:

### Text

```text
Fatura No: INV202600125
```

### Date

```text
21.08.2026
```

### Currency

```text
125.000,00 TL
```

### Image / Logo

Firma logosunu göstermeli.

### Table

Fatura kalemlerini template'teki tablo alanına yerleştirmeli.

### Totals

```text
Ara Toplam
İskonto
KDV
Genel Toplam
```

alanlarını göstermeli. Yazdıklarım örnek olarak sen sistemi kontrol ederek bak

---

# 6. A4 KOORDİNAT SİSTEMİ

Template editor'da kullanılan koordinat sistemini tespit et.

Preview ve PDF tarafında aynı koordinat sistemini kullan.

Örneğin template editor:

```text
x
y
width
height
```

kullanıyorsa renderer da aynı mantığı kullanmalı.

A4 için sabit bir render alanı oluştur.

A4 oranı:

```text
210mm × 297mm
```

olmalı.

Ancak browser üzerinde görüntülerken uygun bir CSS ölçekleme kullanılabilir.

Önemli olan:

**CSS preview koordinatları ile PDF koordinatlarının aynı fiziksel konumu temsil etmesi.**

---

# 7. TEMPLATE RENDERER

Yeni bir merkezi component oluştur.

Örneğin mevcut mimariye uygun olarak:

```text
InvoiceTemplateRenderer
```

veya mevcut isimlendirme standardına uygun bir isim kullan.

Bu component:

```ts
template
invoice
```

verilerini almalı.

Örneğin:

```tsx
<InvoiceTemplateRenderer
  template={selectedTemplate}
  invoice={invoice}
/>
```

mantığında çalışmalı.

Renderer:

1. Template'i okumalı
2. Template elemanlarını dolaşmalı
3. Her field için resolver çalıştırmalı
4. Gerçek değeri bulmalı
5. x/y/width/height bilgisine göre yerleştirmeli
6. Stil özelliklerini uygulamalı
7. Tablo ve dinamik alanları render etmeli

---

# 8. ÖNİZLEME EKRANI

Fatura detay/oluşturma ekranında:

```text
Önizleme
```

butonu veya mevcut preview mekanizması varsa onu kullan.

Önizleme açıldığında:

```text
Seçili Fatura Şablonu
        +
Gerçek Fatura Verisi
        ↓
InvoiceTemplateRenderer
```

çalışmalı.

Örneğin kullanıcı:

```text
Şablon: Modern Kurumsal
```

seçtiyse preview kesinlikle bu template'i kullanmalı.

Başka sabit bir fatura HTML'i kullanılmamalı.

---

# 9. TEMPLATE DEĞİŞTİRME

Kullanıcı farklı template seçtiğinde fatura verileri değişmemeli.

Sadece görünüm değişmeli.

Örneğin:

```text
Fatura:
INV202600125
```

aynı kalmalı.

Template:

```text
Modern
```

ise Modern görünmeli.

Template:

```text
Classic
```

ise Classic görünmeli.

Template:

```text
Minimal
```

ise Minimal görünmeli.

Yani:

```text
Invoice Data
      ↓
Renderer
      ↑
Selected Template
```

şeklinde çalışmalı.

---

# 10. BANKA BİLGİLERİ

Banka bilgileri özellikle dinamik olmalı.

Örneğin template editor'da:

```text
Banka Bilgileri 1
Banka Bilgileri 2
Banka Bilgileri 3
```

alanı varsa bu alan gerçek faturadaki:

```text
company.bankAccounts[0]
```

veya mevcut veri modelindeki karşılığı ile doldurulmalı.

Benzer şekilde:

```text
Banka Bilgileri 2
```

ikinci banka hesabını göstermeli.

IBAN, banka adı, şube, hesap no, SWIFT vb. alanlar mevcut modelde nasıl tutuluyorsa ona göre mapping yapılmalı.

**Sabit banka bilgisi yazma.**
**Not: Yukarıda belirtile alan veya tanımlama örnektir. Sen Proje içerisindekileri kullanacaksın**
---

# 11. DİNAMİK FATURA KALEMLERİ

Fatura kalemleri template'teki tablo alanına dinamik olarak yerleştirilmeli.

Örneğin:

```text
Ürün
Açıklama
Miktar
Birim
Birim Fiyat
KDV
Toplam
```

alanları template'teki tablo kolonlarıyla eşleştirilmeli.

Fatura 3 kalem içeriyorsa 3 satır.

Fatura 20 kalem içeriyorsa 20 satır.

Fatura 100 kalem içeriyorsa gerekli şekilde sayfalara bölünmeli.

---

# 12. ÇOK SAYFALI FATURA

Fatura A4 sayfasını aşarsa otomatik olarak yeni sayfa oluşturulmalı.

Örneğin:

```text
A4 Page 1
────────────
Header
Customer
Items 1-15
Footer

A4 Page 2
────────────
Header
Items 16-30
Totals
Footer
```

Template'te header/footer alanları destekleniyorsa her sayfada doğru şekilde kullanılmalı.

Özellikle tablo satırları sayfa sonunda kesilmemeli.

---

# 13. PDF ÜRETİMİ

PDF üretimi için projede mevcut bir kütüphane/yöntem varsa önce onu analiz et ve mümkünse onu kullan.

Yeni bir PDF kütüphanesi eklemeden önce mevcut sistemi kontrol et.

PDF çıktısında:

* A4
* portrait/landscape
* template koordinatları
* font
* font size
* logo
* border
* renk
* tablo
* banka bilgileri
* toplamlar
* sayfa numarası

gibi template özellikleri korunmalı.

PDF'deki alanların konumu template editor'daki alanlarla aynı olmalı.

Örneğin Template Editor'da:

```text
Fatura No
X: 145
Y: 42
```

ise PDF'de de aynı fiziksel konumda bulunmalı.
**Not: Yukarıda belirtile alan veya tanımlama örnektir. Sen Proje içerisindekileri kullanacaksın**

---

# 14. PREVIEW VE PDF AYNI KAYNAKTAN ÜRETİLMELİ

Çok önemli.

Şu yapıdan kaçın:

```text
Preview → ayrı HTML
PDF → ayrı HTML
```

Bunun yerine:

```text
Template
   ↓
InvoiceTemplateRenderer
   ↓
Preview
   +
PDF
```

mantığını kullan.

Eğer PDF teknolojisi browser DOM'u doğrudan kullanamıyorsa bile ortak bir:

```ts
ResolvedInvoiceTemplate
```

veya:

```ts
TemplateRenderModel
```

oluştur.

Hem Preview hem PDF aynı veri/model üzerinden çalışsın.

---

# 15. FONT VE ÖLÇÜ BİRLİĞİ

PDF ile browser arasındaki ölçü farklarına dikkat et.

Template editor'daki ölçü birimi neyse onu tespit et.

Gerekirse:

```text
px
mm
pt
```

arasında merkezi conversion utility oluştur.

Örneğin:

```ts
pxToMm()
mmToPx()
ptToPx()
```

gibi yardımcı fonksiyonlar kullanılabilir.

Ancak template editor hangi birimi kullanıyorsa mümkün olduğunca onu koru.

---

# 16. BOŞ ALANLAR

Faturada bir alan boşsa:

```text
bank.account2
```

yoksa renderer hata vermemeli.

Bunun yerine:

```text
""
```

döndürmeli veya template'in mevcut davranışına göre alanı gizlemeli.

Örneğin:

```text
Banka Bilgileri 2:
```

değeri yoksa boş alan bırakmak yerine gerekiyorsa tamamen gizlenebilmeli.

Bu davranışı template field configuration üzerinden kontrol edilebilir hale getir.

---

# 17. TEMPLATE VERSIONING

Mevcut sistem destekliyorsa template versiyonlamasını koru.

Bir fatura oluşturulduğunda kullanılan template sonradan değiştirilirse geçmiş faturanın PDF'i bozulmamalı.

Bu nedenle mümkünse:

```text
Invoice
    ↓
Template ID
    ↓
Template Version
```

ilişkisini koru.

Özellikle kesilmiş faturalar için kullanılan template'in geçmişteki görünümü korunmalı.

---

# 18. RESPONSIVE DAVRANIŞ

Fatura A4 olduğu için browser'da responsive şekilde ölçeklenebilir.

Örneğin:

```text
Desktop
A4 = 794 × 1123 px
```

gibi bir preview kullanılabilir.

Ekran küçüldüğünde A4 sayfa küçültülerek gösterilebilir.

Ancak template içindeki koordinatlar değişmemeli.

Yani:

```text
scale
```

sadece görüntüleme seviyesinde uygulanmalı.

Template koordinatları değişmemeli.

---

# 19. VERİ EŞLEŞTİRME KATMANI

Mümkünse merkezi bir mapping sistemi oluştur.

Örneğin:

```ts
const invoiceTemplateData = {
  invoice: {
    number: invoice.number,
    date: invoice.date,
    dueDate: invoice.dueDate,
  },

  seller: {
    name: company.name,
    taxNumber: company.taxNumber,
    taxOffice: company.taxOffice,
    address: company.address,
  },

  customer: {
    name: customer.name,
    taxNumber: customer.taxNumber,
    taxOffice: customer.taxOffice,
    address: customer.address,
  },

  bank: {
    account1: ...,
    account2: ...,
    iban1: ...,
    iban2: ...,
  },

  items: invoice.items,

  totals: {
    subtotal: ...,
    discount: ...,
    tax: ...,
    grandTotal: ...,
  }
};
```

Ancak mevcut proje veri modelini incelemeden bu isimleri zorla uygulama.

**Mevcut modelleri mümkün olduğunca koru.**
**Not: Yukarıda belirtile alan veya tanımlama örnektir. Sen Proje içerisindekileri kullanacaksın**

---

# 20. TEST SENARYOLARI

Implementasyon bittikten sonra aşağıdaki senaryoları test et.

### Test 1

1 adet fatura oluştur.

Template:

```text
Modern
```

Kontrol:

* Fatura No doğru mu?
* Tarih doğru mu?
* Müşteri doğru mu?
* Logo doğru mu?
* Banka bilgileri doğru mu?
* Toplam doğru mu?
* Tüm alanlar doğrumu ?

### Test 2

Aynı faturayı:

```text
Modern
Classic
Minimal
```

template'leriyle aç.

Veriler aynı kalmalı.

Sadece tasarım değişmeli.

### Test 3

20+ fatura kalemi olan fatura oluştur.

Kontrol:

* Sayfa taşması
* Tablo devamlılığı
* Toplamların doğru sayfada bulunması
* Header/Footer

### Test 4

Banka bilgisi olmayan firma ile test et.

Renderer hata vermemeli.

### Test 5

Uzun firma adı ve adres ile test et.

Text overflow kontrol edilmeli.

### Test 6

Uzun ürün açıklaması ile test et.

Tablo satırı bozulmamalı.

### Test 7

Türkçe karakterler:

```text
Ç Ğ İ Ö Ş Ü
ç ğ ı ö ş ü
```

doğru render edilmeli.

### Test 8

PDF ile Preview karşılaştır.

Alanların:

```text
X
Y
Width
Height
```

konumları mümkün olduğunca aynı olmalı.

---

# 21. KOD KALİTESİ

Şunları yapma:

* Mevcut template editor'ü yeniden yazma
* Fatura verilerini componentlere hard-code etme
* Banka bilgilerini hard-code etme
* Preview için ayrı bir fatura tasarımı oluşturma
* PDF için tamamen farklı bir layout oluşturma
* Aynı mapping'i 10 farklı componentte tekrar etme
* Mevcut API/model yapısını gereksiz yere değiştirme
* Gereksiz dependency yükleme

Şunları yap:

* Mevcut yapıyı analiz et
* Merkezi field resolver oluştur
* Merkezi template renderer oluştur
* Preview ve PDF için ortak render model kullan
* TypeScript type safety koru
* Mevcut Tailwind/component sistemini kullan
* Mevcut naming convention'a uy
* Küçük ve tekrar kullanılabilir componentler oluştur

---

# 22. BEKLENEN SON MİMARİ

Hedef mimari yaklaşık olarak:

```text
Invoice
   │
   ├── Invoice Data
   │
   └── Selected Template
             │
             ▼
      Template Resolver
             │
             ▼
      Resolved Template
             │
             ▼
    InvoiceTemplateRenderer
             │
       ┌─────┴─────┐
       ▼           ▼
    Preview       PDF
```

Kod organizasyonunda mevcut proje yapısına uyum sağla.

Ancak mümkünse mantıksal olarak şu ayrımların oluşmasını hedefle:

```text
template/
    resolver/
    renderer/
    fields/
    types/
    utils/
```

Mevcut klasör yapısına aykırıysa yeni klasörleri zorla oluşturma; projenin mevcut mimarisine adapte et.

---

# 23. IMPLEMENTATION STRATEJİSİ

Tek seferde büyük bir refactor yapma.

Şu sırayla ilerle:

### Faz 1

Mevcut Template Editor ve Template JSON yapısını analiz et.

### Faz 2

Mevcut Invoice modelini analiz et.

### Faz 3

Template field → Invoice data mapping sistemini oluştur.

### Faz 4

`InvoiceTemplateRenderer` oluştur.

### Faz 5

Gerçek fatura verisiyle Preview oluştur.

### Faz 6

A4 ölçekleme ve koordinat sistemini düzelt.

### Faz 7

PDF renderer oluştur veya mevcut PDF sistemini template renderer'a bağla.

### Faz 8

Çok sayfalı faturayı destekle.

### Faz 9

Preview/PDF karşılaştırma ve pixel-level alignment kontrollerini yap.

### Faz 10

Edge case ve regression testleri yap.

---

# 24. ÖNEMLİ KURAL

Benim istediğim sistem **"faturanın görüntüsünü template'e benzetmek" değildir.**

İstediğim:

```text
Template Editor'da oluşturulan tasarım
          ↓
Gerçek Invoice Data
          ↓
Template Field Mapping
          ↓
Aynı Template
          ↓
Gerçek Fatura
```

olmasıdır.

Yani Template Editor'da kullanıcı:

```text
[Fatura No]
```

alanını sayfanın sağ üstüne koyduysa, kesilmiş faturada gerçek:

```text
INV-2026-00125
```

değeri tam olarak o alanda görünmelidir.

Aynı şekilde:

```text
[Banka Bilgileri 1]
```

alanı template'te nereye konulduysa gerçek banka bilgisi de tam olarak oraya gelmelidir.

---

# 25. ÇALIŞMAYA BAŞLAMADAN ÖNCE

Önce kod tabanını analiz et.

Bana şu bilgileri raporla:

1. Mevcut Template Editor hangi dosyalarda?
2. Template JSON/model yapısı nedir?
3. Fatura modeli hangi dosyalarda?
4. Fatura alanları nerede tanımlanıyor?
5. Seçili template nasıl belirleniyor?
6. Mevcut Preview var mı?
7. Mevcut PDF sistemi var mı?
8. Hangi PDF teknolojisi kullanılıyor?
9. Template koordinat sistemi nasıl çalışıyor?
10. Banka bilgilerinin veri modeli nedir?
11. Fatura kalemleri nasıl tutuluyor?
12. Çok sayfalı fatura için mevcut bir yapı var mı?

**Bu analizi yaptıktan sonra implementasyona geç.**

Mevcut çalışan özellikleri bozma. Projeyi ve yapılan sistemi bozmadan sadece istenilen şekilde yap

Her fazı tamamladıktan sonra ilgili kodu test et ve sonraki faza geç.
