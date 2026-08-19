# Proje Tasarım Değişiklikleri Günlüğü

Bu dosya, projede gerçekleştirilen önemli tasarım/mimari kararları ve yapılan değişikliklerin tarihçesini tutar.

---

## 2026-08-19 — Sabit Tanımlar: KDV Oranları / Birimler / Sabit Açıklama için Varsayılan Seçim Checkbox'ı

**Dosya:** 
- Backend: `backend/alembic/versions/b6c7d8e9f0a1_add_is_default_to_definitions.py` (migration), `backend/app/models/definitions.py` (DefinitionUnit, DefinitionTaxRate, DefinitionNote), `backend/app/schemas/definitions.py` (UnitResponse, TaxRateResponse, NoteResponse), `backend/app/api/v1/definitions.py` (PATCH endpoints)
- Frontend: `frontend/src/components/Checkbox.tsx` (yeni bileşen), `frontend/src/types/definitions.ts` (types), `frontend/src/features/definitions/api/definitionsApi.ts` (setDefault metodu), `frontend/src/features/definitions/hooks/useUnits.ts` / `useTaxRates.ts` / `useNotes.ts` (useSetDefault* hooks), `frontend/src/pages/dashboard/settings/DefinitionListSection.tsx` (defaultSelection prop), `frontend/src/pages/dashboard/settings/definitions/DefinitionPanel.tsx` (hook import ve prop geçişi)

**İşlem Türü:** Ekleme

**Özet:**

Sabit Tanımlar sekmesinde (dashboard/settings?tab=definitions) KDV Oranları, Birimler ve Sabit Açıklama kartlarının her bir öğe satırına bir checkbox eklendi. Her kartta aynı anda sadece bir öğe "varsayılan" olarak işaretlenebilir (radio-benzeri tekli seçim davranışı, ancak UI olarak checkbox). Checkbox mavi arka plan (`bg-blue-600`) ile beyaz metin (`text-white`) stillendirmesi ve `data-[state=checked]` Tailwind varyantı kullanılarak gerçekleştirildi.

### Detaylar:

**Backend Değişiklikleri:**
1. Yeni Alembic migration (`b6c7d8e9f0a1`) — `definition_units`, `definition_tax_rates`, `definition_notes` tablolarına `is_default BOOLEAN NOT NULL DEFAULT false` kolonu eklendi.
2. Modeller (`DefinitionUnit`, `DefinitionTaxRate`, `DefinitionNote`) — `is_default: Mapped[bool]` alanı eklendi.
3. Response şemaları (`UnitResponse`, `TaxRateResponse`, `NoteResponse`) — `is_default: bool` alanı eklendi.
4. API route'ları — her tür için `PATCH /{id}/default` endpoint'i eklendi:
   - Mantık: hedef öğeyi `_get_own_*` ile bul, aynı `user_id`'ye ait diğer tüm kayıtların `is_default`'ını `False` yap, hedefinkini `True` yap, commit+refresh.
   - Tek bir sorguda toplu update: `db.query(Model).filter(user_id==..., id != target_id).update({"is_default": False})`.

**Frontend Değişiklikleri:**
1. Yeni `Checkbox` bileşeni (`frontend/src/components/Checkbox.tsx`) — `role="checkbox"`, `data-state={checked ? 'checked' : 'unchecked'}`, Tailwind sınıfları `data-[state=checked]:bg-blue-600 data-[state=checked]:text-white` ile stillendirildi, içinde küçük SVG check ikonu yer alır.
2. Tipler (`types/definitions.ts`) — `DefinitionUnit`, `DefinitionTaxRate`, `DefinitionNote` interface'lerine `is_default: boolean` eklendi.
3. API katmanı (`definitionsApi.ts`) — `units.setDefault()`, `taxRates.setDefault()`, `notes.setDefault()` metodu eklendi.
4. Hook'lar (`useUnits.ts`, `useTaxRates.ts`, `useNotes.ts`) — `useSetDefaultUnit()`, `useSetDefaultTaxRate()`, `useSetDefaultNote()` mutation'ları eklendi (aynı `toggleStatus` pattern'i, query invalidation + toast).
5. `DefinitionListSection` bileşeni — `Definition` arayüzüne opsiyonel `is_default?: boolean` eklendi. Bileşene opsiyonel `defaultSelection?: { onSetDefault: (id: string) => void; isSettingDefault: boolean }` prop'u eklendi. Bu prop verildiğinde, aksiyon butonları grubunun en başına (Deactivate'ten önce) `Checkbox` render edilir — `checked={item.is_default}`, `disabled={isSettingDefault || !item.is_active}`.
6. `DefinitionPanel` — sadece `activeKey === 'units' | 'taxRates' | 'notes'` bloklarına `defaultSelection` prop'u geçilir. Ödeme Vadeleri, Kategoriler, Banka Bilgileri kartları bu özelliğe sahip değildir (kapsam dışı).

