# CLAUDE.md — Axion Invoice Oturum Bağlamı

Bu dosya, Claude Code'un her yeni oturumda projeyi hatırlaması için tutulur. Her önemli
karar/ilerleme sonrası bu dosya güncellenmelidir. Detaylı mimari için `PROJEPLAN.md`'ye bakılmalıdır.

---

## Şu An Neredeyiz

**Aktif Faz:** Faz 5 (Cilalama & Yayına Hazırlık) tamamlandı — test kapsamı, hata/loading
  durumları, editör responsive, prod deploy artefaktları hepsi eklendi ve doğrulandı. **Faz 1-5 =
  MVP kapsamı tamamlandı.** Kalan iki şey tamamen kullanıcının ortamına bağlı: Faz 4'ün gerçek
  Stripe test hesabıyla tarayıcı doğrulaması, ve Faz 5'in gerçek bir sunucuya deploy'u — ikisi de
  bu oturumda yapılamadı (Stripe anahtarı, tarayıcı aracı, sunucu erişimi yok).
**Geçmiş fazlar (özet):**
  - **Faz 0:** Backend iskeleti (FastAPI, Docker Compose, JWT auth, Google OAuth).
  - **Faz 1:** Landing page, login/signup UI, dashboard iskeleti, refresh token httpOnly cookie'ye
    taşındı, axios `apiClient` (401→refresh→retry), Zustand `authStore`/`localeStore`.
    Tarayıcıda kullanıcı tarafından doğrulandı ✅ (2 bug bulunup düzeltildi: CORS port eksikliği,
    yanlış signup hata mesajı).
  - **Faz 2:** Sürükle-bırak fatura şablon editörü (`dnd-kit`), `InvoiceTemplate`/
    `InvoiceTemplateField` modelleri, `reconcile_fields` (tam senkron), 3 sistem şablonu seed'i,
    tarayıcıda kullanıcı tarafından doğrulandı ✅.
  - **Faz 3:** Fatura oluşturma + Playwright/Celery ile PDF üretimi, kalemler (`invoice_line_items`),
    demo mod. Tarayıcıda kullanıcı tarafından doğrulandı ✅. Bu doğrulama sırasında
    `InvoicesPage`/`InvoiceDetailPage`'de bir `.toFixed is not a function` hatası bulunup
    düzeltildi — backend Pydantic `Decimal` alanları (`grand_total`, `subtotal`, `tax_total`,
    `quantity`, `unit_price`, `line_total`) JSON'a **string** olarak serileşiyor (Pydantic v2
    varsayılanı, float hassasiyet kaybını önlemek için); frontend tiplerinde bu alanlar `string`
    olarak düzeltildi, gösterim yerlerinde `Number(...)` ile çevriliyor.
  - **Faz 4:** Stripe abonelik/lisanslama (`Plan`/`Subscription` modelleri, otomatik Free abonelik,
    aylık fatura/özel şablon limiti → HTTP 402, webhook-senkron Checkout/Portal, Free plan PDF
    watermark'ı). Backend curl + yerel imzalı sahte webhook payload'larıyla tam doğrulandı.
    **Gerçek Stripe test hesabıyla tarayıcı doğrulaması henüz yapılmadı** — aşağıdaki "Sıradaki
    Adım"da kullanıcının tamamlaması gereken adımlar listeli.
**Son tamamlanan (Faz 5 — Cilalama & Yayına Hazırlık):**
  - **Backend testleri (`backend/tests/`):** `conftest.py` — ayrı `axion_invoice_test` veritabanı
    (aynı Postgres container'da, otomatik oluşturulur + `alembic upgrade head` çalıştırılır),
    her test `Session(bind=connection, join_transaction_mode="create_savepoint")` ile SAVEPOINT
    üzerinden izole edilip sonda rollback edilir (dev DB'ye hiç dokunmaz). 15 test:
    `test_auth.py` (signup/login/me, 401 vs 403 ayrımı — `HTTPBearer` header yokken 403,
    geçersiz token'da 401), `test_invoices.py` (fatura oluşturma, Free'de 6. faturada 402, PDF
    indirme 404→200), `test_subscriptions.py` (plan listesi, `/subscriptions/me`, checkout/portal
    anahtarsızken 503). Çalıştırma: `docker compose exec backend pytest -v` (bkz. `backend/pytest.ini`
    — `pythonpath = .`, yoksa `app` modülü import edilemiyor).
    **Not:** PDF üretimi testlerde gerçek Playwright ile çalıştırılmıyor — `.delay()` gerçek
    Redis'e gidiyor ama dev `celery-worker` container'ı ayrı bir DB'ye bağlı olduğu için invoice'ı
    bulamayıp sessizce no-op yapıyor (zararsız); "PDF hazır" senaryosu testte `pdf_url`'i elle
    set edip dosyayı elle yazarak simüle ediliyor (SAVEPOINT izolasyonu + ayrı `SessionLocal`
    connection'ı yüzünden gerçek eager Celery task'ı test DB'sindeki satırı göremezdi).
  - **Frontend testleri (`vitest`):** `vite.config.ts`'e `test` bloğu, `src/test/setup.ts`
    (`@testing-library/jest-dom` + i18n init), `src/test/renderWithProviders.tsx`
    (QueryClientProvider + MemoryRouter). 7 test: `LoginForm.test.tsx` (email validasyonu API'yi
    çağırmıyor, geçerli submit `authApi.login`'i çağırıyor, hata mesajı gösteriliyor — `authApi`
    mock'lanıyor), `InvoicesPage.test.tsx` (loading/empty/error+retry — `useInvoices` hook'u
    mock'lanıyor), `InvoiceForm.test.tsx` (402 hatasında `invoices.form.limitReached` mesajı +
    billing linki — tüm data hook'ları mock'lanıyor). `npm run test` ile çalıştırılır.
  - **Hata/loading durumları:** `InvoicesPage`/`CustomersPage`/`TemplatesPage` artık `isError`/
    `refetch`'i de kullanıyor, ortak `components/ErrorState.tsx` (mesaj + "Tekrar Dene" butonu)
    ile. `TemplateEditorPage`'e `useTemplate(id)` için loading/error guard eklendi (önce hiç yoktu).
    Yeni i18n key: `common.retry`.
  - **Editör responsive:** `TemplateEditorPage`'deki `flex gap-6` → `flex flex-col gap-4 lg:flex-row
    lg:gap-6`; `FieldPalette`/`StylePanel`'in sabit `w-56` genişliği `w-full lg:w-56`'ya çevrildi.
    `Canvas` zaten responsive'ti (genişliği `ResizeObserver` ile ölçüp mm→px `scale`'i yeniden
    hesaplıyor) — ek bir şey gerekmedi. `CustomersPage`'in form satırı `flex-col sm:flex-row` oldu.
  - **Prod deploy artefaktları** (gerçek sunucuya deploy edilmedi, sadece hazırlandı+build test edildi):
    - `backend/Dockerfile`: `gunicorn` (yeni bağımlılık) + `uvicorn.workers.UvicornWorker`, 4 worker,
      non-root `appuser` (uid 1000). Playwright'ın Chromium'u `/root/.cache` altına iniyor ve
      non-root kullanıcı `/root`'u traverse edemediği için `/home/appuser/.cache`'e kopyalanıp
      `PLAYWRIGHT_BROWSERS_PATH` ona yönlendiriliyor. Build + smoke-test edildi (`docker run` ile
      `whoami` → `appuser`, gunicorn 4 worker başlattı, `/health` 200 döndü).
    - `frontend/Dockerfile` (yeni): multi-stage — `node:22-slim` ile `npm run build`, sonra
      `nginx:1.27-alpine` ile statik dosyaları serve eder. `VITE_API_BASE_URL`/`VITE_GOOGLE_CLIENT_ID`
      build-arg olarak alınır (Vite `VITE_*` değişkenlerini **build zamanında** inline ediyor,
      runtime container env değişkeni işe yaramaz). `frontend/nginx.conf`: SPA fallback
      (`try_files $uri $uri/ /index.html`). Build + smoke-test edildi (kök `/` ve derin bir route
      `/dashboard/invoices` ikisi de 200 döndü).
    - Kök dizinde `docker-compose.prod.yml`: postgres/redis/backend/celery-worker/frontend, hepsi
      `restart: unless-stopped`, bind-mount yok (imaja gömülü kod). Kök `.env.example`:
      `POSTGRES_PASSWORD`/`VITE_API_BASE_URL`/`VITE_GOOGLE_CLIENT_ID`. `docker compose -f
      docker-compose.prod.yml config` ile syntax doğrulandı.
    - `backend/.env.example`'a prod'da değişmesi gereken alanlar için yorum satırları eklendi
      (`COOKIE_SECURE=true`, gerçek `JWT_SECRET_KEY`, `CORS_ORIGINS`/`FRONTEND_URL` gerçek origin,
      live-mode Stripe anahtarları).
  - **Bilinen sınırlık:** Bu oturumda **gerçek bir sunucu/hesap erişimi yoktu** — `docker compose -f
    docker-compose.prod.yml up -d --build` hiç çalıştırılmadı, sadece üç image ayrı ayrı build
    edilip smoke-test edildi. Tarayıcı otomasyon aracı da yoktu — responsive/hata-durumu
    değişiklikleri sadece kod/CSS seviyesinde doğrulanabildi, gerçek tarayıcıda görsel teyit
    kullanıcıya kalıyor.
**Sıradaki adım:** Kullanıcının kendi Stripe test hesabıyla Faz 4 doğrulaması + kendi sunucusunda
  prod deploy + tarayıcıda responsive/hata-durumu görsel teyidi (bkz. aşağıdaki "Sıradaki Adım").

---

## Kesinleşmiş Mimari Kararlar

| Karar | Seçim | Gerekçe |
|-------|-------|---------|
| Backend | Python + FastAPI | Stripe/AI entegrasyon deneyimi mevcut |
| Editör yaklaşımı | DOM tabanlı (dnd-kit) | React ekosistemine daha uygun |
| PDF üretimi | Sunucu tarafı Playwright | Ekran = PDF garantisi, client-side render tutarsızlığı yok |
| Abonelik modeli | Stripe, tier'lı (Free/Pro/Business) | Tekrarlayan gelir, TubeInsight'ta da kullanılan pattern |
| Veritabanı | PostgreSQL + JSONB (layout_json) | Tasarım pozisyon verisi esnek şema gerektiriyor |
| Async işler | Celery + Redis | PDF üretimi ve e-posta gönderimi bloklamamalı |
| Auth | JWT (access+refresh) + Google OAuth | Bireysel/Kurumsal ayrımı ile |
| Refresh token saklama | httpOnly cookie (`refresh_token`, `path=/api/v1/auth`) | XSS'e karşı erişilemez; access token (15dk) sadece Zustand'da bellekte tutulur, localStorage'a yazılmaz |
| Frontend HTTP istemcisi | axios | 401→refresh→retry interceptor deseni native fetch'e göre daha az boilerplate |
| Frontend routing | React Router v7, `createBrowserRouter` | Data-router API, `ProtectedRoute`/`PublicOnlyRoute` ile auth durumuna göre yönlendirme |
| Frontend i18n | react-i18next + i18next | PROJEPLAN §7'de belirlenmişti, Zustand `localeStore` (persist) ile senkron |
| layout_json birimi | milimetre (px değil) | Ekran canvas'ı ve Faz 3'teki Playwright PDF render'ı aynı koordinat sistemini paylaşacak |
| invoice_template_fields kapsamı | Built-in alanlar da satır alır (sadece custom değil) | Faz 3'teki fatura doldurma formu, built-in/custom ayrımı bilmeden sadece template_id'ye göre input render edebilsin diye |
| Sistem şablonu düzenleme | Asla doğrudan PUT edilemez, sadece `/duplicate` (fork) veya editörde düzenleyip `create` ile yeni kopya | Paylaşılan seed veriyi bozmadan "hazır şablondan başlama" akışını sağlar |
| Alan reconcile stratejisi | Tam senkron (upsert + eksik olanı sil), orphan bırakılmaz | Faz 3 formu, canvas'tan kaldırılmış bir alan için hâlâ input göstermesin diye |
| Kalemler (line items) | Şablon alanı değil, ayrı `invoice_line_items` tablosu + PDF'te sabit bir bant | Faz 2 editörü tekrarlayan tablo alan tipini desteklemiyor, tüm sistem şablonlarında y=90-230mm boş |
| PDF depolama | Yerel disk / Docker volume (`pdf_storage`) | Object storage hesabı yok, dev için yeterli; prod'da (Faz 5) gerçek storage'a taşınacak |
| PDF render birimi | Native CSS `mm` (px'e çevrilmiyor) | DB zaten mm tutuyor, "ekranda gördüğün = PDF'de çıkan" garantisi |
| Playwright API | Senkron (`sync_playwright`), async değil | Celery worker senkron process, `asyncio.run()` event-loop sorunu çıkarır |
| Backend base image | `python:3.12-slim-bookworm` (trixie değil) | Playwright `--with-deps`'in apt paket listesi trixie'de eksik (`ttf-unifont` vb. yok) |
| Fatura numarası | `User.invoice_sequence` atomik sayaç | `count(*)+1` fatura silindiğinde numara çakışması üretebilir |
| E-posta gönderimi | İskelet — SMTP yoksa sadece log | Henüz sağlayıcı seçilmedi, gerçek gönderim ayrı bir adımda eklenecek |
| Demo mod | Sabit `is_demo` kullanıcı, `require_not_demo` ile salt-okunur, PDF indirme istisna | "Deneyebilme" değerini korurken paylaşılan demo veriyi mutasyondan korur |
| Varsayılan abonelik | Her kullanıcıya signup/google-login anında otomatik Free `Subscription` | Limit kontrolü her zaman "abonelik var" varsayımıyla çalışabilsin, null-check dallanması gerekmez |
| Stripe webhook senkronu | Canlı `stripe.Subscription.retrieve` API çağrısı yapmaz, sadece webhook payload'ındaki `metadata.user_id` + event verisi kullanılır | Checkout Session'da `subscription_data.metadata` set edilip Stripe tarafından `Subscription`'a taşınıyor; ekstra ağ çağrısı gerekmiyor, webhook mantığı gerçek anahtar olmadan da yerel imzayla test edilebiliyor |
| Limit aşımı hata kodu | HTTP 402 Payment Required | Demo modunun 403'ünden ayrışsın, frontend farklı bir mesaj/CTA gösterebilsin |
| Plan/Stripe price ID eşleşmesi | `Plan.stripe_price_id_monthly/yearly` seed'de NULL, kullanıcı gerçek Stripe hesabı kurunca düz SQL ile doldurur | Bu oturumda gerçek Stripe anahtarı yoktu (Faz 3'teki demo e-posta düzeltmesiyle aynı desen) |
| Şablon limiti (Free) | 0 özel şablon — sadece 3 sistem şablonu kullanılabilir | PROJEPLAN §6'daki "1 (sadece hazır şablon)" notu, kullanıcıyla netleştirilip "0 özel şablon" olarak yorumlandı |
| Watermark hesaplama zamanı | Render zamanında (PDF üretilirken), fatura oluşturma anında değil | Kullanıcı plan değiştirirse yeni üretilecek PDF'ler güncel duruma göre olsun; zaten üretilmiş PDF'ler otomatik yeniden render edilmiyor (bilinen sınırlama) |
| Backend test DB izolasyonu | Aynı Postgres container'da ayrı `axion_invoice_test` DB'si, `join_transaction_mode="create_savepoint"` ile SAVEPOINT-tabanlı rollback | SQLite yerine gerçek Postgres kullanmak JSONB/Decimal davranışını prod'a birebir yansıtır; SAVEPOINT sayesinde testler içindeki `db.commit()` çağrıları dış transaction'ı bitirmeden testler birbirini kirletmiyor |
| Test'lerde PDF/Celery | `.delay()` gerçek Redis'e gidiyor ama mock'lanmıyor; PDF-hazır senaryosu `pdf_url`/dosyayı elle simüle ediyor | Dev `celery-worker` container'ı ayrı bir DB'ye bağlı olduğu için test DB'sindeki invoice'ı bulamayıp zararsızca no-op yapıyor; gerçek Playwright'ı her testte çalıştırmak yavaş ve test-DB/worker-DB çapraz-connection görünürlük sorunu yaratırdı |
| Frontend hata durumu | Ortak `components/ErrorState.tsx` (mesaj + "Tekrar Dene") | `InvoicesPage`/`CustomersPage`/`TemplatesPage` aynı deseni 3 kez tekrarlamasın diye küçük bir paylaşılan bileşen |
| Prod backend process modeli | `gunicorn` + `uvicorn.workers.UvicornWorker`, non-root `appuser` | Dev'deki tek-process `uvicorn --reload`'ın aksine prod'da çoklu worker + reload kapalı; Chromium sandbox'ı zaten non-root altında daha güvenli çalışıyor |
| Prod frontend serve | Multi-stage Docker build → statik dosyalar `nginx`'te, `VITE_*` değişkenleri build-arg | Vite `VITE_*` değişkenlerini derleme anında JS bundle'a gömüyor, runtime container env'i işe yaramıyor — bu yüzden prod URL'i build-time'da bilinmeli |

**Bu tablo yeni bir mimari karar alındığında güncellenmeli, silinmemelidir.**

---

## Çalışma Yöntemi (Mehmet'in tercih ettiği pattern)

1. Her faz **checkpoint bazlı** yürütülür — PROJEPLAN.md'deki kabul kriteri karşılanmadan
   sonraki faza geçilmez.
2. Bir fazın tüm alt görevleri bitmeden ara commit'ler yapılabilir ama fazın "tamamlandı"
   işaretlenmesi kabul kriteri test edildikten sonra olur.
3. Zaman bütçesi haftada ~10-15 saat — büyük refactor'lardan çok, çalışan ve ilerleyen
   MVP'ye öncelik verilir (hız > mükemmellik, ama güvenlik ve auth katmanında ödün verilmez).
4. Her oturum sonunda bu dosyanın "Şu An Neredeyiz" bölümü güncellenmelidir.

---

## Kod Standartları

**Backend (Python/FastAPI):**
- Tüm fonksiyonlarda type hint zorunlu
- Pydantic v2 şemaları `schemas/`, SQLAlchemy modelleri `models/` altında ayrı tutulur
- İş mantığı endpoint'lerin içinde değil `services/` katmanında yazılır
- Her yeni endpoint için en az happy-path testi (`tests/`)

**Frontend (React/TS):**
- Strict TypeScript, `any` kullanımından kaçınılır
- Her özellik `features/<isim>/` altında kendi `components/`, `hooks/`, `api/` alt klasörleriyle izole edilir
- Server state için TanStack Query, sadece client-only state için Zustand kullanılır (ikisini karıştırma)
- Tüm kullanıcıya görünen metinler i18n key'i üzerinden gelir — hardcoded TR/EN string yasak

---

## Yapılmaması Gerekenler

- ❌ e-Fatura/GİB resmi entegrasyonuna Faz 0-5 arasında başlanmaz (kapsam dışı, not: PROJEPLAN.md §9)
- ❌ Client-side html2canvas ile "gerçek" PDF üretimi yapılmaz — sadece hızlı önizleme için kullanılabilir,
  fatura üretiminin kaynak-of-truth'u her zaman backend Playwright render'ıdır
- ❌ Stripe webhook doğrulaması atlanmaz (signature check her zaman zorunlu)
- ❌ Plan limiti kontrolü frontend'de değil backend'de zorlanır (frontend sadece UX için gösterir)

---

## Sıradaki Adım (Detaylı)

Kod tarafında Faz 1-5 (MVP kapsamının tamamı) bitti. Kalan her şey kullanıcının kendi ortamında
yapması gereken doğrulama/deploy adımları — hiçbiri bu oturumda tamamlanamadı çünkü gerçek Stripe
anahtarı, tarayıcı aracı ve sunucu erişimi hiçbiri mevcut değildi.

**1. Faz 4'ün kullanıcı tarafından tamamlanması gereken kısmı** (Stripe test hesabıyla):
1. [stripe.com](https://stripe.com) test hesabından `STRIPE_SECRET_KEY`'i alıp backend `.env`'e
   yazmak.
2. Stripe Dashboard'da Pro/Business için aylık+yıllık 4 Price oluşturup ID'lerini DB'ye yazmak:
   ```sql
   UPDATE plans SET stripe_price_id_monthly='price_...', stripe_price_id_yearly='price_...' WHERE key='pro';
   UPDATE plans SET stripe_price_id_monthly='price_...', stripe_price_id_yearly='price_...' WHERE key='business';
   ```
3. `stripe listen --forward-to localhost:8000/api/v1/webhooks/stripe` çalıştırıp verdiği
   `whsec_...` değerini backend `.env`'deki `STRIPE_WEBHOOK_SECRET`'e yazmak, backend'i
   `docker compose up -d backend` ile yeniden başlatmak (env değişikliği restart ile yüklenmez,
   recreate gerekir — Faz 1'de öğrenildi).
4. Tarayıcıda `/dashboard/billing` → bir plana "Yükselt" → Stripe test kartıyla
   (`4242 4242 4242 4242`) checkout'u tamamlayıp planın yükseldiğini, "Aboneliği Yönet"
   butonunun Portal'ı açtığını, portal'dan iptal edince Free'ye döndüğünü görmek.
5. Free kullanıcıyla 5 fatura oluşturup 6.'da engellenip engellenmediğini, özel şablon
   oluşturmanın engellendiğini, Free PDF'inde filigranın göründüğünü tarayıcıda teyit etmek.

**2. Faz 5'in gerçek sunucuya deploy'u:**
1. Bir sunucu/VPS hazırlamak (Docker + Docker Compose kurulu), DNS'i yönlendirmek.
2. Repo kökünde `.env.example`'ı `.env`'e kopyalayıp `POSTGRES_PASSWORD` (güçlü bir parola),
   `VITE_API_BASE_URL` (backend'in gerçek public URL'i, örn. `https://api.domain.com/api/v1`),
   `VITE_GOOGLE_CLIENT_ID` doldurmak.
3. `backend/.env`'i prod değerleriyle doldurmak — `.env.example`'daki "Prod:" yorumlu satırlara
   bakılmalı (gerçek `JWT_SECRET_KEY`, `COOKIE_SECURE=true`, gerçek `CORS_ORIGINS`/`FRONTEND_URL`,
   live-mode Stripe anahtarları).
4. `docker compose -f docker-compose.prod.yml up -d --build` (ilk build Playwright/Chromium
   indirdiği + frontend'i derlediği için uzun sürebilir).
5. `docker compose -f docker-compose.prod.yml exec backend alembic upgrade head`.
6. HTTPS için ters proxy/TLS sonlandırma eklemek gerekiyor — `docker-compose.prod.yml`'deki
   `frontend`/`backend` servisleri düz HTTP'de 80/8000 portlarını dinliyor, Let's Encrypt/Caddy/
   Traefik gibi bir katman bu oturumda eklenmedi (kapsam dışı bırakıldı, sunucu olmadan test
   edilemezdi).
7. Tarayıcıda responsive değişiklikleri (özellikle `TemplateEditorPage`'in tablet/mobil'de
   stack olması) ve yeni hata/retry durumlarını (örn. backend'i geçici durdurup "Tekrar Dene"
   butonunun çalıştığını görmek) teyit etmek.

**Not:** Dev ortamını tekrar ayağa kaldırmak için `backend/` dizininde `docker compose up -d`.
Yeni test dosyaları/`pytest.ini` `docker-compose.yml`'e bind-mount edildi (`./tests`, `./pytest.ini`)
— container'ı yeniden oluşturmak gerekebilir (`docker compose up -d backend`). Frontend için
`frontend/` dizininde `npm run dev`; testler için `npm run test`. Google OAuth'u gerçek test etmek
için backend `.env`'deki `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` ve frontend `.env`'deki
`VITE_GOOGLE_CLIENT_ID` doldurulmalı; SMTP gerçek e-posta göndermek için backend `.env`'deki
`SMTP_*` alanları doldurulmalı (boşken sadece log'a yazar).
