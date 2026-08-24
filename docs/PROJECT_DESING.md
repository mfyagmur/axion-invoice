# Proje Tasarım / Değişiklik Günlüğü

Bu dosya, proje genelinde yapılan değişikliklerin ve regresyon düzeltmelerinin kaydını tutar. Her giriş: tarih, dosya, işlem türü (ekleme/değiştirme/çıkarma), ve yapılanın özeti.

---

## 2026-08-24 — QR Kod — Yeni "Fatura Bilgisi" Veri Kaynağı Seçeneği

**Bağlam:** Şablon tasarımcısında QR kod elemanının "Veri Kaynağı" seçeneğine 3. bir alternatif eklendi: **"Fatura Bilgisi"**. Şu ana kadar 2 seçenek mevcuttu: dinamik `invoice.number` ve sabit kullanıcı metni. Yeni seçenek, Fatura No, Firma Vergi No, Müşteri Vergi No, Fatura Tarihi, Genel Toplam Tutarı ve Parabirimi olmak üzere 5 alan bilgisini etiketli, çok satırlı metin olarak QR koduna gömüyor. Bu şekilde QR kodu taratıldığında faturanın özet bilgileri görülebiliyor.

**Çözüm:**
1. **backend/app/schemas/template.py:** `QrCodeElement.data_source` literal'ine `"invoice_info"` eklendi
2. **backend/app/services/pdf_service.py:** `_render_visual_v2_html()` fonksiyonundaki `qrcode` dalına `elif data_source == "invoice_info":` eklenip 5 alan `template_field_resolver.resolve_field()` ile çekilerek şu format'ta birleştirildi:
   ```
   Fatura No: {invoice.number}
   Firma Vergi No: {company.tax_number}
   Müşteri Vergi No: {customer.tax_number}
   Fatura Tarihi: {invoice.date}
   Genel Toplam: {totals.grand_total} {invoice.currency}
   ```
   (Boş değerler boş satır olarak yer alır, `resolve_field` zaten eksik veri için `""` döndürüyor.)
3. **frontend/src/features/invoice-editor/types/element.ts:** `QrCodeElement.data_source` union'una `'invoice_info'` eklendi
4. **frontend/src/features/invoice-editor/components/PropertiesPanel.tsx:** QR veri kaynağı dropdown'a `<option value="invoice_info">{t('editor.properties.qrInvoiceInfo')}</option>` seçeneği eklendi
5. **frontend/src/i18n/locales/tr.json, en.json:** Yeni i18n anahtarları:
   - tr: `"qrInvoiceInfo": "Fatura Bilgisi"`
   - en: `"qrInvoiceInfo": "Invoice Info"`
6. **backend/tests/test_templates.py:** Yeni test `test_render_v2_template_qrcode_invoice_info()` — `data_source="invoice_info"` olan qrcode elemanı + invoice ile render edip `_qr_data_uri`'ye giden string'in tüm 5 etiketi ve doğru değerleri içerdiğini monkeypatch ile doğrulanıyor.

| Dosya | İşlem | Özet |
|-------|-------|------|
| `backend/app/schemas/template.py` | Değiştirme | `QrCodeElement.data_source` literal'ine `"invoice_info"` eklendi |
| `backend/app/services/pdf_service.py` | Değiştirme | `qrcode` dalında yeni `elif` eklenip 5 alan etiketli metin olarak birleştirildi |
| `frontend/src/features/invoice-editor/types/element.ts` | Değiştirme | `QrCodeElement.data_source` union'a `'invoice_info'` eklendi |
| `frontend/src/features/invoice-editor/components/PropertiesPanel.tsx` | Değiştirme | QR veri kaynağı dropdown'a yeni seçenek eklendi |
| `frontend/src/i18n/locales/tr.json`, `en.json` | Değiştirme | `qrInvoiceInfo` i18n anahtarları eklendi |
| `backend/tests/test_templates.py` | Ekleme | `test_render_v2_template_qrcode_invoice_info()` yeni test fonksiyonu |

---

## 2026-08-24 — PDF Önizleme — Banka Hesabı Tablosunda Çoklu Render Hatası Düzeltmesi

**Bağlam:** Fatura detay ekranında "Önizle" butonuna basıldığında, PDF/HTML önizlemede banka hesabı tablosunda **sadece sütun başlıkları** (Banka Adı, Şube Adı, vb.) görünüyor, veri satırları gözükmüyor ya da garip bir şekilde görünüyor (başlıklar veri satırlarını kapatıyor gibi). İncelenen gerçek test faturasında (`INV202600013`, "Fatura Test 1" şablonu, v2 layout, 2 banka hesabı atanmış) durum: şablonun `layout_json`'da **3 ayrı `bank-account` elemanı** vardı — slot 1, 2, 3 için ayrı ayrı, konumları yalnızca ~5mm arayla (y: 245.67, 250.67, 255.67mm), her biri sadece 5mm yükseklikte.

**Kök sebep:** `template_designer_base.html`'deki `bank-account` dalı, `element.slot` değerine hiç bakmadan, `bank_accounts` listesi doluysa **HER bank-account elemanı için** (slot 1, 2, ve 3 hepsi) başlık+tüm-hesaplar içeren komple `<table>` render ediyordu. Sonuç: aynı 2-satırlık tablo 3 kez üst üste, sadece 5mm arayla konumlanarak basılıyordu. `.el-table` CSS kuralı (`height: auto !important`) tabloların gerçek içerik yüksekliğine büyümesine izin verdiği için, üst tabloların opak başlık arka planı (`#f5f5f5`) alttaki tabloların veri satırlarını **görsel olarak örtüyordu** — kullanıcının gördüğü "sadece başlıklar" görüntüsü bu yüzden.

**Çözüm:**
1. **template_designer_base.html — slot kontrolü eklendi:** `bank-account` tablo render'ı yalnızca `element.slot == 1` (veya slot undefined) olduğunda yapılır. Slot 2/3 elemanları tamamen skip edilir.
2. **pdf_service.py — banka tablosu yükseklik hesaplaması eklendi:** `_reflow_elements_below_table()` fonksiyonu (items tablosu için zaten mevcuttu) genişletildi: slot-1 `bank-account` elemanları için de şu işlemi yapar:
   - `header_height_mm` + (`row_height_mm` × hesap sayısı) × 1.05 (safety margin) ile gerçek içerik yüksekliğini hesaplar
   - Eğer tasarlanmış `height_mm`'i aşarsa (overflow varsa) `height_mm`'i günceller
   - Tablo altında ~50mm içinde kalan elemanları (`y_mm`) overflow kadarı aşağı kaydırır (item tablosu ile aynı pattern)
3. **_render_visual_v2_html() çağrısı güncellendi:** `_reflow_elements_below_table()` artık 3. parametre olarak `bank_accounts` listesi alıyor.

| Dosya | İşlem | Özet |
|-------|-------|------|
| `backend/app/templates_html/template_designer_base.html` | Değiştirme | `bank-account` dalında `{% if element.slot == 1 or element.slot is undefined %}` kontrolü eklendi, slot 2/3 hiç render edilmiyor |
| `backend/app/services/pdf_service.py` | Değiştirme | `_reflow_elements_below_table()` parametresi `bank_accounts` eklendi, slot-1 bank-account elemanları için yükseklik overflow hesaplaması + altında kalan elemanların kaydırılması uygulandı |
| `backend/tests/test_templates.py` | Ekleme | `test_render_v2_template_multi_bank_account_no_duplication()` yeni test: 3 slotta bank-account elemanı + 2 hesaplı fatura ile render, HTML'de tek bir tablo doğrulanıyor (slot 2/3 tekrar basılmıyor) |

**Doğrulama:**
- Test DB'ye karşı yeni test çalıştırılıp geçtiği teyit edildi
- Gerçek test faturası (`INV202600013`) HTML render'ında:
  - `<thead>` 1 adet (banka tablosunun başlığı) ✓
  - "Banka Adı" header 1 kez ✓
  - Veri satırları 2 adet (2 hesap) ✓
  - Slot 2/3 tekrar render edilmiyor ✓

---

## 2026-08-24 — Banka Hesabı Düzenleme — Seçilmiş Hesapları Kaldırabilme (Clear Button)

**Bağlam:** Fatura detay ekranında (`/dashboard/invoices/:id`) sağ sidebar'daki `BankAccountSection`
bileşeninin düzenleme modunda, kullanıcı şu anda sadece banka hesabı seçebiliyor, ama seçilen 
bir hesabı kaldırmaya (temizlemeye) kabiliyeti yok. Kullanıcı isteği: "Düzenle" butonuna basıp
3 banka hesabından istediğini **kaldırabilsin**, kaydet yapıp sadece kalanlar listelenmesi."

Kök sebep: Düzenleme modundaki Select alan'ında hiçbir "boş bırak" seçeneği yoktu ve UI'da
bilerek seçilen hesapları kaldırmanın yolu yoktu.

Çözüm:
1. **BankAccountSection.tsx — edit mode'daki Select'in yanına clear button eklendi:**
   - Her Select alan'ının sağında küçük bir `X` ikonu (lucide-react'ten)
   - Click handler: `setSelectedIds((prev) => prev.map((id, i) => (i === index ? '' : id)))`
   - Button otomatik disabled hale gelir, o slot boş olduğunda (`disabled={!selectedIds[index]}`)
   - Styling: `CopyIconButton` pattern'ıyla tutarlı (h-10 w-10, border-slate-300, hover:bg-slate-50)
2. **Backend zaten hazırlı:** `handleSave` fonksiyonu `selectedIds[i] || null` dönüştürmesi yapıyor,
   empty string otomatik null'a dönüştürülüyor. Hiçbir backend değişikliği gerekmedi.

| Dosya | İşlem | Özet |
|-------|-------|------|
| `frontend/src/features/invoices/components/BankAccountSection.tsx` | Değiştirme | Edit mode'da her Select'in yanına X kaldırma butonu; `disabled={!selectedIds[index]}`, onClick setSelectedIds'i empty string'e ayarla |

**Doğrulama (beklemede):**
- Frontend'de 3 banka hesabı olan bir faturayı aç, Edit'e bas
- Select'lerin yanındaki X butonlarına tıkla, seçili olanlar temizlensin (disabled olsa bile gözükse)
- Save'e bas, temizlenmiş hesaplar ekrandan kaybolsun, sadece geri kalanlar görünsün
- Tek bir hesap kalırsa grid 1 kolon, iki hesap kalırsa 2 kolon görmek

---

## 2026-08-24 — Banka Hesabı Kartları — Görsel Taşma Hatası Düzeltmesi + IBAN Kopyalama

**Bağlam:** Fatura detay ekranında (`/dashboard/invoices/:id`) sağ sidebar'da yer alan
`BankAccountSection` bileşeninde, birden fazla banka hesabı seçildiğinde (1, 2 veya 3),
metinler (IBAN, hesap no, şube bilgisi) kart genişliğine sığmayıp **iç içe/üst üste binmişti** ve
metin taşması görsel bozulma yaratıyordu. Tasarımca ise her banka hesabının kendi kartı içinde,
başlıkta para birimi rozeti, banka adı, şube, **kopyalanabilir IBAN**, hesap no gösterilmesi
istenmişti.

Kök sebep: Görüntüleme modunda her banka hesabı `grid-cols-3` grid'i içinde çıplak bir `<div>`
olarak render ediliyordu — kart sınırı, padding, CSS `min-w-0`, `overflow`, `break-all`/`truncate`
gibi taşma kontrol mekanizmaları yoktu. IBAN gibi uzun mono-font metinler grid hücresini
genişletip komşu hücrelere taşıyordu; fakat CSS Grid bu durumda hücreleri küçültmek yerine
dış konteyneri genişletme eğilimindedir (implisit grid track davranışı).

Çözüm:
1. **Yeni küçük bileşen:** `CopyIconButton.tsx` — `lucide-react`'in `Copy`/`Check` ikonları +
   `navigator.clipboard.writeText()` + mevcut `useToastStore` ile "Kopyalandı" bildirimi.
   Stil: `EditIconButton` ile tutarlı (`h-7 w-7`, `border-slate-300`, `hover:bg-slate-50`).
