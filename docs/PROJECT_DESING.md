# Proje Tasarım / Değişiklik Günlüğü

Bu dosya, Ayarlar sayfası (`/dashboard/settings`) ile ilgili yapılan değişikliklerin ve
regresyon düzeltmelerinin kaydını tutar. Her giriş: tarih, dosya, işlem türü (ekleme/değiştirme/
çıkarma), ve yapılanın özeti.

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
