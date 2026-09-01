# Yapılacaklar / Ertelenen İşler

## 2026-09-01 — Login/Signup Kayan Panel Geri Getirildi + "Ücretsiz Başla" Ayrı Demo Girişi sonrası

- [ ] 2026-09-01: Tarayıcıda teyit gerekiyor — `/login` ve `/signup`'ın eskisi gibi kayan
  panel/overlay animasyonuyla çalıştığı, alanların artık ön dolu OLMADIĞI; `/get-started`
  sayfasının (AuthLayout'taki "Ücretsiz Başla" butonundan erişilen) `demo@axioninvoice.app` /
  `Demo.12345` ile ön dolu geldiği ve "Giriş Yap" ile `/dashboard`'a yönlendirdiği kontrol
  edilmeli. Bu ortamda tarayıcı otomasyon aracı olmadığı için yapılamadı — bkz.
  `docs/PROJECT_DESING.md` "Login/Signup Kayan Panel Geri Getirildi + ...".
- [ ] 2026-09-01: `landing.hero.ctaPrimary` ("Ücretsiz Başla", ana sayfada `/signup`'a giden
  `Link`) ve `CTASection.tsx`'teki "Demoyu Dene" butonu (hâlâ tek tıkla formsuz `/auth/demo`
  girişi yapıyor) bu görevin kapsamı dışında bırakıldı — kullanıcı isterse bunların da
  `/get-started` akışına yönlendirilip yönlendirilmeyeceği ayrıca netleştirilmeli.
- [ ] 2026-09-01: `frontend/src/features/auth/components/AuthShell.tsx` ve `LoginForm.tsx`
  orijinal hâline döndü, artık bu konuda ek bir teknik borç yok — önceki (yanlış) girişimde
  önerilen `AuthShell` temizliği maddesi bu düzeltmeyle geçersiz olduğu için kaldırıldı.

## 2026-08-31 — Yeni Müşteri Modalı Kaydırmayı Tamamen Kaldırma sonrası

- [ ] 2026-08-31: Modal artık `overflow-hidden` + `max-h-[95vh]` ile scroll'suz; kullanıcının
  tarayıcıda hem küçük hem büyük ekranlarda modalı açıp fare tekerleğiyle üzerinde gezinerek
  içeriğin hareket etmediğini, 4 kartın tamamının (özellikle en alttaki Adres kartının) kesilmeden
  göründüğünü teyit etmesi gerekiyor. Eğer düşük çözünürlüklü bir ekranda içerik `95vh`'e sığmazsa
  (örn. hata mesajları aynı anda çok satır alanı büyütürse) alt kısım `overflow-hidden` nedeniyle
  kırpılabilir — böyle bir durum görülürse haber verilmeli, o zaman farklı bir yaklaşım (örn. daha
  kompakt kart aralıkları) gerekecek. Bkz. `docs/PROJECT_DESING.md` "Yeni Müşteri Modalı Kaydırmayı
  Tamamen Kaldırma".

## 2026-08-31 — Yeni Müşteri Modalı Dikey Scrollbar Gizleme sonrası

- [ ] 2026-08-31: Modal içeriği taştığında (birçok alan/hata mesajı ile) artık dikey scrollbar
  görünmemesi gerekiyor ama kaydırma (fare tekerleği/touch) çalışmaya devam etmeli; kullanıcının
  tarayıcıda içerik taşacak kadar alan doldurup teyit etmesi gerekiyor — bkz.
  `docs/PROJECT_DESING.md` "Yeni Müşteri Modalı Dikey Scrollbar Gizleme".

## 2026-08-31 — Yeni Müşteri Modalı Layout Sıçraması Düzeltmesi sonrası

- [ ] 2026-08-31: Kurumsal/Bireysel geçişinde artık ne dikey "sıçrama" ne de scrollbar
  genişlik zıplaması olmaması gerekiyor; kullanıcının tarayıcıda Bireysel↔Kurumsal arasında
  birkaç kez geçiş yaparak modalın tamamen sabit kalıp kalmadığını teyit etmesi gerekiyor — bkz.
  `docs/PROJECT_DESING.md` "Yeni Müşteri Modalı Layout Sıçraması Düzeltmesi".

## 2026-08-31 — Yeni Müşteri Modalı Düzeltmeleri sonrası

