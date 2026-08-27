import logging
import uuid
from datetime import UTC, date, datetime, timedelta
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.core.config import settings
from app.core.database import SessionLocal
from app.models.customer import CustomerContact
from app.models.invoice import Invoice, InvoicePaymentReminder, InvoicePdfStatus, InvoiceStatus, InvoiceDueReminder
from app.services import email_service
from app.tasks.celery_app import celery_app

logger = logging.getLogger(__name__)

# offset(gün) - frontend'deki PaymentChaserPanel.tsx REMINDER_STEPS ile senkron tutulmalı
REMINDER_STEPS: list[tuple[int, int]] = [(0, 7), (1, 10), (2, 13)]


def _resolve_pdf_bytes(db, invoice: Invoice) -> bytes | None:
    """Reads the invoice PDF for email attachment if it is already generated.

    Never triggers generation itself: `generate_invoice_pdf_task` / retry-pdf own that
    responsibility exclusively, and racing a second Playwright render against theirs for the
    same output file caused pdf_status to get stuck on "pending" (see docs/todo.md).
    """
    if invoice.pdf_status != InvoicePdfStatus.READY:
        logger.info("PDF henüz hazır değil (invoice %s) — mail ek olmadan gönderilecek", invoice.id)
        return None

    output_path = Path(settings.pdf_storage_dir) / f"{invoice.id}.pdf"
    try:
        return output_path.read_bytes()
    except OSError:
        logger.exception("Mail eki için PDF okunamadı (invoice %s)", invoice.id)
        return None


def _collect_recipients(db, invoice: Invoice) -> set[str]:
    recipients = set()

    if invoice.customer.email:
        recipients.add(invoice.customer.email)

    if invoice.recipient_contact_ids:
        for contact_id in invoice.recipient_contact_ids:
            contact = db.get(CustomerContact, uuid.UUID(contact_id))
            if contact and contact.email:
                recipients.add(contact.email)

    return recipients


@celery_app.task(name="send_invoice_email")
def send_invoice_email_task(invoice_id: str) -> None:
    db = SessionLocal()
    try:
        invoice = db.get(Invoice, uuid.UUID(invoice_id))
        if invoice is None:
            return

        recipients = _collect_recipients(db, invoice)
        pdf_bytes = _resolve_pdf_bytes(db, invoice)

        successful_recipients = []
        for email in recipients:
            if email_service.send_invoice_email(email, invoice, pdf_bytes):
                successful_recipients.append(email)

        if successful_recipients:
            invoice.email_sent_at = datetime.now(UTC)
            invoice.email_sent_to = sorted(successful_recipients)

        db.commit()
    finally:
        db.close()


@celery_app.task(name="check_payment_reminders")
def check_payment_reminders() -> None:
    """Beat tarafından periyodik tetiklenir - aktif hatırlatıcılı faturaları tarar,
    süresi gelmiş ve henüz gönderilmemiş adımları gönderim kuyruğuna alır."""
    db = SessionLocal()
    try:
        invoices = (
            db.execute(
                select(Invoice).where(
                    Invoice.payment_reminder_active.is_(True),
                    Invoice.status.not_in([InvoiceStatus.PAID, InvoiceStatus.CANCELLED]),
                )
            )
            .scalars()
            .all()
        )

        now = datetime.now(UTC)

        for invoice in invoices:
            created_at = invoice.created_at
            if created_at.tzinfo is None:
                created_at = created_at.replace(tzinfo=UTC)
            days_elapsed = (now - created_at).days

            sent_steps = {
                row.step_index
                for row in db.execute(
                    select(InvoicePaymentReminder.step_index).where(
                        InvoicePaymentReminder.invoice_id == invoice.id,
                        InvoicePaymentReminder.sent_at.is_not(None),
                    )
                ).all()
            }

            for step_index, offset_days in REMINDER_STEPS:
                if step_index in sent_steps:
                    continue
                if days_elapsed >= offset_days:
                    send_payment_reminder_email_task.delay(str(invoice.id), step_index)
    finally:
        db.close()