**Kapsam Dışında Bırakılan:**
- Checkbox'a fatura ekranında işlev bağlanması — bu ayrı bir görev, `docs/todo.md`'ye eklenmiştir (Görev 4).
- Ödeme Vadeleri / Kategoriler / Banka Bilgileri kartlarına varsayılan seçim eklenmesi.
- Deaktif bir öğe varsayılan iken deaktif edilirse `is_default` otomatik sıfırlanması (checkbox sadece aktif öğelerde tıklanabilir olduğu için pratikte bu senaryo oluşmaz).

**Tasarım Kararı:**
- Varsayılan öğeyi "işaretlemek" için Radio button yerine Checkbox tercih edildi, çünkü:
  1. Fatura ekranında bağlanacak tüm alanların zaten Checkbox/toggle UI'ye sahip olması hedefleniyor.
  2. Kullanıcı arayüzünde "bu öğeyi sistem tarafından kullanıyor mu?" anlamında checkbox daha doğru görünüyor.

---

## Mimari Notlar

**Varsayılan Seçim Kalıcılığı:**
- Backend'de `is_default` kalıcı olarak depolana, her liste sorgusu fresh durumu döner.
- Frontend, yeni kayıtları bu alanın değeriyle `Response`'dan alır; hiç local caching yok.

**Tek Seçim Zorlaması:**
- Backend endpoint'i tarafından zorlanır: `PATCH /{id}/default` çağrıldığında, diğer tüm kayıtlar atomik olarak sıfırlanır.
- Frontend'de "zaten seçili ise tıklama yok" kontrolü: `onChange={() => { if (!item.is_default) onSetDefault(...) }}`.

**Başka Tanım Türlerine Neden Eklenmedi:**
- Ödeme Vadeleri / Kategoriler — fatura oluşturmada genellikle "tüm uygun seçenekleri göster, kullanıcı seç" mantığı. "Varsayılan" kavramı odeıştirse de, fatura editöründe uygulanması ayrı bir görev olacağı için bu aşamada kapsam dışı bırakıldı.
- Banka Bilgileri — fatura detayında seçilecek hesap (genellikle 1-2 tanesi olur), "varsayılan gönderici hesabı" kısmı ayrı bir iş olarak tarif edilecekti.

---

## 2026-08-19 — Fatura Oluşturma: Ödeme Detayları'na Vade Alanı + Fatura Para Birimi Varsayılanı

**Dosya:**
- Frontend: `frontend/src/features/invoices/components/InvoiceForm.tsx`, `frontend/src/i18n/locales/tr.json`, `frontend/src/i18n/locales/en.json`
- Backend: Değişiklik yok (mevcut `due_at` alanı zaten var ve kullanılmıyor)

**İşlem Türü:** Ekleme

**Özet:**

`dashboard/invoices/new` sayfasındaki Ödeme Detayları kartında (Payment Details Card) iki eksiklik giderildi:

1. **Vade Alanı Eklendi:** "Fatura Tipi" ve "Senaryo" alanlarının bulunduğu satıra 3. kolon olarak "Vade" (Due Term) seçimi eklendi. Dropdown'da `dashboard/settings?tab=definitions` → Ödeme Vadeleri tanımlarından gelen aktif tanımlar listelenir. Kullanıcı bir vade seçtiğinde, tanımın gün sayısı bugüne eklenerek otomatik olarak `due_at` form alanına hesaplanmış vade tarihi yazılır. Seçim altında hesaplanan vade tarihini gösteren küçük bilgi metni ("Vade Tarihi: 18.09.2026") gösterilir.