- [ ] 2026-08-31: 6 maddelik düzeltme (header/footer daraltma, website/faks'ın İletişim kartına
  taşınması, İletişim ve Adres kartlarının yeni satır sırası) bu ortamda tarayıcıda teyit
  edilemedi. Kullanıcının kontrol etmesi gerekenler: modal header/footer'ın gözle görülür şekilde
  daha ince olması, Kurumsal & Finansal kartında artık sadece MERSİS No kalması, İletişim
  Bilgileri kartında sıranın E-posta → Web Adresi → (Telefon/Faks) olması, Adres Detayları
  kartında Şehir/Posta Kodu/Ülke'nin tek satırda 3 kolon halinde görünmesi (ülke autocomplete
  dropdown'ının dar kolonda taşma/kesilme yaşamaması) — bkz. `docs/PROJECT_DESING.md`
  "Yeni Müşteri Modalı Düzeltmeleri (kullanıcı geri bildirimi)".

## 2026-08-31 — Yeni Müşteri Modalı Modern Redesign sonrası

- [ ] 2026-08-31: Yeni müşteri modalının (`CustomerFormModal.tsx`) 4 kartlı/segmented-control'lü
  yeni tasarımı bu oturumda gerçek tarayıcıda teyit edilmedi (ortamda tarayıcı otomasyon aracı
  yok) — tip kontrolü (`tsc --noEmit`) ve statik kod incelemesiyle sınırlı kaldı. Kullanıcının
  kendi tarayıcısında kontrol etmesi gerekenler: `dashboard/customers`'da "+ Yeni Müşteri" →
  modalın geniş/kartlı açılması, Bireysel/Kurumsal segmented control'ün şirket adı/vergi no
  alanlarını doğru koşullu değiştirmesi, kategori dropdown ve ülke autocomplete'in çalışması,
  submit ile müşterinin gerçekten oluşması, "Müşteriyi Düzenle" (edit) akışının aynı tasarımla
  bozulmadan çalışması, dark mode'da 4 kartın/footer butonlarının görünümü, ve
  `CustomerDetailPage`/`InvoiceSendEmailModal`'daki mevcut `Modal` kullanımlarının görsel olarak
  değişmediği — bkz. `docs/PROJECT_DESING.md` "Yeni Müşteri Modalı Modern Redesign".
- [ ] 2026-08-31: `SignupForm.tsx`'teki bireysel/kurumsal toggle, yeni `SegmentedControl.tsx`
  bileşenine henüz taşınmadı — bu turda bilinçli olarak kapsam dışı bırakıldı ("sadece istenilen
  yerleri değiştir" talimatı). İleride auth formlarıyla tutarlılık için ayrı bir turda ele
  alınabilir.

## 2026-08-28 — Faz 2: "Şifremi Unuttum" Akışı sonrası

- [ ] 2026-08-28: "Şifremi unuttum" akışı (forgot/reset-password endpoint'leri + yeni frontend
  sayfaları) backend tarafında uçtan uca canlı smoke test ile doğrulandı (token üretimi, email
  gönderimi tetikleme, yeni şifreyle giriş, eski şifrenin reddi, tek kullanımlık token, geçersiz
  token 400) — ancak gerçek tarayıcıda henüz teyit edilmedi (ortamda tarayıcı otomasyon aracı yok).
  Kullanıcının kendi tarayıcısında kontrol etmesi gerekenler: `/login`'de "Şifremi unuttum?"
  linkine tıklayınca `/forgot-password`'a gitmesi, email gönderildikten sonra başarı mesajının
  göründüğü, gelen email'deki linkten `/reset-password?token=...`'a gidip yeni şifre belirlenince
  `/login`'e yönlendirilmesi, süresi dolmuş/geçersiz token ile hata mesajı gösterilmesi — bkz.
  `docs/PROJECT_DESING.md` "Faz 2: 'Şifremi Unuttum' Şifre Sıfırlama Akışı".
- [ ] 2026-08-28: Faz 2'nin kalan üç aday alanı (kullanıcıya soruldu, sadece "Şifremi unuttum"
  seçildi) henüz eklenmedi — ileride ayrı bir turda ele alınabilir: telefon numarası (Signup),
  Vergi No/TC Kimlik No (Kurumsal hesap türü), KVKK/Şartlar onay checkbox'ı.

## 2026-08-28 — Login/Kayıt Ol: Kurumsal Taşma/Alt Bağlantı/Input Kontrastı Düzeltmesi sonrası

- [ ] 2026-08-28: `AuthShell.tsx`'teki dinamik yükseklik ölçümü (`ResizeObserver` + panel
  `scrollHeight`), formun altındaki tekrar eden "Zaten hesabınız var mı" bağlantısının
  kaldırılması ve input kontrast düzeltmesi bu oturumda gerçek tarayıcıda teyit edilmedi —
  ortamda tarayıcı otomasyon aracı yoktu. Kullanıcının kendi tarayıcısında `/signup`'ta
  Kurumsal seçilip Şirket Adı alanı eklenince kartın kesilmeden yumuşakça büyüdüğünü, formların
  altında artık gereksiz bağlantı olmadığını, input alanlarının kart zemininde yeterince belirgin
  (beyaz zemin + gri kenarlık) göründüğünü kontrol etmesi gerekiyor — bkz.
  `docs/PROJECT_DESING.md` "Login/Kayıt Ol: Kurumsal Taşma, Alt Bağlantı Tekrarı ve Input
  Kontrastı Düzeltmesi".

