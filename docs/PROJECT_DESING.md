# Proje Tasarım ve İşlem Kayıtları

Bu dosya, projede yapılan önemli backend/frontend değişikliklerinin tarihli kaydını tutar.

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
