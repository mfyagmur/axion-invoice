# Axion Invoice — A4 Fatura Şablon Tasarımcısı

Sen kıdemli bir **React / TypeScript / UI/UX / SaaS Architecture / Document Editor** uzmanısın.

Mevcut projem **Axion Invoice** isimli profesyonel bir SaaS faturalama uygulamasıdır.

Görevin, mevcut projeyi dikkatlice analiz ederek **faturanın her detayının kullanıcı tarafından görsel olarak tasarlanabildiği, profesyonel bir A4 Invoice Template Designer** geliştirmektir.

Bu özellik basit bir HTML editörü veya form oluşturucu olmayacaktır.

Amaç; kullanıcıya Canva/Figma benzeri bir deneyim sunan ancak özellikle **A4 fatura tasarımı** için optimize edilmiş profesyonel bir Template Designer oluşturmaktır.

---

# 1. ÖNCE PROJEYİ ANALİZ ET

Kod yazmaya başlamadan önce:

Projenin mevcut klasör yapısını incele.
React sürümünü kontrol et.
Vite yapılandırmasını kontrol et.
TypeScript yapılandırmasını kontrol et.
Tailwind CSS sürümünü kontrol et.
Mevcut component mimarisini incele.
Mevcut routing yapısını incele.
State management yapısını incele.
Mevcut invoice/fatura modellerini incele.
Mevcut API servislerini incele.
Mevcut authentication / tenant yapısını incele.
Mevcut tasarım sistemini ve renklerini incele.
Mevcut UI componentlerini mümkün olduğunca yeniden kullan.
Aynı işi yapan mevcut component varsa yenisini oluşturma.
Mevcut çalışan özellikleri ve yapıyı asla bozma bozma.

Unutma sadece dashboard/templates/new (Yeni Şablon Ekle sayfası) sayfasını yeniden yapacağız
Kod yazmadan önce mevcut mimari ile geliştireceğin mimari arasındaki uyumu değerlendir.

Mevcut projede kullanılan teknoloji ve mimariye gereksiz şekilde yeni framework ekleme.

---

# 2. ANA HEDEF

Aşağıdaki yapıya sahip bir:

**Axion Invoice Template Designer**

oluştur.

Kullanıcı A4 sayfasını gerçek bir belge gibi görmeli.

Editör:

```text
┌────────────────────────────────────────────────────────────────────┐
│ Axion Invoice Template Designer                    [Önizle] [Kaydet]│
├───────────────┬────────────────────────────────────┬────────────────┤
│               │                                    │                │
│  ELEMANLAR    │                                    │  ÖZELLİKLER    │
│               │                                    │                │
│  + Metin      │                                    │  Seçili Eleman │
│  + Başlık     │            A4 SAYFASI              │                │
│  + Logo       │                                    │  Konum         │
│  + Çizgi      │          ┌───────────────┐         │  X             │
│  + Tablo      │          │               │         │  Y             │
│  + QR Code    │          │     LOGO      │         │                │
│  + İmza       │          │               │         │  Boyut         │
│               │          │    FATURA     │         │  Width         │
│ DİNAMİK       │          │               │         │  Height        │
│ ALANLAR       │          │               │         │                │
│               │          │   TABLO       │         │  Stil          │
│ Müşteri       │          │               │         │  Font          │
│ Fatura No     │          │               │         │  Renk          │
│ Tarih         │          │               │         │  Hizalama      │
│ KDV           │          │               │         │                │
│ Toplam        │          └───────────────┘         │                │
│               │                                    │                │
└───────────────┴────────────────────────────────────┴────────────────┘
```

---

# 3. A4 SAYFA

Sayfa gerçek A4 ölçüsünde çalışmalıdır.

Portrait:

```text
210mm × 297mm
```

Landscape:

```text
297mm × 210mm
```

Template içerisinde ölçüleri mümkün olduğunca **mm tabanlı** tut.

Browser üzerinde yalnızca render için px dönüşümü yap.

Örneğin:

```text
x: 20mm
y: 30mm
width: 80mm
height: 10mm
```

gibi değerler template modelinde saklanmalıdır.

Pixel değerlerini ana template verisi olarak saklama.

---

# 4. ZOOM

Editörde:

```text
50%
75%
100%
125%
150%
```

gibi zoom seçenekleri bulunmalı.

