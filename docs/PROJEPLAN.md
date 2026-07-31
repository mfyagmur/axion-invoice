# Axion Invoice - Proje Planı

**Durum:** Faz 3 tarayıcıda kullanıcı tarafından doğrulandı ✅. Faz 4 (Abonelik & Lisanslama)
backend curl ile tam doğrulandı — gerçek Stripe hesabıyla tarayıcı testi hâlâ kullanıcı bekliyor.
Faz 5 (Cilalama & Yayına Hazırlık) tamamlandı: test kapsamı (backend 15 + frontend 7, hepsi yeşil),
hata/loading durumları, editör responsive, prod deploy artefaktları (build+smoke-test edildi) —
gerçek sunucuya deploy ve tarayıcı görsel doğrulaması kullanıcıya kalıyor. **Faz 1-5 = MVP kapsamı
tamamlandı**, kalan adımlar kullanıcının kendi ortamında doğrulama.
**Son Güncelleme:** 2026-07-31

---

## 1. Proje Özeti

Axion Invoice, kullanıcıların hazır şablonlardan seçim yapabildiği veya kendi fatura tasarımını
A4 sayfası üzerinde sürükle-bırak yöntemiyle oluşturabildiği bir SaaS fatura yönetim platformudur.

**Temel Farklılaştırıcı:** Kullanıcı, sistemde önceden tanımlı olmayan alanları (örn: "Ek İskonto Oranı")
kendi boş alan bileşenini sayfaya bırakıp isim + değer atayarak oluşturabilir. Bu, klasik fatura
şablon araçlarından ayrışan temel özelliktir.

**Hedef kullanıcı:** Bireysel serbest çalışanlar ve KOBİ'ler (Bireysel / Kurumsal hesap ayrımı).

---

## 2. Teknoloji Yığını

### Frontend (mevcut, PROJECT_STRUCTURE.md'den)
- React 19 + TypeScript + Vite 8
- Zustand (global state) — auth durumu, aktif tasarım editörü state'i
- TanStack Query (server state, cache, invalidation)
- React Hook Form + Zod (form + şema doğrulama)
- Tailwind CSS v4
- React Router DOM v7
- Lucide React (ikonlar)
- **Eklenecek yeni bağımlılıklar:**
  - `@dnd-kit/core`, `@dnd-kit/modifiers` → sürükle-bırak editör
  - `react-i18next`, `i18next` → TR/EN dil desteği
  - `axios` veya native `fetch` + interceptor katmanı → JWT refresh akışı
  - `@react-oauth/google` → Google login (frontend tarafı)
  - `react-pdf` veya `pdfjs-dist` → PDF önizleme (opsiyonel, MVP sonrası)

### Backend (yeni)
- **Python 3.12 + FastAPI** — Stripe ve AI entegrasyon deneyimine paralel, hızlı geliştirme
- **PostgreSQL** — ana veritabanı (JSONB alanları template pozisyon verisi için kritik)
- **SQLAlchemy 2.x + Alembic** — ORM + migration
- **Redis** — cache + Celery broker
- **Celery** — asenkron işler (PDF üretimi, e-posta gönderimi, fatura numarası sıralaması)
- **Playwright (Python)** — HTML/CSS tasarımını sunucu tarafında A4 PDF'e render etme
- **python-jose / PyJWT** — JWT access + refresh token
- **Authlib** — Google OAuth2 akışı
- **Stripe Python SDK** — abonelik, webhook, fatura (kendi platform faturası, karıştırmamak gerek)
- **Pydantic v2** — request/response şemaları

### Neden DOM tabanlı editör + sunucu tarafı Playwright?
Editör tarayıcıda normal HTML/CSS/absolute positioning ile çalışır (dnd-kit). Kullanıcı tasarımı
kaydettiğinde pozisyon verisi (x, y, width, height, font, alignment) JSON olarak DB'ye yazılır.
Fatura üretilirken backend bu JSON'u aynı CSS kurallarıyla bir HTML template'e enjekte eder ve
Playwright ile A4 PDF'e render eder. Bu sayede **ekranda gördüğün = PDF'de çıkan** garantisi sağlanır,
client-side html2canvas gibi yaklaşımların taşma/font kayması sorunları yaşanmaz.

---

