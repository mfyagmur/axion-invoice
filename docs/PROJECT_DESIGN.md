# Project Design Log

Bu dosya, projede yapılan her önemli implementasyon değişikliğini tarih, dosya, işlem türü ve özet ile kaydeder.

---

## Gerçekleştirilen İşlemler

### 2026-08-25 — Mail Gönderim Sistemi (SMTP entegrasyonu)

| Dosya | İşlem | Özet |
|-------|-------|------|
| `backend/app/services/email_service.py` | Değiştirme | Fonksiyon imzasından `pdf_path` parametresi kaldırıldı. SMTP boşsa log yapıyor; SMTP doluysa `smtplib` ile gerçek SMTP gönderimi yapıyor (port 465 ise SSL, aksi halde TLS). Basit Türkçe mesaj (fatura numarası, tutar, para birimi, vade tarihi) gönderiliyor. Hata handling ile loglanan hatalar. |
| `backend/app/tasks/email_tasks.py` | Değiştirme | PDF kontrol ve `pdf_path` inşası kaldırıldı. `email_service.send_invoice_email(to_email, invoice)` doğrudan çağrılıyor. Bu değişiklikle, e-posta gönderimi PDF üretim görevini beklemeden anında gerçekleşiyor. |
| `frontend/src/features/invoices/components/InvoiceForm.tsx` | Değiştirme | (1) `useSendInvoiceEmail` hook import eklendi. (2) `sendEmail` mutation tanımı eklendi. (3) `handleSubmitAndSend()` yeni handler yazıldı — fatura oluştur, sonra e-posta gönder, toast ile bildirim. (4) "Devam Et" butonu hardcoded `disabled` kaldırıldı, `onClick={handleSubmitAndSend}` eklendi, `disabled={!isFormValid \|\| createInvoice.isPending \|\| sendEmail.isPending}` yapıldı. |
| `frontend/src/features/invoices/components/InvoiceRowActions.tsx` | Değiştirme | (1) `useSendInvoiceEmail` ve `useToastStore` import'ları eklendi. (2) Mutation ve `pushToast` hook tanımları eklendi. (3) Satır 196-198'deki hardcoded `disabled` button aktif hale getirildi — `onClick` ile `sendEmail.mutate()` çağrılıyor, success/error toast'leri gösteriliyor. |
| `frontend/src/i18n/locales/tr.json` | Değiştirme | (1) `invoices.form.continueAction`: "Devam Et" → "Gönder". (2) `invoices.form.save`: "Kaydet" → "Kaydet (Taslak)". (3) Yeni anahtar `invoices.detail.emailSendError`: "E-posta gönderilemedi." |
| `frontend/src/i18n/locales/en.json` | Değiştirme | (1) `invoices.form.continueAction`: "Continue" → "Send". (2) `invoices.form.save`: "Save" → "Save (Draft)". (3) Yeni anahtar `invoices.detail.emailSendError`: "Failed to send email." |

**Not:** Backend `.env` dosyasında `# SMTP Configuration` bölümü (SMTP_HOST/PORT/USER/PASSWORD/FROM) zaten mevcut. Kullanıcı gerçek SMTP bilgilerini kendisi `.env`'e girerse mail akışı otomatik çalışır. SMTP boşsa test için log-simülasyonu yapılıyor (prodüksiyona geçilene kadar güvenli default).

---

### 2026-08-25 — Fatura Detay: E-Posta Gönderim Akışının Yeniden Yapılandırılması

