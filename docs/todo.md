# Yapılacaklar / Ertelenen İşler

## 2026-08-28 — Kalıcı Tema Modu (Dark/Light) sonrası

- [ ] 2026-08-28: Invoices/Customers/Dashboard ana sayfa, TemplateEditorPage, InvoiceForm vb. bu
  oturumda dokunulmayan tüm diğer sayfalar henüz `dark:` uyarlaması almadı — hâlâ sabit
  `bg-white`/`slate-*` renkleri kullanıyorlar. Koyu mod açıkken bu sayfalarda beyaz kart/kontrast
  tutarsızlığı beklenir. Kapsamlı bir "tüm uygulamayı koyu temaya taşıma" geçişi ayrı bir oturumda
  yapılmalı (muhtemelen `Input`/`Select`/`Button`/`Modal`/`ErrorState` gibi paylaşılan bileşenlerden
  başlanmalı, çünkü çoğu sayfa bunları kullanıyor).
- [ ] 2026-08-28: `App.tsx`'teki `sonner` `Toaster` ve `ToastContainer` bileşenleri şu an aktif
  temaya göre `theme="dark"` ile senkronize edilmiyor — koyu modda toast bildirimleri açık temalı
  görünebilir. Küçük bir iyileştirme, bu oturumda bilinçli olarak ertelendi.
- [ ] 2026-08-28: Bu oturumda doğrulama, backend konteynerindeki Playwright ile otomatik
  (script tabanlı) yapıldı — gerçek kullanıcı tarafından, kendi tarayıcısında (gerçek Chrome/Edge,
  farklı ekran boyutları, mevcut gerçek hesapla) 3 modun (Açık/Koyu/Sistem) her iki konumda
  (sidebar profil menüsü + `?tab=preferences` Sistem kartı) da denenip görsel olarak teyit
  edilmesi gerekiyor.

## 2026-08-27 — Banka Tablosu Kesilmesi Düzeltmesi sonrası

- [ ] 2026-08-27: Gerçek tarayıcıda, gerçek 3 farklı banka hesabı tanımlanıp (`Tanımlamalar >
  Banka Hesapları`) bir faturaya 3'ü de seçilerek Classic/Sharp/Clean/Compact şablonlarının
  PDF'i indirilip 3 bankanın da tam göründüğü, Vade tarihinin doğru göründüğü teyit edilmeli —
  bu oturumda yalnızca script ile (Playwright screenshot) doğrulandı, gerçek uçtan uca (form →
  Celery PDF üretimi → indirilen dosya) akış tarayıcıda denenmedi.
- [x] ~~Banka hesabı "3 seçildi ama 1 görünüyor"~~ — 2026-08-27: kök neden bulundu ve düzeltildi
  (bkz. `docs/PROJECT_DESING.md` — `.el-bank` CSS eksikliği + Classic/Sharp'ta imza/QR'ın banka
  tablosuyla çakışması). Yukarıdaki tarayıcı doğrulaması hâlâ yapılmalı.

## 2026-08-27 — Fatura Formu Bug Düzeltmeleri sonrası

- [ ] 2026-08-27: `InvoiceForm.tsx`'teki `previousCustomerIdRef` düzeltmesi ve `issued_at` varsayılan
  değeri tarayıcıda test edilmedi — "Tekrar Oluştur" ile bir fatura kopyalanıp Alıcı Kişi alanı
  yeniden seçilmeden doğrudan "Kaydet"/"Devam Et" ile kaydedilebildiği, ve yeni (sıfırdan) bir
  faturada "Tarih" alanının artık bugünün tarihiyle otomatik dolu geldiği tarayıcıda teyit edilmeli.
- [x] ~~Banka hesabı "3 seçildi ama 1 görünüyor" bildirimi~~ — 2026-08-27: ilk incelemede kod
  hatası bulunamamıştı (test kullanıcısının yalnızca 2 tanımlı banka hesabı vardı), ama kullanıcı
  gerçek 3 farklı bankayla tekrar test edince asıl kök neden ortaya çıktı ve düzeltildi — bkz.
  yukarıdaki "Banka Tablosu Kesilmesi Düzeltmesi" bölümü ve `docs/PROJECT_DESING.md`.