## 3. Klasör Yapısı (Güncellenmiş)

```
axion-invoice/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── auth.py
│   │   │       ├── users.py
│   │   │       ├── templates.py
│   │   │       ├── invoices.py
│   │   │       ├── subscriptions.py
│   │   │       └── webhooks.py        # Stripe webhook
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── security.py            # JWT, hashing
│   │   │   └── deps.py                # dependency injection (current_user vs.)
│   │   ├── models/                    # SQLAlchemy modelleri
│   │   ├── schemas/                   # Pydantic şemaları
│   │   ├── services/
│   │   │   ├── pdf_service.py         # Playwright render
│   │   │   ├── stripe_service.py
│   │   │   └── email_service.py
│   │   ├── tasks/                     # Celery task'ları
│   │   ├── templates_html/            # PDF render için base HTML şablonları
│   │   └── main.py
│   ├── alembic/
│   ├── tests/
│   ├── requirements.txt
│   └── .env.example
├── frontend/                          # (mevcut yapı korunuyor)
│   ├── src/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── invoice-editor/        # YENİ - sürükle-bırak editör
│   │   │   ├── invoices/              # YENİ - fatura listesi/oluşturma
│   │   │   ├── dashboard/             # YENİ
│   │   │   └── billing/               # YENİ - abonelik yönetimi
│   │   ├── i18n/
│   │   │   ├── locales/
│   │   │   │   ├── tr.json
│   │   │   │   └── en.json
│   │   │   └── config.ts
│   │   └── layouts/
│   │       ├── DashboardLayout.tsx    # Sidebar + Topbar
│   │       └── PublicLayout.tsx       # Landing page için
├── docs/
│   ├── PROJEPLAN.md                   # (bu dosya)
│   └── CLAUDE.md
```

---

## 4. Veritabanı Şeması (Ana Tablolar)

```
users
  id, email, password_hash (nullable - google login ise null),
  google_id (nullable), full_name, account_type [bireysel|kurumsal],
  company_name (nullable), locale [tr|en], created_at

organizations                -- kurumsal hesaplarda ekip üyesi desteği için (Faz sonrası genişletilebilir)
  id, owner_user_id, name, tax_number

invoice_templates
  id, user_id, name, is_system_template (bool),   -- hazır şablonlar
  page_size [A4], layout_json (JSONB),             -- tüm alanların x/y/w/h/style bilgisi
  created_at, updated_at

invoice_template_fields
  id, template_id, field_key,                      -- "unit_price", "custom_field_1" vb.
  field_type [text|number|date|currency|custom],
  label, is_custom (bool), default_value

invoices
  id, user_id, template_id, invoice_number, customer_id,
  status [draft|sent|paid|overdue|cancelled],
  currency, subtotal, tax_total, grand_total,
  data_json (JSONB),                               -- şablon alanlarına karşılık gelen doldurulmuş veri
  pdf_url (nullable), issued_at, due_at

invoice_customers
  id, user_id, name, email, tax_number, address

invoice_line_items                                 -- Faz 3'te eklendi, orijinal şemada yoktu
  id, invoice_id, description, quantity, unit_price -- line_total DB'de tutulmaz, okumada hesaplanır

plans
  id, key [free|pro|business], name, price_monthly, price_yearly,   -- Faz 4'te "key" eklendi
  max_invoices_per_month, max_templates,                            -- None = sınırsız
  stripe_price_id_monthly, stripe_price_id_yearly                   -- Faz 4 sonunda NULL (bkz. §10)

subscriptions                                        -- Faz 4'te eklendi, her kullanıcıya 1:1
  id, user_id (unique), plan_id, stripe_customer_id, stripe_subscription_id (unique),
  status [active|past_due|canceled|trialing],
  billing_interval [monthly|yearly] (nullable), current_period_end
```

---

## 5. Kimlik Doğrulama Akışı

1. **Kayıt (Signup):** Bireysel / Kurumsal seçimi → email+şifre veya Google ile devam et
2. **JWT:** Access token (15 dk) + Refresh token (7 gün, httpOnly cookie) — frontend axios
   interceptor 401 aldığında otomatik refresh dener
3. **Google Login:** Frontend `@react-oauth/google` ile id_token alır → backend `/auth/google`
   endpoint'i Authlib ile doğrular, kullanıcı yoksa otomatik oluşturur