Zoom değiştirilirken template'in gerçek ölçüleri değişmemelidir.

---

# 5. ELEMENT SİSTEMİ

Aşağıdaki elementleri destekle:

### Temel

* Text
* Heading
* Paragraph
* Line
* Rectangle
* Spacer

### Görsel

* Logo
* Image
* QR Code

### Fatura

* Invoice Header
* Customer Information
* Invoice Information
* Invoice Items Table
* Subtotal
* Discount
* Tax
* Grand Total
* Currency
* Payment Information
* Bank Information
* Notes
* Terms & Conditions
* Signature

### Dinamik

* Dynamic Field
* Dynamic Label
* Dynamic Number
* Dynamic Date
* Dynamic Currency

Element mimarisi genişletilebilir olmalıdır.

Yeni element eklemek mevcut kodu bozmayacak şekilde yapılmalıdır.

---

# 6. DRAG & DROP

Elementler A4 üzerinde:

* sürüklenebilmeli
* taşınabilmeli
* resize edilebilmeli
* seçilebilmeli
* silinebilmeli
* kopyalanabilmeli
* çoğaltılabilmeli
* z-index değiştirilebilmeli

Seçili element üzerinde resize handle'ları göster.

Element hareket ettirilirken hizalama yardımcı çizgileri göster.

---

# 7. SNAP / ALIGNMENT

Profesyonel bir editor davranışı oluştur.

Destekle:

* Grid snapping
* Center snapping
* Left alignment
* Right alignment
* Top alignment
* Bottom alignment
* Equal spacing
* Center vertically
* Center horizontally

Örneğin element başka bir elementin ortasına geldiğinde yardımcı çizgi göster.

---

# 8. ELEMENT SEÇİMİ

Element seçildiğinde:

```text
border
resize handles
selection indicator
```

göster.

Seçili olmayan elementler normal görünmelidir.

Canvas üzerinde kullanıcıya gereksiz görsel karmaşa oluşturma.

---

# 9. SAĞ PROPERTIES PANEL

Seçili elemente göre dinamik özellik paneli oluştur.

Örneğin Text için:

```text
İçerik
Font
Font Size
Font Weight
Font Style
Text Color
Background Color
Text Align
Line Height
Letter Spacing
```

Konum:

```text
X
Y
Width
Height
Rotation
```

Border:

```text
Border Width
Border Color
Border Radius
```

Padding:

```text
Top
Right
Bottom
Left
```

---

# 10. LOGO / IMAGE

Logo ve image elementleri:

* upload
* resize
* position
* aspect ratio
* object fit
* alignment

özelliklerine sahip olmalı.

Logo için:

```text
Contain
Cover
Original
```

seçenekleri sun.

---

# 11. DİNAMİK ALAN SİSTEMİ 

Önemli Not : Aşağıdaki tanımalamlar örnek olarak verildi sen Projedekileri kullan yoksa yeniden tanımla

Axion Invoice için çok önemli.

Kullanıcı faturaya aşağıdaki alanları sürükleyip bırakabilmeli:

### Invoice

```text
invoice.number
invoice.date
invoice.dueDate
invoice.currency
invoice.type
```

### Customer

```text
customer.name
customer.taxNumber
customer.taxOffice
customer.address
customer.city
customer.country
customer.email
customer.phone
```

### Totals

```text
totals.subtotal
totals.discount
totals.tax
totals.grandTotal
```

### Company

```text
company.name
company.taxNumber
company.address
company.phone
company.email
company.website
```

Dynamic field template içinde:

```text
{{invoice.number}}
```

şeklinde saklanabilir.

---

# 12. DİNAMİK ALAN UI

Sol panelde:

```text
DİNAMİK ALANLAR

Fatura
 ├─ Fatura No
 ├─ Fatura Tarihi
 ├─ Vade Tarihi
 └─ Para Birimi

Müşteri
 ├─ Ünvan
 ├─ Vergi No
 ├─ Vergi Dairesi
 └─ Adres

Tutarlar
 ├─ Ara Toplam
 ├─ İskonto
 ├─ KDV
 └─ Genel Toplam
```

bulunsun.

Kullanıcı drag & drop ile A4'e bırakabilsin.

---

# 13. INVOICE TABLE

Fatura tablosu özel bir component olmalıdır.

Kullanıcı sütunları seçebilmeli:

```text
☑ Ürün Kodu
☑ Ürün Adı
☑ Açıklama
☑ Miktar
☑ Birim
☑ Birim Fiyat
☑ İskonto
☑ KDV
☑ KDV Tutarı
☑ Toplam
```

Sütun sıralaması değiştirilebilmeli.

Sütun genişliği değiştirilebilmeli.

Başlık stilini değiştirebilmeli.

Satır stilini değiştirebilmeli.

Border ayarlanabilmeli.

Alternatif satır rengi seçilebilmeli.

---

# 14. TABLO PROPERTIES

Table seçildiğinde:

```text
Columns
Column Width
Header Font
Header Background
Header Color
Row Font
Row Height
Border
Border Color
Border Width
Text Alignment
Currency Format
Number Format
```

özellikleri göster.

---

# 15. TÜM FATURA DETAYLARI TASARLANABİLMELİ

Kullanıcı aşağıdaki alanların tamamının konumunu değiştirebilmeli:
Not : Aşağıdaki Bilgileri Hazırda verildi Projede olan ve burda olmayan faturaya eklenmesi gereknleride eklemelisin

```text
Logo
Firma bilgileri
Müşteri bilgileri
Fatura numarası
Fatura tarihi
Vade tarihi
Fatura tipi
Para birimi
Ürün tablosu
Ara toplam
İskonto
KDV
KDV toplamı
Genel toplam
Ödeme bilgileri
Banka bilgileri
Not
Açıklama
Ödeme şartları
İmza
QR Code
Footer
```

Hiçbir alan sabit pozisyonda olmamalı.

---

# 16. LAYERS PANEL

Katman yönetimi ekle.

Örneğin:

```text
KATMANLAR

☷ Footer
☷ Signature
☷ Grand Total
☷ Invoice Table
☷ Customer Info
☷ Invoice Info
☷ Logo
☷ Header
```

Destekle:

* Bring to front
* Send to back
* Move up
* Move down
* Lock
* Hide

---

# 17. UNDO / REDO

Mutlaka destekle:

```text
Ctrl + Z
Ctrl + Y
```

Toolbar:

```text
↶ Undo
↷ Redo
```

Element ekleme, silme, taşıma, resize ve property değişiklikleri history'ye girmeli.

---

# 18. KEYBOARD SHORTCUTS

Destekle:

```text
Delete
Backspace
Ctrl + C
Ctrl + V
Ctrl + D
Ctrl + Z
Ctrl + Y
Arrow Keys
Shift + Arrow
```

Arrow:

```text
1mm
```

Shift + Arrow:

```text
5mm
```

hareket ettirebilir.

---

# 19. TEMPLATE JSON

Template HTML olarak saklanmamalı.

JSON model kullanılmalı.

Örneğin:

```json
{
  "version": 1,
  "page": {
    "size": "A4",
    "orientation": "portrait",
    "width": 210,
    "height": 297,
    "unit": "mm"
  },
  "elements": [
    {
      "id": "logo_1",
      "type": "logo",
      "x": 20,
      "y": 15,
      "width": 45,
      "height": 20
    },
    {
      "id": "invoice_number",
      "type": "dynamic-field",
      "field": "invoice.number",
      "x": 150,
      "y": 25,
      "width": 40,
      "height": 8
    }
  ]
}
```

Template modelini TypeScript interface'leri ile strongly typed oluştur.

---

# 20. TEMPLATE VERSIONING

Template:

```text
version
```

alanına sahip olmalı.

Daha sonra:

```text
Version 1
Version 2
Version 3
```

gibi versiyonlama yapılabilecek şekilde tasarla.

Eski faturaların hangi template versiyonuyla oluşturulduğu korunabilmeli.

---

# 21. BACKEND

Mevcut FastAPI mimarisini kullan.

Template API oluştur:

```text
GET    /api/templates
GET    /api/templates/{id}
POST   /api/templates
PUT    /api/templates/{id}
DELETE /api/templates/{id}
POST   /api/templates/{id}/duplicate
POST   /api/templates/{id}/default
```

Mevcut API pattern'lerine uy.

Yeni bir mimari oluşturmak yerine projedeki mevcut service/router/schema pattern'lerini takip et.

---

# 22. DATABASE

PostgreSQL üzerinde template JSONB olarak saklanabilir.

Önerilen yapı:

```text
invoice_templates

id
tenant_id
name
description
template_type
version
template_json
is_default
created_at
updated_at
```