- [ ] `due_at` (Vade Tarihi) için `InvoiceForm.tsx`'te hâlâ manuel bir tarih girişi yok — sadece
  ödeme vadesi (payment term) seçilince otomatik hesaplanıyor. Şu an kasıtlı/kabul edilebilir
  bulundu (due-reminder kuralları vade tarihi olmayan durumu zaten kapsıyor) ama kullanıcı
  isterse manuel bir tarih seçici eklenebilir.

## 2026-08-27 — 4 Yeni Fatura Şablonu (Classic/Sharp/Clean/Compact) sonrası

- [ ] 2026-08-27: Şablon dropdown'ında (`dashboard/invoices/new`) 4 yeni ismin göründüğü ve
  "Önizle" (`InvoiceDraftPreviewModal`) akışının tarayıcıda gerçek React/axios akışı üzerinden
  (script ile render değil) doğru çalıştığı tarayıcıda teyit edilmedi. Free ve Business hesapla
  (`mfyagmur@gmail.com` Business, bkz. proje hafızası) Sharp/Clean/Compact seçiminin fatura
  formunda görünürlüğü/davranışı da tarayıcıda kontrol edilmeli.
- [ ] 2026-08-27: `min_plan_key` şu an sadece `/templates/{id}/duplicate` akışını kısıtlıyor,
  fatura oluşturma/önizlemede bir şablonu doğrudan seçmeyi kısıtlamıyor (bkz.
  `docs/PROJECT_DESING.md` — "Önemli mimari bulgu"). Kullanıcıyla bu oturumda netleştirildi:
  şimdilik mevcut davranış (yalnızca kopyalama kısıtlı) korunacak — Free kullanıcılar Sharp/Clean/
  Compact'ı faturada seçip kullanabilir. İleride "Business şablonları faturada da tamamen
  kısıtlansın" istenirse: (1) `invoice_service._get_visible_template`'e `check_min_plan` eklenmeli,
  (2) legacy 3 sistem şablonunun (`Basit`/`Kurumsal`/`Minimal`) `min_plan_key='pro'` değerini
  `NULL`'a çeken düzeltici bir migration da eklenmeli (aksi halde Free kullanıcılar hiç fatura
  oluşturamaz hale gelir — `g1h2i3j4k5l6_add_xslt_template_columns.py`'nin ayarladığı değer).