| Dosya | İşlem | Özet |
|-------|-------|------|
| `backend/alembic/versions/v1w2x3y4z5a6_add_email_sent_tracking_to_invoices.py` | Ekleme | Yeni migration: `invoices.email_sent_at` (`DateTime(timezone=True)`, nullable) ve `invoices.email_sent_to` (`JSONB`, string listesi, nullable) sütunları eklendi. |
| `backend/app/models/invoice.py` | Değiştirme | `Invoice` modeline `email_sent_at: datetime \| None` ve `email_sent_to: list[str] \| None` alanları eklendi. |
| `backend/app/schemas/invoice.py` | Değiştirme | `InvoiceSummaryResponse`'a `email_sent_at`/`email_sent_to` eklendi (miras yoluyla `InvoiceDetailResponse`'a da geçiyor). `InvoiceUpdatePayload`'a `recipient_contact_ids: list[uuid.UUID] \| None` eklendi — alıcılar artık `PATCH /invoices/{id}` ile güncellenebiliyor. |
| `backend/app/services/invoice_service.py` | Değiştirme | `update_invoice()` içine `recipient_contact_ids` işleme bloğu eklendi (PDF içeriğini etkilemediği için `content_changed` tetiklemiyor, PDF yeniden üretimine yol açmıyor). |
| `backend/app/tasks/email_tasks.py` | Değiştirme | `send_invoice_email_task` artık gönderim döngüsü bitince (alıcı varsa) `invoice.email_sent_at = datetime.now(UTC)` ve `invoice.email_sent_to = sorted(recipients)` yazıp commit ediyor. MVP kapsamında "gönderim denendi" = "gönderildi" kabul ediliyor (per-recipient başarı takibi yok, bkz. `docs/todo.md`). |
| `frontend/src/features/invoices/components/InvoiceForm.tsx` | Değiştirme | `handleSubmitAndSend` içindeki otomatik `sendEmail.mutate(...)` çağrısı kaldırıldı — "Devam Et" butonu artık sadece fatura oluşturup detay sayfasına yönlendiriyor, e-posta göndermiyor. `useSendInvoiceEmail` importu/hook'u kaldırıldı (dead code). |
| `frontend/src/features/invoices/components/InvoiceActionHeader.tsx` | Değiştirme | Yeni `onOpenSendEmail` prop'u eklendi. "PDF İndir" butonundan sonra, `InvoiceRowActions`'tan önce yeni "E-posta Gönder" butonu eklendi (`Mail` ikonu, `invoices.detail.sendEmail` key'i — zaten mevcuttu). |
| `frontend/src/features/invoices/components/InvoiceSendEmailModal.tsx` | Ekleme | Yeni modal component. `Modal` (shared) + `CustomerFormModal` deseni referans alındı. `InvoiceForm.tsx`'teki 3 alıcı Select'iyle birebir aynı yapı (`invoice.customer.contacts` kaynak, seçenekler `"Ad Soyad — email"` formatında), `invoice.recipient_contact_ids` ile prefill. Gönder akışı: alıcılar değiştiyse önce `useUpdateInvoice()` ile `PATCH`, sonra `useSendInvoiceEmail()` ile gönderim; başarı/hata toast (`invoices.detail.emailSent`/`emailSendError`, mevcut key'ler). |
| `frontend/src/features/invoices/hooks/useSendInvoiceEmail.ts` | Değiştirme | `onSuccess`'e `['invoices']` ve gecikmeli (2sn) `['invoices', id]` query invalidation eklendi — Celery task async çalıştığı için, `StatusTimeline`'ın `email_sent_at` ile güncellenmesi bu şekilde sağlanıyor. |
| `frontend/src/pages/dashboard/InvoiceDetailPage.tsx` | Değiştirme | `isEmailModalOpen` state + `InvoiceSendEmailModal` render edildi (diğer modallarla aynı desende). `StatusTimeline`'a artık `recipientEmail` yerine `emailSentAt`/`emailSentTo` geçiliyor. |
| `frontend/src/features/invoices/components/StatusTimeline.tsx` | Değiştirme | Adım listesi 3'ten 4'e çıktı: `Oluşturuldu` → **yeni: `E-posta Gönderildi`** (`done: !!emailSentAt`, tarih + gönderilen adres(ler) adımın altında gösteriliyor) → `Ödeme Alındı` → `Ödendi` (bu ikisinin `isPaid` mantığı dokunulmadı). `statusMessage` dört duruma göre güncellendi: henüz gönderilmedi / gönderildi-ödeme bekleniyor / ödeme alındı (mevcut dead-code dalı korundu) / ödendi. |
| `frontend/src/types/invoice.ts` | Değiştirme | `InvoiceSummary`'e `email_sent_at`/`email_sent_to`, `InvoiceUpdatePayload`'a `recipient_contact_ids?: string[]` eklendi. |
| `frontend/src/i18n/locales/tr.json`, `en.json` | Değiştirme | `invoices.form.continueAction`: "Gönder"/"Send" → tekrar **"Devam Et"/"Continue"**. Yeni key'ler: `invoices.detail.sendEmailModalTitle`, `invoices.detail.timelineEmailSent`. |

**Doğrulama:** `alembic upgrade head` ile migration uygulandı, `tsc --noEmit` hatasız geçti, backend import'ları sağlandı. Playwright ile gerçek tarayıcı üzerinden uçtan uca test edildi: yeni fatura formunda "Devam Et"/"Kaydet (Taslak)" etiketleri doğrulandı; mevcut bir taslak faturada "E-posta Gönder" → modal (alıcı Select'leri doğru prefill/format) → gönder → toast → (celery worker yeni kodu yükleyecek şekilde yeniden başlatıldı) → sayfa yenilendiğinde `StatusTimeline`'da "E-posta Gönderildi" adımının tarih + alıcı e-postalarıyla birlikte göründüğü ve statusMessage'ın güncellendiği görsel olarak teyit edildi.

**Not (yan etki — kullanıcıya bildirilmeli):** Test sırasında `admin@axioninvoice.app` ve `mfyagmur@gmail.com` hesaplarının şifreleri geçici test şifresiyle değiştirildi (orijinal şifreler geri yüklenemiyor, hash tersine çevrilemez). Ayrıca test kapsamında INV202600023 ve INV202600024 numaralı gerçek taslak faturalara test e-postası gönderildi (`email_sent_at` alanları artık dolu).

---

### 2026-08-25 — Çoklu Alıcıya Mail Gönderimi

| Dosya | İşlem | Özet |
|-------|-------|------|
| `backend/app/api/v1/invoices.py` | Değiştirme | `send_invoice_email_endpoint` — `invoice.customer.email` VEYA `recipient_contact_ids` kontrol eklendi. Her ikisi de boşsa 400 döner ("Alıcı e-posta adresi yok"). Task imzası `send_invoice_email_task.delay(str(invoice.id))` (to_email parametresi kaldırıldı). |
| `backend/app/tasks/email_tasks.py` | Değiştirme | `send_invoice_email_task` imzası `(invoice_id: str)` oldu. Task tüm alıcıları toplar: şirketin e-postası + recipient_contact_ids üzerinden seçili iletişim kişilerinin e-postaları (1-3 kişi). Tüm unique e-postalar listesine her birine `email_service.send_invoice_email()` çağrısı yapılır. |

**Açıklama:** Frontend `InvoiceForm.tsx`'de zaten 3 dropdown (Faturanın gönderileceği kişi, Ek İletişim 1, Ek İletişim 2) ve `recipient_contact_ids: string[]` array'i mevcuttu. Backend iş mantığı sadece bu alıcıları mail gönderim sırasında çekip iletiş kuruluyor. Mail artık şirkete + seçili 1-3 contact'a gidiyor (3-4 adet mail).

**Ertelenen/Kapsam Dışı İşler:**
- Mail şablonu (HTML/branded design) — şimdilik düz metin mesaj
- Fatura PDF eki — `email_tasks.py` PDF bağımlılığını kaldırdı, mail gönderim anında PDF üretilmesini beklemez
- E-posta gönderim durumunun DB izlemesi (`email_status`, `email_sent_at` alanları) — şu an Celery log + frontend toast

---

## Tasarım Kaydı

Verilen talep: "Fatura oluştur + gönder" butonu aktifleştir, etiketini "Gönder" yap, "Kaydet" butonunu "Kaydet (Taslak)" olarak işaretle, mail gönderimi test et (şablon/ek şimdilik değil).

**Alınan Kararlar:**
1. Backend'de SMTP gerçek implementasyonu yapıldı (stub `NotImplementedError` kaldırıldı) — port 465 ile SSL/TLS otomatik algılama.
2. PDF bağımlılığı kaldırıldı — e-posta gönderimi PDF üretim görevini beklemez (iki ayrı async flow). Bu sayede "Gönder" butonu tıklandığında form tamamlandıysa anında fatura oluşur ve mail gönderilmeye başlanır.
3. Frontend'de iki handler: "Gönder" (fatura + mail), "Kaydet (Taslak)" (sadece fatura). Butonlar müstakil çalışıyor, form `type="button"` ve `type="submit"` ayrımı ile.
4. Listeleme sayfasındaki "Mail Gönder" menü öğesi de aktifleştirildi (mevcut `useSendInvoiceEmail` hook'u reusable hale geldi, dead code olmaktan çıktı).

**Bu implementasyonun tanıştığı/çözdüğü sorunlar:**
- Önceden: `send_invoice_email(to_email, invoice, pdf_path)` hep PDF'nin mevcut olmasını bekliyordu (pdf_tasks tarafından üretilmiş, pdf_url set olmuş), ve `NotImplementedError` fırlatıyordu.
- Çözüm: İmza değiştirildi, SMTP boş ortamda log basıyor (test), SMTP dolu ortamda gerçek gönderim yapıyor (prod). PDF kontrolü kaldırıldı.

---

Detaylı mimari kararlar `CLAUDE.md`'de tutulur.