Multi-tenant yapıya kesinlikle uy.

Bir tenant başka tenant'ın template'ini görememeli.

Mevcut authentication ve tenant middleware sistemini kullan.

---

# 23. TEMPLATE TYPES

İlk etapta:

```text
invoice
```

destekle.

Ancak architecture gelecekte:

```text
invoice
proforma
quote
delivery-note
receipt
purchase-order
```

destekleyecek şekilde tasarlanmalı.

---

# 24. PREVIEW

Editörde:

```text
[ Düzenle ]
[ Önizle ]
```

seçenekleri olsun.

Preview modunda:

* selection border
* resize handles
* grid
* editor controls

gizlenmeli.

Gerçek fatura verileri ile preview oluşturulabilmeli.

---

# 25. PRINT / PDF

A4 PDF çıktısı için editor ile aynı template JSON kullanılmalı.

Akış:

```text
Template JSON
      ↓
Invoice Data
      ↓
Template Renderer
      ↓
A4 HTML
      ↓
PDF
```

Editor'deki görünüm ile PDF görünümü mümkün olduğunca birebir aynı olmalı.

A4:

```text
210mm × 297mm
```

olarak render edilmeli.

Print CSS:

```css
@page {
  size: A4;
  margin: 0;
}
```

kullan.

---

# 26. UI / UX TASARIMI

Axion Invoice'ın mevcut tasarım diline uy.

Genel yaklaşım:

```text
Modern
Minimal
Corporate
Professional
SaaS
Clean
```

UI gereksiz şekilde renkli veya karmaşık olmasın.

Tailwind CSS kullan.

Mevcut Axion Invoice renklerini ve componentlerini mümkün olduğunca kullan.

Özellikle:

* border
* shadow
* radius
* typography
* spacing
* buttons
* inputs
* dropdowns
* tooltip
* modal

için mevcut design system'i takip et.

---

# 27. RESPONSIVE DAVRANIŞ

Editör masaüstü öncelikli olmalıdır.

Minimum:

```text
1280px+
```

ekranlarda rahat çalışmalı.

Tablet ve daha küçük ekranlarda:

* sol panel collapse
* sağ panel collapse
* canvas center

olabilir.

Ancak A4 editorün ana kullanım senaryosu desktop'tur.

---

# 28. PERFORMANS

Çok sayıda element olduğunda editor yavaşlamamalı.

Gereksiz React render'larından kaçın.

Elementleri stable ID ile yönet.

Memoization gerektiğinde kullan.

Ancak React Compiler veya mevcut proje optimizasyon kurallarını bozacak çözümler kullanma.

---

# 29. AUTOSAVE

Editor ilerleyen aşamada autosave destekleyecek şekilde tasarlanmalı.

Örneğin:

```text
Kaydediliyor...
Kaydedildi ✓
```

durumları gösterilebilir.

İlk implementasyonda manuel:

```text
[Kaydet]
```

çalışabilir.

Ancak architecture autosave'e uygun olmalı.

---

# 30. DEFAULT TEMPLATE

İlk açılışta boş A4 yerine profesyonel örnek bir fatura template'i oluştur.

Örneğin:

```text
┌──────────────────────────────────────┐
│ LOGO                   FATURA        │
│                                      │
│ Firma Bilgileri       Fatura Bilgisi│
│                                      │
│ Müşteri Bilgileri                   │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Ürün | Miktar | Fiyat | KDV | ...│ │
│ └──────────────────────────────────┘ │
│                                      │
│                          Ara Toplam  │
│                          İskonto     │
│                          KDV         │
│                          GENEL TOPLAM│
│                                      │
│ Notlar                               │
│                                      │
│                         İmza         │
└──────────────────────────────────────┘
```

Bu template sadece demo amacıyla değil, editorün tüm özelliklerini test etmek için de kullanılmalı.

---

# 31. COMPONENT TASARIM PRENSİBİ

Kod monolitik olmamalı.

Şunun gibi tek bir:

```text
InvoiceEditor.tsx
```

dosyası oluşturma.

Bunun yerine:

```text
TemplateEditor
├── EditorToolbar
├── ElementPanel
├── DynamicFieldsPanel
├── A4Canvas
│   ├── A4Page
│   ├── CanvasElement
│   └── SelectionBox
├── LayersPanel
└── PropertiesPanel
```