- [ ] Çok sayfalı bir faturanın **ilk (son olmayan) sayfasında**, tablo tasarım yüksekliğini aşıp
  sayfanın tamamına yayıldığında, otomatik "Sayfa X/Y" damgası (`pdf_service._page_number_element`,
  sabit `y=page_height-10`) son satırla görsel olarak çakışabiliyor (25 satırlık test faturasında
  Classic/Sharp/Clean'de gözlemlendi). Bu, yalnızca yeni şablonlara özgü değil — `_paginate_table_rows`
  non-last sayfalarda tam sayfa yüksekliğini kullanıyor, sayfa numarası için yer ayırmıyor; herhangi
  bir v2 şablonu (mevcut veya yeni) aynı şekilde etkiler. Kapsam dışı bırakıldı (paylaşılan render
  motoruna dokunmak bu işin kapsamı değildi) — ileride `_paginate_table_rows`'un non-last sayfa
  kapasitesini de sayfa-numarası bandı için birkaç mm azaltması değerlendirilebilir.
- [ ] `TemplatesPage.tsx` şablon listesinde küçük resim/önizleme yok (sadece isim + rozet) —
  `TemplateSummary`'de `thumbnail` alanı hiç yok. Kapsam dışı bırakıldı; ileride istenirse ayrı bir
  iş olarak ele alınabilir (örn. sunucu tarafında her şablon için küçük bir PNG önizleme üretilip
  saklanması).

## 2026-08-27 — Vade Tarihi Bazlı Fatura Hatırlatması (Due-Reminder) sonrası

- [ ] 2026-08-27: `check_invoice_due_reminders` ve `send_invoice_due_reminder_email_task` task'ları Docker üzerinden çalıştırılıp gerçek mail kuyruklanması doğrulanmadı — `docker compose exec backend celery -A app.tasks.celery_app worker` ve `celery beat` ayağa kaldırıp, test faturasında (vade tarihi, kesim tarihi vb. kuralları test ederek) mail tetiklenmesi ve idempotency kontrol edilmeli.
- [ ] 2026-08-27: `PreferencesTab.tsx`'deki checkbox işaretliyken e-posta notunun göründüğü tarayıcıda görsel olarak kontrol edilmedi — Chrome dev tools responsive mode'da tr/en dillerinde görünüm teyit edilmeli.
- [ ] 2026-08-27: Vade tarihi **değiştiğinde** (örn. müşteri erteleme talebi) hatırlatmaların davranışı — bir gün için zaten gönderilmiş hatırlatma, yeni vade tarihine göre hâlâ bekleniyor ise tekrar gönderilmiyor, bu durum kullanıcıya kafa karıştırıcı olabilir. İleride bir "yeniden hesapla" mekanizması veya "geçmiş hatırlatmaları sıfırla" seçeneği eklenebilir.

## 2026-08-27 — Ödeme Hatırlatıcısı (Payment Reminder) sonrası

- [x] ~~Docker Compose ile (`docker compose up --build`) `celery-worker` ve yeni `celery-beat` servislerini yerelde ayağa kaldırıp uçtan uca doğrulama yapılmadı~~ — 2026-08-27: `alembic upgrade head` container içinde çalıştırılıp `invoice_payment_reminders` tablosu oluşturuldu (bkz. `docs/PROJECT_DESING.md` — "Fatura Listesi 500 Hatası Düzeltmesi"). Kalan kısım: test faturasında `payment_reminder_active` aktif edilip `created_at` 7+ gün geriye çekilerek gerçek mail gönderiminin ve `sent_at` yazıldığının doğrulanması hâlâ yapılmadı.
- [x] ~~`celery-beat` servisinin gerçekten ayakta olup olmadığı kontrol edilmemişti~~ — 2026-08-27: `docker compose ps` çıktısında hiç görünmüyordu (hiç build/start edilmemiş), `docker compose up -d celery-beat` ile ayağa kaldırıldı ve "beat: Starting..." logu doğrulandı. Kalan kısım: `check_payment_reminders` task'ının gerçekten saatlik tetiklendiğinin (bir sonraki tam saatte) log üzerinden teyidi.
- [ ] Prod ortamında (`docker-compose.prod.yml`) `celery-beat` servisinin `celerybeat-schedule` dosyası için named volume'a ihtiyacı olup olmadığı değerlendirilmedi — şu an idempotency `invoice_payment_reminders` tablosundan geldiği için zorunlu değil, ama container restart'ında beat'in "son çalışma zamanı" bilgisini kaybetmesi (dolayısıyla bir sonraki dakika tekrar tetiklenmesi) kabul edilebilir bulundu; ölçek büyüdükçe tekrar gözden geçirilebilir.
- [ ] 2026-08-27: `PaymentChaserPanel.tsx` accordion'ındaki yeni mail özeti tarayıcıda görsel olarak test edilmedi (responsive davranış, uzun müşteri/firma adlarında taşma vb.) — kullanıcı arayüzünden kontrol edilmeli.
- [ ] 2026-08-27: `Sidebar.tsx` açılır menüsündeki yeni Çıkış Yap seperatörü tarayıcıda görsel olarak test edilmedi — kullanıcı arayüzünden kontrol edilmeli.
- [ ] 2026-08-27: `PreferencesTab.tsx` yeni 3 kolon responsive yapısı (Bildirim/Süreler/Sistem kartları) tarayıcıda görsel ve responsive davranış açısından test edilmedi — mobil/tablet/desktop breakpoint'lerde görünüm kontrol edilmeli.
- [ ] `REMINDER_STEPS` şu an hem `frontend/src/features/invoices/components/PaymentChaserPanel.tsx` hem `backend/app/tasks/email_tasks.py` içinde ayrı ayrı hardcoded (7/10/13 gün). İleride bu adımların kullanıcı tarafından özelleştirilebilir olması istenirse, tek bir backend kaynağından (örn. `/invoices/payment-reminder/steps` endpoint'i) okunacak şekilde merkezileştirilmesi gerekir.
- [ ] Ödeme hatırlatma mailindeki "Pay Now" bağlantısı, mevcut manuel fatura mailiyle aynı yer tutucu `payment_url` (`{frontend_url}/odeme?fatura=...`) yapısını kullanıyor — gerçek bir online ödeme sayfası/entegrasyonu eklendiğinde bu URL'nin güncellenmesi gerekecek.
