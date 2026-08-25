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

**Ertelenen/Kapsam Dışı İşler:**
- Mail şablonu (HTML/branded design) — şimdilik düz metin mesaj
- Fatura PDF eki — `email_tasks.py` PDF bağımlılığını kaldırdı, mail gönderim anında PDF üretilmesini beklemez
- E-posta gönderim durumunun DB izlemesi (`email_status`, `email_sent_at` alanları) — şu an Celery log + frontend toast
- Çoklu alıcı (`recipient_contact_ids`) — şu an sadece `invoice.customer.email` kullanılıyor

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