@celery_app.task(name="send_reminder_email")
def send_payment_reminder_email_task(invoice_id: str, step_index: int) -> None:
    db = SessionLocal()
    try:
        invoice = db.get(Invoice, uuid.UUID(invoice_id))
        if invoice is None:
            return

        if not invoice.payment_reminder_active or invoice.status in (InvoiceStatus.PAID, InvoiceStatus.CANCELLED):
            return

        already_sent = db.execute(
            select(InvoicePaymentReminder).where(
                InvoicePaymentReminder.invoice_id == invoice.id,
                InvoicePaymentReminder.step_index == step_index,
                InvoicePaymentReminder.sent_at.is_not(None),
            )
        ).scalar_one_or_none()
        if already_sent is not None:
            return

        offset_days = dict(REMINDER_STEPS)[step_index]
        recipients = _collect_recipients(db, invoice)

        successful_recipients = []
        for email in recipients:
            if email_service.send_payment_reminder_email(email, invoice, step_index):
                successful_recipients.append(email)

        if successful_recipients:
            reminder = db.execute(
                select(InvoicePaymentReminder).where(
                    InvoicePaymentReminder.invoice_id == invoice.id,
                    InvoicePaymentReminder.step_index == step_index,
                )
            ).scalar_one_or_none()
            if reminder is None:
                reminder = InvoicePaymentReminder(
                    invoice_id=invoice.id, step_index=step_index, offset_days=offset_days
                )
                db.add(reminder)
            reminder.sent_at = datetime.now(UTC)
            reminder.sent_to = sorted(successful_recipients)
            try:
                db.commit()
            except IntegrityError:
                db.rollback()
    finally:
        db.close()


@celery_app.task(name="check_invoice_due_reminders")
def check_invoice_due_reminders() -> None:
    """Beat tarafından saatlik tetiklenir - notify_invoice_reminders aktif olan kullanıcıların
    ödenmemiş faturalarını tarayan vade tarihi bazlı günlük hatırlatma görevi."""
    db = SessionLocal()
    try:
        from app.models.user import User

        today = datetime.now(UTC).date()

        # notify_invoice_reminders=True ve fatura ödenmemiş olan faturaları çek
        invoices = (
            db.execute(
                select(Invoice)
                .join(User, Invoice.user_id == User.id)
                .where(
                    User.notify_invoice_reminders.is_(True),
                    Invoice.status.not_in([InvoiceStatus.PAID, InvoiceStatus.CANCELLED]),
                )
            )
            .scalars()
            .all()
        )

        for invoice in invoices:
            # Hatırlatma koşulunu kontrol et
            should_remind = False
            kind = None

            if invoice.due_at is None:
                # Vade tarihi yoksa: kesim tarihinin ertesi gününden itibaren
                issue_date = invoice.issued_at or invoice.created_at.date()
                if today >= issue_date + timedelta(days=1):
                    should_remind = True
                    kind = "no_due_date"
            else:
                # Vade tarihi varsa: son 3 gün ve vadesi geçmişse
                if today >= invoice.due_at - timedelta(days=2):
                    should_remind = True
                    if today < invoice.due_at:
                        kind = "approaching"
                    elif today == invoice.due_at:
                        kind = "due_today"
                    else:
                        kind = "overdue"

            if should_remind and kind:
                # Bu gün için zaten gönderilmişse atla
                existing = db.execute(
                    select(InvoiceDueReminder).where(
                        InvoiceDueReminder.invoice_id == invoice.id,
                        InvoiceDueReminder.reminder_date == today,
                    )
                ).scalar_one_or_none()

                if existing is None:
                    send_invoice_due_reminder_email_task.delay(str(invoice.id), today.isoformat(), kind)
    finally:
        db.close()


@celery_app.task(name="send_invoice_due_reminder_email")
def send_invoice_due_reminder_email_task(invoice_id: str, reminder_date_iso: str, kind: str) -> None:
    """Kullanıcıya vade tarihine göre fatura hatırlatması gönderir."""
    db = SessionLocal()
    try:
        from app.models.user import User

        invoice = db.get(Invoice, uuid.UUID(invoice_id))
        if invoice is None:
            return

        user = db.get(User, invoice.user_id)
        if user is None or not user.notify_invoice_reminders:
            return

        # Fatura hâlâ ödenmemiş/iptal edilmemiş mi?
        if invoice.status in (InvoiceStatus.PAID, InvoiceStatus.CANCELLED):
            return

        reminder_date = date.fromisoformat(reminder_date_iso)

        # Bu gün için zaten gönderilmiş mi? (race condition koruması)
        existing = db.execute(
            select(InvoiceDueReminder).where(
                InvoiceDueReminder.invoice_id == invoice.id,
                InvoiceDueReminder.reminder_date == reminder_date,
            )
        ).scalar_one_or_none()

        if existing is not None:
            return

        # Mail gönder
        if email_service.send_invoice_due_reminder_email(user.email, invoice, kind):
            # Başarılı gönderimi kaydet
            due_reminder = InvoiceDueReminder(
                invoice_id=invoice.id,
                reminder_date=reminder_date,
                sent_to=user.email,
            )
            db.add(due_reminder)
            try:
                due_reminder.sent_at = datetime.now(UTC)
                db.commit()
            except IntegrityError:
                db.rollback()
    finally:
        db.close()