2. **Fatura Para Birimi Varsayılanı:** "Fatura para birimi" (`currency`) alanı artık `dashboard/settings?tab=definitions` → Döviz Tipi'nde seçili olan para birimiyle önceden dolu gelir (`user.default_currency`). Kullanıcı isterse yine dropdown'dan başka bir para birimine değiştirebilir (kilitlenmez). Mevcut kur hesaplama mantığı (`useExchangeRate`, "Güncel Döviz Kuru" gösterimi) hiç değişmedi ve aynen çalışmaya devam eder.

### Detaylar:

**Frontend Değişiklikleri (`InvoiceForm.tsx`):**
1. Import'lar: `usePaymentTerms` hook'u ve `useAuthStore` eklendi.
2. `useAuthStore`'dan `user` state'i okundu; `defaultValues.currency` artık hardcoded `'TRY'` yerine `user?.default_currency ?? 'TRY'` kullanılıyor.
3. Yeni local state: `selectedPaymentTermId` — vade seçimi tutmak için.
4. `usePaymentTerms()` hook'u çağrılıp ödeme vadeleri listesi alınır (sadece `is_active` olanlar dropdown'da gösterilir).
5. `useEffect`: `selectedPaymentTermId` değiştiğinde, ilgili `DefinitionPaymentTerm.days` bulunup (`baseDate + days` gün olarak hesaplanan vade tarihi, ISO `YYYY-MM-DD` formatında `setValue('due_at', ...)` ile forma yazılır. Bugün referans alınır, `issued_at` formu önceden dolu değil (dead field).
6. JSX — Ödeme Detayları kartında "Fatura Tipi"/"Senaryo" satırı: grid `sm:grid-cols-2` → `sm:grid-cols-3` yapıldı. "Senaryo" Controller'ından sonra yeni bir `Select` eklendi:
   - Label: `t('invoices.form.dueTerm')` (yeni i18n key)
   - Options: `paymentTerms.filter(is_active).map(pt => ({ value: pt.id, label: "${pt.label} (${pt.days} gün)" }))`
   - Value: `selectedPaymentTermId`
   - Altında: seçiliyse hesaplanan vade tarihini gösteren `<span>` ("Vade Tarihi: 18.09.2026")

**i18n Değişiklikleri:**
- `frontend/src/i18n/locales/tr.json`: `invoices.form.dueTerm` ("Vade") ve `selectDueTerm` ("Vade seçin") eklendi.
- `frontend/src/i18n/locales/en.json`: `invoices.form.dueTerm` ("Due Term") ve `selectDueTerm` ("Select a due term") eklendi.

**Kapsam Dışında Bırakılan:**
- `issued_at` (Fatura Düzenleme Tarihi) için ayrı UI alanı eklenmedi — vade hesaplamasında "boşsa bugün" fallback'i olarak kalır.
- `payment_currency` (Ödeme para birimi) alanına varsayılan bağlanmadı.
- Backend'de değişiklik yok — `due_at`/`currency` zaten mevcut, pass-through alanlar.

**Tasarım Kararı:**
- Vade hesaplama, Bulgudan gelen tahrif tarih değeri yerine, şu an bugünü baz alır. `issued_at` hiç UI'ye bağlı olmadığı için "düzenleme tarihi" kavramı zaten canlı değil; gelecekte `issued_at` UI alanı eklenirse vade hesaplama buna bağlanabilir.

---

**Referanslar:**
- Plan: C:\Users\Mehmet Fazıl YAĞMUR\.claude\plans\rol-n-k-demli-fullstack-radiant-lampson.md
- Todo (Görev 0.4): `docs/todo.md` — "Sabit Tanımlamaların Fatura ve Diğer Formlara Entegrasyonu" (kısmen tamamlandı)
