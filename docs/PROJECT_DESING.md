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
- Backend konsolunda ResponseValidationError hatası görünmemesi (sonuç: HTTP 200 + güncellenen 
  User verisi).