şeklinde ayrıştır.

---

# 32. ÖNERİLEN KLASÖR

Mevcut proje yapısına uygun şekilde gerekirse:

```text
src/features/template-editor/

components/
elements/
properties/
panels/
store/
types/
utils/
constants/
hooks/
services/
```

oluştur.

Mevcut proje naming convention'larına uy.

---

# 33. ÖNEMLİ GELİŞTİRME KURALI

Herhangi bir kod yazmadan önce:

1. Mevcut kodu incele.
2. Mevcut componentleri yeniden kullan.
3. Mevcut API patternlerini incele.
4. Mevcut TypeScript tiplerini incele.
5. Mevcut Tailwind conventionlarını incele.
6. Mevcut routing yapısını incele.

Sonra implementation planını oluştur.

Planı tamamladıktan sonra doğrudan implementation'a geç.

Gereksiz şekilde benden her küçük adım için onay isteme.

---

# 34. KOD KALİTESİ

Kod:

* TypeScript strict uyumlu
* okunabilir
* modüler
* reusable
* maintainable
* test edilebilir

olmalı.

`any` kullanımından kaçın.

Magic number kullanma.

A4 ölçüleri, zoom değerleri ve element type'ları constant olarak tanımlanmalı.

---

# 35. HATA YÖNETİMİ

Özellikle:

* invalid template
* bozuk JSON
* eksik dynamic field
* image yüklenememesi
* API save hatası
* PDF render hatası

için kullanıcıya profesyonel hata mesajları göster.

Browser'ın standart `alert()` veya `confirm()` mekanizmasını kullanma.

Mevcut projedeki toast/modal sistemini kullan.

---

# 36. KULLANICI DENEYİMİ

Kullanıcı şunu hissetmeli:

> "Bu benim faturam. İstediğim yere istediğim alanı koyabiliyorum."

Editor mümkün olduğunca:

* hızlı
* akıcı
* anlaşılır
* profesyonel

olmalı.

---

# 37. GELİŞTİRME SIRASI

Implementation şu sırayla yapılmalı:

### Phase 1

A4 Canvas

### Phase 2

Element model

### Phase 3

Text / Heading / Line

### Phase 4

Selection

### Phase 5

Drag / Resize

### Phase 6

Properties Panel

### Phase 7

Logo / Image

### Phase 8

Dynamic Fields

### Phase 9

Invoice Table

### Phase 10

Layers

### Phase 11

Snap / Alignment

### Phase 12

Undo / Redo

### Phase 13

Preview

### Phase 14

Backend / PostgreSQL

### Phase 15

PDF

---

# 38. HER PHASE SONRASI

Her phase tamamlandığında:

1. TypeScript hatalarını kontrol et.
2. ESLint hatalarını kontrol et.
3. Build çalıştır.
4. Mevcut özelliklerin bozulmadığını kontrol et.
5. Gereksiz kodları temizle.
6. Bir sonraki phase'e geç.

Build başarısızsa sonraki aşamaya geçme.

---

# 39. EN ÖNEMLİ KURAL

Bu projeyi basit bir "drag and drop HTML builder" olarak geliştirme.

Bu sistem:

**Axion Invoice'ın profesyonel Invoice Template Designer'ı**

olacak.

Dolayısıyla mimari gelecekte:

```text
Invoice
Quote
Proforma
Delivery Note
Receipt
Purchase Order
```

gibi tüm belge türlerine genişletilebilecek şekilde hazırlanmalı.

---

# 40. İLK GÖREV

Şimdi projeyi analiz et.

Önce mevcut:

```text
package.json
src/
routing
components
pages
state management
API services
invoice models
Tailwind configuration
authentication
tenant structure
```

yapısını incele.

Ardından bana:

1. Mevcut mimari özeti
2. Template Designer için önerilen mimari
3. Kullanılacak yeni paketler
4. Değiştirilecek dosyalar
5. Oluşturulacak dosyalar
6. Database değişiklikleri
7. API değişiklikleri
8. Implementation aşamaları

şeklinde kısa bir plan göster.

Planı oluşturduktan sonra implementation'a başla.

**Mevcut çalışan kodu gereksiz yere değiştirme veya silme.**

Amaç mevcut Axion Invoice uygulamasına **production-ready profesyonel A4 Invoice Template Designer** eklemektir.