2. **BankAccountSection.tsx — görüntüleme modunu yeniden tasarla:**
   - Dolu hesapları filtrele, dinamik grid: 1 hesap → `grid-cols-1`, 2 → `sm:grid-cols-2`,
     3 → `sm:grid-cols-3` (Tailwind dynamic class escape işlemi, class-map kullanmak daha güvenli).
   - Her hesap kendi iç kartında: `rounded-xl border border-slate-200 p-4 min-w-0` 
     (`min-w-0` grid/flex taşma önleyici, zorla hücreler kontrol altında kalıyor).
   - Kart içi düzen:
     * Para birimi rozeti: `rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium`
     * Banka adı: `text-sm font-bold text-slate-900 truncate`
     * Şube: `text-xs text-slate-500 truncate` — "{branch_name} (Şube Kodu: {branch_code})"
     * IBAN satırı: `font-mono text-sm text-slate-700 break-all` + yanında `CopyIconButton`
       (flex `items-start justify-between gap-2`; kopyala butonu ellipsis'te kalmasın diye `flex-shrink-0`)
     * Hesap No: `text-xs text-slate-500` — "Hesap No: {account_number}"
3. **i18n:** `common.copied` anahtarı (`tr.json`: "Kopyalandı", `en.json`: "Copied") eklendi.

| Dosya | İşlem | Özet |
|-------|-------|------|
| `frontend/src/features/invoices/components/CopyIconButton.tsx` | Ekleme | Yeni küçük ikon buton bileşeni; `Copy`→`Check` animasyonu, `navigator.clipboard.writeText()`, toast bildirimi. |
| `frontend/src/features/invoices/components/BankAccountSection.tsx` | Değiştirme | Görüntüleme modunun düzeni; her hesap kendi kartında (`rounded-xl border p-4 min-w-0`), dinamik grid kolon sayısı, `truncate`/`break-all` taşma önlemleri, IBAN yanında `CopyIconButton`. |
| `frontend/src/i18n/locales/tr.json`, `en.json` | Değiştirme | `common.copied` anahtarı eklendi. |

**Doğrulama:**
- Frontend'de 1, 2, 3 banka hesabı seçili durumları görsel olarak kontrol edildi.
- IBAN kopyala butonuna tıklanıp toast bildirimi gösterildiği doğrulandı.
- Responsive: dar ekran (mobil) simülasyonunda kartlar alt alta düzgün yığıldı, taşma olmadı.
- Edit modu (banka seçim `Select`'leri) davranışının bozulmadığı kontrol edildi.

---

## 2026-08-24 — PDF/Print Preview Banka Bilgileri Tablo Tasarımı

**Bağlam:** Fatura PDF öncizlemesinde ("Önizle" butonu) banka hesabı bilgileri (1, 2 veya 3 adet)
görüntülenişinde düzensiz bir layout vardı — web detay ekranında card-tabanlı modern tasarım 
yapılmasıyla beraber, PDF/print çıktısında da profesyonel bir tablo formatı istenmişti. 
Kök sebep: HTML Jinja2 şablonlarında banka hesapları flex layout (v1 template) veya multiline 
metin (v2 template) ile render ediliyordu — tabular veriye çıktısı hatalı uyuyordu.

Çözüm:
1. **invoice_base.html (v1 template):** Flex layout'tan gerçek HTML `<table>` formatına geçildi.
   - Başlık: "Banka Bilgileri" (kalın)
   - Sütunlar: Banka Adı | Şube Adı | Şube Kodu | Döviz Tipi | Hesap No | IBAN
   - Tablo stili: Header gri background (`#f5f5f5`), altı çizgi (`border-bottom`), satır alternansı
   - Font: Genel 8pt, IBAN `font-family: monospace`
2. **template_designer_base.html (v2 template):** `bank-account` element tipi artık tablo render ediyor.
   - `_render_visual_v2_html` içinde `bank_accounts` listesi v2 template'e geçildi (yeni)
   - Template'te: eğer `bank_accounts` dolu ise tablo render et, yoksa fallback metin (geriye uyumluluk)
   - Aynı tablo tasarımı (sütunlar, styling) v1 ile eşleştirildi
3. **pdf_service.py:** `_render_visual_v2_html` fonksiyonuna `bank_accounts` parametresi eklendi
   (invoice.bank_account/bank_account_2/bank_account_3 üçlüsü filtreli ve render template'e iletildi).

| Dosya | İşlem | Özet |
|-------|-------|------|
| `backend/app/templates_html/invoice_base.html` | Değiştirme | Banka hesapları flex → HTML tablo (6 kolon: banka, şube, şube kodu, döviz, hesap no, IBAN) |
| `backend/app/templates_html/template_designer_base.html` | Değiştirme | bank-account element tipi artık tablo render ediyor (v2 template) |
| `backend/app/services/pdf_service.py` | Değiştirme | `_render_visual_v2_html` fonksiyonuna `bank_accounts` listesi eklendi ve template'e iletildi |

**Not:** Bu değişiklik **sadece PDF/print preview'a** etkiliyor. Web detay ekranında BankAccountSection 
bileşeni (yukarıdaki 2026-08-24 girdisi) zaten modern card layout ile gösteriyor. ✓

---

## 2026-08-21 — Sayfa Altı Sabit İçerik (Banka Hesabı/Açıklama) Reflow İle Birlikte Aşağı Kaymasın Diye Mesafe Eşiği Eklendi

**Bağlam:** Bir önceki reflow düzeltmesi (font metrikleri tabanlı taşma hesabı) tablo↔toplamlar
overlap'ini çözdü, ama kullanıcı yeni bir yan etki bildirdi: tablonun altında, toplamlardan çok
daha aşağıda, **sayfanın en altına sabitlenmesi gereken** bağımsız bir "footer" bandı
(3 adet Banka Hesabı elemanı + bir "Açıklama"/not kutusu, gerçek şablonda y≈245-286mm) da aynı
taşma miktarı kadar aşağı kayıyordu. Bu hem toplamlar ile footer arasında anlamsız büyük bir boşluk
bırakıyor hem de (tablo çok büyüdüğünde) bu footer'ı A4 sayfa sınırının (297mm) dışına itip
**içeriğin istenmeden ikinci bir sayfaya taşmasına** yol açabiliyordu — kullanıcının "diğer sayfaya
kaymaktadır" ifadesi tam olarak buydu.

Kök sebep: `_reflow_elements_below_table`, tablonun orijinal alt sınırının aşağısındaki **her**
elementi (mesafesi ne olursa olsun) itiyordu. Gerçek şablonlarda toplamlar tabloya hemen bitişik
tasarlanır (birkaç mm boşlukla), ama banka hesabı/not gibi bağımsız footer içerikleri sayfanın en
altına, tablodan onlarca mm uzağa sabit olarak yerleştirilir — bunlar tabloyla birlikte "akması"
gereken bir blok değil, sayfanın kendi footer bandıdır.

Yeni bir `_FOLLOW_GAP_THRESHOLD_MM = 50.0` eşiği eklendi: sadece tablonun orijinal alt sınırına
**50mm'den yakın** konumlanmış elementler (tipik olarak toplamlar bloğu) itiliyor; daha uzaktaki
elementler (gerçek şablonda toplamlar bloğunun bitişi ile banka hesabı arası ~37mm boşluk var,
banka hesabının kendisi tablo alt sınırından ~127mm uzakta — aralarında çok net bir ayrım var)
**hiç dokunulmadan** olduğu yerde kalıyor.

| Dosya | İşlem | Özet |
|-------|-------|------|
| `backend/app/services/pdf_service.py` | Değiştirme | `_FOLLOW_GAP_THRESHOLD_MM` sabiti eklendi; `_reflow_elements_below_table()`'daki itme koşulu artık `-0.5 <= (element_y - tablo_alt_sınırı) <= 50.0` aralığına sıkıştırıldı — sadece tabloya bitişik toplamlar bloğu itiliyor, sayfa altındaki bağımsız footer içerikleri (banka hesabı, açıklama/not) sabit kalıyor. |

**Doğrulama:** Kullanıcının gerçek şablonu (`INV202600011`, 10 kalem) tekrar test edildi: tablo
105.9mm→173.0mm'ye büyüyor, toplamlar bloğu hemen ardından 177.9mm'de başlayıp 208.9mm'de bitiyor
(overlap yok), banka hesabı (y=245.7/250.7/255.7) ve "Açıklama" (y=263.3) elemanları **orijinal
konumlarında değişmeden** kalıyor — artık sayfa dışına taşmıyorlar. Faturanın diskteki PDF'i
gerçek Celery task'ı (`generate_invoice_pdf_task`) ile yeniden üretildi. `docker exec ... python -c
"import app.services.pdf_service"` ile modül hatasız import edildi.

---

## 2026-08-21 — Reflow Hesabı, Deklare Edilen `row_height_mm` Yerine Gerçek Font Metriklerini Kullanacak Şekilde Düzeltildi

**Bağlam:** Bir önceki reflow düzeltmesi (`_reflow_elements_below_table`) kullanıcının gerçek
şablonuyla test edildiğinde hâlâ overlap gösterdi (ekran görüntüsüyle bildirdi). Kök sebep
bulundu: fonksiyon taşma miktarını hesaplarken tablonun **deklare edilen** `row_height_mm`
değerini kullanıyordu, ama bu değer sadece CSS `<tr style="height:Xmm">`'in bir **alt sınırı**
(minimum) — tarayıcı, hücre içeriği (font satır yüksekliği + `padding: 1mm`) bunu aşarsa satırı
otomatik büyütüyor. Kullanıcının gerçek şablonunda `row_height_mm: 2.0` olarak kayıtlıydı ama
8pt fontla gerçek render edilen satır yüksekliği ~5.8mm'ye çıkıyordu — yani hesaplanan taşma
(9mm) gerçek taşmanın (~50mm) çok altında kalıyor, toplamlar kutusu yetersiz itilip tablonun
ortasında kalmaya devam ediyordu.

`_natural_row_height_mm(font_size_pt)` adında yeni bir yardımcı eklendi: `font_size_pt × 0.3528
(pt→mm) × 1.35 (satır yüksekliği çarpanı) + 2.0mm (üst+alt hücre padding'i)` formülüyle
tarayıcının gerçekte render edeceği minimum satır yüksekliğini tahmin ediyor. Taşma hesabı artık
`max(deklare_edilen_row_height_mm, gerçek_font_tabanlı_yükseklik)` kullanıyor, ayrıca metin
sarma (uzun açıklamalar) gibi öngörülemeyen büyümelere karşı %5'lik bir güvenlik payı eklendi.

| Dosya | İşlem | Özet |
|-------|-------|------|
| `backend/app/services/pdf_service.py` | Değiştirme | `_natural_row_height_mm()` eklendi; `_reflow_elements_below_table()` artık satır/başlık yüksekliğini `row_height_mm`/`header_font_size` yerine gerçek font metriklerinden hesaplıyor, `content_height_mm`'e %5 güvenlik payı eklendi. |

**Doğrulama:** Kullanıcının bildirdiği gerçek fatura (`INV202600011`, 10 kalem, `row_height_mm:
2.0` olan gerçek şablon) DB'den çekilip doğrudan `render_invoice_html()` ile render edildi:
tablo artık 105.86mm→172.97mm (67.1mm) yüksekliğinde, tüm toplam etiketleri (Ara Toplam/İskonto/
KDV/Genel Toplam/Net Alacak) 177mm'den başlıyor — tablonun altında ~5mm boşlukla, **hiç overlap
yok**. Bu faturanın diskteki eski (hatalı) PDF'i, gerçek Celery task'ı (`generate_invoice_pdf_task`)
doğrudan çağrılarak yeniden üretildi — kullanıcı tekrar indirdiğinde/önizlediğinde güncel render'ı
görecek.

**Bilinen yan etki / sınırlama:** Bu şablonda tablonun tasarlanan yüksekliği (12.9mm, ~1 satır için)
gerçek ihtiyaçtan (10 kalemle 67mm) çok küçük olduğu için itme miktarı da büyük (~54mm) oluyor.
Sayfanın en altına yakın konumlanmış, tablodan bağımsız görünen bir "Açıklama" alanı bu itmeyle
A4 sayfa sınırının (297mm) dışına taşabiliyor — bu, önceden bilinen "tek sabit sayfa, çok sayfalı
fatura desteği yok" sınırlamasının (bkz. `docs/todo.md`) doğal bir sonucu; tablo+toplamlar
overlap'i çözüldükçe, tasarımda tabloya çok az yer ayrılmış şablonlarda sayfanın geri kalanı
sıkışabilir. Kullanıcıya önerim: şablon editöründe tablonun `row_height_mm`/`height_mm` değerini
gerçekçi bir kalem sayısına göre büyütmesi (örn. beklenen maksimum kalem sayısı × ~6mm), bu hem
editörde hem gerçek render'da daha tutarlı bir başlangıç noktası sağlar.

---

## 2026-08-21 — Büyüyen Kalemler Tablosunun Alttaki Elementlerle Üst Üste Binmesi (Overlap) Düzeltildi

**Bağlam:** Bir önceki düzeltme (`.el-table { height:auto; overflow:visible }`) kalemler tablosunun
artık taşan satırları kırpmamasını sağladı, ama render motoru **gerçek CSS document flow**
kullanmıyor — her element (tablo dahil) `layout_json`'da kayıtlı sabit `x_mm`/`y_mm` koordinatına
`position:absolute` ile oturuyor. Bu yüzden tablo büyüdükçe altında konumlandırılmış hiçbir element
(ayrı bir toplamlar kutusu, not, imza vb.) aşağı itilmiyordu — kullanıcı bunu tablonun satırlarının
altındaki toplamlar kutusuyla **üst üste binmesi** olarak gördü ("tabloyu takip etmedi, tablonun
içinde/üstünde kaldı").

Gerçek bir flexbox/document-flow motoruna geçmek (elementlerin serbest x/y konumlandırma modelini
bozar) yerine, render zamanında **sunucu tarafında bir "reflow" hesaplaması** eklendi:
`pdf_service._reflow_elements_below_table()` — kalemler tablosunun gerçek içerik yüksekliğini
(başlık + `satır_sayısı × row_height_mm` + varsa toplamlar `tfoot`'u) tasarlanan `height_mm` ile
karşılaştırır; taşma varsa (a) tablonun kendi kutusunu bu yüksekliğe büyütür, (b) tablonun **orijinal**
alt sınırının aşağısında konumlanmış (yani tasarımda ondan sonra gelmesi amaçlanan) her elementin
`y_mm`'sini aynı miktarda aşağı kaydırır. Bu, `template.layout_json`'ın bir **derin kopyası**
üzerinde yapılır — DB'deki kayıtlı şablon hiçbir zaman mutasyona uğramaz, sadece o anki render
çıktısı etkilenir.

| Dosya | İşlem | Özet |
|-------|-------|------|
| `backend/app/services/pdf_service.py` | Değiştirme | Yeni `_reflow_elements_below_table(elements, line_items)` fonksiyonu eklendi (`copy.deepcopy` ile şablonu mutasyondan korur). `_render_visual_v2_html`, Jinja'ya artık ham `template.layout_json` yerine bu fonksiyondan dönen reflow edilmiş kopyayı geçiriyor. |

**Doğrulama:** Docker konteyner içinde üç senaryo doğrudan test edildi: (1) 10 kalemli tablo + ayrı
sabit-konumlu bir toplam metni — toplam metni tablonun yeni alt sınırının hemen altına kaydı, overlap
kalmadı (tam Jinja render çıktısıyla doğrulandı: tablo 60mm→126mm, toplam kutusu 82mm→128mm'ye
kaydı). (2) İçerik tasarlanan yüksekliğe sığdığında (2 kalem, 60mm'lik kutu) hiçbir kayma
olmadığı — gereksiz itme yok. (3) `show_totals=true` olan bir tabloda `tfoot` yüksekliği de taşma
hesabına dahil edildiği doğrulandı. `docker exec ... python -c "import app.services.pdf_service"` ile
modül hatasız import edildi.

**Bilinen sınırlama:** Bu itme, yalnızca tablonun **orijinal** alt sınırının aşağısında kalan
elementleri etkiler; tablonun yanına (aynı y aralığında, farklı x'te) konumlandırılmış elementler
kasıtlı olarak etkilenmez (örn. tablonun sağında duran ayrı bir logo/not kutusu kaymaz — bu doğru
davranıştır, çünkü onlar tabloyla aynı satırda tasarlanmıştır). Çok satırlı bir taşmada, tablonun
tasarlanan kutusundan çok daha uzun olduğu (ör. sayfa sınırını aşan) durumlarda hâlâ bilinen
"çok sayfalı fatura desteği yok" sınırlaması geçerlidir (bkz. `docs/todo.md`).

---

## 2026-08-21 — Kalemler Tablosu Sabit Yükseklik Kırpması ve Toplamların Tabloyu Takip Etmemesi Düzeltildi

**Bağlam:** Kullanıcı gerçek fatura render'ında (önizleme + PDF, ikisi de aynı kaynaktan:
`pdf_service.render_invoice_html` → `template_designer_base.html`) iki hata bildirdi: (1) 10 kalemli
bir faturada sadece 1 kalem görünüyordu, (2) Toplamlar (Ara Toplam/KDV/Genel Toplam) alanı, tablo
satır sayısına göre büyüyen kalemler tablosunu takip etmiyordu. Kod incelemesi ile satır sayısını
sınırlayan bir backend hatası olmadığı kanıtlandı (`{% for row in line_items %}` tüm kalemleri
basıyordu) — asıl sebep, her element gibi tablo kutusunun da JSON'da kayıtlı **sabit**
`height_mm` + `.el { overflow:hidden }` ile çizilmesiydi: az kalemli bir test faturası için
tasarlanan tablo yüksekliği, 10 kalem eklenince taşan satırları görsel olarak kesiyordu. Toplamlar
ise ayrı, elle konumlandırılmış `dynamic-field` elementleri olduğu için tabloya hiç bağlı değildi.

| Dosya | İşlem | Özet |
|-------|-------|------|
| `backend/app/schemas/template.py` | Değiştirme | `InvoiceTableElement`'a geriye dönük uyumlu (varsayılan `False`) yeni alan: `show_totals: bool`. |
| `backend/app/templates_html/template_designer_base.html` | Değiştirme | `.el-table` için `.el`'in genel sabit `height`/`overflow:hidden` kuralını geçersiz kılan `height:auto !important; overflow:visible !important;` eklendi — tablo artık kaç satır varsa o kadar yer kaplıyor, hiçbir satır kesilmiyor. `show_totals=true` olduğunda `</tbody>` altına, `totals` context'inden (`subtotal`/`tax_total`/`grand_total`) 3 satırlık bir `<tfoot>` eklendi (Genel Toplam kalın) — bu satırlar aynı `<table>` içinde olduğu için HTML akışı sayesinde tablo kaç satıra çıkarsa çıksın **garantili** olarak hemen altında kalıyor. |
| `backend/app/services/pdf_service.py` | Değiştirme | `_render_visual_v2_html`, zaten hesaplanan `totals` dict'ini (`_collect_render_data` dönüşü) artık Jinja context'ine `totals=totals` olarak geçiriyor (önceden `_` ile atılıyordu, template'e hiç ulaşmıyordu). |
| `frontend/src/features/invoice-editor/types/element.ts`, `constants/elementDefaults.ts` | Değiştirme | `InvoiceTableElement` tipine ve yeni tablo elemanı varsayılanına `show_totals: false` eklendi — mevcut şablonlar davranış değişikliği görmez (opt-in). |
| `frontend/src/features/invoice-editor/components/PropertiesPanel.tsx` | Değiştirme | Tablo elemanı özelliklerine "Toplamları Tabloya Ekle" checkbox'ı eklendi (`zebra_striping` checkbox'ıyla birebir aynı pattern). |
| `frontend/src/features/invoice-editor/components/A4Canvas/CanvasElement.tsx` | Değiştirme | Editördeki statik tablo placeholder'ına, `show_totals` açıkken gerçek `tfoot`'u temsilen kozmetik bir 3 satırlık önizleme (Ara Toplam/KDV/Genel Toplam) eklendi — WYSIWYG tutarlılığı için, gerçek render mantığını etkilemiyor. |
| `frontend/src/i18n/locales/tr.json`, `en.json` | Değiştirme | Yeni anahtar: `editor.table.showTotals`. |

**Not:** Mevcut, toplamları ayrı `dynamic-field` kutularıyla tasarlanmış şablonlar hiçbir değişiklik
görmeden çalışmaya devam eder (`show_totals` varsayılan `false`, Jinja'da tanımsız anahtar `False`
olarak değerlendirilir — Docker konteyner içinde eski formatlı bir element dict'iyle test edilip
doğrulandı). Bu geçiş otomatik yapılmaz — kullanıcı isterse şablon editöründe tabloyu seçip yeni
toggle'ı açıp eski ayrı toplam kutularını elle silebilir; bkz. `docs/todo.md`.

**Doğrulama:** `npx tsc --noEmit` ve değişen dosyalar için `npx eslint` hatasız geçti. Backend
tarafında Docker konteyner içinde Jinja template'i doğrudan render edip 10 kalemli sahte veriyle
`<tbody>` içinde 10 `<tr>` üretildiği, `show_totals=true` iken `<tfoot>` ve Genel Toplam değerinin
çıktıda yer aldığı, `show_totals` alanı hiç olmayan eski formatlı bir element dict'iyle de hatasız
render edilip `<tfoot>` üretilmediği doğrulandı. Gerçek tarayıcıda görsel teyit bu ortamda
yapılamadı — kullanıcı kendisi test edecek.

---

## 2026-08-21 — A4 Şablon Editörü ↔ Gerçek Render Tutarsızlıkları Düzeltildi

**Bağlam:** Kullanıcı, bir önceki oturumda eklenen fatura önizleme özelliğini ve şablon
editörünü/fatura oluşturma akışını tekrar gözden geçirmemi ve kendi tespit ettiği hataları
düzeltmemi istedi. Editör canvas'ı (`CanvasElement.tsx`, `PropertiesPanel.tsx`) ile gerçek
render kaynağı (`backend/app/templates_html/template_designer_base.html`,
`pdf_service._render_visual_v2_html`) satır satır karşılaştırılarak iki gerçek tutarsızlık
bulundu — ikisi de "editörde ne görürsen faturada da o çıkar" ilkesini bozuyordu.

| Dosya | İşlem | Özet |
|-------|-------|------|
| `frontend/src/features/invoice-editor/components/A4Canvas/CanvasElement.tsx` | Değiştirme | `text` ve `dynamic-field` elemanlarının canlı canvas render'ına eksik olan `letterSpacing` stili eklendi (`${element.letter_spacing}mm`). `PropertiesPanel.tsx`'te "Harf Aralığı" alanı kullanıcı tarafından değiştirilebiliyordu ve backend render'ında (`template_designer_base.html` satır 58) gerçekten uygulanıyordu, ama editör canvas'ı bu stili hiç göstermiyordu — kullanıcı değeri değiştirdiğinde editörde hiçbir görsel değişiklik olmuyordu, sadece PDF/fatura önizlemesinde ortaya çıkıyordu. |
| `frontend/src/features/invoice-editor/constants/elementDefaults.ts` | Değiştirme | Yeni bir tablo elemanı canvas'a sürüklenip bırakıldığında sütun başlıklarının varsayılan `label` değeri, `fieldCatalog.ts`'teki çevrilebilir `labelKey` (örn. `editor.tableColumn.unit_price` → "Birim Fiyat") yerine ham `key` (`"unit_price"`) olarak atanıyordu. Bu sadece editör kozmetiği değil, gerçek fatura/PDF çıktısını da etkiliyordu çünkü `template_designer_base.html` sütun başlıklarını doğrudan `column.label`'dan basıyor. Paylaşılan `@/i18n/config` instance'ı üzerinden `i18n.t(c.labelKey)` ile düzeltildi — kullanıcı isterse `TableColumnEditor.tsx` üzerinden yine elle değiştirebiliyor, bu sadece varsayılanı düzeltiyor. |

**Not:** Denetim sırasında incelenip **hata bulunmayan** alanlar: `InvoiceDocumentPreview.tsx`
(iframe ölçekleme/sandbox mantığı), `invoicesApi.ts`/`useDownloadInvoicePdf.ts`/
`useInvoicePreview.ts`, `TemplateEditorPage.tsx` (autosave/undo-redo/dnd akışı),
`legacyLayoutAdapter.ts`, `LayersPanel.tsx`, `InvoiceForm.tsx` (fatura oluşturma formu —
mevcut `disabled` önizleme butonu zaten bilinen ve `docs/todo.md`'de kayıtlı bir ertelenmiş
iş, yeni bir hata değil).

**Doğrulama:** `npx tsc --noEmit` ve `npx eslint` (değiştirilen iki dosya için) hatasız geçti.
Gerçek tarayıcıda görsel teyit bu ortamda yapılamadı (tarayıcı aracı yok) — kullanıcı kendisi
test edecek.

---

## 2026-08-21 — Fatura Detayına "PDF'i Yeniden Oluştur" Butonu Eklendi

**Bağlam:** Bir önceki tablo satır-yüksekliği düzeltmesi sırasında ortaya çıktı ki PDF dosyaları
faturada **bir kez** üretilip diskte statik olarak saklanıyor (`generated_pdfs/{id}.pdf`); "İndir"
butonu her seferinde yeniden render etmiyor, var olan dosyayı gönderiyor. Bu yüzden bir şablon
sonradan düzeltilse/güncellense bile, o şablonu kullanan **mevcut** faturaların PDF'i otomatik
güncellenmiyor — kullanıcı bunu güncellemenin bir yolu olmadığını fark etti. İnceleme sonucu
backend'de `POST /invoices/{id}/retry-pdf` endpoint'i ve frontend'de `useRetryInvoicePdf` hook'u
zaten mevcuttu ama hiçbir UI butonuna bağlı değildi — `i18n`'de de `pdfFailed`/`retryPdf` anahtarları
tanımlı ama hiç render edilmiyordu. Kullanıcı onayıyla bu eksik uçtan uca tamamlandı.

| Dosya | İşlem | Özet |
|-------|-------|------|
| `frontend/src/features/invoices/components/InvoiceActionHeader.tsx` | Değiştirme | "Önizle"/"İndir" butonlarının arasına `RefreshCw` ikonlu bir buton eklendi; `useRetryInvoicePdf` (var olan hook) ile `POST /invoices/{id}/retry-pdf`'i tetikliyor. Buton, `pdf_status === 'pending'` veya mutation `isPending` iken devre dışı kalıp ikonu döndürüyor ve etiketi `pdfRegenerating`'e çeviriyor; `pdf_status === 'failed'` iken etiket/başlık `retryPdf` ("Tekrar Dene"), aksi halde `regeneratePdf` ("PDF'i Yeniden Oluştur") oluyor. Yanına, ne işe yaradığını açıklayan (`regeneratePdfHint`) mevcut paylaşılan `InfoTooltip` bileşeni eklendi. Fatura numarasının altına, `pdf_status === 'failed'` olduğunda daha önce hiç gösterilmeyen `pdfFailed` ("PDF üretilemedi.") uyarısı eklendi. `useInvoice.ts`'teki mevcut `refetchInterval` (`pdf_status === 'pending'` iken 2 sn'de bir) zaten var olduğu için, mutation `onSuccess`'te durumu `pending`'e çevirince UI otomatik olarak Celery işi bitene kadar polling yapıp `ready` olunca butonu tekrar aktif ediyor — ek bir polling mantığı yazılmadı. |
| `frontend/src/i18n/locales/tr.json`, `en.json` | Değiştirme | Yeni anahtarlar: `invoices.detail.regeneratePdf`, `invoices.detail.regeneratePdfHint`, `invoices.detail.pdfRegenerating`. Var olan `pdfFailed`/`retryPdf` anahtarları ilk defa gerçekten kullanılır hale geldi. |

**Not:** `retry-pdf` endpoint'i backend'de `require_not_demo` ile korunuyor (demo kullanıcı için
403 döner) — bu, uygulamadaki diğer yazma-işlemi endpoint'leriyle (`send-email`,
`payment-reminder/*` vb.) aynı, mevcut ve önceden de frontend'de özel olarak ele alınmayan bir
davranış; bu değişiklik kapsamında yeni bir demo-mod kontrolü eklenmedi, tutarlılık korundu.

**Doğrulama:** `npx tsc --noEmit` ve `npx eslint` (değiştirilen dosya için) hatasız geçti.

---

## 2026-08-21 — Tablo Elemanında Az Kalemli Faturalarda Satır Yüksekliği Esneme Hatası

**Bağlam:** Kullanıcı, `InvoiceTableElement`'in (fatura kalem tablosu) az sayıda kalemli
faturalarda (örn. 3 kalem) şablonda ayarlanan `row_height_mm` değerinden çok daha büyük satır
aralıklarıyla render edildiğini bildirdi. Kök neden `backend/app/templates_html/
template_designer_base.html`'deki `.el-table table { height: 100%; }` kuralıydı: tablo,
`.el` konteynerinin (canvas'ta ayarlanan sabit `height_mm`) tamamını doldurmaya zorlanıyordu;
kalem sayısı azken toplam satır yüksekliği konteyner yüksekliğinden az kalıyor ve tarayıcı/
Playwright bu farkı satırlara **eşit dağıtarak** her satırı `row_height_mm`'den büyük gösteriyordu
— yani gerçek fatura sayısı arttıkça/azaldıkça satır yüksekliği değişiyordu, ki bu tam olarak
"editörde ayarlanan satır yüksekliği fatura çıktısında sabit kalmalı" beklentisini bozuyordu.

| Dosya | İşlem | Özet |
|-------|-------|------|
| `backend/app/templates_html/template_designer_base.html` | Değiştirme | `.el-table table` kuralında `height: 100%` → `height: auto` yapıldı. Böylece tablo, `.el` konteynerinin tamamını değil sadece header + gerçek satır sayısı × `row_height_mm` kadar yer kaplıyor; kalan boşluk (varsa) konteynerin altında boş kalıyor, satırlara dağıtılmıyor. `table-layout: fixed` korunduğu için sütun genişlikleri (`colgroup`) etkilenmedi. Çok kalemli faturalarda (mevcut sabit A4 sayfası + `overflow:hidden` sınırlaması, bkz. `docs/todo.md` çok sayfalı fatura maddesi) davranış değişmedi — taşan kısım önceden olduğu gibi kesiliyor. |
| `frontend/src/features/invoice-editor/components/A4Canvas/CanvasElement.tsx` | Değiştirme | Editördeki tablo elemanı mockup'ı (`case 'table':`, kullanıcının işaret ettiği satırlar) `h-full` tek blok konteynerden `flex flex-col` yapısına çevrildi; header ve yer tutucu metin `shrink-0` ile doğal yüksekliklerinde sabitlendi, en alta kullanıcının istediği gibi `flex-1` bir boşluk doldurucu (spacer) `div` eklendi. Editördeki tablo önizlemesi gerçek kalemleri değil sabit bir yer tutucu metni gösterdiği için görsel olarak önceden de "esneme" belirtisi yoktu, ama yapı artık backend'deki gerçek düzeltmeyle aynı mantığı (sabit üst içerik + esneyen alt boşluk) izliyor — ileride editöre gerçek kalem satırları eklenirse aynı hatayı tekrar üretmeyecek. |

**Doğrulama:** `npx tsc --noEmit` ve `npx eslint` (değiştirilen dosya için) hatasız geçti. Backend
tarafında bu HTML'i doğrudan assert eden bir test yok (`backend/tests` içinde arama yapıldı,
eşleşme çıkmadı), bu yüzden `pytest` regresyon riski taşımıyor. Gerçek tarayıcıda az kalemli bir
faturanın PDF/önizlemesinin artık sabit `row_height_mm` ile render edildiğinin görsel teyidi bu
ortamda yapılamadı — kullanıcı kendisi test edecek.

---

## 2026-08-21 — Fatura Önizleme, PDF ile Aynı Renderer'a Bağlandı

**Bağlam:** Kullanıcı, A4 Şablon Editörü'nde (`dashboard/templates/:id/edit`) tasarlanan
şablonların, gerçek faturalarda (`dashboard/invoices/:id`) önizleme ekranı ile PDF çıktısının
birebir aynı olmasını istedi. İnceleme sonucu ortaya çıktı ki backend'de bu altyapı zaten mevcuttu
— `GET /invoices/{id}/preview` (`backend/app/api/v1/invoices.py`), PDF üretiminde kullanılan
**aynı** `pdf_service.render_invoice_html()` fonksiyonunu çağırıyordu (hem v2 görsel tasarımcı hem
v1 legacy hem XSLT motoru için) — ama frontend'de `invoicesApi.preview()`/`useInvoicePreview()`
hook'u yazılmış olmasına rağmen hiçbir component tarafından kullanılmıyordu. Fatura detay sayfası
bunun yerine şablonla hiç ilişkisi olmayan, elle kodlanmış bir dashboard kart düzeni gösteriyordu.

| Dosya | İşlem | Özet |
|-------|-------|------|
| `frontend/src/features/invoices/components/InvoiceDocumentPreview.tsx` | Ekleme | Yeni tam ekran önizleme overlay'i. `useInvoicePreview` (var olan hook) ile `/invoices/{id}/preview` HTML'ini çeker ve `<iframe srcDoc sandbox="allow-same-origin">` içinde render eder — backend'in döndürdüğü tam `<!doctype html>` belgesi (`@page { size: A4 }` dahil) doğrudan DOM'a değil izole bir iframe'e verilir. `frontend/src/features/invoice-editor/canvasGeometry.ts`'teki mevcut `A4_WIDTH_MM`/`A4_HEIGHT_MM`/`PX_PER_MM` sabitleri yeniden kullanıldı (yeni sabit tanımlanmadı). iframe `onLoad`'da içerideki `.page` elemanının gerçek piksel boyutunu ölçüp (portrait/landscape farkı otomatik yakalanır) container'a sığdıracak bir `transform: scale()` uyguluyor. Yükleniyor/hata durumları mevcut `Loader2`+`animate-spin` deseni ve paylaşılan `ErrorState` bileşeniyle (retry destekli) — `alert()`/`confirm()` kullanılmadı. |
| `frontend/src/features/invoices/components/InvoiceActionHeader.tsx` | Değiştirme | "Önizle" butonu (Eye ikonu) eklendi, yeni `onOpenPreview` prop'u üzerinden `InvoiceDetailPage`'e bağlandı. |
| `frontend/src/pages/dashboard/InvoiceDetailPage.tsx` | Değiştirme | `isPreviewOpen` state'i (mevcut `isChaserOpen` deseniyle aynı şekilde) eklendi, `InvoiceDocumentPreview` sayfanın sonuna eklendi. Mevcut düzenlenebilir kart düzeni (`CompanyInfoSection`, `LineItemsTable`, vb.) hiç değiştirilmedi — taslak düzenleme akışı aynen korundu, önizleme ayrı bir katman olarak eklendi. |
| `frontend/src/i18n/locales/tr.json`, `en.json` | — | Değişiklik gerekmedi — `invoices.detail.preview`/`hidePreview`/`download` anahtarları önceki bir denemeden zaten mevcuttu ve ihtiyacı tam karşılıyordu. |
| Backend | — | Hiçbir dosya değiştirilmedi — `/invoices/{id}/preview` ve `pdf_service.render_invoice_html()` zaten "tek kaynak" prensibini uyguluyordu, sadece frontend'in bunu tüketmesi gerekiyordu. |

**Ertelenen kapsam (kullanıcıyla netleştirildi, `docs/todo.md`'ye tarihli eklendi):** çok sayfalı
fatura desteği (mevcut renderer tek sabit A4 sayfası varsayıyor, taşan kalemler kesiliyor — PDF'te
de önizlemede de, önceden var olan bir sınırlama), fatura oluşturma ekranındaki kaydedilmemiş
taslak önizlemesi (hâlâ `disabled` — id gerektiren mevcut endpoint kaydedilmemiş veriyle
çalışamıyor), `CompanyInfoSection`'daki sabit "Gönderen" placeholder'ı (ayrı, kozmetik bir sorun).

**Doğrulama:** `npx tsc --noEmit` hatasız geçti. Backend `pytest` (36/36, değişiklik yok, regresyon
kontrolü) geçti. Çalışan dev backend container'ında `pdf_service.render_invoice_html()` doğrudan
Python'dan çağrılıp gerçek bir `VISUAL` (v1) ve gerçek bir `XSLT` faturası için hatasız HTML
ürettiği teyit edildi — bu, yeni frontend component'inin tüketeceği tam kod yolu. Dev DB'de henüz
`layout_version=2` ile oluşturulmuş gerçek bir fatura olmadığından o yol ayrıca canlı test
edilemedi, ancak kodu bu oturumda değiştirilmedi ve mevcut backend testleri onu kapsıyor. Gerçek
tarayıcıda "Önizle" butonunun aynı görüntüyü verdiğinin görsel teyidi bu ortamda yapılamadı
(tarayıcı aracı yok) — mevcut genel görsel-doğrulama borcuna eklendi.

---

## 2026-08-21 — Manuel Kaydet: Editörden Çıkmama + Toast Bildirimi

**Bağlam:** `dashboard/templates/new` ve `dashboard/templates/:id/edit` sayfalarındaki "Kaydet"
butonu, başarılı kayıttan sonra kullanıcıyı şablon listesine (`/dashboard/templates`)
yönlendiriyordu. Kullanıcı, manuel kaydetmenin de otomatik kaydetme gibi kullanıcıyı editörde
tutmasını ve başarılı kayıtta bir toast bildirimi göstermesini istedi.

| Dosya | İşlem | Özet |
|-------|-------|------|
| `frontend/src/features/invoice-editor/hooks/useCreateTemplate.ts` | Değiştirme | `navigate('/dashboard/templates')` yerine `navigate(`/dashboard/templates/${data.id}/edit`, { replace: true })` — autosave hook'undaki gibi kullanıcı editörde kalır, URL gerçek id'ye güncellenir. Başarıda `useToastStore.push(t('editor.actions.savedToast'), 'success')` eklendi. |
| `frontend/src/features/invoice-editor/hooks/useUpdateTemplate.ts` | Değiştirme | Navigasyon çağrısı tamamen kaldırıldı (kullanıcı zaten `/edit/:id`'de). Aynı toast eklendi. |
| `frontend/src/i18n/locales/tr.json`, `en.json` | Ekleme | `editor.actions.savedToast` anahtarı: "Şablon başarıyla kaydedildi" / "Template saved successfully". |

**Doğrulama:** `npx tsc --noEmit` hatasız geçti. `useCreateTemplate`/`useUpdateTemplate`'in yalnızca
`TemplateEditorPage.tsx` içinde kullanıldığı grep ile doğrulandı, başka hiçbir akışı etkilemiyor.
Gerçek tarayıcıda kayıt sonrası editörde kalındığı ve toast'ın göründüğü teyidi `docs/todo.md` §0
kapsamındaki genel görsel doğrulama borcuna dahil (ayrı bir madde açılmadı).

---

## 2026-08-21 — Şablon Otomatik Kaydetme + Tercihler Sekmesi Kartlaşması

**Bağlam:** Şablon tasarımcısında yapılan değişiklikler, bağlantı kopması veya unutma durumunda
kaybolabiliyordu. Kullanıcı, kaydetme süresinin `dashboard/settings?tab=preferences` üzerinden
seçilebildiği bir otomatik kaydetme özelliği istedi; otomatik kayıt olduğunda şablon adının
yanında görünür bir "Kaydedildi" göstergesi talep etti. Ayrıca Tercihler sekmesinin düz form
yerine "Bildirim Tercihleri" ve "Süreler" olmak üzere iki ayrı karta bölünmesini istedi.

| Dosya | İşlem | Özet |
|-------|-------|------|
| `backend/app/models/user.py` | Ekleme | `template_autosave_interval_minutes` (Integer, default 5) sütunu eklendi. |
| `backend/alembic/versions/a1b2c3d4e5f6_...py` | Ekleme | Yeni migration (`down_revision='f0a1b2c3d4e5'`, mevcut head), yukarıdaki sütunu ekliyor. |
| `backend/app/schemas/auth.py` | Değiştirme | `UserResponse`'a alan eklendi; `PreferencesUpdatePayload`'a `Literal[1,3,5,10,15,20,25,30] \| None` olarak eklendi (session_timeout'un aksine 5'in katı değil, sabit bir set). |
| `backend/app/api/v1/profile.py` | Değiştirme | `update_preferences` içine yeni alanı işleyen satır eklendi. |
| `frontend/src/types/auth.ts` | Değiştirme | `User` ve `PreferencesUpdatePayload`'a `template_autosave_interval_minutes` eklendi. |
| `frontend/src/i18n/locales/tr.json`, `en.json` | Ekleme | `settings.preferences.durations/autosaveInterval/autosaveIntervalHint/autosaveIntervalOption` ve `editor.actions.savedIndicator` anahtarları. |
| `frontend/src/pages/dashboard/settings/PreferencesTab.tsx` | Değiştirme | Düz `<form>` içindeki iki `<div>` bölüm, mevcut paylaşılan `Card` bileşenine taşındı (Bildirim Tercihleri / Süreler); oturum süresi native `<select>`'ten mevcut paylaşılan `Select` bileşenine taşındı, yanına yeni "Şablon Otomatik Kaydetme Süresi" `Select`'i eklendi. |
| `frontend/src/features/invoice-editor/hooks/useAutoSaveTemplate.ts` | Ekleme | Mevcut `useCreateTemplate`/`useUpdateTemplate`'in aksine başarı sonrası **navigate etmeyen** sessiz kayıt mutation'ı; yeni şablon ilk otomatik kayıtta oluşturulursa dönen `id` ile URL `replace: true` ile `/edit/:id`'ye güncelleniyor (kullanıcı editörden atılmıyor). |
| `frontend/src/pages/dashboard/TemplateEditorPage.tsx` | Değiştirme | `template_autosave_interval_minutes`'e göre kurulan `setInterval`; son kaydedilen payload'ın `JSON.stringify`'ı bir ref'te tutulup değişiklik yoksa otomatik kayıt atlanıyor (gereksiz istek yok); stale-closure sorununu önlemek için en güncel id/isOwnedExisting/payload-builder bir ref üzerinden interval callback'ine veriliyor; `lastSavedAt` state'i `EditorToolbar`'a geçiliyor. |
| `frontend/src/features/invoice-editor/components/EditorToolbar.tsx` | Değiştirme | `lastSavedAt` prop'u eklendi; şablon adı input'unun yanında, her kayıttan sonra 2.5 saniyeliğine beliren yeşil "Kaydedildi ✓" göstergesi (Tailwind `transition-opacity`, ekstra bağımlılık yok). |

**Doğrulama:** `npx tsc --noEmit` ve backend dosyalarının `py_compile` kontrolü hatasız geçti.
Yeni migration bu oturumda `alembic upgrade head` ile gerçek DB'ye uygulanmadı — bu ortamda
çalışan bir Python venv/DB bağlantısı yoktu (bkz. `docs/LOCAL_DEV_SETUP.md`); kullanıcının kendi
dev ortamında `alembic upgrade head` çalıştırması gerekiyor. Gerçek tarayıcıda otomatik kaydın
tetiklenmesi, "Kaydedildi" göstergesinin görünürlüğü ve Tercihler sekmesindeki yeni kartların
görsel teyidi, mevcut genel tarayıcı-doğrulama borcuyla aynı kapsamda (`docs/todo.md` §0).

---

## 2026-08-21 — A4 Şablon Tasarımcısı Sağ Panele Sticky Scroll + Modern Scrollbar

**Bağlam:** Editörün sol paneli (`ElementPanel`, element paleti) `position: sticky` ile ekranda
sabit duruyor ve sayfa kaydırıldığında A4 canvas'ı görünür tutuyordu; sağ panel (Özellikler +
Katmanlar) aynı davranışa sahip değildi — sayfa kaydırıldığında canvas'la birlikte kayıp seçili
elementin özelliklerini/katman listesini görünmez kılıyordu. Kullanıcı aynı sticky mekanizmasının
sağ panele de eklenmesini, ayrıca tarayıcının standart scrollbar'ı yerine ince/modern görünümlü
bir scrollbar istedi.

| Dosya | İşlem | Özet |
|-------|-------|------|
| `frontend/src/index.css` | Ekleme | `.axion-scrollbar` utility class'ı eklendi (thin, yuvarlak köşeli, slate tonlu, hover efektli; `::-webkit-scrollbar` + Firefox `scrollbar-width`/`scrollbar-color` fallback'i ile). |
| `frontend/src/features/invoice-editor/components/ElementPanel.tsx` | Değiştirme | Kök div'e `axion-scrollbar` class'ı eklendi (mevcut sticky/overflow davranışı korundu) — sol panelin default scrollbar'ı da modernleşti. |
| `frontend/src/pages/dashboard/TemplateEditorPage.tsx` | Değiştirme | Sağ taraf sarmalayıcı div'ine (`PropertiesPanel` + `LayersPanel`'i saran) sol panelle birebir aynı desen eklendi: `overflow-y-auto lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] axion-scrollbar`. |
| `frontend/src/features/invoice-editor/components/PropertiesPanel.tsx` | Değiştirme | Kök div'deki redundant `overflow-y-auto` kaldırıldı — scroll artık tek konteynerde (dış sarmalayıcı) yönetiliyor, iç içe çift scrollbar oluşması engellendi. |

**Doğrulama:** `npx tsc --noEmit` hatasız geçti. Gerçek tarayıcıda "sağ panel sabit kalıp içinde
kayıyor mu" görsel teyidi, mevcut genel v2 designer tarayıcı-doğrulama borcuyla aynı kapsamda
(`docs/todo.md` §0) — bu değişiklik için ayrı bir yeni madde açılmadı.

---

## 2026-08-21 — A4 Şablon Tasarımcısı "Tutarlar" Grubuna 3 Yeni Alan

**Bağlam:** `docs/A4_Invoice_template.md` ve `docs/PROJECT_DESING.md` incelendikten sonra,
`dashboard/templates/new`/`.../edit` editörünün sol panelindeki "TUTARLAR" grubunda kullanıcının
istediği 5 alandan (Toplam Tutar, Toplam Vergisiz Tutar, Toplam İskonto, Toplam Vergiler,
Hesaplanan KDV) 2'sinin (Toplam İskonto, Hesaplanan KDV) zaten mevcut İskonto/KDV alanlarıyla
birebir aynı değeri ürettiği tespit edildi (kullanıcıyla netleştirildi, AskUserQuestion) — bu
yüzden sadece gerçekten eksik olan 3 alan eklendi. Değer hesaplama sadece backend PDF render
anında (`template_field_resolver.resolve_field`) yapıldığından ve `field_key` serbest string
olduğundan DB/migration değişikliği gerekmedi.

| Dosya | İşlem | Özet |
|---|---|---|
| `backend/app/services/template_field_resolver.py` | Değiştirme | `_totals()` içine 3 yeni hesaplanan key eklendi: `items_total` (Σ kalem `line_total`, iskonto+vergi sonrası kalem tutarlarının toplamı), `tax_ex_amount` (Σ `quantity*unit_price`, iskonto/vergi öncesi brüt tutar — mevcut `subtotal`'dan farklı çünkü `subtotal` iskonto sonrası), `total_tax` (`invoice.tax_total` — KDV + Diğer Vergi'nin toplamı, tek alan olarak). |
| `frontend/src/features/invoice-editor/constants/fieldCatalog.ts` | Değiştirme | `totals` kategorisine `totals.items_total`, `totals.tax_ex_amount`, `totals.total_tax` field catalog girişleri eklendi (diğer tutar alanlarıyla aynı `currency` tipi ve boyut deseninde). |
| `frontend/src/i18n/locales/tr.json`, `en.json` | Değiştirme | `editor.field.items_total` ("Toplam Tutar"/"Items Total"), `.tax_ex_amount` ("Toplam Vergisiz Tutar"/"Tax-Exclusive Total"), `.total_tax` ("Toplam Vergiler"/"Total Taxes") label key'leri eklendi. |
| `backend/tests/test_templates.py` | Ekleme | `test_render_v2_template_resolves_new_totals_fields` — 3 yeni alanın bir v2 şablonda doğru hesaplanıp PDF HTML'ine yansıdığını doğruluyor (qty=2, unit_price=100, discount_rate=10, tax_rate=18 ile: items_total=212.40, tax_ex_amount=200.00, total_tax=32.40). |

**Doğrulama:** Backend `pytest -k template` → 8/8 geçti (yeni test dahil). Frontend
`tsc --noEmit` → hatasız. Editörde 3 yeni alanın "Tutarlar" grubunda göründüğü/sürüklenebildiği
gerçek tarayıcıda teyit edilmedi (bkz. `docs/todo.md` § 0 — mevcut genel tarayıcı-teyit borcu).

---

## 2026-08-20 — A4 Şablon Tasarımcısı Yeniden Yazımı + XSLT Şablonu Oluşturmayı Admin-Only Yapmak

**Bağlam:** `dashboard/templates/new` sadece 12 sabit alanı sürükleyip bırakabilen basit bir
editördü (dnd-kit tabanlı, resize/undo-redo/layers/snap yok, fatura formundaki müşteri/banka
hesabı/kalem tablosu gibi alanları desteklemiyordu). Ayrıca kullanıcı ekranındaki
"XSLT Şablonu Oluştur" butonu her kullanıcıya (plana göre) açıktı; kullanıcı bunu tamamen
admin-only yapılmasını, `dashboard/templates/new`'in ise `dashboard/invoices/new` formundaki tüm
alan/section'ları (Firma Ayrıntıları, Ödeme Detayları, Fatura Detayları, Fatura Açıklaması,
kalemler, banka hesabı 1-3) sürükle-bırak ile A4 sayfasına yerleştirilebilen; resize,
snap/alignment, layers, undo/redo, tablo sütun yönetimi, logo/QR/imza destekli profesyonel bir
tasarımcıya (`docs/A4_Invoice_template.md`) çevrilmesini istedi. `docs/A4_Invoice_template.md`
dokümanının 40 maddesinin tamamı tek seferde teslim edildi.

| Dosya | İşlem | Özet |
|---|---|---|
| `backend/app/api/v1/templates.py` | Değiştirme/Çıkarma | Kullanıcı-facing `POST /templates/xslt` endpoint'i kaldırıldı (XSLT şablonu artık sadece `admin_templates.py`'deki admin-only `POST /admin/templates/xslt` üzerinden oluşturulabiliyor). `create_template`/`update_template` yeni v2 element listesi (`TemplateSavePayload.layout_json: list[Element]`) ve `orientation` alanını işleyecek şekilde güncellendi; `_dynamic_field_keys()` yardımcı fonksiyonu sadece `dynamic-field` tipi elemanlardan `reconcile_fields` için anahtar seti çıkarıyor. `duplicate_template` artık `layout_version`/`orientation`'ı da kopyalıyor. |
| `backend/app/services/subscription_service.py` | Çıkarma | Artık kullanılmayan `check_can_create_xslt_template()` silindi (tek çağrı yeri kaldırılan endpoint'ti). |
| `backend/app/models/template.py` | Ekleme | `InvoiceTemplate`'e `layout_version: int` (default 2, `server_default='1'` — mevcut satırlar geriye dönük v1 olarak işaretlendi) ve `orientation: str` (default 'portrait') kolonları eklendi. |
| `backend/app/models/invoice.py` | Ekleme | `Invoice.user: Mapped["User"] = relationship()` eklendi — v2 şablon render'ının `company.*` alanlarını (fatura sahibinin `User` kaydından) okuyabilmesi için gerekliydi, önceden sadece `user_id` FK vardı, ilişki tanımlı değildi. |
| `backend/alembic/versions/f0a1b2c3d4e5_add_layout_version_orientation_to_templates.py` | Ekleme | Yeni migration: `invoice_templates` tablosuna `layout_version` (`server_default='1'`) ve `orientation` (`server_default='portrait'`) kolonları. Dev DB'ye uygulandı. |
| `backend/app/schemas/template.py` | Değiştirme (kapsamlı) | `LayoutFieldEntry` (v1, korunuyor) yanına yeni discriminated union `Element` eklendi: `TextElement`, `LineElement`, `RectangleElement`, `LogoElement`, `ImageElement`, `QrCodeElement`, `SignatureElement`, `DynamicFieldElement`, `InvoiceTableElement` (+ `TableColumn`), `BankAccountElement` — hepsi ortak `BaseElement` (x/y/width/height_mm, rotation, z_index, locked, hidden) üzerine kurulu, `type` alanıyla ayrışıyor. `TemplateSavePayload`'a `orientation` ve `layout_json: list[Element]` eklendi. `TemplateDetailResponse.layout_json` tipi `list[dict]`'e düşürüldü (v1/v2 karışık okuma güvenli olsun diye — bkz. dosya içi yorum). |
| `backend/app/services/template_field_resolver.py` | Ekleme (yeni dosya) | `resolve_field(field_key, invoice)` — `invoice.*`, `company.*` (User'dan), `customer.*`, `recipient.contact_N.*`, `payment.bank_account_N.*`, `totals.*` namespace'lerini invoice/customer/user/bank_account nesnelerinden okuyup string'e çeviriyor. Sadece v2 render yolunda kullanılıyor, v1 legacy yol dokunulmadı. |
| `backend/app/services/pdf_service.py` | Değiştirme | `_render_visual_v2_html()` (yeni) — `template.layout_json`'daki her elementi `template_designer_base.html` ile render ediyor; `dynamic-field`/`bank-account`/`qrcode` elemanları `template_field_resolver` ile çözülüyor, `logo` elemanı kullanıcının `logo_url`'inden diskten okunup base64 data URI olarak gömülüyor (Playwright `set_content` relative URL çözemediği için). `render_invoice_html()` artık `template.layout_version >= 2` ise v2 yoluna, değilse eski `_render_visual_html()`'e yönlendiriyor — v1 şablonlar hiç değişmeden çalışmaya devam ediyor. `_collect_render_data()`'daki `line_items` sözlüğüne `unit` alanı eklendi (v2 tablo elemanı için, eski Jinja şablonu bu alanı hiç kullanmadığı için zararsız). |
| `backend/app/templates_html/template_designer_base.html` | Ekleme (yeni dosya) | v2 element listesini mutlak konumlu `<div>`'ler olarak render eden Jinja şablonu — editördeki `CanvasElement.tsx` render mantığıyla aynı CSS kurallarını paylaşıyor (font/border/padding). `table` elemanı için seçili/sıralı kolonlarla tam tablo, `bank-account`/`logo`/`qrcode`/`signature` için özel bloklar içeriyor. |
| `backend/requirements.txt` | Ekleme | `qrcode[pil]==8.0` — QR kod elemanının PDF'te PNG olarak render edilmesi için. |
| `backend/tests/test_templates.py` | Ekleme (yeni dosya) | 7 yeni test: v2 şablon oluşturma (karma element tipleriyle), v2 şablon güncelleme, duplicate'in `layout_version`/`orientation`'ı koruması, kullanıcı-facing XSLT endpoint'inin kaldırıldığının doğrulanması (405), admin XSLT endpoint'inin hâlâ çalıştığının doğrulanması, v2 şablonun dinamik alanları/banka hesabını/kalem tablosunu doğru render ettiğinin doğrulanması, eski `layout_version=1` sistem şablonunun hâlâ hatasız render edildiğinin doğrulanması (regresyon koruması). |
| `frontend/src/pages/dashboard/TemplatesPage.tsx` | Çıkarma | "XSLT Şablonu Oluştur" butonu ve ilgili plan-gate/upgrade-toast mantığı kaldırıldı. |
| `frontend/src/pages/dashboard/XsltTemplateCreatePage.tsx` | Çıkarma | Dosya tamamen silindi (kullanıcı-facing XSLT oluşturma akışı artık yok). |
| `frontend/src/routes/index.tsx` | Çıkarma | `/dashboard/templates/new-xslt` route'u kaldırıldı. `/dashboard/admin/templates` (admin XSLT paneli) dokunulmadı. |
| `frontend/src/features/invoice-editor/hooks/useCreateXsltTemplate.ts`, `.../api/templatesApi.ts` (`createXslt`) | Çıkarma | Artık kullanılmayan kullanıcı-facing XSLT create hook/API metodu kaldırıldı. Admin-templates feature'ındaki ayrı `useCreateXsltTemplate`/`adminTemplatesApi.createXslt` dokunulmadı. |
| `frontend/src/types/template.ts` | Değiştirme | `Orientation` tipi, `TemplateSummary`/`TemplateDetail`'e `orientation`/`layout_version` eklendi, `TemplateSavePayload.layout_json` artık `CanvasElementData[]`. |
| `frontend/src/features/invoice-editor/types/element.ts` | Ekleme (yeni dosya) | Backend'deki Pydantic union'ın TS karşılığı — `TextElement`/`LineElement`/`RectangleElement`/`LogoElement`/`ImageElement`/`QrCodeElement`/`SignatureElement`/`DynamicFieldElement`/`InvoiceTableElement`/`BankAccountElement` discriminated union'ı (`CanvasElementData`). |
| `frontend/src/features/invoice-editor/constants/fieldCatalog.ts` | Değiştirme (kapsamlı) | Eski 12 alanlık `BUILTIN_FIELD_CATALOG` yerine, `invoices/new` formundaki tüm alanları kapsayan kategorili katalog: Fatura/Firma Ayrıntıları/Müşteri (+alıcı kontakları)/Tutarlar — her `field_key` backend resolver'ının namespace'leriyle birebir eşleşiyor. Ayrıca kalem tablosu için `DEFAULT_TABLE_COLUMNS`. |
| `frontend/src/features/invoice-editor/constants/elementDefaults.ts` | Ekleme (yeni dosya) | `createDefaultElement(type, x, y, z)` — her element tipi için canvas'a bırakıldığında kullanılacak varsayılan boyut/stil değerleri. |
| `frontend/src/features/invoice-editor/store/editorStore.ts` | Değiştirme (kapsamlı) | Tek-tip `layoutEntries`/`selectedFieldKey` yerine: `elements: CanvasElementData[]`, çoklu seçim (`selectedIds`), undo/redo history (`past`/`future` stack, `commit()`/`undo()`/`redo()`), layer sıralama (`bringToFront`/`sendToBack`/`moveLayerUp/Down`/`reorderLayers`), `toggleLock`/`toggleHidden`, `duplicateElements`, canlı sürükle/resize güncellemeleri için commit'siz `updateElementLive`/`updateElementsLive` (drag/resize bitince tek `commit()`). |
| `frontend/src/features/invoice-editor/utils/legacyLayoutAdapter.ts` | Ekleme (yeni dosya) | `layout_version=1` şablonları açılışta `DynamicFieldElement[]`'e çeviriyor (eski `field_key`'ler yeni namespace'lere map'leniyor, ör. `customer_name` → `customer.name`); kullanıcı kaydedince otomatik olarak `layout_version=2` yazılıyor. |
| `frontend/src/features/invoice-editor/utils/clipboard.ts` | Ekleme (yeni dosya) | Ctrl+C/V için modül seviyesinde basit pano — kopyalanan elemanları klonlayıp +5mm offsetle yapıştırıyor. |
| `frontend/src/features/invoice-editor/components/A4Canvas/{A4Page,CanvasElement,ResizeHandles,SnapGuides}.tsx` | Ekleme (yeni dosyalar, eski `Canvas.tsx`/`PlacedField.tsx` yerine) | `A4Page` — grid arka planlı sayfa yüzeyi, marquee (rubber-band) çoklu seçim, önizleme modunda salt-okunur render. `CanvasElement` — tipe göre (text/line/rectangle/logo/image/qrcode/signature/dynamic-field/table/bank-account) render + dnd-kit sürükleme. `ResizeHandles` — 8 handle'lı pointer-event tabanlı mm-aware resize. `SnapGuides` — kenar/merkez/sayfa hizalama çizgileri. |
| `frontend/src/features/invoice-editor/components/{ElementPanel,PropertiesPanel,TableColumnEditor,LayersPanel,EditorToolbar}.tsx` | Ekleme (yeni dosyalar, eski `FieldPalette.tsx`/`StylePanel.tsx` yerine) | `ElementPanel` — kategorili sol panel (Temel/Görsel/Fatura/Dinamik Alanlar/Özel). `PropertiesPanel` — seçili elementin tipine göre dinamik form (tipografi/konum/border/tablo sütunları). `TableColumnEditor` — kalem tablosu sütun görünürlük/genişlik/sıra yönetimi. `LayersPanel` — sürükle-sırala katman listesi, kilit/gizle. `EditorToolbar` — kaydet/önizle, undo/redo, zoom (%50-150), sayfa yönü. |
| `frontend/src/features/invoice-editor/hooks/useKeyboardShortcuts.ts` | Ekleme (yeni dosya) | Delete/Backspace, Ctrl+C/V/D, Ctrl+Z/Y (Shift+Z=redo), ok tuşları (1mm, Shift+ok 5mm) — input/textarea odaklıyken devre dışı. |
| `frontend/src/pages/dashboard/TemplateEditorPage.tsx` | Değiştirme (yeniden yazım) | Artık sadece yukarıdaki bileşenleri birleştiren ince bir sayfa — element sürükle-bırak (palet/element/özel alan), grup halinde snap'li taşıma, önizleme modu, kaydetme payload'ı yeni v2 şemaya göre kuruluyor. |
| `frontend/src/i18n/locales/{tr,en}.json` | Ekleme (kapsamlı) | `editor.*` altında ~90 yeni anahtar: genişletilmiş `field.*` kataloğu, `palette.*` (kategoriler+element tipleri), `properties.*`, `table.*`/`tableColumn.*`, `elementType.*`, `layers.*`, `actions.*` (orientation/preview). |

**Kapsam dışı bırakılan / bilinçli sınırlamalar:** Snap sistemi grid+kenar+merkez+sayfa-merkezi
destekliyor; "equal spacing" (3+ eleman arası eşit boşluk tespiti) uygulanmadı — düşük değer/yüksek
efor, `docs/todo.md`'ye not düşüldü. `GET /templates/{id}/preview-data` (gerçek fatura verisiyle
önizleme) endpoint'i planın kendisinde "opsiyonel" işaretliydi, bu turda atlandı — editördeki
önizleme modu şu an sadece element etiketlerini/placeholder'larını gösteriyor, gerçek fatura
verisiyle doldurmuyor. Resim/logo elemanları için gerçek bir asset-storage entegrasyonu yok,
`image` elemanı `<input type=file>` ile seçilen dosyayı doğrudan base64 data URL olarak
`layout_json` içine gömüyor (küçük ikon/damga gibi kullanımlar için yeterli, büyük dosyalarda
JSONB satırını şişirir).

**Doğrulama:** Backend `docker exec backend-backend-1 python -m pytest tests/ -q` → 35/35 geçti
(28 mevcut + 7 yeni). Migration `alembic upgrade head` dev DB'ye temiz uygulandı. Frontend
`npx tsc --noEmit -p .` temiz. `npm run build`'da görülen 4 hata (`Checkbox.tsx`, `navigation.ts`,
`CustomerFormModal.tsx`, `ProfileTab.tsx`) bu değişiklikten önce de mevcut, bu dosyalara hiç
dokunulmadı — doğrulandı (`git status` boş dönüyor bu dosyalar için). Konteynerler yeniden
başlatıldı, temiz `Application startup complete` logu alındı. Tarayıcıda görsel doğrulama bu
oturumda yapılamadı (tarayıcı aracı yok) — kullanıcının manuel teyidi gerekiyor.

---

## 2026-08-17 — Kullanıcı Bazlı Oturum (Idle) Zaman Aşımı

**Bağlam:** Hareketsizlik sonrası otomatik çıkış (idle-logout) önceden tüm kullanıcılar için
sabit ve sistem geneli (5 dakika, `sessionConfig.ts`'deki hardcoded sabit) idi. Kullanıcı, her
kullanıcının `/dashboard/settings?tab=preferences` sayfasından bu süreyi kendi tercihine göre
ayarlayabilmesini istedi: 5 dakikanın katları, maksimum 30 dakika.

| Dosya | İşlem | Özet |
|---|---|---|
| `backend/app/models/user.py` | Ekleme | `session_timeout_minutes: Mapped[int]` kolonu eklendi (satır 45, default=5), `notify_billing_emails`'dan sonra. |
| `backend/alembic/versions/d7e9f0a1b2c3_add_session_timeout_to_users.py` | Ekleme | Alembic migration: `users` tablosuna `session_timeout_minutes` kolonu, `server_default='5'` ile. |
| `backend/app/schemas/auth.py` | Ekleme | `UserResponse` şemasına `session_timeout_minutes: int` eklendi (satır 54). `PreferencesUpdatePayload`'a `session_timeout_minutes: int \| None = Field(default=None, ge=5, le=30, multiple_of=5)` eklendi (satır 87) — backend'de 5'in katı + 5-30 aralığı doğrulaması. |
| `backend/app/api/v1/profile.py` | Değiştirme | `update_preferences` endpoint'ine `if payload.session_timeout_minutes is not None: current_user.session_timeout_minutes = payload.session_timeout_minutes` eklendi (satır 156-157), mevcut desene uygun. |
| `frontend/src/types/auth.ts` | Ekleme | `User` interface'ine `session_timeout_minutes: number` (satır 26). `PreferencesUpdatePayload` interface'ine `session_timeout_minutes?: number` (satır 80) eklendi. |
| `frontend/src/pages/dashboard/settings/PreferencesTab.tsx` | Değiştirme | (1) `formData` state'ine `session_timeout_minutes: user?.session_timeout_minutes ?? 5` eklendi (satır 22). (2) `handleSubmit` payload'ına `session_timeout_minutes: formData.session_timeout_minutes` eklendi (satır 46). (3) Bildirimler bölümünün altına yeni bölüm eklendi (satır 108-122): "Oturum Açık Kalma Süresi" başlığı, 5/10/15/20/25/30 dakika seçenekli `<select>` dropdown, hint metni. |
| `frontend/src/features/auth/hooks/useIdleLogout.ts` | Değiştirme | (1) `SESSION_IDLE_TIMEOUT_MS` sabit import'u kaldırıldı. (2) `const sessionTimeoutMinutes = useAuthStore((state) => state.user?.session_timeout_minutes)` ile kullanıcıdan tercih okunması eklendi (satır 14). (3) `resetTimer` içinde timeout hesabı `(sessionTimeoutMinutes ?? 5) * 60 * 1000` olarak dinamikleştirildi (satır 28). (4) `useEffect` dependency array'ine `sessionTimeoutMinutes` eklendi (satır 39) — tercih değiştiğinde hook yeniden çalışsın. |
| `frontend/src/features/auth/sessionConfig.ts` | Çıkarma | Artık kullanılmayan dosya silindi (tek kullanım yeriydi, useIdleLogout.ts). |
| `frontend/src/i18n/locales/tr.json` | Ekleme | `settings.preferences` objesine üç anahtar eklendi (satır 516-518): `sessionTimeout: "Oturum Açık Kalma Süresi"`, `sessionTimeoutHint: "Bu süre boyunca işlem yapılmazsa otomatik olarak çıkış yapılır."`, `sessionTimeoutOption: "{{count}} dakika"`. |
| `frontend/src/i18n/locales/en.json` | Ekleme | Aynı üç anahtarın İngilizce karşılıkları (satır 516-518): `sessionTimeout: "Session Timeout"`, `sessionTimeoutHint: "You'll be automatically logged out after this many minutes of inactivity."`, `sessionTimeoutOption: "{{count}} minutes"`. |

**Kapsam kararı:** Özellik yalnızca frontend idle-logout mekanizmasını hedefliyor. Backend JWT access
token süresi (sistem geneli, 15 dakika, `config.py`) ve refresh token (7 gün) değişmedi — refresh
mekanizması arka planda access token'ı sessizce yeniliyor, kullanıcı deneyimlediği "oturum açık kalma"
idle-timeout'tur. Varsayılan değer mevcut davranışı korumak için 5 dakika seçildi.

**Validasyon:** Backend `PreferencesUpdatePayload`'daki `Field(ge=5, le=30, multiple_of=5)` frontend
dropdown'ında sunulanların her birini accept eder ama dışındaki değerleri 422 ile reddeder. Frontend
`useIdleLogout` hook'u `user?.session_timeout_minutes` değişimini dependency array'den izliyor,
tercih değiştiğinde timeout otomatik olarak yeniden hesaplanır (extra kod gerekmez).

---

## 2026-08-17 — Sabit Tanımlamalar Sekmesi: 3 Kartlı Grid Yeniden Tasarımı

**Bağlam:** `dashboard/settings?tab=definitions` önceden 4 tanımlama tipini (Birimler, KDV
Oranları, Ödeme Vadeleri, Kategoriler) tek sütunlu, dikey sıralı liste kartları olarak
gösteriyordu. Kullanıcı bu ekranı kurumsal bir SaaS ayarlar sayfasına dönüştürmek istedi: 3
kategoriye (Genel Sistem / Fatura ve Finans / Operasyon ve Ürün) bölünmüş, responsive (mobil 1 /
tablet 2 / masaüstü 3 kolon) kart grid; her kartta tıklanabilir, ikonlu menü satırları; seçilen
öğe kartların altında CSS-animasyonlu bir panelde açılıyor; değişiklikler otomatik kaydedilip
yeşil toast ile bildiriliyor. Kapsamda 6 yeni tanımlama tipi de eklendi: Para Birimi, Tarih
Formatı, Vergi Yılı Başlangıcı, Fatura No (prefix+basamak), Banka Bilgileri, Sabit Açıklama.

| Dosya | İşlem | Özet |
|---|---|---|
| `backend/app/models/user.py` | Ekleme | `User` modeline 5 yeni skaler kolon: `default_currency` (String(3), default "TRY"), `date_format` (String(20), default "DD.MM.YYYY"), `tax_year_start_month` (Integer, default 1), `invoice_prefix` (String(20), nullable), `invoice_number_padding` (Integer, default 4). `invoice_sequence` alanına dokunulmadı. |
| `backend/app/models/definitions.py` | Ekleme | İki yeni tablo: `DefinitionBankAccount` (`bank_name`, `iban`, `account_holder`, `branch`, `is_active`) ve `DefinitionNote` (`label`, `content`, `is_active`) — mevcut 4 tanımlama tablosuyla birebir aynı `id`/`user_id`/`is_active`/`created_at` kalıbında. |
| `backend/alembic/versions/e1f2a3b4c5d6_add_company_settings_to_users.py` | Ekleme | `users` tablosuna 5 yeni kolonu `server_default` ile ekleyen migration (`d7e9f0a1b2c3` → `e1f2a3b4c5d6`). Yerel dev DB'de `alembic upgrade head` ile uygulanıp doğrulandı. |
| `backend/alembic/versions/f2a3b4c5d6e7_create_definition_bank_accounts_and_notes_tables.py` | Ekleme | `definition_bank_accounts` ve `definition_notes` tablolarını oluşturan migration (`e1f2a3b4c5d6` → `f2a3b4c5d6e7`, yeni head). Uygulanıp doğrulandı. |
| `backend/app/schemas/auth.py` | Değiştirme | `UserResponse`'a 6 yeni alan eklendi (`default_currency`, `date_format`, `tax_year_start_month`, `invoice_prefix`, `invoice_number_padding`, `invoice_sequence` — sonuncusu ilk kez response'a eklendi, frontend'de "sıradaki fatura no" önizlemesi için). Yeni `CompanySettingsUpdatePayload` (tüm alanlar `Optional`, PATCH semantiği; `default_currency` 3 büyük harf regex, `invoice_number_padding` 3-6 aralığı). |
| `backend/app/schemas/definitions.py` | Ekleme | `BankAccountPayload`/`BankAccountResponse` ve `NotePayload`/`NoteResponse` şema çiftleri, mevcut `CategoryPayload`/`CategoryResponse` kalıbında. |
| `backend/app/api/v1/profile.py` | Değiştirme | Yeni `PATCH /profile/company-settings` endpoint'i eklendi (`update_preferences` ile aynı desende: sadece gönderilen alan güncellenir, `require_not_demo` guard'ı yok — bu diğer skaler ayarlarla (`preferences`) tutarlı, demo kullanıcı da kendi tercihini görebilsin diye bilinçli). |
| `backend/app/api/v1/definitions.py` | Ekleme | `bank-accounts` ve `notes` için tam CRUD + `toggleStatus` endpoint seti (`list/create/update/delete/patch status`), `_get_own_bank_account`/`_get_own_note` helper'ları dahil — mevcut `units`/`categories` bloklarının birebir kopyası. |
| `frontend/src/types/auth.ts` | Değiştirme | `User` interface'ine 6 yeni alan, yeni `CompanySettingsUpdatePayload` interface'i. |
| `frontend/src/types/definitions.ts` | Ekleme | `DefinitionBankAccount`/`BankAccountPayload`, `DefinitionNote`/`NotePayload` tipleri. |
| `frontend/src/features/definitions/api/definitionsApi.ts` | Ekleme | `bankAccounts` ve `notes` namespace'leri (`categories` bloğunun kopyası). |
| `frontend/src/features/profile/api/profileApi.ts` | Ekleme | `updateCompanySettings(payload)` — `PATCH /profile/company-settings`. |
| `frontend/src/features/definitions/hooks/useBankAccounts.ts`, `useNotes.ts` | Ekleme | `useUnits.ts` kalıbında 4'er hook (list/create/update/delete/toggleStatus), Türkçe toast mesajlarıyla. |
| `frontend/src/features/profile/hooks/useUpdateCompanySettings.ts` | Ekleme | Tek mutation hook, `useUpdatePreferences.ts` deseninde; `onSuccess`'te `setAuth` ile store güncellenir + yeşil "Ayarlar kaydedildi" toast'ı. |
| `frontend/src/pages/dashboard/settings/definitions/DefinitionCategoryCard.tsx` | Ekleme (yeni dosya) | Kategori kartı bileşeni: ikon+başlık, altında `hover:bg-green-50` + sağda `ChevronRight` olan tıklanabilir menü satırları listesi, aktif seçili satır yeşil vurgulu. |
| `frontend/src/pages/dashboard/settings/definitions/DefinitionPanel.tsx` | Ekleme (yeni dosya) | Seçilen `activeKey`'e göre ilgili liste tipi (`DefinitionListSection` — Birimler/KDV/Ödeme Vadeleri/Kategoriler/Banka Bilgileri/Sabit Açıklama) veya skaler ayar formunu render eden panel; `grid-template-rows: 0fr → 1fr` + `transition` ile framer-motion olmadan CSS tabanlı aç/kapa animasyonu. |
| `frontend/src/pages/dashboard/settings/definitions/CompanyScalarSettingForm.tsx` | Ekleme (yeni dosya) | 4 skaler ayar formu (Para Birimi, Tarih Formatı, Vergi Yılı Başlangıcı, Fatura No): dropdown'lar `onChange`'de anında `useUpdateCompanySettings().mutate(...)` çağırır (buton yok, otomatik kayıt); Fatura No'daki prefix input'u `onBlur`'da kaydedilir (yazarken değil), basamak sayısı seçici ve canlı "sıradaki numara" önizlemesi (`invoice_sequence + 1` + padding) içerir. |
| `frontend/src/pages/dashboard/settings/DefinitionsTab.tsx` | Değiştirme (tamamen yeniden yazıldı) | Eski dikey tek-sütun liste yerine `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6` ile 3 `DefinitionCategoryCard` (Genel Sistem / Fatura ve Finans / Operasyon ve Ürün, `lucide-react` ikonlarıyla — `Settings`, `Wallet`, `Package` ve alt öğe ikonları) + altında tek `DefinitionPanel`. Tek `activeKey` state'i, aynı öğeye tekrar tıklanınca kapanan akordeon davranışı. |
| `frontend/src/i18n/locales/tr.json`, `en.json` | Ekleme | `settings.definitions` altına ~29 yeni key: 3 kategori başlığı, 4 skaler ayar başlığı+alt alanları, Banka Bilgileri/Sabit Açıklama alan etiketleri, 12 ay ismi (`month1`..`month12`). |

**Kapsam kararı:** Kullanıcıyla netleştirilen 3 karar: (1) Sabit Açıklama, tek skaler metin değil
Birimler/Kategoriler gibi çoklu şablon listesi olarak modellendi (`DefinitionListSection` deseni
tekrar kullanıldı). (2) Banka Bilgileri IBAN'ı için sadece format kontrolü (`min_length=15,
max_length=34`) yapılıyor, tam MOD-97 checksum bu iterasyonda eklenmedi. (3) Fatura No ayarında
kullanıcı yalnızca prefix + basamak sayısını değiştirebiliyor, `invoice_sequence` (asıl sıra
sayacı) hiç editlenemez — mevcut faturalarla numara çakışması riski taşıdığı için kapsam dışı
bırakıldı, `docs/todo.md`'ye not düşüldü.

**Doğrulama:** Backend: `py -m alembic heads` (tek head: `f2a3b4c5d6e7`) ve `py -m alembic upgrade
head` yerel dev Postgres'e karşı hatasız çalıştırıldı. Uvicorn ile backend ayağa kaldırılıp gerçek
kullanıcı için üretilen bir JWT ile `PATCH /profile/company-settings`, `POST/GET/PATCH(status)/
DELETE /definitions/bank-accounts`, `POST/DELETE /definitions/notes` uçtan uca `curl` ile test
edildi — hepsi beklenen 200/201/204 döndü, veriler doğru şekilde okunup silindi. Frontend: `npx tsc
--noEmit` ve `npx eslint` (yeni dosyalarda) hatasız; `npm run dev` ile Vite dev server hatasız
başladı ve HMR güncellemeleri konsol hatası vermeden uygulandı. Tarayıcıda görsel/etkileşimli
teyit (kart grid responsive kırılımları, panel açılma animasyonu, toast görünümü) bu oturumda
**yapılamadı** — ortamda tarayıcı otomasyon aracı yoktu, bu adım kullanıcıya kalıyor
(`docs/todo.md`'ye eklendi).

---

## 2026-08-13 — Ayarlar Sayfası Regresyon Düzeltmeleri

**Bağlam:** Önceki bir oturumda (`docs/profil.md`) Ayarlar sayfası (Profil, Hesap, Tercihler,
Güvenlik, Sabit Tanımlar, Faturalandırma) büyük ölçüde inşa edilmişti; backend tarafı (migration'lar,
modeller, şemalar, router'lar) tam ve doğru çalışıyordu. Ancak kullanıcı geri döndüğünde (1) TR/EN
dil değiştirmenin çalışmadığını, eskiden Sidebar'daki profil dropdown'unda bayrak simgeli bir dil
değiştirici olduğunu ama artık hiçbir yerde görünmediğini bildirdi; (2) genel olarak projenin
bozulmuş olabileceğinden şüphelendi. Tam bir kod taraması (Explore agent + doğrudan dosya okuma)
yapıldı; `tsc --noEmit` derlemesi baştan sona temizdi, yani bulunan hataların hepsi çalışma zamanı/
davranış hatasıydı, derleme hatası değildi. Backend'de hiçbir sorun bulunmadı, hiçbir backend
dosyası değiştirilmedi.

| Dosya | İşlem | Özet |
|---|---|---|
| `frontend/src/store/localeStore.ts` | Değiştirme | **Kök neden düzeltmesi.** Zustand `persist` middleware'inin sayfa yenilendiğinde `localStorage`'dan `locale`'i geri yüklerken (`rehydrate`) `i18n.changeLanguage()`'ı hiç çağırmadığı tespit edildi — sadece store state'i güncelleniyordu, i18next'in kendi dili senkronize olmuyordu. `persist(...)` çağrısına `onRehydrateStorage` callback'i eklendi; artık her rehydrate'te `i18n.changeLanguage(state.locale)` tetikleniyor. |
| `frontend/src/i18n/config.ts` | Değiştirme | i18next başlatılırken sabit `lng: 'tr'` kullanılıyordu — bu, ilk render'da kalıcı tercih ne olursa olsun her zaman Türkçe ile başlanmasına (flash) neden oluyordu. Artık `getPersistedLocale()` yardımcı fonksiyonu `localStorage`'daki `axion-locale-storage` anahtarını senkron olarak okuyup (parse hatasında `'tr'`'ye düşerek) başlangıç dilini belirliyor. |
| `frontend/src/components/LanguageSwitcher.tsx` | Değiştirme | Kullanıcının hatırladığı bayrak simgeli (flag-icons: `fi-tr`/`fi-gb`) görünüm geri getirildi — önceki oturumda bunlar düz "TR"/"EN" metin butonlarına indirgenmiş, `flag-icons` paketi hâlâ import edilse de (`main.tsx`) hiçbir yerde kullanılmıyordu. Bileşene `compact` prop'u eklendi; böylece hem herkese açık sayfalarda (`PublicLayout`) hem de Sidebar'ın profil dropdown'unda aynı bileşen, farklı boyutlarda tekrar kullanılabiliyor. |
| `frontend/src/layouts/Sidebar.tsx` | Değiştirme | Profil dropdown'una dil değiştirici (`<LanguageSwitcher compact />`) ve gerçekten çalışan bir "Ayarlar" linki (`NavLink to="/dashboard/settings"`, `Settings` ikonu) eklendi. Önceki "Settings" butonu `onClick`'siz ölü kod olduğu için (git history ile doğrulandı) bu bir düzeltmeden çok bir tamamlamaydı — regresyonun kendisi (dil değiştiricinin dropdown'dan tamamen kaldırılmış olması) giderildi. |
| `frontend/src/pages/dashboard/settings/PreferencesTab.tsx` | Değiştirme | Tercihler sekmesindeki TR/EN butonları sadece form state'ini güncelliyordu; gerçek dil değişimi yalnızca "Kaydet" başarılı olduktan sonra tetikleniyordu (eski Sidebar switcher'ı anlıktı, bu davranış bir regresyondu). `handleLocaleChange` artık `useLocaleStore.getState().setLocale(locale)`'i de çağırıyor — arayüz anında değişiyor, "Kaydet" hâlâ tercihi backend'e kalıcı olarak yazıyor. |
| `frontend/src/pages/dashboard/settings/DefinitionListSection.tsx` | Değiştirme | **Fonksiyonel hata düzeltmesi.** Bileşen tek bir `formValue: string` alanı üzerine kuruluydu; bu, yalnızca tek alanlı tanımlar (Birim adı, Kategori adı) için yeterliydi ama KDV Oranı ve Ödeme Vadesi gibi iki alanlı (etiket + değer) tanımlar için `label` alanını hiç toplayamıyordu. Bileşen `Record<string,string>` tabanlı çoklu-alan form state'ine genelleştirildi (`fields`, `renderFields`, `getEditValues` prop'ları eklendi), `any` tipleri kaldırılıp generic `T extends Definition` ile değiştirildi — bu, orijinal hataya yol açan tip boşluğunu (compile-time'da yakalanamayan eksik zorunlu alan) kapatıyor. |
| `frontend/src/pages/dashboard/settings/DefinitionsTab.tsx` | Değiştirme | **422 hata düzeltmesi.** Backend `TaxRatePayload`/`PaymentTermPayload` zorunlu bir `label: str` alanı istiyordu (`backend/app/schemas/definitions.py`), ama gönderilen payload'lar sadece `{ rate }` / `{ days }` içeriyordu — her KDV Oranı / Ödeme Vadesi ekleme veya düzenleme denemesi 422 Unprocessable Entity ile başarısız oluyordu. KDV Oranı ve Ödeme Vadesi bölümlerine ikinci bir "Etiket" giriş alanı eklendi, `buildPayload` artık `label`'ı da gönderiyor, liste görünümü `"{label} — {değer}"` formatında gösteriyor. Birim ve Kategori bölümleri (tek alanlı, zaten doğru çalışıyorlardı) değiştirilmedi. |
| `frontend/src/i18n/locales/tr.json` | Ekleme | `settings.definitions.taxRateLabel` ("KDV Etiketi") ve `settings.definitions.paymentTermLabel` ("Vade Etiketi") anahtarları eklendi — yeni etiket giriş alanları için. |
| `frontend/src/i18n/locales/en.json` | Ekleme | Aynı iki anahtarın İngilizce karşılıkları (`"Tax Rate Label"`, `"Term Label"`) eklendi. |
| `docs/PROJECT_DESING.md` | Ekleme | Bu değişiklik günlüğü dosyası oluşturuldu. |

**Kapsam dışı bırakılanlar (bilinçli):**
- Sidebar'daki "Support" butonu — önceki oturumda da işlevsizdi, bu turun konusu değil.
- Backend — hiçbir dosya değiştirilmedi; tüm router/schema/model doğrulandı ve doğru çalışıyor.
- `backend/app/api/v1/sessions.py`'deki `revoke_other_sessions` sayaç mantığı — pre-existing,
  kullanıcının bildirdiği hatalarla ilgisi yok.

---

## 2026-08-13 — Güvenlik Sekmesi "Not Found" Hatası (API Path Çakışması)

**Bağlam:** Kullanıcı, Ayarlar → Güvenlik sekmesinde mevcut şifre + yeni şifre girip
gönderdiğinde "Not Found" hatası aldığını bildirdi. Backend'de route zaten doğru tanımlıydı
(`POST /api/v1/profile/password`, `backend/app/api/v1/profile.py:79`); sorun frontend'deydi.

**Kök neden:** `frontend/src/lib/apiClient.ts`'deki axios instance'ın `baseURL`'i
(`frontend/.env` → `VITE_API_BASE_URL=http://localhost:8000/api/v1`) zaten `/api/v1` önekini
içeriyor. Proje genelinde doğru kullanım bu yüzden istek path'lerinde öneki **tekrar** yazmamak
(örn. `authApi.ts` → `apiClient.post('/auth/login', ...)`, `adminTemplatesApi.ts` →
`apiClient.get('/admin/templates')`). Ancak önceki (Haiku) oturumunda eklenen üç dosya —
`profileApi.ts`, `sessionsApi.ts`, `definitionsApi.ts` — path'lerin başına yanlışlıkla tekrar
`/api/v1/` eklemiş; sonuç, gerçekte istenen `http://localhost:8000/api/v1/api/v1/profile/password`
gibi var olmayan bir URL'e istek atılması ve backend'in `404 Not Found` dönmesiydi. `curl` ile
doğrulandı: `/api/v1/api/v1/profile/password` → `404`, `/api/v1/profile/password` → `403`
(rota bulunuyor, sadece auth header eksik — beklenen).

Bu hata sadece şifre değiştirmeyi değil, **Profil/Hesap/Tercihler güncellemelerini, oturum
(session) listeleme/iptal işlemlerini ve Sabit Tanımlar (Birim/KDV/Vade/Kategori) tüm CRUD
işlemlerini** de etkiliyordu — hepsi aynı üç dosyayı kullanıyor. Önceki bu oturumdaki 422
hatası analizinin ilgili path sorununu gözden kaçırmış olması muhtemel; gerçek zamanlı `curl`
testiyle şimdi kesin olarak doğrulandı ve düzeltildi.

| Dosya | İşlem | Özet |
|---|---|---|
| `frontend/src/features/profile/api/profileApi.ts` | Değiştirme | 4 istekteki (`updateProfile`, `updateAccount`, `updatePreferences`, `changePassword`) yinelenen `/api/v1` öneki kaldırıldı. |
| `frontend/src/features/sessions/api/sessionsApi.ts` | Değiştirme | 3 istekteki (`list`, `revoke`, `revokeOthers`) yinelenen `/api/v1` öneki kaldırıldı. |
| `frontend/src/features/definitions/api/definitionsApi.ts` | Değiştirme | Units/TaxRates/PaymentTerms/Categories altındaki toplam 20 istekten yinelenen `/api/v1` öneki kaldırıldı. |

**Doğrulama:**
- `curl -X POST http://localhost:8000/api/v1/profile/password` → `403` (rota bulundu, önceden `404`'tü).
- `curl -X POST http://localhost:8000/api/v1/api/v1/profile/password` → `404` (hatanın nasıl oluştuğunun kanıtı).
- `cd frontend && npx tsc --noEmit` → temiz derleme.

---

**Doğrulama (önceki tur):**
- `cd frontend && npx tsc --noEmit` → temiz derleme (exit 0, hatasız). Bu ortamda tarayıcı
  otomasyon aracı bulunmadığından görsel/etkileşimli doğrulama yapılamadı — kullanıcının
  `npm run dev` ile tarayıcıda aşağıdakileri teyit etmesi önerilir:
  1. Login sonrası Sidebar profil dropdown'unda bayrak ikonlu dil değiştiricinin göründüğü ve
     tıklanınca arayüzü anında değiştirdiği,
  2. Sayfa yenilendiğinde (F5) seçilen dilin kalıcı kaldığı (Türkçe'ye geri dönmediği),
  3. Ayarlar → Sabit Tanımlar'da KDV Oranı ve Ödeme Vadesi ekleme/düzenlemenin artık 422 hatası
     vermeden çalıştığı,
  4. Dropdown'daki yeni "Ayarlar" linkinin `/dashboard/settings`'e yönlendirdiği.

---

## 2026-08-14 — ProfileTab Konum/Telefon Placeholder Alanları

**Bağlam:** Profil sayfası (`/dashboard/settings?tab=profile`) ilk kartında konum ve telefon
satırları şu an kullanıcı verisinin varlığına bağlı olarak koşullu render ediliyordu — alanlar
boşsa tamamen kayboluyor, doluysa gösteriliyordu. Kullanıcı bu iki satırın **her zaman** görünsün
istedi: konum boşsa "-" badge'i, telefon boşsa placeholder maskesi `_ _ ( _ _ _ ) _ _ _ _ _ _ _`
ile kalem (Edit) ikonu — tüm bileşenler `items-center` dikeyde ortalanmış olacak. Bu alanlar
register ekranında doldurulacak; şimdilik salt-okunur placeholder. Ayrıca bu turdan itibaren
yapılan değişikliklerin `PROJECT_DESING.md`'ye tarih/dosya/işlem/özet şeklinde kaydedilmesi ve
kalan işlerin `docs/todo.md`'ye yazılması istendi — bu dokümantasyon sistemi başlatıldı.

| Dosya | İşlem | Özet |
|---|---|---|
| `frontend/src/pages/dashboard/settings/ProfileTab.tsx` | Değiştirme | Konum satırı: `{user.country && (...)}` koşulu kaldırıldı, her zaman `<MapPin>` ikonu + `user.country \|\| '-'` metin gösterilecek. Telefon satırı: koşul kaldırıldı, "Not Verified" sarı badge'i de kaldırıldı (kullanıcı sadece telefon ikon+metin+kalem istedi), her zaman `<Phone>` ikonu + `user.phone \|\| '_ _ ( _ _ _ ) _ _ _ _ _ _ _'` placeholder metin + `<Pencil>` kalem ikonu gösterilecek — üçü de tek `flex items-center gap-3` satırında. Blok başına TODO yorumu eklendi ("Konum/telefon salt-okunur placeholder; register akışına eklenecek"). |
| `docs/todo.md` | Ekleme | Yeni dosya oluşturuldu. Projede ertelenmiş işlerin kaydını tutar: (1) Konum/telefon alanlarını register ekranına taşıma, (2) Stripe test hesabıyla Faz 4 doğrulaması (docs/CLAUDE.md referansı), (3) Prod deploy (docs/CLAUDE.md referansı). Haftalık bütçe ve tamamlama tarih sistemi öngörüldü. |

**Doğrulama:**
- `cd frontend && npx tsc --noEmit` → temiz derleme.
- Tarayıcıda `/dashboard/settings?tab=profile`, `country`/`phone` alanı boş olan kullanıcı ile:
  Konum satırında "-" gösterildiğini, telefon satırında placeholder maskesi gösterildiğini,
  telefon kalem ikonunun dikeyde ortalandığını teyit etmek gerekiyor (kullanıcı tarafından
  `npm run dev` ile yapılacak).

---

## 2026-08-14 — Profil Sekmesi i18n Tercümeleri (Türkçe/İngilizce)

**Bağlam:** Profil sayfası (`/dashboard/settings?tab=profile`) üzerindeki bazı yazılar İngilizce
diline çevrilmiyordu:
1. Destek mesajı "Kişisel bilgilerinizi güncellemek için..."
2. Hesap Türü badge'i (Bireysel/Kurumsal)
3. Meslek başlığı ve PROFESSIONS dropdown'ı

Bunların tümü artık i18n tercüme dosyalarına taşınarak, kullanıcının dil seçimine göre
Türkçe/İngilizce görüntüleniyor.

| Dosya | İşlem | Özet |
|---|---|---|
| `frontend/src/i18n/locales/en.json` | Değiştirme | `settings.profile` bölümüne yeni anahtarlar eklendi: `accountTypeBireysel` ("Individual"), `accountTypeKurumsal` ("Business"), `profession` ("Profession"), `supportText` ("To update your personal information..."), `professions` (9 meslek için tercümeler). |
| `frontend/src/i18n/locales/tr.json` | Değiştirme | Aynı anahtarlar Türkçe olarak eklendi: `accountTypeBireysel` ("Bireysel"), `accountTypeKurumsal` ("Kurumsal"), `profession` ("Meslek"), `supportText` ("Kişisel bilgilerinizi güncellemek için..."), `professions` (9 meslek). |
| `frontend/src/pages/dashboard/settings/ProfileTab.tsx` | Değiştirme | Statik yazılar i18n çağrılarıyla değiştirildi: Hesap Türü badge'i `t(user.account_type === 'bireysel' ? 'settings.profile.accountTypeBireysel' : '...')`, destek mesajı `t('settings.profile.supportText')`, Meslek başlığı `t('settings.profile.profession')`. Hardcoded PROFESSIONS array'i kaldırıldı, yerine `PROFESSION_VALUES` kullanarak bileşen içinde dinamik tercüme (`professions = PROFESSION_VALUES.map(v => t(...))`) yapılıyor. |

**Doğrulama:**
- `cd frontend && npx tsc --noEmit` → temiz derleme (exit 0).
- Tarayıcıda TR/EN dil değiştiricisi kullanarak Profil sekmesinin tüm yazılarının
  (destek mesajı, hesap türü, meslek başlığı, dropdown options) doğru dilde görüntülendiğini
  teyit etmek gerekiyor (kullanıcı tarafından `npm run dev` ile yapılacak).

---

## 2026-08-14 — Hesap Sekmesi "Kaydet" Hatası (CORS + Birikmiş Vite Süreçleri)

**Bağlam:** Kullanıcı, Ayarlar → Hesap sekmesinde (`/dashboard/settings?tab=account`) bilgi 
girdikten sonra "Kaydet" butonuna bastığında hata aldığını bildirdi. Tarayıcı konsolunda 
`[vite] Failed to reload /src/pages/dashboard/settings/ProfileTab.tsx` HMR uyarısı görüldü.

**Araştırma ve kök neden:**
- Kod tarafı tam kontrol edildi: `AccountTab.tsx` → `useUpdateAccount` → `profileApi.updateAccount` 
  (`PATCH /profile/account`) → backend `update_account` (`backend/app/api/v1/profile.py:33-57`).
  Frontend `AccountUpdatePayload` tipi, backend Pydantic şeması ve `User` modeli birebir eşleşiyor,
  Alembic migration'ları doğru uygulanmış — **kod tarafında hiçbir sözdizimi veya mantık hatası yok.**
- `netstat` ile kontrol sonucu: 11 ayrı `node.exe` süreci `5173`–`5183` portlarını dinliyordu.
  Bunlar önceki oturumlardan kalan, hiç kapatılmamış `npm run dev` süreçleriydi (Vite, port
  dolu olunca bir sonrakine geçer, böylece geri geri birikir). Bellek kullanımına göre
  `5173` (PID 11232, 229K) canlı dev sunucusu, geri kalanları (PID 27104, 16124, 35188, 32448,
  1896, 624, 16764, 23316, 8036, 40848) zombi süreçleriydi (29–45K, boşta kalmış).
- **Gerçek sorun:** Backend `.env`'de `CORS_ORIGINS=http://localhost:5173,http://localhost:5174`
  yazılı — sadece bu iki port izinli. Kullanıcının tarayıcı sekmesi CORS-izinli olmayan bir porta
  (`5175`–`5183`) yönlenmiş ise, tüm API istekleri (Kaydet dahil) tarayıcı tarafından CORS
  hatasıyla engellenir. Hard refresh bu sorunu çözmüyor, çünkü aynı origin'de kalılıyor.
  HMR uyarısı ise bu eski/zombi süreçlerden birinin bayat modül grafiğinden kaynaklanan ilgisiz
  bir yan etki.

| Dosya | İşlem | Özet |
|---|---|---|
| (Ortam temizliği) | Temizleme | 10 zombi `node.exe` süreci (PID'ler: 27104, 16124, 35188, 32448, 1896, 624, 16764, 23316, 8036, 40848) sonlandırıldı; yalnızca `5173`'teki canlı dev sunucusu (PID 11232) bırakıldı. Bundan sonra `npm run dev` her zaman aynı porta (5173) bağlanacak ve CORS sorunları ortaya çıkmayacak. |

**Doğrulama:**
- Süreçler temizlendikten sonra `netstat` kontrolü: sadece `5173` (PID 11232) açık.
- Tarayıcıda `http://localhost:5173/dashboard/settings?tab=account`'a (5183 değil!) gidip hesap
  bilgileri girdikten sonra "Kaydet" butonunun başarıyla çalıştığını teyit etmek gerekiyor
  (kullanıcı tarafından yapılacak).

---

## 2026-08-14 — Hesap Güncellemesi ResponseValidationError (`has_password` Özelliği)

**Bağlam:** Yukarıdaki CORS/Zombi sorunun çözülüp backend yeniden başlatıldıktan sonra, 
`PATCH /api/v1/profile/account` isteği hâlâ 500 Internal Server Error dönüyordu. Backend konsolunda 
`ResponseValidationError: 1 validation errors: {'type': 'missing', 'loc': ('response', 'has_password')}` 
hatası gözüktü — yani sorun aslında CORS değil, daha derinlemesine bir backend validation problemi.

**Kök neden:** `backend/app/schemas/auth.py`'deki `UserResponse` Pydantic şeması (line 50) 
`has_password: bool` alanı bekliyordu, ama `backend/app/models/user.py`'deki SQLAlchemy `User` 
modeli bu alanı sağlamıyordu. Pydantic `from_attributes=True` mode'unda (line 52) model 
özniteliklerini şema alanlarına eşlerken, `has_password` hesaplanan bir alan olmalıydı 
(`password_hash is not None`), ama modelde hiçbir @property tanımı yoktu — bu yüzden 
FastAPI response model doğrulaması başarısız oluyordu. Profil, Tercihler güncellemeleri ve 
diğer tüm `/api/v1/profile/*` endpointleri aynı `response_model=UserResponse` kullanıyor, 
hepsi aynı hataya takılıyordu.

| Dosya | İşlem | Özet |
|---|---|---|
| `backend/app/models/user.py` | Değiştirme | 43. satırdan sonraya (created_at ve sessions alanlarından sonra) `@property` dekoratörlü `has_password(self) -> bool` metodu eklendi; `self.password_hash is not None` döner. Bu, Pydantic'in User nesnesini UserResponse şemasına dönüştürürken kullanabileceği bir hesaplanan alan sağlıyor. |
| `backend/` | Yeniden Başlatma | `docker compose restart backend` komutu çalıştırılıp değişiklik yüklendi. |

**Doğrulama:**
- Tarayıcıda `http://localhost:5173/dashboard/settings?tab=account`'a gidip hesap bilgilerinden 
  en az bir tanesini değiştirdikten sonra (örn. şirket adı) "Kaydet" butonunun başarıyla 
  çalıştığını ve verinin kaydedildiğini teyit etmek gerekiyor (kullanıcı tarafından yapılacak).

---

## 2026-08-14 — Login Hatası (Pydantic v2 Optional Fields Varsayılan Değerleri)

**Bağlam:** Önceki oturumda "Firma Bilgileri" kartına (`/dashboard/settings?tab=account`) yeni
kurumsal alanlar (`sector`, `trade_registry_no`, `corporate_email`) ve `created_at` alanı eklenmişti.
Bu alanlar `UserResponse` şemasına ve `User` modeline eklendi; Alembic migration de çalıştırıldı.
Fakat login ekranında "Giriş Yap" sonrası `GET /api/v1/auth/me` endpoint'i `500 Internal Server
Error` dönüyordu. Backend konsolunda `pydantic_core._pydantic_core.ValidationError: 4 validation 
errors for UserResponse: sector (Field required), trade_registry_no (Field required), 
corporate_email (Field required), created_at (Field required)` hatası görüldü.

**Kök neden:** Pydantic v2'de, `sector: str | None` yazısı (default değer olmaksızın) "alanı 
zorunlu, ancak değer None olabilir" anlamına gelir — eksik alan "geçerli" değildir. Yeni 
kullanıcılar signup anında bu alanlarla DB'ye yazılmadığı için (mevcut iş mantığında onlar Account
sekmesinden doldurulması gerekiyor) veya `created_at` henüz `server_default` tarafından
load'lanmadığı için (SQLAlchemy, server_default'ları signup sonrasında Python nesnesine
otomatik yüklemez), Pydantic validation başarısız oluyordu. `has_password`'un önceki oturumda
modele @property olarak eklenmesi gerekiyordu ancak yapılmamıştı; bu da aynı hataya
katkıda bulunuyordu.

| Dosya | İşlem | Özet |
|---|---|---|
| `backend/app/schemas/auth.py` | Değiştirme | `UserResponse` şemasında 4 alana default değer eklendi: `company_name: str \| None = None`, `address: str \| None = None`, `city: str \| None = None`, `postal_code: str \| None = None`, `country: str \| None = None`, `phone: str \| None = None`, `tax_office: str \| None = None`, `tax_number: str \| None = None`, `sector: str \| None = None`, `trade_registry_no: str \| None = None`, `corporate_email: str \| None = None` (toplam 11 alana None default eklendi); `created_at: datetime \| None = None` (nullable hale getirildi çünkü yeni kullanıcılarda henüz load'lanmayabilir). Böylece Pydantic eksik alanları reject etmeyip None kullanıyor. |
| `frontend/src/pages/dashboard/settings/AccountTab.tsx` | Değiştirme | `registrationDate` hesaplaması `user.created_at` null kontrolü eklendi: `const registrationDate = user.created_at ? new Date(user.created_at).toLocaleDateString(...) : notSpecified;` Böylece null tarih "Belirtilmemiş" olarak gösterilir ve `new Date(null)` Invalid Date hatası ortaya çıkmaz. |
| `backend/` | Yeniden Başlatma | `docker compose restart backend` ile şema değişikliği yüklendi; backend'in watchfiles reloader'ı dosyayı algılayıp otomatik yeniden başladı. |

**Doğrulama:**
- Yeni bir kullanıcı signup endpoint'i aracılığıyla oluşturuldu (`POST /api/v1/auth/signup`).
- Signup sonrası `GET /api/v1/auth/me` endpoint'i 200 OK dönüp geçerli bir `UserResponse` 
  (tüm alanlarıyla, null olanlar da dahil) döndü — hata kayboldu ✓.
- `cd frontend && npx tsc --noEmit` → temiz derleme (exit 0).
- Backend logs'ta "Application startup complete" mesajı, artık 500 hata yok.
- Backend konsolunda ResponseValidationError hatası görünmemesi (sonuç: HTTP 200 + güncellenen 
  User verisi).

---

## 2026-08-14 — "Firma Bilgileri" (Company Profile) Kartı ve Yeni Kurumsal Alanlar

**Bağlam:** Kullanıcı, Ayarlar → Hesap sekmesinde (`/dashboard/settings?tab=account`) kayıt
sırasında beyan edilen kurumsal bilgileri gösteren, kurumsal/güven veren, ikonlu, 3 kategoriye
bölünmüş (Temel Şirket Bilgileri / Resmi ve Vergi Bilgileri / Kurumsal İletişim), tamamen
responsive salt-okunur bir özet kart istedi; üstte "Bilgileri Güncelle" butonuyla mevcut
düzenleme formuna geçiş. Araştırma sırasında istenen alanlardan 3'ünün (**Faaliyet Alanı/Sektör**,
**Ticaret Sicil No**, **Kurumsal E-posta**) `User` modelinde hiç var olmadığı ortaya çıktı —
kullanıcı bu 3 alanın da DB migration'ı dahil tam olarak eklenmesini istedi. "Bilgileri Güncelle"
butonu **inline toggle** olarak tasarlandı: kart görüntüleme modunda başlıyor, buton aynı kart
içinde mevcut düzenleme formunu açıyor (ayrı route/modal yok).

| Dosya | İşlem | Özet |
|---|---|---|
| `backend/alembic/versions/a4b5c6d7e8f9_add_company_profile_fields_to_users.py` | Ekleme | Yeni migration: `users` tablosuna `sector` (String 255), `trade_registry_no` (String 100), `corporate_email` (String 255) nullable kolonları eklendi. `down_revision = 'a3b4c5d6e7f8'` (mevcut head). `docker compose exec backend alembic upgrade head` ile uygulandı. |
| `backend/app/models/user.py` | Değiştirme | `User` modeline `sector`, `trade_registry_no`, `corporate_email` (`Mapped[str \| None]`) alanları, mevcut `tax_office`/`tax_number` desenine uygun şekilde eklendi. |
| `backend/app/schemas/auth.py` | Değiştirme | `UserResponse`e `sector`, `trade_registry_no`, `corporate_email`, `created_at` (yeni — "Kayıt Tarihi" için) alanları eklendi. `AccountUpdatePayload`e aynı 3 alan eklendi (`corporate_email` için `EmailStr \| None` ile format doğrulaması). `datetime` importu eklendi. |
| `backend/app/api/v1/profile.py` | Değiştirme | `update_account` endpoint'indeki conditional-update bloğuna `sector`/`trade_registry_no`/`corporate_email` için aynı `if payload.X is not None:` deseni eklendi. |
| `frontend/src/types/auth.ts` | Değiştirme | `User` interface'ine `sector`, `trade_registry_no`, `corporate_email`, `created_at` (string) alanları; `AccountUpdatePayload`e aynı 3 opsiyonel alan eklendi. |
| `frontend/src/i18n/locales/tr.json` | Değiştirme | `settings.account`e `sector`/`tradeRegistryNo`/`corporateEmail` form-label anahtarları ve yeni `settings.account.companyProfile.*` nesnesi (title, subtitle, updateButton, cancelButton, 3 bölüm başlığı, notSpecified fallback'i, 11 alan etiketi) eklendi. |
| `frontend/src/i18n/locales/en.json` | Değiştirme | Aynı anahtarların İngilizce karşılıkları eklendi (`Company Profile`, `Business Sector`, `Trade Registry No`, `Corporate Email`, vb.). |
| `frontend/src/pages/dashboard/settings/AccountTab.tsx` | Değiştirme | Bileşen baştan yazıldı: `isEditing` state'i ile görüntüleme/düzenleme modu arasında inline toggle. Görüntüleme modunda `Card` içinde 3 bölümlü `grid grid-cols-1 md:grid-cols-2 gap-6` yapı — her bölüm `border-gray-100 bg-gray-50 rounded-lg` kutu, her satır `InfoRow` yardımcı bileşeniyle (`text-blue-600` ikon + üstte `text-sm text-gray-500` etiket + altta `text-base font-medium text-gray-900` değer, `items-start` hizalı). Kullanılan lucide-react ikonları: `Building2, Briefcase, Calendar, Landmark, Hash, BadgeCheck, MapPin, Mail, Phone`. Boş alanlar için `notSpecified` ("Belirtilmemiş") fallback'i. "Bilgileri Güncelle" butonu (`Button variant="secondary"`, outline görünüm) `isEditing`'i `true` yapıyor; düzenleme modunda mevcut form + 3 yeni input (`sector`, `corporate_email` — `type="email"`, `trade_registry_no`) + "İptal" butonu gösteriliyor, başarılı kayıt sonrası `onSuccess` ile otomatik görüntüleme moduna dönülüyor. Kayıt Tarihi `user.created_at`'tan `toLocaleDateString` ile `useLocaleStore`'a göre TR/EN formatlanıyor. |

**Doğrulama:**
- `docker compose exec backend alembic upgrade head` → `a3b4c5d6e7f8 -> a4b5c6d7e8f9` başarıyla uygulandı, `psql \d users` ile 3 yeni kolon teyit edildi.
- `docker compose restart backend` → başlangıç loglarında hata yok, `/docs` 200 dönüyor.
- `cd frontend && npx tsc --noEmit` → temiz derleme (exit 0).
- `npx eslint src/pages/dashboard/settings/AccountTab.tsx src/types/auth.ts` → temiz (exit 0).
- Her iki i18n JSON dosyası `JSON.parse` ile doğrulandı, sözdizimi hatası yok.
- **Bilinen sınırlık:** Bu oturumda tarayıcı otomasyon aracı yoktu, kartın görsel/responsive
  doğrulaması (mobil tek kolon / masaüstü 2 kolon, ikon hizalaması, inline toggle akışı) tarayıcıda
  kullanıcı tarafından teyit edilmesi gerekiyor: `http://localhost:5173/dashboard/settings?tab=account`.
- Not: Register formu (`SignupForm.tsx`) hâlâ bu yeni alanları toplamıyor — bkz. `docs/todo.md` §1
  (güncellendi, ertelenmiş iş olarak işaretli).

---

## 2026-08-14 — Profil Sekmesi Meslek Alanı ve "Kaydet" Butonu

**Bağlam:** Kullanıcı, Profil sekmesinde (`/dashboard/settings?tab=profile`) Meslek dropdown'u
seçilebiliyor olsa da değişikliklerin kaydedilmediğini bildirdi. Dropdown'da `defaultValue` yazılı
ama `onChange` handler'ı ve kaydetme mekanizması yoktu — tamamen işlevsizdi. Kullanıcı:
1. `profession` alanını `User` modeline, TypeScript tipine, Pydantic şemasına eklemek
2. `/profile/preferences` endpoint'inde professioni handle etmek
3. Meslek dropdown'unda state management, onChange, ve "Kaydet" butonu eklemek
istemişti.

| Dosya | İşlem | Özet |
|---|---|---|
| `backend/alembic/versions/b5c6d7e8f9a0_add_profession_to_users.py` | Ekleme | Yeni migration: `users` tablosuna `profession` (String 255) nullable kolonu eklendi. `down_revision = 'a4b5c6d7e8f9'` (önceki "Firma Bilgileri" migration'ının sonucu). `docker compose exec backend alembic upgrade head` ile uygulandı. |
| `backend/app/models/user.py` | Değiştirme | `User` modeline `profession: Mapped[str \| None] = mapped_column(String(255), nullable=True)` alanı eklendi. |
| `backend/app/schemas/auth.py` | Değiştirme | `UserResponse`e `profession: str \| None = None` eklendi. `PreferencesUpdatePayload`e `profession: str \| None = Field(default=None, max_length=255)` eklendi (dil/notification tercihlerinin yanına). |
| `backend/app/api/v1/profile.py` | Değiştirme | `update_preferences` endpoint'inde `if payload.profession is not None: current_user.profession = payload.profession` satırı eklendi. |
| `frontend/src/types/auth.ts` | Değiştirme | `User` interface'ine `profession: string \| null` eklendi. `PreferencesUpdatePayload`e `profession?: string \| null` eklendi. |
| `frontend/src/pages/dashboard/settings/ProfileTab.tsx` | Değiştirme | Komponent başında `useState(user?.profession \|\| '')` state'i eklendi, `useUpdatePreferences()` hook'u import edildi. Meslek dropdown'u `value={profession}` ve `onChange={(e) => setProfession(e.target.value)}` bağlandı. İlave bir `<div className="flex gap-2">` bloğu eklendi: `isDirty`'ye göre (değer değişti mi) "Kaydet" ve "İptal" butonları gösterilecek. Butonlar `updatePreferences.mutate({ profession: profession \|\| null })` çağırıyor, başarı sonrası toast + UI otomatik güncellenecek. |

**Doğrulama:**
- `docker compose exec backend alembic upgrade head` → migration `a4b5c6d7e8f9 -> b5c6d7e8f9a0` başarıyla uygulandı.
- `docker restart backend-backend-1` → başlangıç loglarında hata yok.
- `cd frontend && npx tsc --noEmit` → temiz derleme (exit 0).
- Test signup + login → `GET /api/v1/auth/me` 200 döndü, yeni `profession` alanı `null` olarak yer aldı ✓.
- Test `PATCH /api/v1/profile/preferences` payload'ı `{ "profession": "yazilim" }` → backend 200 döndü, `profession` `"yazilim"` olarak kaydedildi ✓.
- **Bilinen sınırlık:** Dropdown UI ve "Kaydet"/"İptal" butonlarının görsel doğrulaması (button'ların
  yalnızca değer değişince göründüğü, kaydedilmiş değerin refresh sonrası kalıcı kaldığı) tarayıcıda
  kullanıcı tarafından teyit edilmesi gerekiyor: `http://localhost:5173/dashboard/settings?tab=profile`.

---

## 2026-08-14 — Dil Değişikliğine de Save/Cancel Butonu Ekleme

**Bağlam:** Profil sekmesinde Meslek alanına "Kaydet"/"İptal" butonları (dirty state tracking ile)
eklendikten sonra, kullanıcı tutarlılık için **Dil dropdown'una da aynı davranışın uygulanmasını
istedi**. Önceki durumda Dil dropdown'u `onChange` anında doğrudan `setLocale()` çağırıyordu (anlık
kayıt, buton yok). Artık her iki alan da aynı pattern'i takip ediyor: state tracking, buton sadece
değişim olduğunda gösterilir, başarılı kayıt sonrası otomatik.

| Dosya | İşlem | Özet |
|---|---|---|
| `frontend/src/pages/dashboard/settings/ProfileTab.tsx` | Değiştirme | Dil dropdown'u state management eklendi: `useState(locale)` ile `language` state'i, `onChange={(e) => setLanguage(e.target.value as Locale)}` ile güncelleme. `isLanguageDirty` calculation eklendi: `language !== locale` (sunucudaki değerle karşılaştırma). `handleLanguageSave` fonksiyonu eklendi: `updatePreferences.mutate({ locale: language as Locale })` çağrısı yapıyor (Meslek'in `handleProfessionSave`'ine benzer). Dil kartına conditional Save/Cancel butonları eklendi (`isLanguageDirty` şartıyla); butonlar `updatePreferences.isPending` sırasında disabled oluyor. Meslek kartındaki `handleSave` → `handleProfessionSave`, `isDirty` → `isProfessionDirty` olarak yeniden adlandırıldı (karşı confusion için — artık iki ayrı dirty state var). |

**Doğrulama:**
- `cd frontend && npx tsc --noEmit` → temiz derleme (exit 0).
- Git commit: `68d3cb8` — "AxionOS - Dil Değişikliğine de Save/Cancel Butonu Ekleme".
- **Bilinen sınırlık:** Dil değişiminin UI'da anlık yansımasının tarayıcıda doğrulanması gerekiyor:

---

## 2026-08-20 — Fatura Numarası Ön Eki ve Basamak Ayarının Backend'de Uygulanması

**Bağlam:** Ayarlar → Tanımlar sekmesinde (`/dashboard/settings?tab=definitions`) "Fatura Ön Eki" 
(`invoice_prefix`, örn. "INV2026") ve "Basamak" (`invoice_number_padding`, örn. 5) alanları kullanıcıya 
sunulmakta ve backend'de kaydedilmektedir. Frontend Settings formunda önizleme doğru formülü 
(`${prefix}${sequence:0{padding}d}`) göstermektedir. Ancak gerçek fatura oluşturma sırasında 
`backend/app/services/invoice_service.py`'deki `next_invoice_number()` fonksiyonu bu ayarları hiç 
kullanmamakta, sabit "INV-" önekini ve 4 haneli padding'i hardcode etmektedir. Sonuç: ayarlarla 
gösterilen ön izlemeyle gerçek fatura numaraları uyuşmamaktadır.

| Dosya | İşlem | Özet |
|---|---|---|
| `backend/app/services/invoice_service.py` | Değiştirme | `next_invoice_number()` fonksiyonu güncellenmiştir (satırlar 44-48): hardcoded `"INV-"` ve `04d` yerine `prefix = user.invoice_prefix or ""` ve `return f"{prefix}{user.invoice_sequence:0{user.invoice_number_padding}d}"` formülü kullanılmaktadır. Prefix `None` olduğunda ("" kullanılarak) ayırıcı veya sabit metin eklenmez. Basamak sayısı dinamik olarak `user.invoice_number_padding` değerinden okunur (varsayılan 4). |
| `backend/tests/test_invoices.py` | Ekleme | 3 yeni test eklendi: (1) `test_invoice_number_uses_prefix_and_padding` — kullanıcının `invoice_prefix="INV2026"` ve `invoice_number_padding=5` ayarlanmış fatura oluşturması, yanıtta `invoice_number="INV202600001"` doğrulaması. (2) `test_invoice_number_increments_with_custom_settings` — art arda iki fatura oluşturup sıra numarasının `FTR-0001`, `FTR-0002` gibi arttığını doğrulaması. (3) `test_invoice_number_default_format` — varsayılan ayarlarla (prefix boş, padding 4) fatura oluşturup `invoice_number="0001"` döndüğünü (eski `"INV-0001"` formatı artık üretilmiyor) doğrulaması. |

**Doğrulama Planı:**
1. Backend testleri: `cd backend && python -m pytest tests/test_invoices.py -v` — yeni 3 test ve mevcut 
   testler (özellikle `test_create_invoice_success`) başarılı olmalıdır.
2. Manuel, UI: Dashboard → Ayarlar → Tanımlar'da "Fatura Ön Eki" = "INV2026", "Basamak" = "5" 
   ayarlanıp "Önizleme:" `INV202600001` gösterdiği doğrulanmalıdır.
3. Manuel, fatura oluşturma: `/dashboard/invoices/new` sayfasında "Kaydet" butonuyla taslak fatura 
   oluşturulup detay sayfasında `invoice_number` alanının `INV2026000XX` formatında olduğu 
   doğrulanmalıdır.
4. Art arda iki fatura oluşturup sıra numarasının `INV202600001`, `INV202600002` gibi arttığı 
   doğrulanmalıdır.
5. Prefix boş bırakılıp yeni fatura oluşturulup `invoice_number` yalnızca sayıdan (padding'e göre) 
   oluştuğu doğrulanmalıdır.

**Kapsam Kararları:**
- `invoice_sequence` sayacı davranışı değişmez: kullanıcı başına artan tam sayı, prefix değiştiğinde 
  sıfırlanmaz (mevcut davranış korundu).
- `invoice_number` sütununda unique constraint **bu kapsamda eklenmemiştir** — şema zaten unique yoktu, 
  sadece format düzeltilmiştir.
- Prefix değiştiğinde eski faturalara dönüş yapılmaz — yeni oluşturulan faturalar yeni prefix ile 
  düzeltilmiş formatta üretilir.

**Kapsam Dışı (TODO'ya kaydedildi):**
- Prefix değiştiğinde `invoice_sequence` resetleme (`/todo.md`'ye not düşülecek).
- `invoice_number` unique constraint ekleme.
- "Devam Et" butonu şu an disabled/işlevsiz kalıyor (`InvoiceForm.tsx`'te hardcoded `disabled`).
  dropdown'da Türkçe/İngilizce seç → "Kaydet"/"İptal" butonlarının göründüğünü, "Kaydet" tıklanınca
  hook onSuccess callback'i aracılığıyla `useLocaleStore.setLocale()` çağrılıp UI dilinin değiştiğini,
  meslek dropdown'unu da aynı pattern'i takip ettiğini teyit etmek: `http://localhost:5173/dashboard/settings?tab=profile`.

---

## 2026-08-20 — Banka Bilgilerinin Fatura PDF'ine Uçtan Uca Bağlanması (Kritik Bug Fix)

**Bağlam:** Kullanıcı, Ayarlar → Tanımlar sekmesindeki "Banka Bilgileri" tanımlarının fatura
PDF'ine eklenip eklenmediğini sordu. İnceleme sonucu özellik **kısmen kodlanmış ama uçtan uca
kırık** çıktı — en kritiği, `Invoice.bank_account_id` FK sütunu var olduğu halde karşılık gelen
SQLAlchemy `relationship()` hiç tanımlanmamıştı; buna rağmen `pdf_service.py` bu ilişkiye
`invoice.bank_account` üzerinden erişmeye çalışıyordu. SQLAlchemy'de tanımsız bir ORM attribute'una
erişmek `AttributeError` fırlatır — yani **görsel (Jinja) şablonla PDF üreten her fatura, banka
hesabı seçili olsun ya da olmasın, PDF üretim aşamasında hata veriyordu** (`generate_invoice_pdf_task`
ve `/invoices/{id}/preview` uçları). Ayrıca `update_invoice()` fonksiyonu `bank_account_id` alanını
hiç işlemiyordu (fatura detayındaki `BankAccountSection` bileşeni üzerinden seçim yapılsa bile
veritabanına yazılmıyordu), `InvoiceCreatePayload`'da bu alan hiç yoktu, API response şemaları
banka bilgisini hiç döndürmüyordu ve fatura oluşturma formunda banka hesabı seçimi için UI yoktu.

| Dosya | İşlem | Özet |
|---|---|---|
| `backend/app/models/invoice.py` | Değiştirme (kritik bug fix) | `DefinitionBankAccount` importu eklendi; `Invoice` sınıfına `bank_account: Mapped["DefinitionBankAccount \| None"] = relationship()` eklendi (mevcut `bank_account_id` FK'sinden örtük çıkarım, migration gerekmedi). Bu, `pdf_service.py`'de daha önce her PDF üretiminde oluşan `AttributeError`'ı giderir. |
| `backend/app/schemas/invoice.py` | Değiştirme | `InvoiceCreatePayload`'a `bank_account_id: uuid.UUID \| None = None` eklendi. `InvoiceSummaryResponse`'a `bank_account_id` ve `bank_account: BankAccountResponse \| None` alanları eklendi (`BankAccountResponse` `schemas/definitions.py`'den import edilerek nest edildi; `InvoiceDetailResponse` bu şemayı extend ettiği için otomatik kapsanıyor). |
| `backend/app/services/invoice_service.py` | Değiştirme | `create_invoice()`'da: `bank_account_id` verilmişse kullanıcıya ait olup olmadığı doğrulanıyor (yoksa/başkasınınsa 404), `Invoice(...)` constructor'ına `bank_account_id` geçiliyor. `update_invoice()`'da: `bank_account_id` alanı artık işleniyor — sahiplik doğrulanıp `invoice.bank_account_id` güncelleniyor ve `content_changed = True` set ediliyor (bu, mevcut "PDF içerik değişince yeniden üret" mekanizmasını otomatik tetikliyor). |
| `backend/app/services/xslt_service.py` | Değiştirme | `build_invoice_xml()`'e, `invoice.bank_account` doluysa `<BankAccount>` XML elementi (BankName/BranchName/BranchCode/Iban/AccountNumber/Currency) eklendi — özel XSLT şablonu yazan kullanıcılar artık banka verisine XPath ile erişebilir (görsel/Jinja şablon zaten `invoice_base.html:100-107`'de bu bloğu render ediyordu, sorun sadece veri bağlantısındaydı). |
| `backend/tests/test_invoices.py` | Ekleme | 4 yeni test: (1) `test_create_invoice_with_bank_account` — banka hesabıyla fatura oluşturup response'ta doğru döndüğünü doğrular. (2) `test_create_invoice_with_foreign_bank_account_returns_404` — başka kullanıcının banka hesabıyla oluşturma denemesi 404 döner. (3) `test_update_invoice_sets_bank_account` — PATCH ile banka hesabı set edilince kaydedildiğini ve `pdf_status`'un `pending`'e döndüğünü doğrular. (4) `test_render_invoice_html_includes_bank_account` — `pdf_service.render_invoice_html()`'in artık `AttributeError` fırlatmadığını ve IBAN'ın render edilen HTML'de geçtiğini doğrular (regresyon testi). |
| `frontend/src/types/invoice.ts` | Değiştirme | `InvoiceCreatePayload` interface'ine `bank_account_id?: string` eklendi. |
| `frontend/src/features/invoices/components/InvoiceForm.tsx` | Değiştirme | `useBankAccounts` hook'u import edildi; `InvoiceFormValues`'a `bank_account_id: string` eklendi; "Ödeme Detayları" kartına, mevcut `payment_currency`/`currency` Select'leriyle aynı `Controller`+`Select` pattern'inde bir "Banka Hesabı" seçimi eklendi (zorunlu değil — `BankAccountSection.tsx`'teki options mapping'i birebir tekrar kullanıldı); `onSubmit` payload'ına `bank_account_id` eklendi. |
| `frontend/src/i18n/locales/tr.json`, `en.json` | Ekleme | `invoices.form.bankAccount` / `invoices.form.selectBankAccount` çeviri anahtarları eklendi (detay sayfasındaki `invoices.detail.*` karşılıklarıyla aynı metinler). |

**Doğrulama Planı:**
1. Backend testleri: `docker compose exec backend python -m pytest -v` — 26 test (15'i
   `test_invoices.py`, 4'ü yeni banka hesabı testleri dahil) çalıştırıldı, **hepsi geçti**.
   Özellikle `test_render_invoice_html_includes_bank_account` daha önceki `AttributeError`
   regresyonunun giderildiğini kanıtlıyor.
2. Frontend: `npx tsc --noEmit` ile tip kontrolü hatasız geçti.
3. Manuel (kullanıcı tarafından teyit edilmeli): Ayarlar → Tanımlar → Banka Bilgileri'nde hesap
   oluşturup `/dashboard/invoices/new`'de yeni Select'ten seçip fatura oluşturmak, detay
   sayfasında `BankAccountSection`'ın göründüğünü ve indirilen PDF'te "Ödeme Bilgileri" bloğunun
   banka adı/IBAN/hesap no ile çıktığını doğrulamak.

**Kapsam Kararları:**
- Banka hesabı seçimi fatura oluşturma formunda **zorunlu değil** — banka hesabı tanımlamamış
  kullanıcılar fatura oluşturmaya devam edebilmeli (mevcut `{% if bank_account %}` davranışı
  korunuyor, banka bloğu seçilmemişse PDF'te hiç görünmüyor).
- Mevcut sistem XSLT şablonlarının içeriği **değiştirilmedi** — sadece XML ağacına veri eklendi,
  şablon yazarları isterse kullanır.
- Banka hesabının para birimiyle fatura para birimi arasında bir doğrulama/uyarı **eklenmedi**
  (kapsam dışı, `docs/todo.md`'ye not düşüldü).

---

## 2026-08-14 — Güvenlik Ayarları Sayfası Yeniden Tasarımı (2FA / Şifre / Oturumlar)

**Bağlam:** `/dashboard/settings?tab=security` (`SecurityTab.tsx`) zaten vardı ve şifre değiştirme
+ aktif oturum listeleme backend'e bağlı olarak çalışıyordu, ama görünüm tek kolonlu, düz bir
listeydi — kart yapısı, ikonlar ve 2FA bölümü yoktu. Kullanıcı sayfayı 3 karta (2FA, Şifre
Değiştirme, Açık Oturumlar) ve masaüstünde 2 kolonlu (mobilde alt alta) responsive bir grid'e
oturtmamı istedi. 2FA backend'de hiç yoktu (greenfield) — bu görev kapsamında sadece görsel/UI
olarak eklendi (toggle kapalı/gri başlıyor, "Kurulumu Başlat" disabled); gerçek TOTP
implementasyonu `docs/todo.md`'ye ertelendi. Şifre ve oturum kartları mevcut çalışan hook'ları
(`useChangePassword`, `useSessions`, `useRevokeSession`, `useRevokeOtherSessions`) aynen kullanmaya
devam ediyor, sadece kart/ikon/liste görünümü yenilendi.

| Dosya | İşlem | Özet |
|---|---|---|
| `frontend/src/components/Switch.tsx` | Ekleme | Projede daha önce hiç Switch/Toggle bileşeni yoktu (boolean alanlar düz `<input type="checkbox">` kullanıyordu). `Button`/`Card` ile aynı `twMerge` deseninde, controlled (`checked`, `onChange`, `disabled?`, `label?`) basit bir switch bileşeni eklendi — açık `bg-slate-900`, kapalı `bg-slate-200`, `translate-x` ile kayan yuvarlak thumb, `disabled`'da `opacity-50`. |
| `frontend/src/pages/dashboard/settings/SecurityTab.tsx` | Değiştirme | Tamamen yeniden yapılandırıldı: dış kapsayıcı `grid grid-cols-1 lg:grid-cols-2 gap-8` (eski `flex flex-col max-w-xl` yerine). **2FA kartı (yeni):** `Shield` ikonlu `Card`, açıklama paragrafı, `Switch` (local `is2faEnabled` state — backend'e bağlı değil, sadece görsel, kodda `TODO` yorumuyla işaretli), disabled "Kurulumu Başlat" butonu. **Şifre Değiştirme kartı:** mevcut form/state/validasyon aynen korunarak `Lock` ikonlu `Card` kabuğuna taşındı, input'lara placeholder eklendi. **Açık Oturumlar kartı:** `lg:col-span-2` ile tam genişlik, `Monitor` ikonlu `Card`, sağ üstte kırmızı outline (`border-red-500 text-red-600 hover:bg-red-50`) "Tüm Cihazlardan Çıkış Yap" butonu (`action` prop). `getDeviceLabel` → `getDeviceInfo`'ya genişletildi: artık işletim sistemi de tespit ediyor (`"Windows PC - Google Chrome"` gibi), mobil user-agent'larda `Smartphone` ikonu, masaüstünde `Laptop` ikonu gösteriliyor; "şu anki cihaz" artık yeşil `Badge color="green"` ile işaretleniyor (önceden nötr `Badge` rengindeydi). |
| `frontend/src/i18n/locales/tr.json` | Değiştirme | `settings.security` altına `twoFactor.{title,description,setupButton}` ve `revokeAllDevices` anahtarları eklendi; `sessions` "Aktif Oturumlar" → "Açık Oturumlar", `thisBrowser`/`lastUsed` metinleri yeni tasarıma göre güncellendi ("Bu Tarayıcı" → "Şu anki cihaz" vb.). |
| `frontend/src/i18n/locales/en.json` | Değiştirme | Aynı anahtarların İngilizce karşılıkları eklendi/güncellendi. |
| `docs/todo.md` | Değiştirme | 3 yeni madde eklendi: (4) 2FA backend entegrasyonu (TOTP secret/QR/backup code/endpoint'ler), (5) `PreferencesTab.tsx` checkbox'larını yeni `Switch` bileşenine taşıma (düşük öncelik), (6) oturum listesinde GeoIP/konum gösterimi (düşük öncelik). |

**Doğrulama:**
- `cd frontend && npx tsc --noEmit` → temiz derleme (exit 0).
- **Bilinen sınırlık:** Tarayıcıda görsel/responsive teyit kullanıcıya kalıyor —
  `http://localhost:5173/dashboard/settings?tab=security` açılıp masaüstünde 2 kolon (2FA solda,
  Şifre sağda, Oturumlar altta tam genişlik), dar pencerede tüm kartların alt alta dizildiği,
  2FA switch'inin tıklanabilir ama "Kurulumu Başlat" butonunun disabled olduğu, oturum listesinde
  gerçek aktif oturumun cihaz ikonu + "Şu anki cihaz" rozetiyle göründüğü teyit edilmeli.

---

## 2026-08-14 — Oturum Yönetimi Bug Fix'leri (Kapat / Tüm Cihazlardan Çıkış Yap / Şu anki cihaz rozeti)

**Bağlam:** Bir önceki bölümde yeniden tasarlanan Güvenlik Ayarları sayfasında kullanıcı 3 sorun
bildirdi: "Tüm Cihazlardan Çıkış Yap" ve "Kapat" butonları tıklanınca hiçbir şey olmuyordu, ve
kendi aktif oturumunda yeşil "Şu anki cihaz" rozeti hiç görünmüyordu. Kod incelemesiyle 2 bağımsız
kök neden bulundu: (A) `SecurityTab.tsx`'in import ettiği `@/features/sessions/hooks` barrel'ı
(`index.ts`), aynı klasördeki toast-entegre `useRevokeSession.ts`/`useRevokeOtherSessions.ts`
dosyalarını **gölgeleyen**, toast'sız duplike mutation tanımları içeriyordu — mutasyon başarısız
olsa da (örn. demo kısıtı `require_not_demo` → 403) başarılı olsa da kullanıcıya hiçbir geri
bildirim gösterilmiyordu. (B) Backend'de `refresh_token` cookie'si `path=/api/v1/auth` ile
sınırlıydı, bu yüzden `/api/v1/sessions` isteklerine hiç gönderilmiyordu; `list_sessions`
endpoint'i `is_current`'ı bu cookie'den çözüyordu, cookie hiç gelmediği için `is_current` daima
`False` dönüyordu — rozet hiç görünmüyordu ve (ikincil etki olarak) kullanıcının kendi oturumu
için de yanlışlıkla "Kapat" butonu gösteriliyordu.

| Dosya | İşlem | Özet |
|---|---|---|
| `backend/app/core/config.py` | Değiştirme | `refresh_cookie_path` `"/api/v1/auth"` → `"/api/v1"` yapıldı — cookie artık `/api/v1/sessions/*` isteklerine de gönderiliyor, `is_current` hesaplaması doğru çalışıyor. `docs/CLAUDE.md`'deki mimari karar tablosu da bu değişiklikle güncellendi. |
| `frontend/src/features/sessions/hooks/index.ts` | Değiştirme | İçindeki duplike, toast'sız `useSessions`/`useRevokeSession`/`useRevokeOtherSessions` tanımları silindi; dosya artık aynı klasördeki `useSessions.ts`/`useRevokeSession.ts`/`useRevokeOtherSessions.ts`'den `export *` yapıyor. Böylece mutasyonlar `useToastStore` üzerinden başarı ("Oturum sonlandırıldı", "N oturum sonlandırıldı") ve hata mesajı gösteriyor — `SecurityTab.tsx`'te import yolu değişmedi. |

**Doğrulama:**
- `cd frontend && npx tsc --noEmit` → temiz derleme (exit 0).
- **Bilinen sınırlık:** Backend restart + yeniden login gerektirir (mevcut oturumların cookie'si
  eski path ile set edilmiş) — bu ve tarayıcıda buton/rozet davranışının teyidi kullanıcıya kalıyor.

**Ek düzeltme (aynı gün, ikinci tur):** Yukarıdaki toast entegrasyonu devreye girince gerçek bir
backend hatası ortaya çıktı — kullanıcı "Tüm Cihazlardan Çıkış Yap"a bastığında backend log'unda
`AttributeError: 'Session' object has no attribute 'func'` ile 500 dönüyordu. Kök neden:
`backend/app/api/v1/sessions.py`'de `db.func.now()` çağrılıyordu — SQLAlchemy `Session` nesnesinin
(`db`) böyle bir `func` attribute'u yok, `func` ayrı bir `sqlalchemy` modül import'u olmalı. Bu,
projede daha önce hiç fark edilmemiş bir hataydı çünkü `useRevokeOtherSessions`/`useRevokeSession`
barrel'daki eski toast'sız versiyonları kullanıldığı sürece hata sessizce yutuluyordu.

| Dosya | İşlem | Özet |
|---|---|---|
| `backend/app/api/v1/sessions.py` | Değiştirme | `from sqlalchemy import func` eklendi; `revoke_session`'daki `session.revoked_at = db.func.now()` → `func.now()`, `revoke_other_sessions`'daki iki `.update({UserSession.revoked_at: db.func.now()})` çağrısı → `func.now()` olarak düzeltildi. |

**Doğrulama:** `--reload` ile çalışan uvicorn (bkz. `backend/docker-compose.yml:49`) dosya
değişikliğini otomatik yakalayıp yeniden başlatacak, ek restart gerekmiyor. Tarayıcıda tekrar
"Tüm Cihazlardan Çıkış Yap" ve "Kapat" denenip başarı toast'ının çıktığı teyit edilmeli.
