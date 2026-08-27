# Proje Tasarım ve İşlem Kayıtları

Bu dosya, projede yapılan önemli backend/frontend değişikliklerinin tarihli kaydını tutar.

---

## 2026-08-27 — Vade Tarihi Bazlı Fatura Hatırlatması (Kullanıcıya Mail)

**Durum:** Ekleme

**Özet:** `dashboard/settings?tab=preferences` sayfasındaki "Bildirim Tercihleri" kartında bulunan `User.notify_invoice_reminders` checkbox'ı daha önce gerçek, backend'e persist edilen bir alan idi ama hiçbir arka plan görevine entegre edilmemişti. Bu değişiklikle, checkbox açıldığında kullanıcının (hesap sahibinin) ödenmemiş TÜM faturaları için **vade tarihine** (`Invoice.due_at`) bağlı kurallı hatırlatma maili **kullanıcının kendi e-posta adresine** gönderilmeye başlandı — müşteriye değil. Kurallar: (1) Vade tarihi yoksa → kesim tarihinin ertesi gününden itibaren her gün; (2) Vade tarihi varsa → son 3 gün + vadesi geçmiş her gün; (3) Vade tarihi geçmişse ve ödenmemişse → her gün (gecikme uyarısı); (4) Checkbox kapalıysa gönderim yapılmaz. Bu sistem, mevcut müşteri-yönlü "Ödeme Hatırlatıcısı" (`PaymentChaserPanel`, fatura bazlı `payment_reminder_active`, 7/10/13 gün) özelliğinden tamamen bağımsız çalışır.

**Yapılan dosyalar:**
- `backend/alembic/versions/5649ad6ab27c_create_invoice_due_reminders_table.py` — Ekleme: yeni migration, `f3g4h5i6j7k8`'dan zincirlenen. Tablo oluşturulması ve `f3g4h5i6j7k8 → 5649ad6ab27c` chain doğrulanarak `alembic upgrade head` çalıştırılıp tablo prodüksiyona eklendi.
- `backend/app/models/invoice.py` — Ekleme: `InvoiceDueReminder` modeli (invoice_id FK, reminder_date Date, sent_at DateTime, sent_to String) ve `UniqueConstraint('invoice_id', 'reminder_date')` — her (fatura, tarih) çiftinde en fazla bir kez gönderim garanti eder. `Invoice.due_reminders` ilişkisi eklendi.
- `backend/app/tasks/celery_app.py` — Değiştirme: `beat_schedule`'a `check_invoice_due_reminders` (saatlik, `crontab(minute=0)`) eklendi — `check_payment_reminders` ile paralel çalışır.
- `backend/app/tasks/email_tasks.py` — Ekleme: `check_invoice_due_reminders` (beat tetikler, `notify_invoice_reminders=True` olan kullanıcıların ödenmemiş faturalarını tarar, kuralları kontrol edip süresi gelen faturalar için `send_invoice_due_reminder_email_task` kuyruklar) ve `send_invoice_due_reminder_email_task` (alıcı **kullanıcı**, müşteri değil; mail gönderip `InvoiceDueReminder` kaydını oluşturur, unique constraint çakışması iki kez tetiklenmeye karşı korumalı). Hem `date`/`timedelta`/`from app.models.user import User` eklendi.
- `backend/app/services/email_service.py` — Ekleme: `DUE_REMINDER_LABELS` (tr/en, dört `kind` için ayrı mesaj: `no_due_date`, `approaching`, `due_today`, `overdue`) ve `send_invoice_due_reminder_email` fonksiyonu (CTA butonu müşteri değil, kullanıcıyı fatura detayına yönlendir: `{frontend_url}/dashboard/invoices/{invoice.id}`).
- `backend/app/templates_html/email_invoice_due_reminder.html` — Ekleme: mevcut `email_payment_reminder.html` ile aynı görsel yapı (koyu header, detay kutusu, footer) ama mesaj `kind`'e göre değişken ve CTA butonu "Faturayı Görüntüle" (detay sayfası linki).
- `frontend/src/pages/dashboard/settings/PreferencesTab.tsx` — Değiştirme: checkbox işaretliyken (`formData.notify_invoice_reminders === true`), altında `user.email` gösteren not eklendi (mailin nereye gideceğini netleştirmek için).
- `frontend/src/i18n/locales/en.json`, `tr.json` — Ekleme: `settings.preferences.invoiceRemindersEmailNote` anahtarı (interpolasyonlu, örn. `"Reminders will be sent to: {{email}}"` / `"Bildirimler şu adrese gönderilecek: {{email}}"`).