## 2026-08-28 — Login/Kayıt Ol: Gerçek Kayan Panel + "Ücretsiz Başla" Demo Girişi sonrası

- [ ] 2026-08-28: Yeni karşılıklı kayan panel animasyonu (`AuthShell.tsx` — Login/Signup panelleri
  zıt yönlerde `translateX` ile yer değiştiriyor) ve "Ücretsiz Başla" butonunun artık `useDemoLogin`
  ile doğrudan `/dashboard`'a demo girişi yapması bu oturumda gerçek tarayıcıda teyit edilmedi —
  ortamda tarayıcı otomasyon aracı yoktu. Kullanıcının kendi tarayıcısında `/login`↔`/signup`
  arasında geçiş yaparken iki panelin de görünür şekilde karşılıklı kaydığını, klavyeyle Tab
  yapıldığında ekran dışındaki (inert) panele odağın gitmediğini, ve header'daki "Ücretsiz Başla"
  butonunun tek tıkla `/dashboard`'a giriş yaptığını kontrol etmesi gerekiyor — bkz.
  `docs/PROJECT_DESING.md` "Login/Kayıt Ol: Gerçek Kayan Panel Animasyonu + Ücretsiz Başla Demo
  Girişi".
- [ ] 2026-08-28: Dark/light tema geçişi, TR/EN dil değişimi, mobil genişlikte (`< 768px`) tek form
  fallback'i de aynı şekilde henüz gerçek tarayıcıda teyit edilmedi (Faz 1'in ilk sürümünden kalan,
  hâlâ açık).
- [x] 2026-08-28: Faz 2 — kullanıcı, UI onaylandıktan sonra Login/Signup formlarına yeni alanlar
  eklenmesini istedi; hangi alanlar sorulup "Şifremi unuttum" akışı seçildi ve uygulandı (bkz.
  yukarıdaki "Faz 2: 'Şifremi Unuttum' Akışı sonrası" bölümü). Kalan üç aday alan orada açık madde
  olarak listelendi.

## 2026-08-28 — Koyu Mod Renk Kontrastı Düzeltmeleri sonrası

- [ ] 2026-08-28: Bu oturumda yapılan renk düzeltmeleri sadece kod/CSS seviyesinde yapıldı —
  gerçek tarayıcıda görsel teyit edilmedi (tarayıcı aracı yoktu). Şablon listesi, şablon düzenleme
  ekranı (toolbar/panel/katman/özellik/kağıt önizleme), Faturalar listesi+tablosu+aksiyon menüsü,
  Müşteriler listesi ve genel Modal/ConfirmDialog/Select/Input formları koyu modda gezilip
  okunmaz metin veya beyaz-kalan yüzey kalıp kalmadığı teyit edilmeli.
- [ ] 2026-08-28: Kapsam dışı bırakılan alanlar var — fatura oluşturma formu (`InvoiceForm.tsx`
  ve alt bileşenleri), fatura detay sayfası, ayarlar sekmelerinin geri kalanı (Preferences dışı),
  billing/subscription sayfaları, ve invoice-editor dışındaki diğer feature klasörleri henüz
  taranmadı — bu oturumun kapsamı Şablonlar (asıl bildirilen sorun) + paylaşılan bileşenler +
  Faturalar/Müşteriler listeleri ile sınırlı tutuldu.
- [x] ~~Invoices/Customers/Dashboard listeleri ve paylaşılan Input/Select/Button/Modal/ErrorState
  gibi bileşenler henüz dark: almadı~~ — 2026-08-28: bu oturumda düzeltildi, bkz.
  `docs/PROJECT_DESING.md` "Koyu Mod Renk Kontrastı Düzeltmeleri".
- [x] ~~`App.tsx`'teki sonner `Toaster` aktif temaya göre senkronize değildi~~ — 2026-08-28:
  `useIsDarkMode()` hook'u ile `theme` prop'u bağlandı.
- [ ] 2026-08-28 (önceki oturumdan taşındı): Kalıcı tema modunun kendisi (3 yönlü Açık/Koyu/Sistem
  kontrolü, sidebar + Preferences konumları) gerçek kullanıcı tarafından kendi tarayıcısında hâlâ
  teyit edilmedi.

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
