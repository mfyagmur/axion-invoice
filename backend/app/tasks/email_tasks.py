import logging
import uuid
from datetime import UTC, datetime
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.core.config import settings
from app.core.database import SessionLocal
from app.models.customer import CustomerContact
from app.models.invoice import Invoice, InvoicePaymentReminder, InvoicePdfStatus, InvoiceStatus
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
