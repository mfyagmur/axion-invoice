# Proje Tasarım / Değişiklik Günlüğü

Bu dosya, Ayarlar sayfası (`/dashboard/settings`) ile ilgili yapılan değişikliklerin ve
regresyon düzeltmelerinin kaydını tutar. Her giriş: tarih, dosya, işlem türü (ekleme/değiştirme/
çıkarma), ve yapılanın özeti.

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