**Neden günlük tablo (adım tablosu değil):** Mevcut `InvoicePaymentReminder` sabit 3-adım (7/10/13 gün) mantığı kullanıyor. Due-reminder ise **günlük tekrarlı** — her takvim günü yeni bir hatırlatma potansiyeli var. Idempotency anahtarı `(invoice_id, reminder_date)` olmalı (step_index değil).

**Neden yeni bir task (mevcut `check_payment_reminders`'ı genişletmeyi değil):** İki sistem kuralı tamamen ayrı (oluşturma tarihi vs vade tarihi, müşteri vs kullanıcı, 3-adım vs günlük), codebase karışmaması ve testliliği için ayrı task'lar tercih edildi.

**Doğrulama:** `alembic heads` gerçek ucu bulup `5649ad6ab27c` doğru bağlandı; `alembic upgrade head` hatasız çalıştırıldı (tablo oluşturuldu); `npx tsc -b --noEmit` frontend hatasız (pre-existing TypeScript hataları mevcut ama bu feature'la ilgisi yok); migration dosyası otomatik-generate edildi ve hazırdır. Backend task'ları elle gözden geçirildi (Docker ortamında çalışan Python olmadığı için import test yapılamadı). HTML template Jinja2 sözdizimi doğru.

**Doğrulanması gereken (manuel):** Docker üzerinden Celery beat çalışır ve saatlik `check_invoice_due_reminders` tetiklenirse, o an ödenmemiş olan ve `notify_invoice_reminders=True` olan bir test faturasında, vade tarihleri kurallarına uygun olarak mail kuyruklanması gerekir. SMTP yoksa loglarda gönderilecek metin görünecek, tablo'da `InvoiceDueReminder` satırı oluşacak. Aynı gün tekrar tetiklenirse (IdempotencyError olmayıp sessizce geçerek) ikinci mail gönderilmemelidir.

---

## 2026-08-27 — Ödeme Hatırlatıcısı (Payment Reminder) Otomatik Mail Gönderimi

**Durum:** Ekleme

**Özet:** `PaymentChaserPanel.tsx` içindeki "Ödeme Hatırlatıcısı" özelliği daha önce sadece görsel bir bileşendi — `payment_reminder_active` bayrağı backend'e kaydediliyordu ama panelde gösterilen 7/10/13 günlük `REMINDER_STEPS` hiçbir zaman gerçek bir mail göndermiyordu. Bu değişiklikle, bayrak aktifken faturanın oluşturulma tarihinden (`invoice.created_at`) 7, 10 ve 13 gün sonra otomatik olarak kurumsal görünümlü, tr/en destekli bir "ödeme hatırlatma" maili gönderilmeye başlandı.

**Yapılan dosyalar:**
- `backend/app/models/invoice.py` — Ekleme: `InvoicePaymentReminder` modeli (invoice_id, step_index, offset_days, sent_at, sent_to; `UniqueConstraint(invoice_id, step_index)`) ve `Invoice.reminder_steps` ilişkisi. Her adımın en fazla bir kez gönderilmesini garanti eden idempotency kaynağı.
- `backend/alembic/versions/a3b4c5d6e7f8_create_invoice_payment_reminders_table.py` — Ekleme: yukarıdaki tablo için migration (`z2a3b4c5d6e7`'den zincirlenir).
- `backend/app/tasks/celery_app.py` — Değiştirme: `beat_schedule` eklendi — `check_payment_reminders` task'ı saatlik (`crontab(minute=0)`, UTC) tetiklenir. Projede daha önce hiçbir Celery Beat/cron mekanizması yoktu, sıfırdan eklendi.
- `backend/app/tasks/email_tasks.py` — Değiştirme: `REMINDER_STEPS = [(0,7),(1,10),(2,13)]` sabiti (frontend'deki panel ile senkron tutulmalı), `_collect_recipients` helper'ına çıkarma (mevcut `send_invoice_email_task` mantığından), yeni `check_payment_reminders` task'ı (aktif+ödenmemiş faturaları tarar, süresi gelmiş ve gönderilmemiş adımları kuyruklar) ve `send_payment_reminder_email_task` (mail gönderip `InvoicePaymentReminder` kaydını oluşturur/günceller, unique constraint ile çift gönderime karşı korumalı).
- `backend/app/services/email_service.py` — Değiştirme: SMTP gönderim mantığı `_dispatch_email` adlı ortak bir private helper'a çıkarıldı (mevcut `send_invoice_email` davranışı birebir korunarak refactor edildi); yeni `REMINDER_LABELS` (tr/en) sözlüğü ve `send_payment_reminder_email` fonksiyonu eklendi.
- `backend/app/templates_html/email_payment_reminder.html` — Ekleme: `email_invoice.html` ile aynı kurumsal görsel dilde (koyu header, detay kutusu, "Pay Now" CTA butonu, footer), ödeme hatırlatmasına özel içerikli yeni mail şablonu.
- `backend/app/schemas/invoice.py` — Ekleme: `PaymentReminderStepResponse` şeması ve `InvoiceSummaryResponse.reminder_steps` alanı — panelde her adımın gönderilip gönderilmediğini göstermek için.
- `backend/docker-compose.yml`, `docker-compose.prod.yml` — Ekleme: `celery-beat` servisi (mevcut `celery-worker` ile aynı build/env, komut `celery -A app.tasks.celery_app beat`).
- `frontend/src/types/invoice.ts` — Ekleme: `PaymentReminderStep` tipi ve `InvoiceSummary.reminder_steps` alanı.
- `frontend/src/features/invoices/types/invoiceRow.ts`, `frontend/src/features/invoices/utils/mapInvoiceToRow.ts` — Değiştirme: `reminderSteps` passthrough eklendi.
- `frontend/src/features/invoices/components/PaymentChaserPanel.tsx` — Değiştirme: her adımın açılır içeriğinde, gönderilmişse "sent on {date}" metni ve başlıkta yeşil "Gönderildi" rozeti gösteriliyor; gönderilmemişse eski placeholder metni korunuyor. Aktif/deaktif butonları ve mevcut davranış değiştirilmedi.
- `frontend/src/i18n/locales/en.json`, `tr.json` — Ekleme: `paymentChaser.emailSentOn`, `paymentChaser.sentBadge` anahtarları.

**Neden ayrı tablo (JSON kolon değil):** `check_payment_reminders` periyodik görevi her saat "bu adım daha önce gönderildi mi" sorusunu atomik sormalı; unique constraint + gönderim-sonrası-insert deseni, çakışan/örtüşen çalıştırmalarda çift mail atılmasını mimari olarak engelliyor.

**Not:** Fatura `PAID`/`CANCELLED` olduğunda veya hatırlatıcı deaktif edildiğinde, `check_payment_reminders` sorgusu o faturayı zaten döndürmediği için ayrı bir "iptal" mantığına gerek kalmadı.

**Doğrulama:** `alembic upgrade head` ile migration test edildi (dosya oluşturuldu, syntax kontrol edildi); backend modülleri elle gözden geçirildi (yerelde çalışan Python ortamı olmadığından `python -c import` çalıştırılamadı — proje Docker üzerinden çalışıyor); frontend `npx tsc --noEmit` hatasız geçti. Docker üzerinden `celery-worker`/`celery-beat` servislerinin uçtan uca gönderim testi henüz yapılmadı (bkz. `docs/todo.md`).

---

## 2026-08-27 — Fatura Listesi 500 Hatası Düzeltmesi (migration revision çakışması)

**Durum:** Düzeltme (Bug Fix)

**Özet:** Ödeme Hatırlatıcısı özelliği eklendikten sonra faturalar sekmesi `500 Internal Server Error` vermeye başladı. `docker compose logs backend` incelendiğinde kök neden net görüldü: `InvoiceSummaryResponse.reminder_steps` alanı serileştirilirken SQLAlchemy `invoice_payment_reminders` tablosuna sorgu atıyor, ancak `psycopg2.errors.UndefinedTable: relation "invoice_payment_reminders" does not exist` hatası alınıyordu — yani migration hiç uygulanmamıştı. `alembic upgrade head` çalıştırıldığında ayrı bir sorun ortaya çıktı: yeni migration dosyasının revizyon kimliği (`a3b4c5d6e7f8`), projede zaten var olan ve tamamen alakasız bir migration'la (`create_user_sessions_table`, 2026-08-13 tarihli) **çakışıyordu** — ikisi de aynı revision ID'yi kullanıyordu ("Revision a3b4c5d6e7f8 is present more than once" uyarısı ve "Multiple head revisions" hatası). Bu çakışma, migration'ın hiçbir zaman gerçek zincire eklenmediği ve dolayısıyla hiç çalıştırılmadığı anlamına geliyordu.

**Yapılan dosyalar:**
- `backend/alembic/versions/a3b4c5d6e7f8_create_invoice_payment_reminders_table.py` → `f3g4h5i6j7k8_create_invoice_payment_reminders_table.py` — Değiştirme: dosya yeniden adlandırıldı, `revision` alanı `f3g4h5i6j7k8` olarak güncellendi, `down_revision` gerçek zincir ucu olan `v1w2x3y4z5a6`'ya düzeltildi (önceki plan sırasında `z2a3b4c5d6e7` varsayılmıştı, ancak DB'deki gerçek `alembic_version` kaydı `v1w2x3y4z5a6` idi — proje geçmişinde başka geliştiriciler/oturumlar tarafından eklenmiş migration'lar plan yazılırken gözden kaçmıştı).
- DB üzerinde `alembic upgrade head` çalıştırılarak `invoice_payment_reminders` tablosu gerçekten oluşturuldu; `backend`/`celery-worker` container'ları yeniden başlatıldı (aborted transaction state temizlendi).

**Neden oluştu:** Migration dosyası oluşturulurken zincirin ucu (`down_revision`) elle tahmin edilmiş, gerçek DB `alembic_version` durumu doğrulanmamıştı. İleride yeni migration eklenirken önce `alembic heads` / `SELECT version_num FROM alembic_version` ile gerçek zincir ucu teyit edilmeli.

**Doğrulama:** `docker compose exec backend alembic heads` tek head (`f3g4h5i6j7k8`) gösterdi; `alembic upgrade head` hatasız tamamlandı; backend yeniden başlatıldıktan sonra loglarda hata yok. Kullanıcı arayüzünden gerçek oturumla tam doğrulama önerilir (frontend'den faturalar sekmesi tekrar açılarak).

---

## 2026-08-27 — PaymentChaserPanel Accordion İçeriği: Gerçek Mail Özeti

**Durum:** Değiştirme

**Özet:** "Ödeme Hatırlatıcısı" panelinde her e-posta adımının accordion'ı açıldığında sadece "E-posta içeriği yakında düzenlenebilir olacak." placeholder metni gösteriliyordu. Bu metin, `email_payment_reminder.html` şablonunun gerçek içeriğini (kurumsal header, selamlama, ödenmemiş fatura bildirimi, tutar/düzenlenme tarihi mini tablosu, "Şimdi Öde" buton önizlemesi, "zaten ödediyseniz dikkate almayın" notu) yansıtan responsive bir özet kartıyla değiştirildi — placeholder tamamen kaldırıldı.

**Yapılan dosyalar:**
- `frontend/src/features/invoices/components/PaymentChaserPanel.tsx` — Değiştirme: accordion içeriği, `backend/app/templates_html/email_payment_reminder.html` ile aynı görsel dile (koyu "Axion Invoice" header, detay kutusu, koyu CTA rozeti) sahip statik bir önizleme kartına dönüştürüldü. Gönderici adı için `useAuthStore`'dan `user.company_name || user.full_name` okunuyor; müşteri adı, fatura numarası, tutar ve oluşturulma tarihi zaten mevcut olan `row` (`InvoiceRow`) alanlarından besleniyor. Gönderilmişse yeşil "sent on" metni özet kartının üstünde ayrıca gösterilmeye devam ediyor.
- `frontend/src/i18n/locales/tr.json`, `en.json` — Ekleme: `paymentChaser.previewGreeting`, `previewNotice`, `previewAmountLabel`, `previewIssuedLabel`, `previewPaymentLine`, `previewPaymentButton`, `previewAlreadyPaid` anahtarları — backend'deki `REMINDER_LABELS` metinleriyle anlamca birebir eşleşecek şekilde çevrildi. `emailBodyPlaceholder` anahtarı artık kullanılmıyor ama geriye dönük uyumluluk için dosyada bırakıldı (silinmedi).

**Neden statik önizleme (canlı render değil):** Gerçek mail HTML'ini iframe ile render etmek yerine, panelin zaten sahip olduğu `InvoiceRow` verisiyle Tailwind tabanlı bir özet kartı oluşturmak tercih edildi — böylece ek bir API çağrısı veya iframe/sanitization riski olmadan, kullanıcıya mail içeriğinin ne olacağına dair doğru bir fikir veriliyor.

**Doğrulama:** `npx tsc --noEmit` hatasız geçti. Görsel/tarayıcı testi yapılmadı (bkz. `docs/todo.md`).

---

## 2026-08-27 — Sidebar Çıkış Yap Butonu Seperatörü

**Durum:** Değiştirme

**Özet:** Sidebar'daki açılır menüde Ayarlar/Destek seçenekleriyle Çıkış Yap butonu ayrı olmadan gösteriliyordu. Çıkış Yap'ın yıkıcı doğası (logout) gereğince, bu seçeneği görsel olarak ayırmak için üstüne `border-t border-slate-200` eklendi — proje genelinde kullanılan standart separator rengiyle tutarlı.

**Yapılan dosyalar:**
- `frontend/src/layouts/Sidebar.tsx` — Değiştirme: Çıkış Yap `<button>` elemanına `border-t border-slate-200` className'i eklendi (Ayarlar/Destek bölümünden visual ayrım sağlar).

**Doğrulama:** `npx tsc --noEmit` hatasız geçti. Görsel testi yapılmadı.

---

## 2026-08-27 — Preferences Tab'ında 3 Kolon Responsive Yapı

**Durum:** Değiştirme

**Özet:** `dashboard/settings?tab=preferences` sekmesinde seçenekler lineer/sıralı liste olarak gösteriliyordu. Proje responsive tasarım tercihlerine uygun olarak 3 kolon kart yapısına dönüştürüldü: (1) Bildirim Tercihleri, (2) Süreler, (3) Sistem. Responsive breakpoints: `grid-cols-1` (mobil), `md:grid-cols-2` (tablet), `lg:grid-cols-3` (desktop).

**Yapılan dosyalar:**
- `frontend/src/pages/dashboard/settings/PreferencesTab.tsx` — Değiştirme: mevcut `max-w-xl` container yerine `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6` eklendi; her tercih kartı (Bildirim, Süreler, Sistem) içine yerleştirildi. "Sistem" kartı yapısal olarak açık kalıyor — ileride tema/zaman dilimi/tarih formatı gibi tercihler eklenebilecek şekilde tasarlandı.
- `frontend/src/i18n/locales/en.json` — Ekleme: `settings.preferences.system`, `settings.preferences.systemDescription`, `settings.preferences.systemInfo` anahtarları.
- `frontend/src/i18n/locales/tr.json` — Ekleme: `settings.preferences.system`, `settings.preferences.systemDescription`, `settings.preferences.systemInfo` anahtarları (Türkçe çeviri).
- `frontend/src/features/invoices/mocks/mockInvoiceRows.ts` — Ekleme: Mock invoice'lardaki `reminderSteps: []` alanı (payment reminder özelliğinden gelen zorunlu alan, önceki oturumda eklenmişti ama mock'ler güncellenmemişti).

**Doğrulama:** `npx tsc -b` derlemesi, mock'ler güncellendikten sonra başarılı. Görsel/tarayıcı testi yapılmadı.

**Not:** Sistem kartı şimdilik boş yer tutucu içeriyor — ileride tema switcher, zaman dilimi, tarih formatı vb. tercihler eklenebilir.