4. **Demo Mod:** Landing page'de "Demoyu Dene" butonu → backend'de sabit bir demo kullanıcıya
   ait read-only/sandbox session (gerçek kayıt gerektirmeden hazır verilerle dashboard'u gezme)

---

## 6. Abonelik / Lisans Modeli (Stripe, Tier'lı SaaS)

| Plan | Fiyat (örnek) | Aylık Fatura Limiti | Şablon Limiti | Özellikler |
|------|---------------|----------------------|----------------|------------|
| Free | 0 | 5 | 1 (sadece hazır şablon) | Watermark'lı PDF |
| Pro | 149₺/ay | 100 | 10 (özel tasarım dahil) | Watermark yok, öncelikli destek |
| Business | 399₺/ay | Sınırsız | Sınırsız | Çoklu kullanıcı (Faz 5+), API erişimi |

- Stripe Checkout ile abonelik başlatma, Stripe Customer Portal ile iptal/yükseltme
- Webhook (`invoice.paid`, `customer.subscription.updated/deleted`) ile `subscriptions` tablosu
  senkron tutulur
- Backend'de her fatura oluşturma isteğinde plan limiti kontrolü (middleware/dependency)

---

## 7. Dil Desteği (i18n)

- `frontend/src/i18n/locales/{tr,en}.json` — düz key-value yapı, namespace'lere bölünebilir
  (`common.json`, `dashboard.json`, `invoice.json` şeklinde büyürse ayrılır)
- Dil seçimi Zustand store + localStorage'da tutulur, `i18next` bunu okur
- Kullanıcının DB'deki `locale` alanı, login sonrası tercih edilen dili otomatik uygular
- Tarih/para birimi formatlaması `Intl.NumberFormat` / `Intl.DateTimeFormat` ile locale'e göre

---

## 8. Faz Planı (Checkpoint Bazlı)

### Faz 0 — Altyapı (Backend iskeleti) ✅ TAMAMLANDI
- [x] FastAPI proje iskeleti, Docker Compose (postgres, redis, backend, celery worker)
- [x] SQLAlchemy modelleri + Alembic ilk migration
- [x] JWT auth (signup/login/refresh) çalışır durumda, curl ile test
- [x] Google OAuth entegrasyonu (backend tarafı hazır, uçtan uca test Faz 1'de frontend ile)
- **Kabul Kriteri:** ✅ Yeni kullanıcı kayıt olup token alabiliyor, token ile korumalı bir endpoint'e
  erişebiliyor (`/api/v1/auth/signup` → `/me`, curl ile doğrulandı)

### Faz 1 — Landing Page + Auth UI + Dashboard İskeleti ✅ TAMAMLANDI
- [x] Landing page (Hero, özellikler, fiyatlandırma, CTA) — responsive
- [x] Signup/Login formları (React Hook Form + Zod), Google login butonu (client ID girilene kadar
      koşullu olarak gizli)
- [x] Dashboard layout: sol sidebar (Dashboard, Faturalar, Şablonlar, Müşteriler, Ayarlar, Faturalama)
- [x] TR/EN dil değiştirici header'da (react-i18next + Zustand `localeStore`)
- **Kabul Kriteri:** Kullanıcı kayıt olup dashboard'a düşüyor, sidebar üzerinden boş sayfalar arasında
      gezinebiliyor, dil değişince metinler anlık güncelleniyor — `npm run build`/`npm run lint`
      temiz, backend auth akışı curl ile uçtan uca doğrulandı; **gerçek tarayıcıda görsel/etkileşimli
      test bu oturumda tarayıcı aracı olmadığı için yapılamadı, teyit bekliyor.**
- **Yan değişiklik:** Refresh token JSON body'den httpOnly cookie'ye taşındı (bkz. §5 ve CLAUDE.md
  mimari kararlar tablosu), backend'de `/logout` endpoint'i eklendi.

### Faz 2 — Fatura Tasarım Editörü (Çekirdek Özellik) ✅ TAMAMLANDI (tarayıcıda kullanıcı tarafından doğrulandı)
- [x] A4 canvas alanı (mm→px sabit oranlı render, `ResizeObserver` ile responsive scale)
- [x] dnd-kit ile hazır alan bileşenlerini (Müşteri Adı, Tarih, Vade Tarihi, Fatura No, Şirket
      Adı, Ara Toplam, Vergi) sürükleyip bırakma
- [x] Boş/özel alan bileşeni: kullanıcı label + değer tipi (metin/sayı/tarih/para birimi) atayabiliyor
- [x] Tasarımı JSON olarak kaydetme (`layout_json`, backend'de `invoice_templates`/
      `invoice_template_fields` tabloları + 2 Alembic migration + tam CRUD + `/duplicate`)
- [x] Hazır sistem şablonlarından (3 tasarım: Basit/Kurumsal/Minimal) başlayarak düzenleme
- **Kabul Kriteri:** Backend curl ile tam doğrulandı (create/update/reconcile/duplicate/sistem
      şablonu PUT reddi). Frontend `npm run build`/`npm run lint` temiz. **Gerçek tarayıcıda
      sürükle-bırak/kaydet/tekrar-aç akışı henüz görsel olarak teyit edilmedi** (bu oturumda
      tarayıcı otomasyon aracı yoktu) — Faz 3'e geçmeden önce yapılmalı.
- **Yan not:** Temel stil paneli (font boyutu/kalın/hizalama) kapsam kararı olarak eklendi,
  resize (yeniden boyutlandırma) bilinçli olarak bu fazın dışında bırakıldı (bkz. CLAUDE.md).

### Faz 3 — Fatura Oluşturma + PDF Üretimi ✅ TAMAMLANDI (tarayıcı testi bekliyor)
- [x] Şablon seçip fatura verisi (müşteri, kalemler, tutarlar) girme formu — kalemler ayrı sabit
      bir `invoice_line_items` tablosu/blok olarak eklendi (şablon alanı değil)
- [x] Backend: Playwright ile `layout_json` + veri → A4 PDF render, Celery task olarak kuyruğa alma
- [x] Oluşturulan PDF'i indirme / e-posta ile gönderme (e-posta iskelet — SMTP yoksa log'a yazar)
- [x] Demo mod: hazır sahte veriyle bu akışın tamamını kayıt olmadan deneyebilme (salt-okunur,
      PDF indirme istisna)
- **Kabul Kriteri:** Backend curl ile tam doğrulandı — gerçek bir fatura oluşturuldu, Celery PDF'i
      birkaç saniyede üretti, indirilen PDF'in içeriği (`pdftotext`) şirket/müşteri/kalem/toplam
      verileriyle birebir eşleşti. **Gerçek tarayıcıda görsel doğrulama (PDF'in ekrandaki
      tasarımla birebir örtüştüğünü göz ile teyit etme) henüz yapılmadı** (bu oturumda tarayıcı
      otomasyon aracı yoktu) — Faz 4'e geçmeden önce yapılmalı.
- **Yan notlar:** Backend Dockerfile base image'i `python:3.12-slim-bookworm`'a sabitlendi
  (Playwright'ın apt bağımlılıkları Debian trixie'de eksikti). Fatura numarası çakışma riskini
  önlemek için `count+1` yerine `User.invoice_sequence` atomik sayaç kullanıldı.

### Faz 4 — Abonelik & Lisanslama ✅ TAMAMLANDI (backend curl ile doğrulandı, Stripe hesabı/tarayıcı testi bekliyor)
- [x] Her kullanıcıya signup/google-login anında otomatik Free plan `Subscription`'ı atanır
      (`ensure_default_subscription`), mevcut kullanıcılar migration'da backfill edildi
- [x] Fiyatlandırma sayfası (dashboard `BillingPage`) → Stripe Checkout entegrasyonu
      (aylık+yıllık), Stripe Customer Portal ile abonelik yönetimi
- [x] Webhook (`customer.subscription.created/updated/deleted`) ile abonelik durumu
      senkronizasyonu — canlı Stripe API çağrısı gerektirmeyen metadata tabanlı tasarım (bkz.
      CLAUDE.md mimari kararlar), imza doğrulaması her zaman zorunlu
- [x] Plan limitlerinin backend'de zorlanması: aylık fatura limiti (`check_invoice_limit`) ve
      özel şablon limiti (`check_template_limit`, Free=0 "sadece hazır şablon"), aşılınca HTTP 402
      + frontend'de billing linkine yönlendiren hata mesajı
- [x] Free plan PDF'lerine watermark (render zamanında kullanıcının o anki planına göre hesaplanır)
- **Kabul Kriteri:** Free kullanıcı 5. faturadan sonra 402 alıyor, özel şablon oluşturamıyor,
      webhook ile Business'a yükseltilince limit kalkıyor ve watermark kalkıyor — hepsi curl +
      yerel olarak imzalanmış sahte webhook payload'larıyla doğrulandı (bkz. CLAUDE.md). **Stripe
      test modunda gerçek Checkout/Portal akışı ve tarayıcıda görsel doğrulama henüz yapılmadı**
      (bu oturumda Stripe anahtarları/tarayıcı aracı yoktu) — kullanıcının kendi Stripe test
      hesabıyla tamamlaması gerekiyor (bkz. CLAUDE.md "Sıradaki Adım").

### Faz 5 — Cilalama & Yayına Hazırlık (Sellable MVP)
- [x] Responsive son kontrol: `TemplateEditorPage` (palette/canvas/style-panel) `lg:` altında dikey
      stack oluyor, `DashboardLayout` zaten responsive'ti; diğer sayfalar zaten tek sütun
- [x] Hata durumları: `InvoicesPage`/`CustomersPage`/`TemplatesPage` artık `isError` + "Tekrar Dene"
      (`ErrorState` bileşeni), `TemplateEditorPage` şablon fetch'i için loading/error guard'ı
- [x] Temel test kapsamı: backend 15 pytest (auth, fatura oluşturma + 402 limiti, PDF indirme,
      abonelik/plan endpoint'leri — ayrı `axion_invoice_test` DB'sinde, transaction-rollback
      izolasyonuyla), frontend 7 vitest (LoginForm doğrulama/hata, InvoicesPage loading/empty/
      error/retry, InvoiceForm 402 limit mesajı + billing linki)
- [x] Prod deploy artefaktları: `backend/Dockerfile` (gunicorn+uvicorn worker, non-root user),
      `frontend/Dockerfile` (multi-stage, nginx + SPA fallback), kök dizinde
      `docker-compose.prod.yml` — üçü de build+smoke-test edildi. **Gerçek bir sunucuya deploy bu
      oturumda yapılmadı** (sunucu/hesap erişimi yok) — kullanıcı kendi sunucusunda devreye alacak.
- **Kabul Kriteri:** Backend/frontend testleri yeşil, prod compose dosyaları `docker compose config`
      ile doğrulandı ve üç image de gerçekten build+smoke-test edildi (bkz. CLAUDE.md). Tarayıcıda
      responsive/hata-durumu görsel doğrulaması ve gerçek sunucuya deploy kullanıcıya kalıyor.

---

## 9. MVP Kapsam Sınırları

**Faz 1-4 = Satılabilir MVP.** Şunlar MVP dışı, sonraya bırakılıyor:
- Ekip/çoklu kullanıcı yönetimi (kurumsal hesapta tek admin yeterli, MVP'de)
- Muhasebe entegrasyonları (e-Fatura/e-Arşiv resmi entegrasyonu — bu ayrı ve büyük bir iş, notu düşülsün)
- Mobil native uygulama (sadece responsive web)
- Şablon pazaryeri / şablon paylaşımı

---

## 10. Riskler & Notlar

- **Playwright + Celery worker deploy karmaşıklığı:** Headless tarayıcı içeren container biraz ağır
  olabilir; erken aşamada Docker image boyutunu test et.
- **Mobil/tablet'te sürükle-bırak editör:** Dokunmatik ekranda dnd-kit deneyimi masaüstünden farklı
  olacak — Faz 2'de en azından "tablet'te salt görüntüleme, düzenleme masaüstünde" gibi bir kısıtla
  başlanabilir, bu ürün kararı Faz 2 başında netleştirilmeli.
- **e-Fatura/e-Arşiv (GİB) entegrasyonu** Türkiye pazarında kritik bir sonraki adım olacaktır ama
  MVP'yi geciktirmemesi için kapsam dışı tutuldu — bu netlik CLAUDE.md'de de not edilecek.
